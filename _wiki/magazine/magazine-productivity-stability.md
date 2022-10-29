---
layout  : wiki
title   : The Importance of Architecture
summary : 아키텍처의 중요성과 개발 설계의 생산성과 안정성
date    : 2022-10-21 20:54:32 +0900
updated : 2022-10-21 21:15:24 +0900
tag     : magazine
toc     : true
comment : true
public  : true
parent  : [[/magazine]]
latex   : true
---
* TOC
{:toc}

## The Importance of Architecture

__아키텍처(architecture)__ 란 __서비스의 구조__ 를 의미합니다. 따라서, 아키텍처는 중요합니다.

불안정한 아키텍처가 적용된 서비스는 비지니스 요구사항의 추가 및 변경에 대해서 __유연(flexible)__ 하지 않습니다. 최악의 경우에는 서비스를 다시 만들어야 하는 경우도 있을 것입니다. 이는 곧 __비용(cost)__ 과 직결됩니다. 

따라서 __좋은 아키텍처 설계를 고민해야하는 이유는 적은 비용으로 서비스를 확장, 변경할 수 있도록 만들기 위함__ 입니다.

### Hierarchy

TCP/IP Layer 및 설계에 있어서 자주 사용되는 아키텍처들을 생각해보면 __계층(hierarchy)__ 이 존재합니다.

계층이 존재하는 이유는 각 계층에서 담당해야 할 __역할(role) 및 책임(responsibility)__ 을 명확하게 하고, 더 나아가 계층간에 변경이 있을때 다른 계층으로의 __변경을 최소화__ 하기 위함입니다.

예를 들어 A-B-C 의 3계층으로 이루어진 구조에서 C 계층에서의 변경이 일어났을때, A, B 계층에서도 변경이 일어나야 한다면 변경이 발생할 때 많은 코드들을 수정해야 하므로 많은 __비용(cost)__ 이 들 것입니다.

개발 설계에 있어서 자주 사용되는 __3 Layers Architecture__ 와 __Clean Architecture__ 를 살펴보겠습니다.

### 3 Layers Architecture

![](/resource/wiki/magazine-productivity-stability/three-layer.png)

3 Layers Architecture 는 Presentation(UI), Domain, Data 의 3가지 레이어로 구성됩니다. __의존성__ 은 Presentation Layer 는 Domain Layer 를 바라보고 Domain Layer 는 Data Layer 를 바라봅니다. __변경__ 은 Data Layer 의 변경이 발생하면 Domain, Presentation Layer 까지 모두 영향을 끼칩니다.

3 Layers Architecture 보통 아래와 같은 패키지 구조를 띄고 있습니다.

- __Package Structures__
  - presentation
    - Controller
  - domain
    - Service 
    - Entity
  - data
    - Repository

이러한 구조에서 실제로도 그림처럼 Data Layer 의 변경이 다른 Layer 까지 영향을 미치는지 코드를 통해서 확인해 보겠습니다. Data Layer 에서는 데이터베이스 접근을 위해 JPA 를 사용 중이라고 가정하겠습니다.

- __Controller__

```kotlin
@Controller
class Presentation(
    private val authService: AuthService
) {
    @PostMapping("/signin")
    fun signIn(@ModelAttribute("request") request: AuthDto.SignInRequest, model: Model): String {
        val entity = authService.signIn(request)
        model.addAttribute("result", entity)
        return "signin"
    }
}
```

- __Entity__

```kotlin
@Table
@Entity
class Member(
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    val email: String,
    
    val userName: String
)
```

- __Service__

```kotlin
@Service
class Domain(
    private val repository: MemberRepository
) {
    fun signIn(request: AuthDto.SignInRequest) {
        val entity = Member(email = request.email, userName = request.userName)
        repository.save(entity)
    }
}
```

- __Repository__

```kotlin
interface MemberRepository: CrudRepository<Member, Long> {
}
```

