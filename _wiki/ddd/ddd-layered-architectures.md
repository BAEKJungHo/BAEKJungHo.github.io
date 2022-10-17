---
layout  : wiki
title   : Layered Architectures
summary : Layered Architectures 에 따른 각 Layer 의 구현 방식
date    : 2022-07-11 15:02:32 +0900
updated : 2022-07-11 15:12:24 +0900
tag     : ddd
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

# Layered Architectures

## From: 도메인 주도 설계

| Layer  | Description  |  Object |
|--------|--------------|---------|
| 사용자 인터페이스(interfaces) | 사용자에게 정보를 보여주고 사용자의 명령을 해석하는 책임  | Controller, Dto, Mapper |
| 응용 계층(application) | 수행할 작업을 정의하고 표현력 있는 도메인 객체가 문제를 해결하게 한다. 이 계층에서 책임지는 작업은 업무상 중요하거나 다른 시스템의 응용 계층과 상호 작용하는 데 필요한 것들이다. 이 계층은 얇게 유지되고, 오직 작업을 조정하고 아래에 위치한 계층에 포함된 도메인 객체의 협력자에게 작업을 위임한다.      | Facade |
| 도메인 계층(domain) | 업무 개념과 업무 상황에 대한 정보, 업무 규칙을 표현하는 일을 책임진다. 이 계층에서는 업무 상황을 반영하는 상태를 제어하고 사용하며, 그와 같은 상태 저장과 관련된 기술적인 세부사항은 인프라 스트럭쳐에 위임한다. 이 계층이 업무용 소프트웨어의 핵심이다.  | Service, Command, Criteria, Info, Reader, Store, Executor, Factory(interface) |
| 인프라 스트럭쳐 계층(infrastructure) | 상위 계층을 지원하는 일반화된 기술적 기능을 제공한다. 이러한 기능에는 애플리케이션에 대한 메시지 전송, 도메인 영속화, UI 에 위젯을 그리는 것 등이 있다. | low level 구현체, HttpServiceImpl, Spring JPA, RedisConnector |

> MODEL-DRIVEN-DESIGN 을 가능케 하는 것은 Domain Layer 를 분리하는데 있다.

## Domain vs Entity

만약에, Domain 과 Entity 라는 개념을 분리해서 관리한다고 하면 Entity 는 Infrastructure Layer 에 속할 수도 있다. 단, 도메인 로직은 Domain Class 에 잘 응집이 되어 있어야 한다. 혹은, Entity 도 Domain Layer 에 두어서 관리할 수 있다.

Domain 과 Entity 를 분리하는 이유는 `변경에 대한 유연함` 이다. Domain 객체가 여러 미들웨어 실체들과 연결될 수도 있기 때문이다. 엔티티 클래스에 인터페이스가 있다면 나중에 데이터베이스나 ORM 을 교체하기가 쉬워진다. 또한 SOLID 원칙을 생각했을 때는 Entity 랑 Domain 을 분리해서 관리하는게 좋다고 생각한다. 

그럼에도 불구하고 Entity 에 Domain 로직들을 모아두는 방법도 나쁘지는 않다고 생각한다. 이 경우의 가장 큰 장점은 `생산성`이라고 생각한다.

## DTO 

DTO 는 어느 계층에 존재하는 것이 맞을까? 회사마다 다르다.

A 회사는 DTO 를 interface 계층에 두기도 하며, B 회사는 DTO 를 application 계층에 두기도 한다.

## Layer 간 참조 관계

![](/resource/wiki/ddd-layered-architectures/layer.png)

- __Layer 간의 참조 관계에서 application 과 infrastructure 는 domain layer 를 바라보게 하고, 양방향 참조는 허용하지 않게 한다.__
   - 즉, infrastructure 에서 domain/application 계층에 있는 클래스를 바라볼 수 있으며, domain 과 application 에서는 infrastructure 를 바라보지 않게 한다.
   - 양방향 참조를 허용하지 않게 하기 위해서는 `세부 구현 기술에 대한 인터페이스를 지원`하면 된다.
- domain layer 는 low level 의 기술에 상관 없이 독립적으로 존재할 수 있어야 한다.

## Layered Architecture 의 핵심 기술

