---
layout  : wiki
title   : Distributed Lock with Redis
summary : 
date    : 2023-03-17 13:15:32 +0900
updated : 2023-03-17 13:55:24 +0900
tag     : redis lock
toc     : true
comment : true
public  : true
parent  : [[/redis]]
latex   : true
---
* TOC
{:toc}

## Distributed Lock with Redis

[Distributed Lock with Redis](https://redis.io/docs/manual/patterns/distributed-locks/#is-the-algorithm-asynchronous)

### Correct Implementation with a Single Instance

To acquire the lock, the way to go is the following:
```
SET resource_name my_random_value NX PX 30000
```

NX 옵션은 겹쳐쓰기를 방지한다. NX 옵션이 없다면 같은 key 로 SET 명령시 이전 value 가 지워지고 새로 입력한 value 가 남는다. 
즉, __NX 옵션을 사용하면 데이터베이스에 같은 키가 없는 경우에만 값이 저장__ 된다. 키가 이미 존재하는 경우에는 (nil) 을 반환한다.

PX 옵션은 만료시간을 정한다. Expire of 30000 milliseconds (PX option)

my_random_value 는 모든 클라이언트와 잠금으로부터 고유한 값이어야 한다.

Redis: remove the key only if it exists and the value stored at the key is exactly the one I expect to be. This is accomplished by the following Lua script:
```
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```

특정 클라이언트가 잠금을 획득하고, 만료 시간보다 더 긴 시간동안 작업을 수행하여, 다른 클라이언트가 잠금을 획득하고 앞의 클라이언트가 다른 클라이언트가 획득한 잠금을 해제할 수 있다. 

이렇게 다른 클라이언트에서 만든 잠금을 해제하지 않도록하는것이 중요한데, 위 Lua Script 가 그걸 가능하게 한다.

ARGV[1] 은 처음에 잠금을 획득한 클라이언트가 제공한 고유 식별자이다. (가장 간단한 솔루션은 UNIX timestamp 를 고유 ID 로 사용하는 것이다.) 

그래서 고유 식별자값이 같으면 잠금을 해제한다. 값이 일치하지 않으면(else 문) 잠금이 만료되어 다른 클라이언트에서 획득했거나 현재 클라이언트가 잠금을 보유하고 있지 않음을 의미한다. 그리고 0 을 반환하는데 잠금을 해제하지 않았다는 의미이다.

Redis 의 명령과 함께 이 Lua 스크립트를 사용할 때, 다음과 같이 잠금 키와 고유 식별자를 인수로 제공해야 한다.

```
EVAL <LUA_SCRIPT> 1 mylock UNIQUE_IDENTIFIER
```

이 스크립트는 다른 클라이언트가 실수로 잠금을 해제하는 것을 방지하여 잠금을 보유한 클라이언트에 의해서만 잠금이 해제되도록 한다.

위 매커니즘은 단일인스턴스로 구성된 비분산 애플리케이션에서 항상 안전하게 사용할 수 있다.

분산 시스템에서 락을 안전하게 사용하기 위해서는 RedLock 알고리즘을 사용해야 한다.

### RedLock Algorithms

The Redlock algorithm is a distributed lock algorithm designed to handle distributed locking across multiple independent Redis instances or nodes. It was proposed by Salvatore Sanfilippo, the creator of Redis, to tackle the challenges of achieving consensus in distributed systems.

Here's an overview of how the Redlock algorithm works:

1. __Initialization__: A client trying to acquire a lock generates a unique identifier, typically a UUID. This identifier is used to associate the lock with the client.
2. __Lock requests__: The client sends lock requests to multiple Redis instances or nodes, providing the lock key, the unique identifier, and a time-to-live (TTL) value. The TTL ensures that the lock automatically expires after a certain period, avoiding deadlocks in case the client crashes or fails to release the lock.
3. __Lock acquisition on Redis instances__: Each Redis instance attempts to acquire the lock using the SET command with the NX (Not eXists) and PX (expiration time in milliseconds) options. The lock is acquired in the instance only if the key does not already exist.
4. __Consensus__: The client checks the responses from all the Redis instances. If the lock is acquired by the majority of instances, the client considers the lock to be successfully obtained. If the lock is not acquired by the majority, the client considers the lock acquisition to have failed.
5. __Lock release on failure__: If the lock acquisition fails, the client removes the lock key from the instances where it was set. This step ensures that the lock is not left behind in case of a failure to reach consensus.
6. __Retrying__: In case of a failure to acquire the lock, the client waits for a random delay and then retries the lock acquisition process from step 2.
7. __Executing the critical section__: If the client successfully acquires the lock, it can proceed to execute the critical section of the code. Other clients attempting to acquire the lock during this time will have to wait or retry.
8. __Releasing the lock__: After the client has executed the critical section, it should release the lock on all the Redis instances where it was acquired. To ensure that the lock is only released by the client holding it, a Lua script can be used to check if the key's value matches the unique identifier and delete the key only if the values match.

The Redlock algorithm provides a practical solution for achieving consensus and ensuring that only one client can execute a critical section of code at a time in a distributed environment. However, it's worth noting that the algorithm makes certain assumptions about the reliability and consistency of the Redis instances, and it's not a perfect solution for every distributed locking scenario.

Consensus(합의)는 Redis Instance 가 N대 인 경우, __N/2+1 인스턴스__ 를 잠글 수 있어야지만 잠금을 획득했다고 판단한다. N/2+1 인스턴스를 잠글 수 없거나 유효시간이 음수이면 모든 인스턴스의 잠금을 해제하려고 시도한다.

분산 애플리케이션 환경에서 RedLock 을 사용하더라도 무조건 안전한것은 아니다. 

공식문서와 [How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) 글에서는 일관성, 정확성이 우려되는 경우 __펜싱 토큰(fencing tokens)__ 을 고려해야한다고 말한다. 예를 들어 ZooKeeper 를 잠금 서비스로 사용하는 경우 zxid or znode 버전 번호를 펜싱 토큰으로 사용할 수 있다.

1. 락을 획득한 클라이언트A 가 트랜잭션이 끝나지 않았는데 leaseTime(expireTime) 에 의해 락을 해제
2. 클라이언트B 가 락을 획득하고 트랜잭션 완료 후 락을 해제
3. 클라이언트A 의 트랜잭션 종료

마지막 3번 과정에서 클라이언트B가 수정한 값이 제대로 갱신이 안될 수 있다. 즉 lost-update 가 발생할 수 있다. 이러한 문제를 해결하기 위해 Fencing Tokens 이나 Optimistic Locking 을 사용하는데, RedLock 에는 Fencing Token 을 생성하는 기능이 없다.

또한, JPA 를 사용하면 Optimistic Locking 을 쉽게 사용할 수 있기 때문에 성능 이슈 없이 사용할 수 있다는게 장점이다.

__Fencing Tokens__
- Fencing tokens are used in distributed systems to ensure that only the most recent holder of a distributed lock can execute a critical section of code. When a client acquires a lock, it receives a fencing token, typically a monotonically increasing number. The client includes this token in any requests to shared resources, such as databases or message brokers.
- The shared resources maintain the highest seen fencing token and reject any requests with a lower token value. This mechanism ensures that even if a lock expires and is acquired by another client, the first client's requests will be rejected, preventing stale writes and maintaining consistency.
- Fencing tokens are especially useful in distributed systems where network partitions, clock skew, or other factors can cause locks to be released or acquired incorrectly.

__Optimistic Locking__
- Optimistic locking is a concurrency control mechanism used in databases and other shared resources to prevent multiple transactions from modifying the same data simultaneously. Instead of using locks to block access to the data, optimistic locking allows multiple transactions to read and modify the data concurrently, under the assumption that conflicts will be rare.
- In optimistic locking, each transaction reads the data and records its version (or timestamp). When a transaction wants to commit its changes, it checks if the data's version has changed since it was read. If the version has not changed, the transaction can safely commit its changes. If the version has changed, it means another transaction has modified the data, and the current transaction must be aborted and retried.
- Optimistic locking is useful for scenarios where conflicts are infrequent, and it can provide better performance than pessimistic locking, which involves acquiring and holding locks for the duration of the transaction.