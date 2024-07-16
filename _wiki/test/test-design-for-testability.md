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
- 관찰 가능성(observability) 은 기대 행위를 단언(assert) 하는 테스트를 쉽게 할 수 있는 방법을 클래스가 제공함으로써 달성할 수 있다. (일반적으로 spy 를 사용하는경우, spy 를 꼭 사용해야 하는지 되묻는 습관을 들이는 것이 좋다.)
- 테스트에 도움이 되도록 프로덕션 코드를 변경하는 것은 좋다.

## Frame of Reference

- 테스트를 개발주기에 통합하자
- 코드베이스에서 가장 중요한 부분만을 대상으로 하자
- 최소한의 유지비로 최대의 가치를 끌어내자
- 프로덕션 코드 수정/리팩토링 시 테스트 코드도 수정하자
- 날짜 관련 로직 작성 시 코너 케이스를 고려하자
  - DB 에 특정 컬럼은 KST, 특정 컬럼은 UTC 로 저장되어있는 경우 날짜 관련 로직 작성이 번거롭다
  - 이 경우 KST 기준 09:00 이전/이후 00:00(자정) 이전/이후를 필수로 고려하자
- 테스트는 코드의 단위를 검증해서는 안된다. 오히려 동작의 단위, 문제 영역에 의미가 있는 것 등을 검증해야 한다

## References

- Effective Software Testing: A developer's guide / Mauricio Aniche