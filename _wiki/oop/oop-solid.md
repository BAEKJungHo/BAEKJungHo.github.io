---
layout  : wiki
title   : SOLID
summary : 
date    : 2022-10-02 15:02:32 +0900
updated : 2022-10-02 15:12:24 +0900
tag     : oop
toc     : true
comment : true
public  : true
parent  : [[/oop]]
latex   : true
---
* TOC
{:toc}

## Single Responsibility Principle

### From: UncleBob

> Gather together the things that change for the same reasons. Separate things that change for different reasons.
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
> 단일 모듈은 변경의 이유가 하나, 오직 하나 뿐이어야 한다.
>
> 변경의 이유란 바로 사용자와 이해관계자를 가리키며, 다음과 같이 바꿔 말할 수도 있다. 
> 
> 하나의 모듈은 하나의, 오직 하나의 사용자 또는 이해관계자에 대해서만 책임져야 한다.
> 
> 사용자와 이해관계자란 단어를 여기에 쓰는 것은 올바르지 않다. 이러한 집단을 액터라고 하는데 SRP 의 최종 버전은 아래와 같다.
> 
> 하나의 모듈은 하나의, 오직 하나의 액터에 대해서만 책임져야 한다.
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

## Liskov Substitution Principle

### From: UncleBob

> A program that uses an interface must not be confused by an implementation of that interface.
> 
> This principle is about keeping abstractions crisp and well-defined.
> 
> Dan’s slides are entirely correct on this topic; he simply missed the point of the principle. Simple code is code that maintains crisp subtype relationships.

### From: Clean Architecture

> 1998년 Barbara Liskov 는 subtype 을 아래와 같이 정의했다.
> 
> 여기에서 필요한 것은 다음과 같은 치환(substitution) 원칙이다. S 타입의 객체 o1 각각에 대응하는 T 타입 객체 o2 가 있고, T 타입을 이용해서 정의한 모든 프로그램 P 에서 o2 의 자리에 o1 을 치환하더라도 P 의 행위가 변하지 않는다면 S 는 T 의 하위타입이다.

### From: 오브젝트

> LSP 를 한 마디로 정리하면 "서브타입은 그것의 기반 타입에 대해 대체 가능해야 한다" 는 것으로 클라이언트가 "차이점을 인식하지 못한 채 파생 클래스의 인터페이스를 통해 서브 클래스를 사용할 수 있어야 한다" 는 것이다.

### From: 한 번 읽으면 두 번 깨닫는 객체지향 프로그래밍

> LSP 란 "자식 클래스는 부모 클래스가 사용되는 곳(이 클래스 그룹을 사용하는 다른 클래스)에 대체될 수 있어야 한다" 는 원칙이다.

### From: Real-World Software Development

> LSP 는 클래스 상속과 인터페이스 구현을 올바르게 사용하도록 도와준다. 
> 
> 형식(type)이라는 용어가 등장하면 클래스나 인터페이스를 떠올리자. 하위형식(subtype)이라는 용어는 두 형식이 부모와 자식 관계를 이루었음을 의미한다. 즉, 클래스 상속이나 인터페이스 구현이 이에 해당한다.
> 
> LSP 를 자세히 들여다보면 LSP 를 네 개의 부분으로 쪼갤 수 있다.
> 
> q(x) 는 T 형식의 x 객체를 증명할 수 있는 공식이다. 그러면 S 형식의 객체 y 가 있고 S 가 T 의 하위형식이라면 q(y) 는 참이다.
> 
> - __하위형식에서 선행조건을 더 할 수 없음__
>   - 선행조건은 어떤 코드가 동작하는 조건을 결정한다. 
>   - LSP 란 부모가 지정한 것보다 더 많은 선행조건을 요구할 수 없음을 의미한다.
> - __하위형식에서 후행조건을 악화시킬 수 없음__
>   - 후행조건은 어떤 코드를 실행한 다음에 만족해야 하는 규칙이다.
>   - 부모가 부작용을 포함하거나 어떤 값을 반환한다면 자식도 그래야 한다.
> - __슈퍼형식의 불변자는 하위형식에서 보존됨__
>   - 불변자란 밀물과 썰물처럼 항상 변하지 않는 어떤 것을 가리킨다.
>   - 상속 관계의 부모와 자식 클래스가 있을 때, 부모 클래스에서 유지되는 모든 불변자는 자식 클래스에서도 유지되어야 한다.
> - __히스토리 규칙__
>   - 기본적으로 자식 클래스는 부모가 허용하지 않은 상태 변화를 허용하지 않아야 한다. 

