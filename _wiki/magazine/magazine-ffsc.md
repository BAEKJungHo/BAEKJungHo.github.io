---
layout  : wiki
title   : FFSC
summary : 
date    : 2023-07-23 20:54:32 +0900
updated : 2023-07-23 21:15:24 +0900
tag     : magazine architecture
toc     : true
comment : true
public  : true
parent  : [[/magazine]]
latex   : true
---
* TOC
{:toc}

## FFSC

__FFSC Architectures__:
- Feature
- Function
- System
- Clean

현재 5년차로 접어들면서 미들레벨로 넘어가고 있는 시점인 것 같다. __42dot - Hyundai Motor Group__ 에서 MSA, Saga, CleanArchitecture 등 다양한 아키텍처를 시도해볼 수 있는 경험을 했다. 물론 모든 도전에 마무리가 있고 성과가 났으면 좋았을텐데, 그렇지 못한 프로젝트도 있었다.

이 경험에서 확실하게 배운 것 중 하나는 __Best Architectures it depends on the situation__ 이었다.

본론으로 넘어가서, __Feature/Function/System__ 이라는 개념을 __CORE-VALUE of Clean Architecture__ 와 결합을 하면 나름 의미있는 아키텍처를 프로젝트에 적용할 수 있다.

- Feature 는 가장 작은 단위 이며 재사용가능(reusable) 하다.
- Function 은 Feature 의 조합이다.
- System 은 Function 의 조합이며, 별도의 인스턴스로 동작하는 모듈을 의미한다.

__Design of Module & Package Structures__:

Spring Boot Gradle Multi Module Projects 의 경우에는 간단하게 core, client, server-a, server-b 등의 모듈로 구성이 될 것이다. 여기서 client, core 는 servers 에서 사용 가능한 Feature
에 해당되며, servers 가 System 에 해당된다. 따라서 모듈은 System 일 수도 있고, Feature 일 수도 있다. Function 은 System 을 이루는 핵심 도메인/컴포넌트 개념으로 생각하면 된다.
Function 을 별도의 모듈로도 구분할 수 있고, 패키지로도 구분할 수 있는데 개념적으로는 Controller 와 Facade 가 포함된 계층을 의미한다.

__Design of Sub Package Structures__:

큰 구조를 잡았다면 세부적은 패키지 구조를 설계해야 한다. 패키지를 설계할때 일반적으로 __Layer vs Domain__ 방식 중 하나로 설계하게 된다. 이 과정에서 또 세부적으로 domain 을 상위 패키지로 두고 하위에 layer 를 두거나,
layer 를 상위에 두고 하위에 domain 별로 구분할 수도 있다. 여기서 말하는 layer 는 [PresentationDomainDataLayering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html) 개념일 수도 있고,
dto, repository 같은 개념일 수도 있다. 각자 장단점이 있으니 상황에 맞게 설계하면 된다.

Green Field 의 경우에는 DDD 를 적용해보는 것도 좋을 것 같다. Brown Field 라면 최대한 적은 리소스로 최대의 효과를 보는 방법을 선택하는 것이 더 낫다고 생각한다.