Layered Architecture 에서 대부분의 로직들은 추상화 된다. 이러한 아키텍처에서 실제 구현체가 동작하기 위한 핵심 기술은 [PSA](https://baekjungho.github.io/wiki/spring/spring-psa/)와 + [DI](https://baekjungho.github.io/wiki/spring/spring-di/) 이다.

## Domain Layer

> DDD 의 목표는 기술보다는 도메인에 대한 모델에 집중해 더 나은 소프트웨어를 만들어내는 것이다.

- 업무 개념과 업무 상황에 대한 정보, 업무 규칙을 표현하는 일을 책임진다.
- 이 계층에서는 업무 상황을 반영하는 상태를 제어하고 사용하며 그와 같은 상태 저장과 관련된 기술적인 세무사항은 인프라스트럭쳐에 위임한다.
- 이 계층이 업무용 소프트웨어의 핵심이다.
- 외부(interfaces)의 변경에 영향을 받지 않도록 추상화 수준이 높아야 한다.

### 표준 구현

- __domain layer 에서의 Service 에서는 해당 도메인의 전체 흐름을 파악할 수 있도록 구현 되어야 한다.__
  - 도메인 로직에서는 어떤 기술을 사용했는지는 중요하지 않다. 어떤 업무를 어떤 순서로 처리했는지가 더욱 중요한 관심사이다.
  - 도메인 업무는 적절한 interface 를 사용하여 추상화하고 실제 구현은 다른 layer 에 맡기는게 맞다.
- __세세한 기술 구현은 인프라스트럭쳐에서 담당한다. Domain Service 는 DI 를 통해서 사용한다.__
  - 영속화된 객체를 로딩하기 위해 Spring JPA 를 사용할 수도 있지만 MyBatis 를 사용할 수도 있는 것이다. domain layer 에서는 객체를 로딩하기 위한 추상화된 interface 를 사용하고, 실제 동작은 하위 layer 의 기술 구현체에 맡긴다.
  - interface 로 추상화된 실제 구현 기술은 언제든지 원하는 것으로 교체가 가능하다.
- __Specification 을 활용한다.__
  - 명세는 어떤 객체가 그 객체의 평가 기준을 만족하는지 판정하기 위한 객체를 의미한다.
  - 명세는 도메인 규칙이 정의된 객체를 의미한다.
  - 단, 도메인 규칙이 도메인 클래스와 명세에 분리되서 관리될 가능성이 있기 때문에, 명세의 정확한 역할을 정의한 다음 사용해야 한다.
- __domain layer 에서의 Service 들은 xxxService 로 선언될 필요는 없다.__
  - 수 많은 Service 클래스가 존재하게 되면, 도메인 전체 흐름을 컨트롤하는 Service 가 무엇인지 알기 어렵다.
  - 도메인 전체 흐름을 컨트롤하는 Service 는 하나로 유지하고, 이를 support 하는 클래스는 각각의 역할,책임에 맞게 네이밍을 가져간다.
    - (interface) xxxReader, xxxStore, xxxAggregator, xxxFactory, xxxExecutor ...
    - 이에 대한 구현체는 인프라스트럭쳐에서 구현한다.
- __Service 간에는 참조 관계를 가지지 않도록 한다.__
  - DDD 의 Aggregate Root 개념 처럼 Entity 간에도 상하 관계가 존재하며, Service 를 구현하는 과정에서도 상하 관계가 생긴다.
  - Service 간의 참조 관계를 갖게 되면, 상위 Service 가 하위 Service 를 참조하게 되는 현상이 발생한다.
  - 코드 의존성이 많으면 테스트 코드가 어려워지기 때문에 이런 구조는 피해야 한다.
  - Service 간의 참조 관계를 가지지 않도록 원칙을 세운다.
    - Service 내의 로직은 추상화 수준을 높게 가져가고, 각 추상화의 실제 구현체를 쪼개서 관리한다.

## Infrastructure Layer

> 상위 계층을 지원하는 일반화된 기술적 기능을 제공한다.

### 표준 구현

- __domain layer 에 사용되는 추상화된 interface 에 대한 구현체를 관리한다.__
  - domain layer 에서는 DI 를 통해서 구현체를 사용하게 된다.
- __세세한 기술 스택을 활용해 domain 의 추상화된 interface 를 구현하는 것이므로 비교적 구현에서의 자유도를 높게 가져갈 수 있다.__
  - [Persistence Ignorance](https://deviq.com/principles/persistence-ignorance)
  - [Having the domain model separated from the persistence model](https://enterprisecraftsmanship.com/posts/having-the-domain-model-separate-from-the-persistence-model/)
- __infrastructure layer 간의 참조 관계는 허용한다.__
  - infrastructure layer 는 주로 domain layer 에 선언된 interface 에 대한 구현체가 많으므로 Service 에 비해서 의존성이 많지 않다.
  - 로직의 재활용을 위해 infrastructure 내의 구현체를 의존 관계로 활용해도 된다. (단, 순환 참조는 발생하지 않도록 해야 함)
  - infrastructure layer 에서의 bean 들은 `@Component` 어노테이션을 사용하여 관리한다. 사실 `@Service` 와의 기능적인 차이는 없지만 annotation 을 통해서 class 에 대한 의미 부여 정도를 할 수 있다.

## Application Layer

> 도메인 객체가 문제를 해결하도록 지시하는 계층이며, 비지니스 규칙은 포함하지 않는다.

- 수행할 작업을 정의한다.
- 도메인 객체가 문제를 해결하도록 지시한다.
- 다른 애플리케이션 계층과의 상호 작용
- 비지니스 규칙은 포함하지 않으며, 작업을 조정하고, 도메인 계층에 업무를 위임한다.
  - 따라서 해당 layer 는 얇게 유지됨
- 작업을 조정하기만 하고 도메인 상태를 가지면 안된다.

### 표준 구현

- __transaction 으로 묶여야 하는 도메인 로직과, 그 외의 로직을 aggregation 하는 역할로 한정 짓는다.__
- __application layer 의 네이밍은 xxxFacade 를 사용한다.__
  - Facade 의 개념은 복잡한 여러 개의 API 를 하나의 인터페이스로 aggregation 하는 역할이지만, application layer 내에서의 facade 는 __서비스 간의 조합으로 하나의 요구사항을 처리하는 클래스__ 로 정의할 수 있다. 

실제적인 요구사항을 예시로 하여 Facade 구현을 정의해보면 다음과 같다.
  
- "주문완료 후 유저에게 카카오톡으로 주문 성공 알림이 전달된다" 라는 요구사항이 있다고 가정
  - 주문 처리 과정에서의 모든 도메인 로직은 하나의 transaction 으로 묶여야 정합성에 이슈가 없다.
  - 그러나 주문 완료 직후의 카카오톡 알림 발송이 실패하더라도, 주문 로직이 전체 롤백될 필요는 없다.

```kotlin
fun completeOrder(registerOrder: OrderCommand.RegisterOrder): String {
    val orderToken = orderService.completeOrder(registerOrder)
    notificationService.sendKakao(template = "ORDER_COMPLETE", content = "complete order")
    return orderToken
}
```

- completeOrder 메서드는 transaction 이 없다.
- orderService.completeOrder(registerOrder) 에 transaction 이 선언되어 있다.
- 외부 서비스에 대한 성공/실패에 민감하지 않도록 요구사항을 처리한다.

## Interfaces Layer

> 사용자에게 정보를 보여주고 사용자의 명령을 해석하는 책임을 진다.

### 표준 구현

- __DTO 를 interfaces layer 에 두는 이유__
  - DTO 와 Mapper(도메인 Layer 에서 사용되는 Command, Criteria 객체로 변환하는 역할)등을 interfaces layer 에 두는 이유는, interfaces layer 가 사용자의 요청을 해석하고, 응답을 전달하는 곳이기 때문이다.
  - 즉, 사용자의 요청을 DTO 로 받아서 해석(Mapper 를 통해 다른 객체로 변환)하는 역할을 담당하는 Layer 라고 생각하면 된다.
- __API 를 설계할 때에는 없어도 되는 Request Parameter 는 제거하고, 외부에 리턴하는 Response 도 최소한을 유지하도록 노력하자__
  - 요구하는 Request Parameter 가 많다는 것은 관련된 메서드나 객체에서 처리해야하는 로직이 많다는 것을 의미하고, 이는 관련된 객체가 생각보다 많은 역할을 하고 있다는 신호일 수 있다.
  - Response 의 경우도 불필요한 응답을 제공하고 있고 이를 가져다 쓰는 로직이 있다면, 추후 해당 Response 에서 특정 프로퍼티는 제거하기 어렵게 될 수 있다.
  - API 는 한번 외부에 오픈하면 바꿀 수 없는 것이라고 생각하자. 처음부터 제한적으로 설계하고 구현해야 한다.
    - 경우에 따라서 resource 중간에 버전을 명시하기도 한다.(Ex. v1, v2)
- __http, gRPC, 비동기 메시징과 같은 서비스간 통신 기술은 interfaces layer 에서만 사용되도록 한다.__
  - 가령 json 처리 관련 로직이나 http cookie 파싱 로직 등이 Domain layer 에서 사용되는 식의 구현은 피해야 한다.
  - 그렇게 하지 않으면 언제든지 교체될 수 있는 외부 통신 기술로 인해 domain 로직까지 변경되어야 하는 상황이 발생한다.

## Links

- [Portable Service Abstraction](https://baekjungho.github.io/wiki/spring/spring-psa/)
- [Dependency Injection](https://baekjungho.github.io/wiki/spring/spring-di/)

## References

- 도메인 주도 설계 / Eric Evans 저 / 위키북스
- The Red: 비지니스 성공을 위한 Java/Spring 기반 서비스 개발가 MSA 구축