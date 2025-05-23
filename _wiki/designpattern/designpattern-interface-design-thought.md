---
layout  : wiki
title   : INTERFACE
summary : 
date    : 2025-01-01 19:28:32 +0900
updated : 2025-01-01 20:15:24 +0900
tag     : designpattern principle
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## INTERFACE

Interface Programming 에 대한 내용은 1995 년에 등장한 Java 보다 먼저 나온 사상으로 추상적이고 일반화된 설계 사상이다.
1994년 에 출판된 ___[<<GoF, Design Patterns: Elements of Reusable Object-Oriented Software (1994)>>](https://en.wikipedia.org/wiki/Design_Patterns)___ 에서 처음 등장했다.

![](/resource/wiki/designpattern-interface-design-thought/principles.png)

본질적으로 인터페이스는 <mark><em><strong>Protocol 또는 Contract 의 집합</strong></em></mark>으로, 사용자에게 제공되는 기능의 목록이다.

Use of an interface also leads to ___[dynamic binding](https://en.wikipedia.org/wiki/Dynamic_dispatch)___ and ___[polymorphism](https://klarciel.net/wiki/oop/oop-polymorphism/)___, which are central features of object-oriented programming.

> 코드에서 구현되는 인터페이스는 구현이 아닌 인터페이스 기반이라는 설계 사상 에서 프로그래밍 언어의 인터페이스 또는 추상 클래스로 이해될 수 있다. 이 사상을 적용하면 구현이 세부 사항에 의존하지 않고 인터페이스에 의존하도록 하여 세부 사항이 변경되더라도 업스트림 시스템 코드를 변경할 필요 없고 결합을 줄이고 확장성을 향상시키게 된다.
>
> 구현이 아닌 인터페이스에 기반한 프로그래밍이라는 설계 사상을 표현하는 또 다른 방법은 구현이 아닌 ___[추상화(ABSTRACTION)](https://klarciel.net/wiki/architecture/architecture-abstraction/)___ 에 기반한 프로그래밍 이다. 이 표현이 설계 사상의 원래 의도를 훨씬 더 잘 반영하고 있다. 구현에 영향받지 않는 설계는 코드 유연성을 높여주며, 이후 요구 사항이 변경되더라도 훨씬 더 잘 대응할 수 있게 된다. 좋은 코드 설계는 현재 요구 사항에 유연하게 대응할 수 있을 뿐만 아니라 이후 요구 사항이 변경될 때조차도 기존의 코드 설계를 훼손하지 않고 유연하게 대응하는 것이다. 추상화는 코드의 확장성, 유연성, 유지보수성을 향상 시키는 효과적인 수단이다.
>
> 이 설계 사상의 원래 의도를 생각해보면, 비지니스 시나리오에서 특정 기능에 대한 구현 방법이 하나 뿐이고, 이후에도 다른 구현 방법으로 대체할 일이 없다면 인터페이스를 정의할 필요가 없다. 그리고 함수의 구현이 변경되더라도 동시에 두개의 구현이 사용되지 않는다면 클래스의 구현을 직접 수정해도 된다. 함수는 그 자체로 구현 세부사항을 캡슐화한 추상화이다. 따라서 함수의 정의가 충분하다면, 인터페이스가 없어도 구현이 아닌 추상화 사상을 만족할 수 있다.
>
> *<small>设计模式之美 / 王争</small>*

Swift 의 ___[protocol](https://bbiguduk.gitbook.io/swift/language-guide-1/protocols)___ 은 객체나 구조체, 열거형 등이 특정 속성이나 메서드를 반드시 구현하도록 강제하는 일종의 ___계약(Contract)___ 이다. 이는 인터페이스 기반 설계 철학을 그대로 반영한 개념으로, 구현 세부 사항이 아닌 추상화를 기반으로 코드를 작성할 수 있도록 한다.

Spring 에서는 ___[Portable Service Abstraction](https://klarciel.net/wiki/spring/spring-psa/)___ 를 통해 인터페이스 설계 사상을 반영한 것을 알 수 있다.

___Interface___ 가 클수록 추상화는 약해진다. 실제로 인터페이스에 메서드가 늘어날 수록 재사용성은 떨어질 수 있다. 인터페이스를 간결하게 만들면 인터페이스를 조합해서 상위 수준의 추상화를 정의할 수 있다.

```go
type Reader interface {
  Read(p []byte) (n int, err error)
}

type Writer interface {
  Write(p []byte) (n int, err error)
}

type ReadWriter interface {
  Reader
  Writer
}
```

Go 에서는 인터페이스를 기본적으로 클라이언트(사용자) 측에 둔다.

이는 ___[Interface Segregation Principle](https://klarciel.net/wiki/oop/oop-solid/)___ 과도 잘 맞다.
Provider 측에 구체적인 구현을 드러내고, 이를 사용할 지 추상화가 더 필요할 지는 사용자 측에서 직접 판단하는 게 좋다.
단, 설계 방향성이 제공자 측에 두는게 더 나은 경우도 있다.

## References

- Design Patterns: Elements of Reusable Object-Oriented Software / GoF
- 设计模式之美 / 王争
- Go 100 Mistakes and How to Avoid Them / Teiva Harsanyi / MANNING