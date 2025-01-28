---
layout  : wiki
title   : Optimistic Concurrency Control; Optimistic Locking
summary : Pessimistic Lock
date    : 2025-01-15 13:15:32 +0900
updated : 2025-01-15 13:55:24 +0900
tag     : redis lock concurrency
toc     : true
comment : true
public  : true
parent  : [[/redis]]
latex   : true
---
* TOC
{:toc}

## Optimistic Concurrency Control

__Optimistic Locking__
- Optimistic locking is a concurrency control mechanism used in databases and other shared resources to prevent multiple transactions from modifying the same data simultaneously. Instead of using locks to block access to the data, optimistic locking allows multiple transactions to read and modify the data concurrently, under the assumption that conflicts will be rare.
- In optimistic locking, each transaction reads the data and records its version (or timestamp). When a transaction wants to commit its changes, it checks if the data's version has changed since it was read. If the version has not changed, the transaction can safely commit its changes. If the version has changed, it means another transaction has modified the data, and the current transaction must be aborted and retried.
- Optimistic locking is useful for scenarios where conflicts are infrequent, and it can provide better performance than pessimistic locking, which involves acquiring and holding locks for the duration of the transaction.

낙관락은 데이터에 대한 락을 실제로 걸지 않고, 트랜잭션이 끝날 때 버전 정보(version)를 확인하여 충돌 여부를 판단한다. 여러 클라이언트가 동시에 작업을 시도할 때 경쟁 조건을 해결하는 방법 중 하나이다. (타임 스탬프를 활용하기도 하는데, 시간은 지속적으로 흐르기 때문에 부정확할 가능성이 더 크다.)

JPA 의 경우 버전 속성을 확인하여 엔티티의 변경 사항을 감지한다. 동시 업데이트가 발생하는 경우 OptimisticLockException 이 발생한다. 즉, 낙관적 잠금은 엔티티에 포함된 버전 속성을 사용하여 엔티티의 동시 수정을 제어한다.

```sql
-- 조회
SELECT id, version, ... FROM table WHERE id = ?

-- 업데이트
UPDATE table
SET column1 = ?, column2 = ?, version = version + 1
WHERE id = ? AND version = ?
```

__Sequence Diagram__:

![](/resource/wiki/redis-optimistic-lock/optimistic%20locking.png)

### PessimisticLock vs OptimisticLock

PessimisticLock 은 아래와 같은 단점이 있다.

분산 환경에서는 락을 획득하기 위해 네트워크 요청이 오가야 하므로 Latency 가 발생한다. 분산된 여러 노드에서 락 상태를 관리하려면 중앙화된 락 매니저 등이 필요하며, 이는 추가적으로 관리 비용이 발생한다.
또한 한 트랜잭션이 락을 너무 오래 소유하고 있는 경우, 다른 트랜잭션은 락이 걸린 리소스에 접근할 수 없습니다. 즉, 성능적인 이슈가 발생할 수 있다.

하지만 아래와 같은 케이스에서는 실무에서 비관락을 사용하기도 한다.

- 트랜잭션 충돌 가능성이 높고, 데이터의 정합성이 무엇보다 중요할 때
- 데이터가 중앙화되어 있고 락 관리의 오버헤드가 크지 않은 경우
- 실시간 시스템에서 충돌 회피가 비용적으로 낙관적 락보다 더 유리한 경우

OptimisticLock __충돌 가능성이 낮은 경우__ 에는 비관락보다 성능이 좋다. 단, 실무(분산 애플리케이션 환경)에서는 낙관락만 사용하는 경우는 많진 않다.
왜냐하면 낙관락은 경합 발생시 하나의 트랜잭션을 제외하고 예외가 발생하기 때문에, 재시도(retry) 로직을 직접 작성해줘야 하기 때문이다.
경쟁 조건이 발생할 경우, 트랜잭션이 실패하고, 클라이언트는 작업을 다시 시도해야 하므로 **낙관적 락** 은 일반적으로 **충돌 가능성이 낮은** 환경에서 유용하다. 분산락을 해제하기 전에 DB 트랜잭션이 커밋이 되거나, 분산락을 해제하고나서 커밋이 되는 경우 등에 대비하여 **Optimistic Locking** 을 추가로 사용하는 것이 좋다.

### OptimisticLocking with LuaScript

