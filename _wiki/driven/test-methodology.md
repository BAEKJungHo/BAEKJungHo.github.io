---
layout  : wiki
title   : Software Development Methodology
summary : 
date    : 2022-04-18 19:54:32 +0900
updated : 2022-04-18 21:15:24 +0900
tag     : methodology
toc     : true
comment : true
public  : true
parent  : [[/methodology]]
latex   : true
---
* TOC
{:toc}

# Software Development Methodology

## Test Code Is Required ?

> 대부분의 경우 테스트 가능한 애플리케이션을 목표로 할 경우 훌륭한 애플리케이션 코드를 작성하게 된다.   - Rod Johnson

## Testing Motivators

- __Validate the System__
- __Code Coverage__
- __Enable Refactoring__
- __Document the Behavior of the System__

테스트 코드가 잘 작성된 프로그램은 리팩토링이 쉽다. 테스트 코드가 작성되지 않은 상태에서 새로운 기능을 추가하거나 리팩토링을 해야하는 경우 내가 작성/변경한 코드가 Side Effect 없이 잘 작성된 코드인지 어떻게 검증할 것인가?

__테스트 코드가 해결해 준다.__

## Good Test is ?

- __Atomic__
  - Atomic 의 기준은 Scenario 일 수도 있고, Method 일 수도 있고, Behavior 일 수도 있다. Atomic 의 기준은 목적(purpose)에 따라 달라진다. 
- __Isolated__
  - 다른 테스트로부터 독립 되어있어야 하며, 다른 테스트에 영향을 주어서는 안된다.

# [Extreme Programming](https://baekjungho.github.io/wiki/driven/extreme-programming)

# TDD

![](/resource/wiki/test-methodology/tdd.png)

테스트 주도 개발(TDD)은 테스트를 작성하여 소프트웨어를 구축하는 기술이다. 1990년대 후반에 Extreme Programming 의 일부로 Kent Beck 에 의해 개발되었다. 

In essence you follow three simple steps repeatedly:

- __[RED]__ Write a test for the next bit of functionality you want to add.
- __[GREEN]__ Write the functional code until the test passes.
- __[REFACTOR]__ Refactor both new and old code to make it well structured.

TDD 는 시스템 기능을 구축하면서 한 번에 한 테스트씩 이 세 단계를 계속 반복하는 프로세스이다.

## Unit Test

Unit Test 는 특정 단위(테스트 대상)가 의도한대로 작동하는지 검증하는 것을 말한다.

![](/resource/wiki/test-methodology/unittest.png)

## Sociable and Solitary

- 단위 테스트 작성 시 관계를 맺고있는 대상(협력 객체)이 있는 경우를 고려해야 함
- 협력 객체를 실제 객체로 사용하는지 Mock 객체로 사용하는지에 따라 테스트 구현이 달라짐

> 단위의 정의를 논하기 앞서 테스트하는 단위가 통합(Sociable)되어야 하는지 고립(Solitary)되어야 하는지 먼저 고려해야 한다.

## Test Double

- 테스트 목적으로 실제 객체 대신 사용되는 모든 종류의 척도 객체에 대한 일반 용어
- 실제 (예 : 클래스, 모듈 또는 함수)를 가짜 버전으로 대체한다는 의미
- 가짜 버전은 실제와 같은 것처럼 보이고 (동일한 메서드 호출에 대한 답변) 단위 테스트 시작 시 스스로 정의한 미리 준비된 답변으로 응답함
- Test Double 에는 여러 종류가 있지만 대체 한다는 큰 의미에서는 같다고 할 수 있음

![](/resource/wiki/test-methodology/testdouble.png)

> 테스트 더블은 크게 Dummy, Fake, Stub, Spy, Mock 으로 나눈다.

### Dummy

> 인스턴스화된 객체가 필요해서 구현한 가짜 객체일 뿐이고, 생성된 Dummy 객체는 정상적인 동작을 보장하지 않음

- 가장 기본적인 테스트 더블
- 인스턴스화 된 객체가 필요하지만 기능은 필요하지 않은 경우에 사용
- Dummy 객체의 메서드가 호출되었을 때 정상 동작은 보장하지 않음
- 객체는 전달되지만 사용되지 않는 객체

```kotln
interface AService {
  fun print()
}
class AServiceDummy(): AService {
  override fun print() {
    // nothing to do 
  }
}
```