위와 같은 구조를 사용 중일 때 다음과 같은 변경 요구사항이 생겼습니다.

- JPA 대신 R2dbc 를 사용하여 데이터베이스를 접근하자.
- 회원 테이블에 userName 을 삭제하자.

CrudRepository 대신 ReactiveCrudRepository 를 상속받아서 사용해야 하므로 가장 먼저 Data Layer 가 먼저 변경될 것입니다. 다음에는 Entity 에서 JPA 와 관련된 어노테이션들을 제거하고 Entity 의 구조를 바꿔야할 것입니다. 마지막으로 화면에서 사용 중이던 userName 필드를 제거해야할 것입니다.

그림과 동일하게 실제로도 Data Layer 에서 변경이 일어났을 때 Domain, Presentation Layer 모두에 영향을 끼치는 것을 볼 수 있습니다.

그러면 "위 아키텍처는 변경에 불안정한 아키텍처 아닌가요?" 라는 생각이 들 수 있습니다. 맞습니다. 3 Layers Architecture 는 변경에 불안정한 아키텍처입니다.

그럼에도 불구하고 자주 사용되는 아키텍처입니다. 위와 같은 구조는 누가 사용해야 할까요?

__트래픽이 많지 않고 비지니스 요구사항의 변경 및 추가가 자주 일어나지 않으며, 짧은 개발 주기를 갖는 프로젝트일 경우__ 적합 합니다.

예를 들어 1개월 ~ 3개월 정도의 개발 주기를 갖는 프로젝트의 경우에는 Clean Architecture 보다 3 Layers Architecture 를 선택하여 개발하는 것이 생산성이 더 좋습니다. 그래서 대게 Agency 혹은 SI 회사들이 위와 같은 구조를 사용하는 경우가 많습니다. (모든 SI 가 그렇다는 것은 아닙니다.)

### Clean Architecture

![](/resource/wiki/magazine-productivity-stability/clean-architecture.png)

위 그림에서 가장 중요한 부분은 노란색 원(Entities)과 빨간색 원(Use Cases) 입니다. Entities 는 __기업의 업무규칙(고수준 정책)__ 들을 정의하는 Layer 이며, Use Cases 는 __애플리케이션 기능(사용 사례)__ 을 정의하는 Layer 입니다.

그림에서 4가지 원만 표기되고 있지만 필요에 따라서는 더 많은 원들이 존재할 수 있습니다. 중요한 것은 __의존성(Dependency) 방향이 단방향(고수준 정책을 담당하고 있는 핵심 Layer 로 의존)__ 으로 이루어져야 한다는 것입니다. 이는 저수준 정책들이 고수준 정책에 의존해야 한다라는 의미이며, 저수준 정책들이 정의되어있는 Layer 에서 변경이 일어났을 때, 고수준 정책을 다루고 있는 Layer 에 영향을 끼치면 안된다라는 의미이기도 합니다.

__정리하자면 패키지간 의존성을 단뱡향으로 정의하는 것은 저수준 정책이 변경될 때 고수준 정책에 영향을 미치지 않게 하기 위해서입니다. 다시 말하면 저수준 정책을 다루고 있는 패키지에서 변경이 일어났을 때 고수준 정책을 다루고 있는 패키지에 변경이 일어나지 않게 하기 위해서입니다.__

Clean Architecture 를 사용하는 것이 적합한 경우는 __비지니스 요구사항이 자주 변경 및 추가 되거나, 지속적으로 서비스를 개선해 나가야 하는 프로젝트일 경우__ 적합 합니다.

## Domain Driven Design

도메인 주도 설계(Domain Driven Design)란 __도메인(Domain)__ 을 중심으로 소프트웨어를 설계하는 접근 방식입니다. 여기서 도메인이란 Clean Architecture 의 고수준 정책을 다루는 Entity 라고 생각하면 됩니다. 즉, 도메인 주도 설계에서 도메인은 기업의 업무 규칙을 다룬다고 볼 수 있습니다.

