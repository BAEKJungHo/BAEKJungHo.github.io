---
layout  : wiki
title   : DEPENDENCY
summary : 
date    : 2024-08-09 15:02:32 +0900
updated : 2024-08-09 15:12:24 +0900
tag     : architecture spring
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## DEPENDENCY

A ___[Dependency](https://en.wikipedia.org/wiki/Coupling_(computer_programming))___ occurs when one component (the dependent) requires another component (the dependency) to perform its tasks.

__Common forms__:
- Function calls
- Class inheritance
- Interface implementation
- Data sharing

___[Software Architectures](https://baekjungho.github.io/wiki/architecture/architecture-software/)___ 를 설계 하거나, 비지니스 로직을 수행하기 위한 Sequence 를 설계할 때, Dependency 에 대한 고려가 빠질 수 없다.
A 가 B 에 의존하고 있는 경우 A 는 B 와 ___[Coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming))___ 되어있다라고 표현하기도 한다. 결합도가 높은 서비스 구조는 일반적으로 안티패턴으로 간주되는데 그 이유는 B 의 변경사항이 A 에게도 영향을 줄 수 있기 때문이다.
그래서 보통 MSA 나 다양한 팀으로 구성되어있는 회사에서, 각 서비스간 의존성을 줄이기 위해 사용되는 패턴이 ___[Publish/Subscribe Architecture](https://baekjungho.github.io/wiki/architecture/architecture-pub-sub/)___ 이다. Message Broker 를 도입해 데이터를 Consume 하더라도, Payload 에 다양한 형식의 데이터가 존재한다면 아예 의존성이 없다고 말할 순 없다.
즉, 타 서비스에서 발행된 데이터에 의존하게 되는 셈이다. 이 경우 ___[ZERO PAYLOAD](https://baekjungho.github.io/wiki/architecture/architecture-zero-payload/)___ 도입을 고려해볼 수 있다.

추가로 의존성은 테스트 코드 작성을 어렵게 만드는 경우가 있다. Domain Layer 에서 Infra Layer 에 대한 의존성이 있는 경우 ___[Testability](https://baekjungho.github.io/wiki/test/test-design-for-testability/)___ 가 떨어진다. 즉, Domain Layer 에 대한 테스트 코드 작성이 더 어려워 진다.

## Management Techniques

Dependency 를 관리하기 위한 기술로는 ___[Inversion Of Control](https://baekjungho.github.io/wiki/spring/spring-ioc/)___, ___[Dependency Injection](https://baekjungho.github.io/wiki/spring/spring-di/)___ 등이 있다.

Constructor Injection 을 사용한 DI 는 다음과 같다.

![](/resource/wiki/architecture-dependecny/constructor-di.png)

```java
public class Salutation {
    private readonly IMessageWriter writer;

    public Salutation(IMessageWriter writer) {
        if (writer == null)     
            throw new ArgumentNullException("writer");
        this.writer = writer;
    }
    
    public void Exclaim() {
        this.writer.Write("Hello DI!");   
    }
}
```

구체 타입 대신 ___Abstraction___ 타입을 사용하여 구성(Composition) 을 사용하는 것을 ___SEAM___ 이라고 한다.

![](/resource/wiki/architecture-dependecny/seam.png)

Dependency Injection 을 사용하면 ___[Layered Architecture](https://martinfowler.com/bliki/InversionOfControl.html)___ 를 사용하더라도 의존성 방향을 고수준에서 저수준으로 단방향으로 흐르게끔 만들 수 있다.

![](/resource/wiki/architecture-dependecny/flow.png)

## Links

- [Inversion of Control Containers and the Dependency Injection pattern - Martinfowler](https://martinfowler.com/articles/injection.html)

## References

- Dependency Injection Principles, Practices, and Patterns / Steven van Deursen and Mark Seemann