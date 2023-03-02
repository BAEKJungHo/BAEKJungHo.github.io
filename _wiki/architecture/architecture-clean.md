---
layout  : wiki
title   : Clean Architecture
summary : 
date    : 2023-02-27 15:02:32 +0900
updated : 2023-02-27 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Clean Architecture

![](/resource/wiki/architecture-clean/clean.png)

Entities 는 기업의 업무규칙(고수준 정책) 들을 정의하는 Layer 이며, Use Cases 는 애플리케이션 기능(사용 사례) 을 정의하는 Layer 이다.

Layered Architecture 의 목적인 __"계층을 분리하여 계층간 책임을 명확히 하고 다른 영역에서의 변경으로부터 보호한다."__ 와 [Hexagonal Architecture](https://baekjungho.github.io/wiki/architecture/architecture-hexagonal/) 의 목적인 __"핵심 로직을 주변 Infrastructure 영역으로 부터 분리한다"__ 의 개념이 결합 된 아키텍처라고 생각하면 된다.

__Layered Architecture Flow:__
- Presentation > Application > Persistence > Database
- 오직 한 방향으로만 흐르고 있다.

Clean Architecture 를 설계하기 위해서 가장 중요한 것은 __Dependency Rule__ 을 잘 정하는 것이다. 정확히는 Dependency Flow 가 고수준 정책을 향하게끔 설계하는 것이다.

Clean Architecture 는 Layered Architecture 처럼 수평적인 계층으로 분리한다. 대신 여기에 Hexagonal Architecture 의 철학이 결합되면 아래와 같은 Flow 가 탄생한다. 
- Interfaces > Application > __Domain__ < Infrastructure
- [How to Implementation Clean Architecture ?](https://baekjungho.github.io/wiki/ddd/ddd-clean-architectures/)

핵심 로직이 모여있는 Domain 을 다른 어떤 영역에서의 변경으로부터 보호하기 위함이다.

## Links

- [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)