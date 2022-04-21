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

### Sociable and Solitary

- 단위 테스트 작성 시 관계를 맺고있는 대상(협력 객체)이 있는 경우를 고려해야 함
- 협력 객체를 실제 객체로 사용하는지 Mock 객체로 사용하는지에 따라 테스트 구현이 달라짐

> 단위의 정의를 논하기 앞서 테스트하는 단위가 통합(Sociable)되어야 하는지 고립(Solitary)되어야 하는지 먼저 고려해야 한다.

## Links

- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Unit Test](https://martinfowler.com/bliki/UnitTest.html)
- [Extreme Programming](https://martinfowler.com/bliki/ExtremeProgramming.html)

## 참고 문헌

- Extreme Programming / Kent Beck / 인사이트
- Extreme Programming Installed / Ron Jeffries, Ann Anderson, Chet Handrickson 공저 / 인사이트