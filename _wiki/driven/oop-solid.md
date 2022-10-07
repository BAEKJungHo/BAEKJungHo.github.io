---
layout  : wiki
title   : SOLID
summary : 
date    : 2022-10-02 15:02:32 +0900
updated : 2022-10-02 15:12:24 +0900
tag     : methodology oop
toc     : true
comment : true
public  : true
parent  : [[/methodology]]
latex   : true
---
* TOC
{:toc}

## Single Responsibility Principle

### From: UncleBob

> __Gather together the things that change for the same reasons. Separate things that change for different reasons.__
> 
> Microservices do not solve this problem. You can create a tangled microservice, or a tangled set of microservices if you mix code that changes for different reasons.
> 
> Dan North’s answer to the SRP is to “Write Simple Code”. I agree. The SRP is one of the ways we keep the code simple.
> 
> - [Dan North’s position on SOLID](https://speakerdeck.com/tastapod/why-every-element-of-solid-is-wrong)
>   - Just write simple code

### From: Clean Architecture

> SOLID 원칙 중에서 그 의미가 가장 잘 전달되지 못한 원칙은 바로 SRP 이다. 프로그래머가 이 원칙의 이름을 듣는다면 모든 모듈이 단 하나의 일만 해야 한다는 의미로 받아들이기 쉽다. 
> 
> 단 하나의 일만 해야 한다는 원칙은 따로 있다. 바로 함수는 반드시 하나의, 단 하나의 일만 해야 한다는 원칙이다. 
> 이 원칙은 커다란 함수를 작은 함수들로 리팩터링 하는 더 저수준에서 사용된다.
> 
> 역사적으로 SRP 는 다음과 같이 기술되어 왔다.
> 
> __단일 모듈은 변경의 이유가 하나, 오직 하나 뿐이어야 한다.__
>
> 변경의 이유란 바로 사용자와 이해관계자를 가리키며, 다음과 같이 바꿔 말할 수도 있다. __하나의 모듈은 하나의, 오직 하나의 사용자 또는 이해관계자에 대해서만 책임져야 한다.__
> 
> 사용자와 이해관계자란 단어를 여기에 쓰는 것은 올바르지 않다. 이러한 집단을 액터라고 하는데 SRP 의 최종 버전은 아래와 같다.
> 
> __하나의 모듈은 하나의, 오직 하나의 액터에 대해서만 책임져야 한다.__
> 
> 모듈은 함수와 데이터 구조로 구성된 응집된 집합이다.
> 
> 응집된(cohesive) 이라는 단어가 SRP 를 암시하며, 단일 액터를 책임지는 코드를 함께 묶어주는 힘이 바로 응집성(cohesion)이다.

### From: Head First OOAD

> 필요 없는 복잡한 연관 관계를 피해서, 쉽게 재사용 가능하게 만들 수 있게 도와 주는 원칙이 SRP 와 OCP 이다.
>
> DRY 는 하나의 기능을 한 곳에 두자는 내용이다.
>
> SRP 는 클래스가 한 가지 일만 잘하게 하자는 내용이다.

### From: 오브젝트

> SRP 맥락에서 '책임'이라는 말이 '변경의 이유'라는 의미로 사용된다는 점이다. SRP 는 [역할, 책임, 협력](https://baekjungho.github.io/wiki/driven/oop-oo/#%EC%97%AD%ED%95%A0-%EC%B1%85%EC%9E%84-%ED%98%91%EB%A0%A5)에서 이야기하는 책임과는 다르며 변경과 관련된 더 큰 개념을 가리킨다.

### From: 한 번 읽으면 두 번 깨닫는 객체지향 프로그래밍

> 시스템의 모든 객체는 하나의 책임만을 가져야 한다.

### From: Real-World Software Development

> SRP 는 쉽게 관리하고 유지보수하는 코드를 구현하는 데 도움을 주는 포괄적인 소프트웨어 개발 지침이다.
> 
> 다음 두 가지를 보완하기 위해 SRP 를 적용한다.
> 
> - 한 클래스는 한 기능만 책임진다.
> - 클래스가 바뀌어야 하는 이유는 오직 하나여야 한다.
> 
> SRP 를 적용하면 코드가 바뀌어야 하는 이유가 한 가지로 제한되므로 더 튼튼한 코드를 만들 수 있다.

## Links

- [SOLID Relevance - UncleBob](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)

## 참고 문헌

- Clean Architecture / Robert C. Martin 저 / 인사이트
- Head First Object-Oriented Analysis & Design / 브렛 맥래프린, 게리 폴리스, 데이빗 웨스트 저 / O'REILLY
- 오브젝트 / 조영호 저 / 위키북스
- 한 번 읽으면 두 번 깨닫는 객체지향 프로그래밍 / 김동헌 저 / e 비즈북스
- Real-World Software Development 실전 자바 소프트웨어 개발 / 라울-게이브리얼 우르마, 리처드 워버턴 저 / O'REILLY