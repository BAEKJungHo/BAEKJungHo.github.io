---
layout  : wiki
title   : FencedLock
summary : 
date    : 2024-10-05 12:15:32 +0900
updated : 2024-10-05 13:55:24 +0900
tag     : redis lock distributed concurrency
toc     : true
comment : true
public  : true
parent  : [[/redis]]
latex   : true
---
* TOC
{:toc}

## FencedLock

Distributed System 에서 Shared Resources 를 보호하기 위해 ___[Distributed Lock Mechanisms](https://baekjungho.github.io/wiki/spring/spring-concurrency-resolve/)___ 을 사용한다.
일반적으로 Redis 의 lock/tryLock 을 사용하는데, ___[STOP THE WORLD](https://baekjungho.github.io/wiki/java/java-garbage-collection/#stop-the-world)___ 가 발생하는 경우에는 Lost Update(write-write-conflict) 가 발생할 수 있다.

> Specifically, a ___[write–write conflict](https://en.wikipedia.org/wiki/Write%E2%80%93write_conflict)___ occurs when "transaction requests to write an entity for which an unclosed transaction has already made a write request.

![](/resource/wiki/redis-fenced-lock/lost-update.png)
*<small><a href="https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html/">Lost Update</a></small>*

Stop The World 에 의한 Lost Update 를 막기 위해서 ___Fencing Token___ 을 사용한다.

![](/resource/wiki/redis-fenced-lock/lock-with-fencing-token.png)
*<small><a href="https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html/">Lock With Fencing Token</a></small>*

Redisson 의 ___[FencedLock](https://redisson.org/docs/data-and-services/locks-and-synchronizers/#fenced-lock)___ 은 다음과 같다.

```java
RFencedLock lock = redisson.getFencedLock("myLock");

// traditional lock method
Long token = lock.lockAndGetToken();

// or acquire lock and automatically unlock it after 10 seconds
token = lock.lockAndGetToken(10, TimeUnit.SECONDS);

// or wait for lock aquisition up to 100 seconds 
// and automatically unlock it after 10 seconds
Long token = lock.tryLockAndGetToken(100, 10, TimeUnit.SECONDS);
if (token != null) {
   try {
     // check if token >= old token
     ...
   } finally {
       lock.unlock();
   }
}
```

RedissonFencedLock 클래스를 가서 코드를 살펴보면 내부적으로 아래 메서드를 사용하고 있음을 알 수 있고, Lua Script 를 확인할 수 있다.

```java
<T> RFuture<T> tryLockInnerAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
    return this.commandExecutor.syncedEval(
            this.getRawName(), LongCodec.INSTANCE, command, 
            "if ((redis.call('exists', KEYS[1]) == 0) or (redis.call('hexists', KEYS[1], ARGV[2]) == 1)) then redis.call('incr', KEYS[2]);redis.call('hincrby', KEYS[1], ARGV[2], 1); redis.call('pexpire', KEYS[1], ARGV[1]); return nil; end; return redis.call('pttl', KEYS[1]);",
            Arrays.asList(this.getRawName(), this.tokenName), new Object[]{unit.toMillis(leaseTime), this.getLockName(threadId)}
    );
}
```

__Lua Script__:

```
-- 조건문
if (
    (redis.call('exists', KEYS[1]) == 0) or              -- 키가 존재하지 않거나
    (redis.call('hexists', KEYS[1], ARGV[2]) == 1)       -- 해시에 특정 필드가 이미 존재하면
) then
    -- 실행 블록
    redis.call('hincrby', KEYS[1], ARGV[2], 1);          -- 해시 필드의 값을 1 증가
    redis.call('pexpire', KEYS[1], ARGV[1]);             -- 키의 만료 시간 설정
    return nil;                                          -- nil 반환
end;

-- 조건이 만족하지 않을 경우
return redis.call('pttl', KEYS[1]);                      -- 키의 남은 만료 시간 반환
```

필드:

- KEYS[1]: 락의 키 이름
- ARGV[1]: 만료 시간 (밀리초)
- ARGV[2]: 해시 필드 이름 (보통 스레드나 프로세스 식별자)

조건이 참인 경우:

- hincrby: 해시 필드의 값을 1 증가시킴
- pexpire: 키에 대한 만료 시간을 설정 (밀리초 단위)
- return nil: 성공적으로 처리됨을 나타냄

조건이 거짓일 경우:

- pttl: 키의 남은 만료 시간을 밀리초 단위로 반환

### Watch Dog Mechanism

__tryLockAndGetTokenAsync__:

![](/resource/wiki/redis-fenced-lock/watch-dog.png)

위 코드에서 `if (!subscribeFuture.isDone()) { }` 조건문을 보면 ___[WatchDog](https://baekjungho.github.io/wiki/designpattern/designpattern-watch-dog/)___ 과 유사한 패턴이 적용되어있다.

![](/resource/wiki/redis-fenced-lock/code-explain.png)