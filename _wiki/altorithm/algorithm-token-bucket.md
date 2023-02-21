---
layout  : wiki
title   : Token Bucket to Control Communication Volume
summary : 
date    : 2023-02-20 15:54:32 +0900
updated : 2023-02-20 20:15:24 +0900
tag     : algorithm
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Token Bucket

토큰 버킷 알고리즘은 분산 시스템에서 속도 제한에 일반적으로 사용되는 방법이다. 특정 기간 내에 처리할 수 있는 요청 수를 제한(rate limit)하여 요청 처리 속도를 제어할 수 있는 간단한 알고리즘이다.

토큰 버킷 알고리즘은 처음에는 특정 수의 토큰으로 채워진 토큰 버킷을 유지 관리하는 방식으로 작동한다. 요청이 수신될 때마다 알고리즘은 요청을 처리하기에 충분한 토큰이 버킷에 있는지 확인한다. 요청이 있는 경우 요청이 처리되고 토큰이 버킷에서 제거된다. 토큰이 충분하지 않으면 요청이 거부되거나 충분한 토큰을 사용할 수 있을 때까지 지연된다.

토큰으로 버킷을 보충하는 속도는 시간 단위로 버킷에 추가되는 토큰 수를 지정하는 보충 속도에 따라 결정된다. 버킷에 저장할 수 있는 최대 토큰 수는 버스트 용량에 의해 결정된다.

토큰 버킷 알고리즘에서 속도 제한은 클라이언트를 고유하게 식별하는 키를 기준으로 각 클라이언트에 대해 독립적으로 수행된다. 이를 통해 고객의 특정 요구에 따라 다양한 속도 제한을 적용할 수 있다.

토큰 버킷 알고리즘은 간단하고 효율적이며 분산 시스템에서 쉽게 구현할 수 있다. 일반적으로 네트워크 [Traffic shaping(통신량 조절)](https://en.wikipedia.org/wiki/Traffic_shaping)에서 사용되며, 네트워크 링크를 통해 전송되는 트래픽의 양을 제한하는 데 사용되며, 특정 기간 내에 수행될 수 있는 API 요청의 수를 제한하는 데 사용된다.

## Compare Traffic Policy and Traffic Shape to Limit Bandwidth

> [Compare Traffic Policy and Traffic Shape to Limit Bandwidth](https://www.cisco.com/c/en/us/support/docs/quality-of-service-qos/qos-policing/19645-policevsshape.html)
> 
> ![](/resource/wiki/algorithm-token-bucket/traffic.png)
> 
> Shaping implies the existence of a queue and of sufficient memory to buffer delayed packets, while policing does not. Queues are an outbound concept; packets that leave an interface get queued and can be shaped. __Only policing can be applied to inbound traffic on an interface.__ Ensure that you have sufficient memory when you enable shaping. In addition, shaping requires a function that schedules for later transmission of any delayed packets. This schedule functionality allows you to organize the shaping queue into different queues. Examples of this functionality are Class Based Weighted Fair Queuing (CBWFQ) and Low Latency Queuing (LLQ).

## Benefits of Traffic Shaping

- __Prevents network congestion__: Traffic shaping can be used to prevent network congestion and improve the performance of the network. By regulating the flow of traffic, traffic shaping ensures that the available bandwidth is used effectively, and prevents congestion that can cause delays and packet loss.
- __Prioritizes traffic__: Traffic shaping can be used to prioritize traffic based on its importance. This ensures that critical traffic, such as voice and video, receive the necessary bandwidth and are not impacted by less important traffic.
- __Improves user experience__: By preventing network congestion and prioritizing traffic, traffic shaping can improve the user experience for end-users, ensuring that applications and services are responsive and reliable.
- __Limits network abuse__: Traffic shaping can be used to limit the amount of bandwidth that is used by individual users or applications. This helps to prevent network abuse and ensures that bandwidth is shared fairly across all users.

## Implementation with Kotlin

```kotlin
class TokenBucket(
    private var capacity: Int,
    private var tokens: Int,
    private val replenishRate: Double
) {
    private var lastRefillTime: Long = System.currentTimeMillis()

    @Synchronized
    fun consume(tokens: Int): Boolean {
        refill()
        return if (tokens <= this.tokens) {
            this.tokens -= tokens
            true
        } else {
            false
        }
    }

    @Synchronized
    private fun refill() {
        val now = System.currentTimeMillis()
        if (tokens < capacity) {
            val elapsedTime = (now - lastRefillTime) / 1000.0
            val tokensToAdd = elapsedTime * replenishRate
            tokens = (tokens + tokensToAdd).coerceAtMost(capacity.toDouble()).toInt()
            lastRefillTime = now
        }
    }
}
```

- The __TokenBucket class__, which represents a bucket of tokens that can be consumed at a certain rate.
- The __capacity property__, which represents the maximum number of tokens that can be stored in the bucket.
- The __tokens property__, which represents the current number of tokens in the bucket.
- The __replenishRate property__, which represents the rate at which the bucket is refilled with tokens.
- The __lastRefillTime property__, which represents the last time the bucket was refilled with tokens.
- The __consume() method__, which is used to consume a certain number of tokens from the bucket. If there are enough tokens in the bucket, the tokens are consumed and the method returns true. Otherwise, the method returns false.
- The __refill() method__, which is used to refill the bucket with tokens based on the replenishRate. This method is called before consuming tokens to ensure that the bucket is refilled if necessary.

You can create an instance of TokenBucket and use the consume() method to check if a certain number of tokens can be consumed from the bucket. For example:

```kotlin
// The bucket is refilled at a rate of 0.5 tokens per second. 
val bucket = TokenBucket(10, 10, 0.5)
if (bucket.consume(5)) {
    // tokens were consumed
} else {
    // not enough tokens in the bucket
}
```

In this example, a TokenBucket is created with a capacity of 10 tokens, 10 tokens are initially added to the bucket, and the bucket is refilled at a rate of 0.5 tokens per second. The consume() method is called to check if 5 tokens can be consumed from the bucket. If there are enough tokens in the bucket, the tokens are consumed and the consume() method returns true. Otherwise, the method returns false.

## Links

- [Wikipedia](https://en.wikipedia.org/wiki/Token_bucket)
- [Token Bucket Rate Limiting](https://intronetworks.cs.luc.edu/current/html/tokenbucket.html)
- [API Rate Limiting Using Token Bucket Algorithm](https://www.linkedin.com/pulse/api-rate-limiting-using-token-bucket-algorithm-siddharth-patnaik/)