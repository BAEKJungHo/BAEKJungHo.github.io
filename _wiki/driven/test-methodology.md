---
layout  : wiki
title   : Test Methodology
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

# Test Methodology

## Test Code Is Required ?

> 대부분의 경우 테스트 가능한 애플리케이션을 목표로 할 경우 훌륭한 애플리케이션 코드를 작성하게 된다. - Rod Johnson

### Testing Motivators

- Validate the System
- Code Coverage
- Enable Refactoring
- Document the Behavior of the System

테스트 코드가 잘 작성된 프로그램은 리팩토링이 쉽다. 테스트 코드가 작성되지 않은 상태에서 새로운 기능을 추가하거나 리팩토링을 해야하는 경우 내가 작성/변경한 코드가 Side Effect 없이 잘 작성된 코드인지 어떻게 검증할 것인가?

__테스트 코드가 해결해 준다.__

### Good Test is ?

- __Atomic__
  - Atomic 의 기준은 Scenario 일 수도 있고(ATDD), Method 일 수도 있고(TDD), Behavior 일 수도 있다(BDD). Atomic 의 기준은 `목적(purpose)`에 따라 달라진다. 
- __Isolated__
  - 다른 테스트로부터 독립 되어있어야 하며, 다른 테스트에 영향을 주어서는 안된다.

## TDD

![](/resource/wiki/test-methodology/tdd.png)

테스트 주도 개발(TDD)은 테스트를 작성하여 소프트웨어를 구축하는 기술이다. 1990년대 후반에 Extreme Programming 의 일부로 Kent Beck 에 의해 개발되었다. 

In essence you follow three simple steps repeatedly:

- __[RED]__ Write a test for the next bit of functionality you want to add.
- __[GREEN]__ Write the functional code until the test passes.
- __[REFACTOR]__ Refactor both new and old code to make it well structured.

TDD 는 시스템 기능을 구축하면서 한 번에 한 테스트씩 이 세 단계를 계속 반복하는 프로세스이다.

## Links

- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## 참고 문헌

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- Effective Kotlin / Marcin Moskala 저 / 인사이트