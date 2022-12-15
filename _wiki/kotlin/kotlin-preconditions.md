---
layout  : wiki
title   : Guava Preconditions
summary : 
date    : 2022-12-11 20:54:32 +0900
updated : 2022-12-11 21:15:24 +0900
tag     : kotlin java
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Guava Preconditions

- [Guava PreconditionsExplained](https://github.com/google/guava/wiki/PreconditionsExplained)
- [Latest Version](https://search.maven.org/search?q=g:com.google.guava%20AND%20a:guava)
- [Preconditions Docs](https://guava.dev/releases/19.0/api/docs/com/google/common/base/Preconditions.html)
- [Guava Preconditions Example](https://www.javarticles.com/2015/12/guava-preconditions-example.html)

## DomainPrecondition

Domain Logic 에 대한 사전 조건(precondition)을 검사하는 책임을 가진 객체를 만들 수 있다.

```kotlin
import static com.google.common.base.Preconditions.*

object PaymentPrecondition {
    fun checkNull(id: Long?) {
        checkNotNull(id, "$id is Null")
    }
    
    fun checkProvider(provider: PaymentProvider) {
        checkState(PaymentProvider.KAKAO == provider, "Not supported provider")
    }
}
```

## Links

- [Comparison of Ways to Check Preconditions in Java](https://www.sw-engineering-candies.com/blog-1/comparison-of-ways-to-check-preconditions-in-java)
- [Guava preconditions - Baeldung](https://www.baeldung.com/guava-preconditions)