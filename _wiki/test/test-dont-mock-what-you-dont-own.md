---
layout  : wiki
title   : Don’t Mock What You Don’t Own
summary : 
date    : 2024-12-31 19:28:32 +0900
updated : 2024-12-31 20:15:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Don’t Mock What You Don’t Own

___[Don’t Mock What You Don’t Own](https://github.com/testdouble/contributing-tests/wiki/Don%27t-mock-what-you-don%27t-own)___ 는 내가 소유하지 않은 것을
Mocking 하지 말라는 의미인데, ___[TestDoubles](https://klarciel.net/wiki/test/test-testdoubles/) 의  주요 가치가 [Design Feedback](https://klarciel.net/wiki/tdd/tdd-interface-design-decisions/)___ 이라는 사고방식에서 나온 것이다.
예를 들어 무언가를 위조하기 위해서 고통이 수반된다면, 더 나은 테스트더블 라이브러리를 사용하는 것이 아니라 ___[sut 과 doc](https://klarciel.net/wiki/test/tdd-sut-doc/)___ 간의 상호작용에 대해서 재설계를 해야 한다.

"소유하지 않은 것"은 ___외부 라이브러리, 프레임워크, 또는 타사 API 등을 의미___ 하는데, 이는 모킹해서는 안된다.

- 외부 라이브러리의 내부 구현은 내가 통제할 수 없으므로, 업데이트나 변경 시 테스트가 깨질 가능성이 높음
- 의도하지 않은 테스트 실패는 불필요한 유지보수 비용을 초래함
- HTTP 클라이언트 라이브러리(e.g., RestTemplate, OkHttp)를 모킹하면 내부 구현 변경에 따라 테스트가 깨질 가능성이 있다. 이를 감싸는 레이어를 도입하거나, 실제 HTTP 요청을 보내는 테스트를 작성해야 함

__[Portable Service Abstraction](https://klarciel.net/wiki/spring/spring-psa/)__:

```kotlin
interface PaymentProcessor {
    fun processPayment(amount: BigDecimal): Boolean
}

// Implementation using an external library
class StripePaymentProcessor : PaymentProcessor {
    override fun processPayment(amount: BigDecimal): Boolean {
        // Call Stripe SDK
        return true
    }
}
```

이러한 원칙은 ___[Dependency Inversion Principle](https://klarciel.net/wiki/oop/oop-solid/)___, ___[Ports and Adapters Architecture](https://klarciel.net/wiki/architecture/architecture-hexagonal/)___ 의 원칙과 유사한 면이 있다.