도메인 주도 설게에서는 4가지 Layer 로 구성된 [Layered Architecture](https://baekjungho.github.io/wiki/ddd/ddd-layered-architectures/) 를 사용합니다. 핵심은 __의존성 방향이 Domain 으로 향해야 한다는 것이고, 모든 도메인 규칙들을 도메인 패키지로 잘 응집되도록 만드는 것이 중요합니다.__ 이러한 점에서 도메인 주도 설계에서 사용되는 Layered Architecture 는 Clean Architecture 와 상당히 유사합니다. 

### Refactoring

DDD 와 Clean Architecture 를 적용하면 아래와 같은 패키지 구조가 완성됩니다.

![](/resource/wiki/magazine-productivity-stability/four-layer.png)

- __Package Structures__
  - interfaces
    - Controller, DTO, Mapper
  - application
    - UseCase
  - domain
    - Service
    - Entity
    - Repository Interface
  - infrastructure
    - Repository Implementation

interfaces 는 Presentation Layer 이며 application 은 Use Cases 를 담당합니다. domain 은 고수준 정책을 담당하는 Entities 에 속하며 infrastructure 는 Data layer 에 속합니다.

위와 같은 구조를 사용하더라도 JPA 에서 R2dbc 로 변경해야 한다는 요구사항이 생기면 Infrastructure Layer 에서의 변경이 Domain Layer 까지 영향을 미치게 됩니다. 

그 이유는 __Entity 와 Domain 을 분리하지 않았기 때문__ 입니다. JPA 를 사용 중이라면 따로 Domain Class 를 두지 않고 Entity 에 도메인 규칙들을 정의해서 사용하는 것이 __생산성(productivity)__ 을 더 끌어 올릴 수 있습니다. 반면에 패키지 구조의 __안정성(stability)__ 은 떨어지게 됩니다.

생산성을 포기하고 안정성을 끌어올리기 위해서는 패키지 구조가 아래와 같이 변경되어야 합니다.

- __Package Structures__
  - interfaces
    - Controller, DTO, Mapper
  - application
    - UseCase
  - domain
    - Service
    - Domain
    - Repository Interface
  - infrastructure
    - Repository Implementation
    - Entity

즉, Domain Layer 에 아래와 같은 Domain Class 를 별도로 두는 것입니다. 위와 같은 구조라면 JPA 에서 R2dbc 로 변경되더라도 Domain Layer 에 아무런 영향을 주지 않습니다. (테이블 컬럼이 추가되는 경우는 제외)

- __Domain Class__

```kotlin
class Member(
    val id: Long? = null,
    
    val email: String,
    
    val userName: String
) {
    fun toEntity() {
        return MembmerEntity(
            id = this.id,
            email = this.email,
            userName = this.userName
        )
    }
}
```

## Productivity and Stability

어떤 기준으로 __생산성(productivity)과 안정성(stability)__ 중에 누구에게 더 높은 우선순위를 줘야 할까요? 바로 __서비스의 성격(Character of Service)__ 이라고 생각합니다. 

인증 서비스를 만드는 경우를 생각해 보겠습니다. 인증 서비스의 경우에는 일단 한 번 만들어지고나서 비지니스의 요구사항이 자주 추가되거나 변경되지 않습니다. 또한 내부 서비스들로부터 많은 인증 요청을 수시로 받기 때문에 안정성이 고려되어야 하는 서비스입니다.

반면에 주문 서비스를 생각해보겠습니다. 주문 서비스는 비지니스의 요구사항이 자주 추가되거나 변경될 가능성이 농후합니다. 안정성 역시 중요하지만 생산성 또한 안정성 못지 않게 중요합니다.

이처럼 서비스가 어떤 성격을 띄는지에 따라서 생산성을 높일 것인지 안정성을 높일 것인지를 고려하여 설계하면 됩니다.

## Links

- [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