## Interface Segregation Principle

### From: UncleBob

> Keep interfaces small so that users don’t end up depending on things they don’t need.

### From: Clean Architecture

> ![](/resource/wiki/oop-solid/isp.png)
> 
> User1 의 소스 코드는 U1Ops 와 op1 에는 의존하지만 OPS 에는 의존하지 않게 된다. 따라서 OPS 에서 발생한 변경이 User1 과는 전혀 관계없는 변경이 라면, User 1을 다시 컴파일하고 새로 배포하는 상황은 초래되지 않는다.

### From: 오브젝트

> 인터페이스를 클라이언트의 기대에 따라 분리함으로써 변경에 의해 영향을 제어하는 설계원칙을 ISP 라고 한다. 
> 
> 이 원칙은 비대한 인터페이스의 단점을 해결한다. 비대한 인터페이스를 가지는 클래스는 응집성이 없는 인터페이스를 가지는 클래스다.

### From: 한 번 읽으면 두 번 깨닫는 객체지향 프로그래밍

> ISP 는 SRP 와 비슷하다. SRP 는 클래스 관점에서 클래스가 하나의 일만 해야 한다고 가이드라인을 제시한다. ISP 는 "인터페이스 관점에서 클래스는 자신이 사용하지 않는 메서드에 의존하면 안된다" 라는 인터페이스 사용 가이드라인을 제시한다.

### From: Real-World Software Development

> ISP 는 다음 사상을 추구한다. 어떤 클래스도 사용하지 않는 메서드에 의존성을 갖지 않아야 한다. 이는 불필요한 결합을 만들기 때문이다. 이 원칙을 따르면 응집도도 높아진다.

## Dependency Inversion Principle

### From: UncleBob

> Depend in the direction of abstraction. High level modules should not depend upon low level details.
> 
> In every case Dan’s slides end with: Just write simple code. This is good advice. However, if the years have taught us anything it is that simplicity requires disciplines guided by principles. It is those principles that define simplicity. It is those disciplines that constrain the programmers to produce code that leans towards simplicity.
> 
> In every case Dan’s slides end with: Just write simple code. This is good advice. However, if the years have taught us anything it is that simplicity requires disciplines guided by principles. It is those principles that define simplicity. It is those disciplines that constrain the programmers to produce code that leans towards simplicity.

### From: Architecture Patterns with Python

> __고수준 모듈(high-level module)__ 은 여러분의 조직에서 정말 중요하게 여기는 코드다. 제약 회사에 근무한다면 고수준 모듈은 환자와 임상시험을 관리한다. 은행에서 근무한다면 고수준 모듈은 거래나 외환을 관리한다. 고수준 모듈은 실세게의 개념을 처리하는 함수, 클래스, 패키지를 말한다.
>
> __저수준 모듈(low-level module)__ 은 여러분의 조직에서 신경 쓰지 않는 코드다. HR 부서가 파일 시스템이나 네트워크 소켓에 관심을 갖을 가능성이 낮다. 여러분이 SMTP, HTTP, AMQP 등을 재무팀과 의논하는 경우도 드물 것이다. 기술적이지 않은 관련자들에게 이런 저수준 개념은 흥미로운 대상이 아니거나 중요하지 않다. 이런 관련자들은 고수준의 개념이 정상으로 작동되는지만 신경 쓴다. 급여 시스템이 정시에 정상적 실행되면 사업 부서는 급여 시스템이 크론 잡(cron job)인지, 쿠버네티스(Kubernetes)에서 실행되는 일시적인 함수인지에 대해 신경 쓰지 않는다.
>
> 의존성은 꼭 임포트나 호출만을 뜻하지 않는다. 대신 한 모듈이 다른 모듈을 필요로 하거나, 안다는 좀더 일반적인 생각이 의존성이다.

### From: Clean Architecture

