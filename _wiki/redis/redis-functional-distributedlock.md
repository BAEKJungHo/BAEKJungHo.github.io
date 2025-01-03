---
layout  : wiki
title   : Functional DistributedLock
summary : 
date    : 2024-12-17 13:15:32 +0900
updated : 2024-12-17 13:55:24 +0900
tag     : redis lock distributed
toc     : true
comment : true
public  : true
parent  : [[/redis]]
latex   : true
---
* TOC
{:toc}

## Functional Distributed Lock

___[Concurrency](https://klarciel.net/wiki/spring/spring-concurrency/)___ Issue 해결을 위해서 ___[Distributed Lock](https://klarciel.net/wiki/spring/spring-concurrency-resolve/#distributedlock-with-optimisticlock)___ 을 사용하곤 한다. 보통은 AOP Based Distributed Lock 을 사용하는데
이 경우 Controller 의 Handler Method 에 @DistributedLock 어노테이션을 추가하여 전체적으로 적용된다.

AOP Based Distributed Lock 은 ___[AOP](https://klarciel.net/wiki/spring/spring-aop/)___ 기반이기 때문에 대상 메서드에 부가 기능(예: 락 획득/해제)을 적용하기 위해 ___[Proxy](https://klarciel.net/wiki/designpattern/designpattern-proxy/)___ 객체를 생성한다.
또한 AOP 구현에서는 일반적으로 동적 바이트코드 조작 기술(예: AspectJ)을 사용하여 대상 클래스의 메서드에 부가 기능을 삽입한다.
이 과정에서 클래스 로딩 시간이 증가하고, 런타임 시 바이트코드 조작 작업이 추가로 수행되어 성능 overhead 가 발생할 수 있다.

Low Level 에서 발생하는 성능 차이보다 더 성능에 영향을 주는 부분은 ___Lock 점유 시간___ 이 길다는 것이다. AOP Based Distributed Lock 에서는  `point.proceed()` 부분이 끝나야 Lock 을 해제하기 때문이다.

비지니스 로직에서 락이 필요한 영역과, 불필요한 영역이 명확하고, 대규모 트래픽이 발생하는 서비스라면 ___Functional Distributed Lock___ 을 사용하면 성능을 개선할 수 있다.

Functional Distributed Lock 을 적용하여 얼마나 성능이 개선되었는지 구하는 공식은 대략 다음과 같다.

- 1개의 락에서 아낀 시간 * 락 개수 * 트래픽 량

__Functional Distributed Lock with Fenced Lock__:

```kotlin
import org.redisson.api.RFencedLock
import org.redisson.api.RedissonClient
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit

@Service
class OrderService {
    @Autowired
    private lateinit var redissonClient: RedissonClient

    fun placeOrder(userId: String, productId: String) {
        withFencedLock("order_lock_$userId") { processOrder(userId, productId) }
    }

    private inline fun <T> withFencedLock(key: String, block: () -> T): T? {
        val lock = redissonClient.getFencedLock(key)
        val token = lock.lockAndGetToken(10, TimeUnit.SECONDS)
        return if (token != null) {
            try {
                block()
            } finally {
                if (lock.isHeldByCurrentThread) {
                    lock.unlock()
                }
            }
        } else {
            null
        }
    }

    private fun processOrder(userId: String, productId: String) {
        // 주문 처리 로직 구현
        println("Processing order for user $userId and product $productId")
    }
}
```

### Challenges of Combining Distributed Locks with Transactional Logic

Functional Distributed Lock 을 사용하는 경우, ___[Declarative Transaction](https://klarciel.net/wiki/spring/spring-declarative-transaction/)___ 을 같이 사용하면 ___[Concurrency](https://klarciel.net/wiki/spring/spring-concurrency/)___ 이슈가 발생한다.

__Occurrence Concurrency Issue__:

```kotlin
@Transaction
fun order(protocol: OrderProtocol) {
    val user = userRepository.retrieve(protocol.userId)
    redisClient.executeWithLock(key = lockKey, waitTime = 400L, leaseTime = 1000L) {
        // validation protocol is valid (내부적으로 Entity Graph 탐색으로 인한 쿼리 조회 발생)
        // ... Fetch
        // Create Entity
        // Insert
    }
    eventPublisher.publish(/** Order Completed Event */)
}
```

위와 같은 코드가 있을 때, validation 로직에서는 내부적으로 Entity Graph 탐색으로 인한 쿼리 조회 발생하고 있다고 가정하자.
이때 실제로 Insert 로직이 끝나고 Event 까지 publish 되어야 Transaction 이 끝나고, Flush 가 된다.
따라서, 실제로 DB 에 반영되기 전에 동시 다발적으로 validation 로직을 실행하게되어 동시성 이슈가 발생할 수 있다.

___[Programmatic Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/programmatic.html)___ 방식을 사용하여 아래와 같은 형태의 코드를 만들어야 한다.

```kotlin
fun order(protocol: OrderProtocol) {
    val user = userRepository.retrieve(protocol.userId)

    /**
     * 독립적인 작업을 나타내는 하나의 Task 로 볼 수 있다.
     */
    redisClient.executeWithLock(key = lockKey, waitTime = 400L, leaseTime = 1000L) {
        tx.execute {
            // validation protocol is valid (내부적으로 Entity Graph 탐색으로 인한 쿼리 조회 발생)
            // ... Fetch
            // Create Entity
            // Insert
        }
    }
    
    eventPublisher.publish(/** Order Completed Event */)
}
```

- [Data Driven Workflows](https://klarciel.net/wiki/architecture/architecture-data-driven-workflows/)

## Links

- [카카오페이는 어떻게 수천만 결제를 처리할까? 우아한 결제 분산락 노하우](https://speakerdeck.com/kakao/ifkakao24-86?slide=116)