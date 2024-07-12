---
layout  : wiki
title   : Testability
summary : 
date    : 2024-07-12 09:25:32 +0900
updated : 2024-07-12 09:29:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Testability

Production Code 를 설계할 때, __항상 테스트 가능성을 고려(_[Software Testability](https://en.wikipedia.org/wiki/Software_testability)_)__ 해야 한다.

테스트 가능한 설계를 위한 몇가지 지침을 소개한다.

- 도메인 코드에서 인프라 의존성을 제거한다. ___[Clean Architectures](https://baekjungho.github.io/wiki/architecture/architecture-clean/)___ 의 핵심 원칙이기도 하다. (책임이 클 수록 더 복잡해지고 버그가 발생할 가능성이 증가한다. 따라서 명확한 책임 분리가 필요하다.)
- 제어 가능성(control ability) 을 위해서 어떤 클래스가 다른 클래스에 의존한다면 의존성을 ___[Test Doubles](https://baekjungho.github.io/wiki/test/test-testdoubles/)___ 를 사용하여 쉽게 교체할 수 있도록 해야 한다.

## References

- Effective Software Testing: A developer's guide / Mauricio Aniche