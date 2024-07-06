---
layout  : wiki
title   : Test Pyramid
summary : The "Test Pyramid" is a metaphor that tells us to group software tests into buckets of different granularity
date    : 2024-06-23 15:54:32 +0900
updated : 2024-06-23 20:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Test Pyramid

__Test Pyramid__:

![](/resource/wiki/test-the-practical-test-pyramid/tesy-pyramid.png)

### Unit Test

단위를 격리해서 테스트하는 것을 단위 테스트라고 한다. 단위 테스트는 빠르다. 따라서 빠르고 자동화된 테스트 스위트는 우리에게 __지속적인 피드백(_[Immediate feedback for interface design decisions](https://baekjungho.github.io/wiki/tdd/tdd-interface-design-decisions/)_)__ 을 준다.

단위 테스트의 단점으로는 현실성이 떨어지며, 잡을 수 없는 종류의 버그가 존재한다. 단위 테스트만으로는 소프트웨어 시스템의 실제 실행 모습을 완벽하게 재현할 수 없다.

Roy Osherove 는 다음과 같이 말했다.

> "단위 테스트는 시스템에서 작업 단위를 호출하는 자동화된 코드 조각이다. 작업 단위는 한 메서드, 한 클래스 또는 함께 동작하는 여러 클래스에 이룰 수 있고 검증 가능한 단 하나의 논리적 목표를 달성한다."

단위 테스트에서 가장 어려운 점은 __한 단위를 구성하는 요소를 정의하는 것__ 이다.

대부분의 경우에 단위 테스트는 데이터베이스나 웹 서비스 등과 같은 __외부 시스템에 의존하지 않는 작은 클래스 세트 등__ 을 테스트하는 것을 뜻한다.
만약 외부 서비스에 의존(dependency)하고 있다면 가능한한 __격리__ 하여 테스트 해야 한다.

## Links

- [실용적인 테스트 피라미드 (번역)](https://www.integer.blog/practical-test-pyramid/)

## References

- [The Practical Test Pyramid / Martinfowler](https://martinfowler.com/articles/practical-test-pyramid.html)