특정 테스트에 대해서 해당 구현체의 동작이 필요하지 않을 수 있다. 이처럼 동작하지 않아도 테스트에는 영향을 미치지 않는 객체를 Dummy 객체라고 한다.

### Fake 

> 동작은 하지만 실제 사용되는 객체처럼 정교하게 동작하지는 않는 객체를 의미

- 복잡한 로직이나 객체 내부에서 필요로 하는 다른 외부 객체들의 동작을 단순화하여 구현한 객체
- 동작의 구현을 가지고 있지만 실제 프로덕션에는 적합하지 않은 객체
- [InMemoryTestDatabase](https://martinfowler.com/bliki/InMemoryTestDatabase.html)

### Stub

> 테스트에서 호출된 요청에 대해 미리 준비해둔 결과를 제공

- Dummy 객체가 실제로 동작한느 것 처럼 보이게 만들어 놓은 객체
- 인터페이스 또는 기본 클래스가 최소한으로 구현된 상태
- 테스트에서 호출된 요청에 대해 미리 준비해둔 결과를 제공
  - Mockito Framework 도 Stub 과 같은 역할을 제공함
- 테스트를 위해 의도한 결과만 반환되도록 하기 위한 객체

### Spy

> 실제 객체로도 사용할 수 있고 Stub 객체로도 활용할 수 있으며 필요한 경우 특정 메서드가 제대로 호출되었는지 여부를 확인할 수 있음

- Stub 의 역할을 가지면서 호출된 내용에 대해 약간의 정보를 기록한다.
- 테스트 더블로 구현된 객체에 자기 자신이 호출되었을 때 확인이 필요한 부분을 기록하도록 구현한다.
- 실제 객체처럼 동작시킬 수도 있고, 필요한 부분에 대해서는 Stub 을 만들어서 동작을 지정할 수도 있다.
  - Mockito 프레임워크의 verify() 메서드가 같은 역할을 함

### Mock

> 호출에 대한 기대를 명세하고 내용에 따라 동작하도록 프로그래밍 된 객체

## Inside Out, Outside In

### Inside Out

- 처음부터 도메인 모델에 주의를 집중
- 도메인 로직이 UI 에 의존하지 않도록 함
- 도메인 객체 구현 후 일단 동작하면 그 위에 UI를 적용하는 순서로 진행
- 이렇게 하면 Mock 객체를 사용할 필요가 없어짐
- 무조건 사용하지 않는다는 것이 아니라 사용 빈도가 낮아짐

### Outside In

- 테스트 대상의 외부 인터페이스를 설계하는 것부터 시작
- 계층적 시스템에서도 적용 가능
- 레이어 별로 테스트를 작성하고, 단계적으로 한번에 하나의 레이어에 대해 진행
- OO와 TDD 가 익숙하지 않은 사람들에게 가이드할 때 도움이 된다고 생각됨
- 도메인에 대한 이해도가 높지 않은 상태에서 진행이 가능

### 어떤 기준으로 선택해야 할까?

> 사실은 상향식, 하향식 둘 다 TDD 의 프로세스를 효과적으로 설명해 줄 수 없다. ... 만약 어떤 방향성을 가질 필요가 있다면 '아는 것에서 모르는 것으로(known-to-unknown)' 방향이 유용할 것이다. 우리가 어느 정도의 지식과 경험을 가지고 시작한다는 점, 개발하는 중에 새로운 것을 배우게 될 것임을 예상한다는 점 등을 암시한다.
>
> Test-Driven Development, kent beck

- 컨트롤러를 먼저 만들것인지 도메인 모델을 먼저 만들것인지는 정답이 없음
- 인수 테스트로 인해서 우리는 어떤 컨트롤러가 나와야 하는지 알고 있으므로 컨트롤러를 먼저 작성해도 좋고
도메인 모델의 기능 정의가 나와있는 상황에서 도메인을 먼저 작성해도 좋다.

## Links

- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Unit Test](https://martinfowler.com/bliki/UnitTest.html)
- [Extreme Programming](https://martinfowler.com/bliki/ExtremeProgramming.html)
- [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)
- [Test Double](https://martinfowler.com/bliki/TestDouble.html)
- [Test Double By Tecoble](https://tecoble.techcourse.co.kr/post/2020-09-19-what-is-test-double/)

## 참고 문헌

- Extreme Programming / Kent Beck / 인사이트
- Extreme Programming Installed / Ron Jeffries, Ann Anderson, Chet Handrickson 공저 / 인사이트