예를 들어, 영화 예약 등의 서비스에서 낙관락을 사용해야한다고 가정하자. 이때 공유 자원인 좌석(Seat)의 테이블의 경우
상영관(Theater) 의 정보만 가지고 있다고 가정하자.

이 경우 낙관락을 사용하려면 Row 에 대한 Update 가 이뤄져야 하므로, 특정 컬럼(상태 등)을 추가하고 해당 컬럼이 가진 Row 를 업데이트하는 방향 or 좌석만큼의 미리 예약을 등록하는 방식등으로 해결해야 한다.
하지만 이 경우 테이블 설계가 변경되거나 테이블에 불필요한 공간을 잡아먹기 때문에 고려가 필요하다.

___해당 기술(낙관락)이 어떤 문제를 해결하는지(본질)와 구현 방법에 대해서 알면___ 매커니즘을 활용할 수 있다.

- **Check and Set** : 낙관락은 실제로 Lock 을 걸지 않고 Version 을 통해서 다른 트랜잭션이 이 트랜잭션이 사용한 데이터(읽기 또는 쓰기)를 수정했는지 확인한다. 충돌이 없으면 모든 변경 사항을 적용한다.

Redis 의 대부분의 명령들은 원자적이다. 단, 하나의 트랜잭션(논리적인 작업)내에서 원자적인 명령들을 각각 호출하는 경우에는 동시성 이슈가 발생할 수 있다.

```
클라이언트 A - GET balance → 100을 가져옴.

- 새로운 잔액 계산: 100 - 50 = 50 (50을 출금).
- SET balance 50 → 잔액을 50으로 설정.

클라이언트 B의 동작 (A 와 동시에 실행)

- GET balance → 100을 가져옴.
- 새로운 잔액 계산: 100 - 30 = 70 (30을 출금).
- SET balance 70 → 잔액을 70으로 설정.
```

이러한 문제를 해결하기 위해서 **Lua Script** 를 활용할 수 있다.

Redis 서버에서 실행되며, 실행 중에는 다른 명령이 끼어들 수 없다. 또한 여러 개의 명령을 개별적으로 보내는 대신, 한 번의 스크립트 실행으로 모든 작업을 원자적으로 처리할 수 있다는 특징이 있다.
SCRIPT LOAD 명령어를 실행하기 위해서는 키가 저장되어 있는 노드에서 명령을 실행해야 한다. 따라서, Cluster 환경에서는 스크립트를 Cluster 내의 모든 노드에 캐싱해야 한다.

Redis 는 싱글 스레드와 이벤트 루프 기반으로 동작하기 때문에 한 번에 하나의 요청을 처리한다.

**Lua Script 와 Caching 을 활용하여 낙관적 잠금(optimistic locking) 메커니즘을 구현** 할 수 있다.

__Pseudo code__:

```
- [GET] 키의 현재 버전 확인
- 키가 없으면 초기 버전 1로 설정
- [Check And Set] 현재 버전과 전달받은 버전이 일치하면:
    - 버전 증가
    - 만료 시간 설정
    - 성공(1) 반환
- 버전 불일치 시 실패(0) 반환
```

__LUA SCRIPT__:

```kotlin
val LUA_SCRIPT = """
        local key = KEYS[1]
        local latestVersion = redis.call('get', key)
        local currentVersion = tonumber (ARGV[1])
        local limitTime = tonumber (ARGV[2])
        
        if not latestVersion then
            redis.call('set', key, 1)
            latestVersion = 1
        end
        
        if latestVersion == currentVersion then
            redis.call('INCRBY', key, '1')
            redis.call('expire', key, limitTime)
            return 1
        else
            return 0
        end
    """

val result = redisClient.getScript(StringCodec.INSTANCE).evalSha<Long>(
    RScript.Mode.READ_WRITE,
    scriptSha,
    RScript.ReturnType.INTEGER,
    listOf(model.key),  // 해당 키를 KEYS 로 전달
    model.version.toString(),  // 현재 버전(상태)을 ARGV로 전달
    TimeUnit.HOURS.toHours(1L)
)
```

해당 코드를 사용하는 클라이언트측의 코드는 대략 다음과 같은 흐름일 것이다.

```kotlin
fun booking(...) {
  tx {
      // Do something
      // 현재 버전 조회
      // 현재 버전을 Lua script 가 동작하는 함수에 전달
      // .. DB Save ..
      // Version Check and Update
  }
}
```
