---
layout  : wiki
title   : Essence of Domain Driven Design
summary : Domain Driven Design is Philosophy, Approach and Art
date    : 2023-01-15 22:57:32 +0900
updated : 2023-01-15 23:21:24 +0900
tag     : ddd
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Essence of Domain Design Driven

DDD 의 본질은 패턴, 방법론이 아니라 __추상적인 철학__ 이나 __접근법__ 이다. 그리고 이러한 본질은 __전략적 설계(strategic design)__ 에 근간을 두고 있다.

- __Domain Driven Design is Philosophy, Approach and Art__

> Domain-driven design (DDD) is a __software development approach__ that focuses on understanding and modeling the business domain, or the specific area of the business that the software is being built for. The goal of DDD is to create a software system that accurately reflects the underlying business processes and rules, and is easily understandable and maintainable by domain experts. __DDD includes a set of practices and patterns for analyzing and modeling the domain__, as well as techniques for implementing the resulting model in software. It emphasizes communication between domain experts and software developers, and the use of domain-specific languages.

현실 세계의 __비지니스 도메인(business domain)__ 은 정말 다양하고 많다. 비지니스 도메인은 회사의 주요 활동 영역을 의미한다. 그리고 비지니스 도메인 안에는 __문제 도메인__ 이 있다. 문제 도메인은 비지니스 도메인에서 소프트웨어로 해결하고자하는 영역의 도메인을 의미한다. 비지니스 도메인과 문제 도메인이 같을 수도 있다.

DDD 는 비지니스 도메인에서 문제가 되는 도메인을 추출하여 해당 도메인을 대상으로 어떻게 __문제(problem)__ 를 __해결(solution)__ 해 나갈 것인가를 생각하고 __접근__ 하는 것이 중요하다.

### Divide and Conquer

문제 도메인을 해결하기 위해서는 __서브 도메인(sub domain)__ 추출이 중요하다. 
- 인터넷 예매라는 문제 도메인을 소프트웨어로 해결하기 위해서 예매, 도면, 상품, 회원 등의 서브 도메인으로 나눈다.

서브 도메인을 추출할 때 중요한 점은 이해 당사자들(개발자, 도메인 전문가 등)이 모여서 __Ubiquitous Language__ 를 사용하여 Communication 하는 것이다.

### Knowledge Crunching

개발자는 처음에 도메인 지식이 전무하지만 도메인 전문가와의 의사소통을 통해서 도메인 지식이 점점 쌓이게 된다. 이러한 과정을 __지식 탐구(Knowledge crunching)__ 이라고 한다. 지식 탐구 과정에서 모든 의사소통은 __Ubiquitous Language__ 를 기반으로 진행된다.

> In Domain-Driven Design (DDD), "knowledge crunching" refers to the process of distilling complex domain knowledge into a simplified, easy-to-understand form that can be used to drive the design and development of software systems. This typically involves breaking down complex concepts and relationships into smaller, more manageable pieces, and then using this simplified knowledge to inform the design of the software's architecture and components. The goal of knowledge crunching is to create a software system that accurately reflects the real-world domain it is meant to model, while also being easy to understand and maintain.

### Distillation

서브 도메인도 __핵심, 지원, 일반__ 으로 분류할 수 있다. 인터넷 예매에서는 예매가 핵심 도메인이고 회원 처럼 모든 서비스가 가지고 있는 도메인을 일반 도메인, 상품과 같은 도메인을 지원 도메인으로 분류할 수 있다.

이렇게 서브 도메인을 분류하는 것을 __Distillation(증류, 추출)__ 이라고 한다.

- __핵심__: 복잡성과 변동성, 난이도가 높다. 경쟁 우위를 가져야 한다. 구현은 In-house 에서 해야 한다.
- __일반__: 복잡성이 핵심보단 낮으며 난이도도 높은 편이다.
- __지원__: 복잡성이 핵심과 일반에 비해 낮으며 난이도가 낮은 편이다. 지원 도메인의 구현은 In-house 또는 하청을 통해 구현한다.

문제 공간(distillation 까지의 과정을 거치는 공간)에서는 도메인 전문가가 주, 개발자가 부 였다면 해결 공간에서는 개발자가 주가 되어 진행된다. 예를 들어 예매라는 핵심 서브 도메인을 해결하기 위해서 __Knowledge crunching__ 이 일어나며 예매 라는 핵심 하위 도메인이 __결제, 티켓, 예매라는 도메인으로 분류__ 가 된다.

## Big Ball of Mud

