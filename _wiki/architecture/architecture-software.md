---
layout  : wiki
title   : Experience of Software Architectures
summary : Correlation between DomainPurity and Productivity, Protocol, Mixed Architectures
date    : 2024-08-07 11:02:32 +0900
updated : 2024-08-07 12:12:24 +0900
tag     : architecture software swift
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Software Architectures

나는 운이 좋게도 ___[42dot](https://42dot.ai/)___ 을 다니면서, 내가 공부했던 다양한 아키텍처 지식을 실무에 녹일 수 있는 경험을 많이 하게 되었다.
그 경험속에서 얻은 __Insights__ 를 공유 및 기록으로 남기고자 한다.

애플리케이션을 설계할때 어떠한 ___[Software Architectures](https://en.wikipedia.org/wiki/Software_architecture)___ 를 선택할 지 고민을 하게될 것이다.
이때 업무 일정이 빠듯하거나, 어떠한 아키텍처 스타일이 최선인지 잘 모르겠는 경우에 ___[Layered Architecture](https://baekjungho.github.io/wiki/architecture/architecture-layered/)___ 가 애플리케이션을 빠르게 구축하기에 적합한 스타일일 수 있다.

어느 정도 기능을 붙이고 나서, 코드를 다시 들여다보면서 "현재 이 아키텍처 스타일을 그대로 유지해도 될까 ?" 라는 의문을 가지면 좋다.
특히 Layered Architecture 를 사용할때 흔히 발생하는 _[Code Smell](https://en.wikipedia.org/wiki/Code_smell)_ 은 Service 가 하나의 도메인 로직만 담당하는 것이 아니라 여러 도메인 로직을 처리하는 __Orchestration__ 역할 까지 같이 한다는 점이다.
이 경우 서비스의 크기에 따라 다를 수 있는데, 서비스비가 꽤 있는 경우 비지니스 로직과 Orchestration 을 담당하는 Service Class 에 ___[Dynamic Dependency](https://baekjungho.github.io/wiki/spring/spring-di/)___ 가 많이 생기면서 __복잡도(Complexity)__ 가 많이 증가한다.

Code Smell 을 맡았으니, 서비스가 더 커지기 전에 빠르게 다른 아키텍처를 선택하는것이 나을 수 있다. 
이때 선택할 수 있는 대안으로는 ___[Hexagonal Architecture](https://baekjungho.github.io/wiki/architecture/architecture-hexagonal/)___ 와 ___[Clean Architecture](https://baekjungho.github.io/wiki/architecture/architecture-clean/)___ 가 있다.
만약에 서비스에서 요청을 처리하기 위해서 ___[Types](https://baekjungho.github.io/wiki/ddd/ddd-modeling/#types-and-functions)___ 이 가장 중요한 경우에는 ___[Functional Architecture](https://baekjungho.github.io/wiki/architecture/architecture-functional/)___ 와 ___[Type-Driven Development](https://kciter.so/posts/type-driven-development/)___ 를 적용해볼 수 있다.

## Correlation between DomainPurity and Productivity

다양한 아키텍처들을 공부해보면 알겠지만 결국 본질은 <mark><em><strong>외부 변경사항으로 부터 Domain 을 보호하기 위해 Dependency Flow 를 저수준에서 고수준으로 단방향으로 흐르도록 설계</strong></em></mark> 하는 것이다.
나는 이것을 <mark><em><strong>Domain Purity</strong></em></mark> 를 얼마나 높게 가져갈 것인가로 보고 있다.
도메인 순수성(Domain Purity)을 높게 가져가려고 노력할 수록 생산성이 떨어지는 경험을 겪게 될 것이다.

예를 들어 Hexagonal/Clean Architecture 를 적용했다 가정하고 Domain Purity 를 높게 가져가기 위해서 Domain 과 Entity 를 분리했다고 가정하자. 이 경우 아래와 같은 흐름으로 요청을 처리하게 된다. (Usecase/Facade 클래스는 여러 비지니스 로직을 조합해서 처리하는 역할을 하기 때문에 앞으로 Orchestration 이라 부르겠다.)

![](/resource/wiki/architecture-software/flow.png)

위와 같은 흐름에서 데이터 전달 객체를 몇개 사용할 것인가가 생산성(productivity)에 큰 영향을 미친다.

- Controller 에서 Orchestration 은 DTO Object
- Orchestration 에서 DomainService 로는 Command/Query Object
- DomainService 에서 Store/Reader 는 DomainModel
- Store/Reader 에서 Repository 로는 Entity

여기서 생산성을 가장 많이 잡아먹는 부분이 ___Object Converting___ 이고, 객체 변환을 위해서 직접 Mapper 클래스를 작성해주거나, ModelMapper, Mapstruct 와 같은 Library 를 사용할 수도 있다.

항상 Domain Purity 를 높게 가져가는 것이 좋을까? 전혀 그렇지 않다. Software Architecture 를 정함에 있어서 모든것은 <mark><em><strong>Trade-Off</strong></em></mark> 이다.
서비스 성격에 따라서 ___[DomainModel](https://baekjungho.github.io/wiki/architecture/architecture-domain-model/)___ 과 Entity 를 분리하지 않고 Entity 를 DomainModel 로 사용할 수 있다.
(일반적으로 도메인 논리가 너무 복잡하지 않으면 Entity 를 DomainModel 로 사용해도 된다.)
_[서비스 성격에 따라 생산성이 중요할지, 안정성이 중요할지를 고민](https://baekjungho.github.io/wiki/magazine/magazine-productivity-stability/)_ 해보는 것이 좋다고 생각한다.

## Mixed Architecture

어느 하나의 아키텍처만 단일로 적용할 필요는 없는 것 같다. 그럼에도 위에서 말한 ___본질(essence)___ 은 지키도록 노력하는 것이 중요하다.
Domain 로직을 어떻게 응집성 있게 관리할 것인지, 가독성은 좋은지 등에 대한 고민이 중요하다고 생각한다.
따라서 다양한 아키텍처의 특징을 조합해서 적용할 수도 있다.

## Protocols

이 글이 작성된 시점으로 얼마전, 팀원 분의 Code Review 를 하면서 팀원 분께서 작성한 코드에 대한 토론을 하게 되었고 그 속에서 팀원분의 설계 사상에 대한 Insights 를 얻어갔다.

일반적으로 데이터 전달 객체는 (Kotlin 기준) data class 로 선언되고 각 data class 간의 변환을 위해서 Object Converter 가 필요했다. 이 경우 몇개의 데이터 전달 객체를 사용할 것인가에 따라 생산성이 크게 좌우된다.
이 경우 Mapper 를 작성하느라 현타가 올때도 있다.

이때 Swift 의 ___[Protocols](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/)___ - <mark><em><strong>Define requirements that conforming types must implement</strong></em></mark> 개념을 차용하면 Mapper 에 대한 관리 고민이 줄게 된다.

일종의 ___규약___ 을 정의한다고 생각하면된다. 해당 규약은 필드와, 메서드 시그니처를 가질 수 있다. Kotlin 에서는 interface 로 표현될 수 있다.

```kotlin
// 할인 가능한 항목을 나타내는 인터페이스
interface Discountable {
    val discountRate: Double
    fun applyDiscount(price: Double): Double
}

// 재고 관리가 가능한 항목을 나타내는 인터페이스
interface Stockable {
    var stockQuantity: Int
    fun isInStock(): Boolean
    fun addStock(quantity: Int)
    fun removeStock(quantity: Int)
}

// 상품 정보를 출력하는 인터페이스
interface Printable {
    fun getInfo(): String
}

// 상품을 나타내는 데이터 클래스
data class Product(
    val id: Int,
    val name: String,
    var price: Double,
    override var stockQuantity: Int = 0,
    override val discountRate: Double = 0.0
) : Discountable, Stockable, Printable {

    override fun applyDiscount(price: Double): Double {
        return price * (1 - discountRate)
    }

    override fun isInStock(): Boolean {
        return stockQuantity > 0
    }

    override fun addStock(quantity: Int) {
        stockQuantity += quantity
    }

    override fun removeStock(quantity: Int) {
        if (quantity <= stockQuantity) {
            stockQuantity -= quantity
        } else {
            throw IllegalArgumentException("재고가 부족합니다.")
        }
    }

    override fun getInfo(): String {
        return "$name (ID: $id) - 가격: ₩$price, 재고: $stockQuantity, 할인율: ${discountRate * 100}%"
    }
}
```

Discountable, Stockable 과 같은 Protocol 을 Domain Layer 에 정의해두고, 사용자에게 응답하기 위한 data class 에서도 필요하면 Domain Layer 에 있는 protocol 을 구현해서 사용하면 
의존성 방향은 저수준에서 고수준을 그대로 유지시킬 수 있다.

```kotlin
// Protocol
interface SharedIdentity {
    // 외부에 응답으로 노출될 수 있는 ID 
    val sharedIdentity: UUID
}

// Entity
class Member(
    val id: Long,
    override val sharedIdentity: UUID
): SharedIdentity {
    // ...
}

// DTO
// 회원 가입후 클라이언트가 받을 응답 회원의 Identity 를 포함
data class JoinResponse(
    override val sharedIdentity: UUID
): SharedIdentity
```

Facade 코드를 작성하면 대략 아래와 같다.

```kotlin
@Facade
class AccountFacade(
    val memberService: MemberService,
    ...
) {
    
    fun joinMember(request: JoinRequest): JoinResponse {
        // ...
        val result: SharedIdentity = memberService.join(entity)
        return JoinResponse(result.sharedIdentity)
    }
}
```

Protocol 기반 통신의 범위를 어디까지 할 것인지 등에 대한 논의, 사용 불가능한 케이스는 없는지 등 다양한 고민이 이뤄져야 할 것이다.

