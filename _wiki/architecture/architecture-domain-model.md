---
layout  : wiki
title   : DomainModel
summary : 
date    : 2024-08-03 12:02:32 +0900
updated : 2024-08-03 12:12:24 +0900
tag     : architecture ddd designpattern oop
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
favorite: true
---
* TOC
{:toc}

## DomainModel

An object model of the domain that incorporates both __behavior__ and __data__.

![](/resource/wiki/architecture-domain-model/domain-model-uml.png)

___[Object Oriented](https://baekjungho.github.io/wiki/oop/oop-oo/)___ 에서 ___[DomainModel](https://www.martinfowler.com/eaaCatalog/domainModel.html)___ 은 Database Model 과 비슷해보이지만 차이가 많다.
DomainModel 은 데이터와 프로세스가 혼합된 구조이다.

주로 2가지 형식의 DomainModel 이 사용되는데 첫 번째는 데이터베이스 테이블과 설계가 거의 유사한 DomainModel 이 있고,
다른 하나는 RichDomainModel 이 있다. RichDomainModel 은 상속, ___[Strategy](https://baekjungho.github.io/wiki/designpattern/designpattern-strategy/)___ 패턴등의 다양한 GoF 패턴, 그리고 복잡한 객체 그래프 탐색을 필요로 한다.
RichDomainModel 에는 __Data Mapper__ 가 필요하다. RichDomainModel 은 ___[POJO](https://baekjungho.github.io/wiki/spring/spring-pojo/)___ DomainModel 이다.

풍성한 도메인 모델(Rich Domain Model) 이란 데이터와 비지니스 로직을 하나의 클래스에서 관리하는 모델을 의미하며, OOP 의 캡슐화 특성을 만족한다. ___[DDD](https://baekjungho.github.io/wiki/ddd/)___ 는 주로 비지니스 시스템을 분리하고, 비지니스 모듈을 분할해 비지니스 도메인 모델과 상호 작용을 정의하는 방법을 설계할 때 사용된다.
DDD 를 잘하기 위한 핵심은 DDD 의 개념에 대한 이해가 아니라 비지니스에 친숙해 지는 것이다. 개념을 잘 알고 있어도 비지니스에 익숙하지 않으면 합리적인 ___[Domain Modeling](https://baekjungho.github.io/wiki/ddd/ddd-modeling/)___ 을 얻을 수 없다.

```kotlin
import java.math.BigDecimal

// Rich Domain Model
class Wallet(private val id: Long) {
    private val createTime: Long = System.currentTimeMillis()
    private var balance: BigDecimal = BigDecimal.ZERO

    fun getBalance(): BigDecimal {
        return balance
    }

    fun debit(amount: BigDecimal) {
        if (balance < amount) {
            throw InsufficientBalanceException("Insufficient balance to debit $amount")
        }
        balance = balance.subtract(amount)
    }

    fun credit(amount: BigDecimal) {
        if (amount < BigDecimal.ZERO) {
            throw InvalidAmountException("Invalid amount to credit: $amount")
        }
        balance = balance.add(amount)
    }
}

class InsufficientBalanceException(message: String) : RuntimeException(message)
class InvalidAmountException(message: String) : RuntimeException(message)
```

<mark><em><strong>DomainModel 은 비지니스 동작을 반영하며, 비지니스 동작은 자주 변경해야 하므로 이 계층을 손쉽게 수정, 변경, 테스트할 수 있게 만드는 것이 아주 중요하다.</strong></em></mark>

비지니스 논리를 도메인 객체에 반영할 때 흔히 하는 고민은 도메인 객체가 과하게 비대해지는 것이다. 이 경우 일반적인 동작과 특정 사례의 동작을 구분해서 일반적인 동작은 DomainModel 에 반영하며 특정 사례의 동작은 다른 Layer 에 반영하는 경우도 있는데,
이렇게 동작이 분리되었을 때의 단점은 중복이 발생할 우려가 있다. 따라서 DomainModel 에 일단 반영해놓고 클래스의 크기가 너무 커지면 그때 수정해도 된다.

일반적으로 도메인 논리가 너무 복잡하지 않으면 Entity 를 DomainModel 로 사용해도 된다. Entity 를 DomainModel 로 사용했을 때의 장점은
생산성(productivity)이 더 낫다는 것이다. 나는 Entity 와 DomainModel 을 별도로 분리할 지에 대해서 _[서비스 성격에 따라 생산성이 중요할지, 안정성이 중요할지를 고민](https://baekjungho.github.io/wiki/magazine/magazine-productivity-stability/)_ 한다. 그 외에도 서비스 성격에 따라 고려해야할 부분더 있을 수 있다.
정답은 없고 적절한 __Trade-Off__ 가 필요하다. 도메인 논리가 너무 복잡한 경우에는 Entity 와 DomainModel 을 분리하는 것이 나을수도 있다.

DomainModel 이 필요한 시점은 유효성 검사, 계산, 파생 등 복잡하고 끊임없이 변하는 비지니스 규칙을 구현해야할 때 DomainModel 을 사용해 비지니스 규칙을 처리하는 것이 좋다.

## References

- Patterns of Enterprise Application Architecture / Martin Fowler
- 设计模式之美 / 王争