![](/resource/wiki/ddd-essence/bigballofmud.jpg)

큰 진흙덩어리(Big Ball of Mud)는 특정한 구조없이 성장한 시스템을 설명하는 소프트웨어 아키텍처 패턴이다. Anti-pattern 이 아니다. 작은 소프트웨어의 경우에는 Big Ball of Mud Pattern 으로도 충분히 구현 가능하고 오히려 이 경우가 생산성이 더 좋을 수 있다.

> A "big ball of mud" is a software architecture pattern that describes a system that has grown organically, without much planning or structure, resulting in a complex and difficult-to-maintain codebase. The term is often used to describe systems that have become hard to understand, modify, or extend due to a lack of clear design principles or cohesive structure. In contrast, a well-designed system would be considered a "small ball of mud" or a "well-structured system".

- Brown Field: 이미 구축된 소프트웨어에서 진행하는 것. 소프트웨어 복잡성이 높다.
- Green Field: 맨 처음부터 진행하는 것. 처음 시작하기 때문에 소프트웨어 복잡성이 상대적으로 낮다.

Big Ball of Mud 가 적용된 소프트웨어에서 전략적 설계를 적용할 수 있다.

## Strategic Design and Tactical Design

전략적 설계(strategic design)는 접근법을 의미한다. Bounded Context, Ubiquitous Language 같은 패턴이 있다. 전략적 설계의 목적은 문제 도메인을 추출하여 해결 공간으로 가야하는 것이다.

- 전략적 설계 시 유용한 도구
  - 사용 사례(use-case) 분석
  - Event Storming
  - Business Model 분석

전술적 설계(tactical design)는 Aggregate, Domain-Event 등 상대적으로 방법론에 가깝다. 전술적 설계의 목적은 풍부한 도메인 모델을 적용하는 것이다.

### Ubiquitous Language

가장 중요한 것은 Application Code, Testing Code, Specs and Documentation, Discussion 등 언제 어디서나 Ubiquitous Language 를 기반으로 Communication 을 해야 한다는 것이다. 

Ubiquitous Language 를 용어 사전을 만들어서 관리하는 것이 아닌 Passive 처럼 몸에 배어있어야 한다.

### Event Storming

![](/resource/wiki/ddd-essence/event-storming.png)

Event Storming 은 Brown Field 프로젝트 상황에서 매우 유용하다.

### Bounded Context

- [BoundedContext](https://baekjungho.github.io/wiki/ddd/ddd-bounded-context/)

> A bounded context in Domain-Driven Design (DDD) is a central pattern used to manage complexity in software systems. It refers to a specific area or "subdomain" within a larger system that has its own distinct domain language and model. The idea is to create boundaries within the system to separate concerns and reduce the complexity of managing relationships and interactions between different parts of the system. This allows teams to focus on a specific area of the system, while still being aware of how it interacts with other areas.

### Model Driven

Bounded Context 별로 전술을 설정해야 한다. 즉, 핵심 서브 도메인에 인력을 집중하고 도메인을 잘 표현해 내야 한다. 예매, 결제, 티켓이라는 서브 핵심 도메인에서 예매에 Model Driven 이라는 전술을 적용할 수 있다.

모델 주도(Model-driven)는 시스템의 추상적 표현인 모델을 먼저 생성하여 해당 시스템의 설계, 개발 및 배포의 기초로 사용하는 소프트웨어 개발 접근법을 말한다.

> Model-driven refers to a software development approach in which a model, or abstract representation of a system, is created first and used as the basis for the design, development, and deployment of that system. The model can be used to automatically generate code, test cases, and other artifacts, and can also be used for simulation and validation of the system's behavior. This approach can help to improve the efficiency and quality of the software development process and can also facilitate the creation of more robust and maintainable systems.

### Context Map

![](/resource/wiki/ddd-essence/context-map.png)

The context map is a visual representation of the system’s bounded contexts and integrations between them. 

- [Anticorruption Layer(ACL)](https://baekjungho.github.io/wiki/ddd/ddd-anticorruption-layer/)

## Links

- [NHN FORWARD 2022](https://www.youtube.com/watch?v=6w7SQ_1aJ0A&list=PL42XJKPNDepYXyKefvicxlA2fz1aThVs5&index=37)
- [Event Storming - ContextMapper](https://contextmapper.org/docs/event-storming/)
- [What is Domain Driven](https://www.oreilly.com/library/view/what-is-domain-driven/9781492057802/ch04.html)

## References

- 도메인 주도 설계 / Eric Evans 저 / 위키북스