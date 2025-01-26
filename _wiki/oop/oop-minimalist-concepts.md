---
layout  : wiki
title   : Minimalist Concepts
summary : KISS, YAGNI
date    : 2025-01-22 15:02:32 +0900
updated : 2025-01-22 15:12:24 +0900
tag     : oop
toc     : true
comment : true
public  : true
parent  : [[/oop]]
latex   : true
---
* TOC
{:toc}

## Minimalist Concepts

___Minimalist Concepts___ 는 IT 분야에서 ___단순성과 본질___ 에 집중하는 철학을 의미한다. 이는 불필요한 복잡성을 제거하고, 핵심 가치를 유지하면서 효율적이고 명확한 시스템을 구축하는 데 초점을 둔다.

### Provides The Bare Minimum Required

소프트웨어는 "모든 기능을 포함"하는 대신, 사용자가 진정으로 필요로 하는 핵심 기능에 집중
- e.g 초기 Slack은 단순한 채팅과 파일 공유만 지원

### UI/UX

__간결하고 직관적인 인터페이스__:
- 사용자에게 혼란을 주는 불필요한 요소 제거.
- e.g Apple의 디자인 철학은 단순한 레이아웃과 직관적인 인터페이스로 유명.

__Less is More__:
- 페이지에 배치되는 정보나 버튼의 수를 최소화하고, 중요한 작업만 강조.
- e.g Google 검색 페이지는 검색창 하나와 최소한의 버튼만 제공.

__사용자 여정의 단순화__:
- 사용자가 목적을 달성하기 위해 필요한 클릭 수를 줄이는 방향.
- e.g 1-Click 구매 기능(아마존).

### Data

불필요한 데이터를 수집하거나 저장하지 않음으로써 데이터베이스의 크기와 복잡성을 줄임
- e.g GDPR 규정을 준수하기 위해 사용자 데이터를 최소한으로 수집

### Single Responsibility Principle

___[Object Oriented Programming; Single Responsibility Principle](https://klarciel.net/wiki/oop/oop-solid/)___

### KISS

KISS 원칙은 ___Keep it simple(short, straight forward)___ 의 의미를 지니고 있다. 가능한 한 단순하게 유지하라는 대전제는 비슷하다.

KISS 원칙은 많은 상황에 적용될 수 있는 포괄적인 설계 원칙이다.

코드 라인 수가 적다고 KISS 원칙을 지키는 것도 아니며, 복잡한 코드가 반드시 KISS 원칙을 위반하는 것도 아니다. (예를 들면 복잡한 알고리즘을 사용하여 문제를 해결하는 경우, KMP 알고리즘 등)

KISS 원칙을 만족하는 코드 작성 방법
- 복잡한 정규표현식, 프로그래밍 언어에서 제공하는 지나치게 높은 레벨의 코드 등 지나치게 복잡한 기술을 사용하여 코드를 구현하지 않는다.
- 바퀴를 다시 발명(reinvent the wheel) 하는 대신 기존 라이브러리를 사용하는 것을 고려한다.
- 과도하게 최적화 하지 않는다.

### YAGNI

YAGNI(you ain't gonna need it) 원칙은 현재 사용되지 않는 코드를 작성하지 말고 설계를 하지 말라는 것이다. 즉, 과도하게 설계하지 말라는 것이다.

YAGNI 를 준수하지 않는 코드는 ___사용되지 않는 코드___ 혹은 ___과도하게 확장된 코드___ 인 경우가 있다.

- 사용되지 않는 코드
  - 필요 없는 기능이나 로직이 작성되어 있지만 실제로 사용되지 않는 경우
- 과도하게 확장된 코드
  - 현재 요구 사항보다 지나치게 일반화된 구조나 복잡한 설계를 도입해 코드가 불필요하게 무거워진 경우.

## References

- 设计模式之美 / 王争