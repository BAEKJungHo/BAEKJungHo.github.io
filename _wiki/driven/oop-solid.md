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

> SRP(단일 책임 원칙) 맥락에서 '책임'이라는 말이 '변경의 이유'라는 의미로 사용된다는 점이다. SRP 는 [역할, 책임, 협력](https://baekjungho.github.io/wiki/driven/oop-oo/#%EC%97%AD%ED%95%A0-%EC%B1%85%EC%9E%84-%ED%98%91%EB%A0%A5)에서 이야기하는 책임과는 다르며 변경과 관련된 더 큰 개념을 가리킨다.

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

## Open-Closed Principle

### From: UncleBob

> A Module should be open for extension but closed for modification.
> 
> Dan’s answer is “write simple code”. Again, I agree. And, ironically, he is right. Simple code is both open and closed.

### From: Clean Architecture

> OCP(개방-폐쇄 원칙)는 "소프트웨어 개체(artifact)는 확장에는 열려 있어야 하고, 변경에는 닫혀 있어야 한다" 는 원칙이다.
> 
> 소프트웨어 아키텍처를 공부하는 가장 근본적인 이유가 바로 이 때문이다. 만약 요구사항을 살짝 확장하는 데 소프트웨어를 엄청나게 수정해야 한다면, 그 소프트웨어 시스템을 설계한 아키텍트는 엄청난 실패에 맞닥뜨린것이다.

### From: Head First OOAD

> 필요 없는 복잡한 연관 관계를 피해서, 쉽게 재사용 가능하게 만들 수 있게 도와 주는 원칙이 SRP 와 OCP 이다.
>
> OCP 를 사용하면, 기존 코드를 변경하기 보다는 확장을 통해 변경을 가능하게 한다. 예를 들어 클래스에 private 메서드가 여러개 있다면 이들은 수정에 닫혀있는 것이다. 하지만 그 private 메서드를 여러 방법으로 호출할 수 있도록 public 메서드를 추가할 수 있는데 이때 private 메서드의 행동은 변경하진 않지만 확장하고 있는 것이니 이것도 OCP 가 사용되는 또 다른 예이다.

### From: 오브젝트

> 시스템에 새로운 로직을 추가하기 위해 클라이언트 코드를 수정할 필요가 없다는 것(기존 코드에 아무런 영향을 미치지 않고 새로운 객체 유형과 행위를 추가할 수 있는 것)을 OCP 라고 한다. 이것이 객체지향 설계가 전통적인 방식에 비해 변경하고 확장하기 쉬운 구조를 설계할 수 있는 이유다.
> 
> 소프트웨어 개체(클래스, 모듈, 함수 등등)는 확장에 대해 열려 있어야 하고, 수정에 대해서는 닫혀 있어야 한다.
> 
> - 확장에 대해 열려있다: 애플리케이션의 요구사항이 변경될 때 이 변경에 맞게 새로운 동작을 추가해서 애플리케이션의 기능을 확장할 수 있다.
> - 수정에 대해 닫혀있다: 기존의 코드를 수정하지 않고도 애플리케이션의 동작을 추가하거나 변경할 수 있다.
> 
> OCP 는 유연한 설계란 기존의 코드를 수정하지 않고도 애플리케이션의 동작을 확장할 수 있는 설계라고 이야기한다.

### From: 한 번 읽으면 두 번 깨닫는 객체지향 프로그래밍

> 이미 사용 중인 클래스 내부의 코드를 수정하게 되면, 사이드 이펙트가 우려된다.
> 또한, 수정한 코드의 정상작도 유무에 더해서, 사이드 이펙트 발생 유무도 번거롭게 테스트해야 한다. 
> 
> 클래스는 기능 확장에 대해서는 열려있지만, 코드 수정에 대해서는 닫혀있어야 한다.
> 
> 객체지향의 근본 조건인 상속과 오버라이드, 폴리모피즘이 OCP 를 지원한다. Strategy Pattern 이나 Decorator Pattern 을 공부하는 것도 OCP 원리를 좀 더 명확하게 이해할 수 있다.

### From: Real-World Software Development

> OCP 는 코드베이스에 유연성을 추가하고 유지보수성을 개선하는 데 도움을 주는 원칙이다.

## Links

- [SOLID Relevance - UncleBob](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
  - [번역본 - 객체지향 5원칙 (SOLID)은 구시대의 유물 ?](https://mangsby.com/blog/programming/%EA%B0%9D%EC%B2%B4%EC%A7%80%ED%96%A5-5%EC%9B%90%EC%B9%99-solid%EC%9D%80-%EA%B5%AC%EC%8B%9C%EB%8C%80%EC%9D%98-%EC%9C%A0%EB%AC%BC%EC%9D%B8%EA%B0%80/)
- [SOLID 원칙 - 기계인간 John Grib](https://johngrib.github.io/wiki/jargon/solid/#fn:clean-arch-63)

## 참고 문헌

- Clean Architecture / Robert C. Martin 저 / 인사이트
- Head First Object-Oriented Analysis & Design / 브렛 맥래프린, 게리 폴리스, 데이빗 웨스트 저 / O'REILLY
- 오브젝트 / 조영호 저 / 위키북스
- 한 번 읽으면 두 번 깨닫는 객체지향 프로그래밍 / 김동헌 저 / e 비즈북스
- Real-World Software Development 실전 자바 소프트웨어 개발 / 라울-게이브리얼 우르마, 리처드 워버턴 저 / O'REILLY