> DIP 에서 말하는 유연성이 극대화된 시스템이란 소스 코드 의존성이 추상(abstraction)에 의존하며 구체(concretion)에는 의존하지 않는 시스템을 말한다.
> 
> 우리가 의존하지 않도록 피하고자 하는 것은 바로 변동성이 큰(volatile) 구체적이 요소다. 그리고 이 구체적인 요소는 우리가 열심히 개발하는 중이라 자주 변경될 수밖에 없는 모듈들이다.
>
> - __변동성이 큰 구체 클래스를 참조하지 말라.__ 대신 추상 인터페이스를 참조하라. 이 규칙은 언어가 정적 타입이든 동적 타입이든 관계없이 모두 적용된다. 또한 이 규칙은 객체 생성 방식을 강하게 제약하며, 일반적으로 추상 팩토리(Abstract Factory)를 사용하도록 강제한다.
> - __변동성이 큰 구체 클래스로부터 파생하지 말라.__ 이 규칙은 이전 규칙의 따름 정리이지만, 별도로 언급할 만한 가치가 있다. 정적 타입 언어에서 상속은 소스 코드에 존재하는 모든 관계 중에서 가장 강력한 동시에 뻣뻣해서 변경하기 어렵다. 따라서 상속은 아주 신중하게 사용해야 한다. 동적 타입 언어라면 문제가 덜 되지만, 의존성을 가진다는 사실에는 변함이 없다. 따라서 신중에 신중을 거듭하는 게 가장 현명한 선택이다.
> - __구체 함수를 오버라이드 하지 말라.__ 대체로 구체 함수는 소스 코드 의존성을 필요로 한다. 따라서 구체 함수를 오버라이드 하면 이러한 의존성을 제거할 수 없게 되며, 실제로는 그 의존성을 상속하게 된다. 이러한 의존성을 제거하려면, 차라리 추상 함수로 선언하고 구현체들에서 각자의 용도에 맞게 구현해야 한다.
> -__구체적이며 변동성이 크다면 절대로 그 이름을 언급하지 말라.__ 사실 이 실천법은 DIP 원칙을 다른 방식으로 풀어쓴 것이다.

### From: 오브젝트

> DIP 는 다음과 같다.
>
> - 상위 수준의 모듈은 하위 수준의 모듈에 의존해서는 안된다. 둘 모두 추상화에 의존해야 한다.
> - 추상화는 구체적인 사항에 의존해서는 안 된다. 구체적인 사항은 추상화에 의존해야 한다.

### From: 한 번 읽으면 두 번 깨닫는 객체지향 프로그래밍

> DIP 는 구체적인 클래스 대신 추상적인 클래스에 의존하라는 뜻이다.
> 
> - __AS-IS__: ArrayList list = new ArrayList()
> - __TO-BE__: List list = new ArrayList()

### From: Real-World Software Development

> 의존관계 역전의 정의는 다음과 같다.
> 
> - 높은 수준의 모듈은 낮은 수준의 모듈에 의존하지 않아야 한다. 두 모듈 모두 추상화에 의존해야 한다.
> - 추상화는 세부 사항에 의존하지 않아야 한다. 세부 사항은 추상화에 의존해야 한다.

## Links

- [SOLID Relevance - UncleBob](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
  - [번역본 - 객체지향 5원칙 (SOLID)은 구시대의 유물 ?](https://mangsby.com/blog/programming/%EA%B0%9D%EC%B2%B4%EC%A7%80%ED%96%A5-5%EC%9B%90%EC%B9%99-solid%EC%9D%80-%EA%B5%AC%EC%8B%9C%EB%8C%80%EC%9D%98-%EC%9C%A0%EB%AC%BC%EC%9D%B8%EA%B0%80/)

## References

- Clean Architecture / Robert C. Martin 저 / 인사이트
- Head First Object-Oriented Analysis & Design / 브렛 맥래프린, 게리 폴리스, 데이빗 웨스트 저 / O'REILLY
- 오브젝트 / 조영호 저 / 위키북스
- 한 번 읽으면 두 번 깨닫는 객체지향 프로그래밍 / 김동헌 저 / e 비즈북스
- Real-World Software Development 실전 자바 소프트웨어 개발 / 라울-게이브리얼 우르마, 리처드 워버턴 저 / O'REILLY
- Architecture Patterns with Python / 해리 퍼시벌, 밥 그레고리 저 / O'REILLY