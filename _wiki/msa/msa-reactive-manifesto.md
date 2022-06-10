---
layout  : wiki
title   : Reactive Manifesto
summary : 리액티브 선언문
date    : 2022-06-03 17:54:32 +0900
updated : 2022-06-03 20:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Reactive Manifesto

> 소프트웨어 아키텍처란 소프트웨어를 구성하는 요소와 그 구성요소 간의 관계를 정의한 것이다. 또한 아키텍처를 정의하는 과정은 시스템 구축을 위한 여러 가지 비기능 요건(성능, 가용성, 보안, 유지보수성, 확장성 등)을 만족하는 다양한 해결 방법을 찾는 과정이다.
> 
> reactive 의 사전적 의미는 '반응을 보이는'이다. 이는 다양한 상황에 따라 빠르고 적절하게 반응하는 시스템을 의미한다.

![](/resource/wiki/msa-reactive-manifesto/reactive-manifesto.png)

- __응답성(Responsive)__
  - 사용자에게 신뢰성 있는 응답을 빠르고 적절하게 제공하는 것을 의미
- __탄력성(Resilient)__
  - 장애가 발생하거나 부분적으로 고장 나더라도 시스템 전체가 고장 나지 않고 빠르게 복구하는 능력을 의미
- __유연성(Elastic)__
  - 시스템의 사용량에 변화가 있더라도 균일한 응답성을 제공하는 것을 의미
  - 시스템 사용량에 비례해서 자원을 늘리거나 줄이는 능력
- __메시지 기반(Message Driven)__
  - 비동기 메시지 전달을 통해 위치 투명성, 느슨한 결합, 논블로킹 통신을 지향하는 것을 의미
  - 마이크로서비스 간의 의존성을 줄이는 중요한 특성

## Architecture Flexibility

아키텍처 유연성(Architecture Flexibility)은 시스템을 구성하는 요소 간의 관계들이 느슨하게 맺어져 있어 언제든지 대체되거나 추가 확장될 수 있는 특성을 말한다. 

특히, 클라우드 인프라 자체가 변화무쌍한 비지니스 환경에 대응할 수 있는 유연성과 확장성을 갖추고 있기 때문에 애플리케이션 아키텍처 역시 유연성을 갖춰야 한다.

## Links

- [The Reactive Manifesto](https://www.reactivemanifesto.org/)

## 참고 문헌

- 도메인 주도 설계로 시작하는 마이크로서비스 개발 / 한정헌, 유해식, 최은정, 이주영 저 / 위키북스