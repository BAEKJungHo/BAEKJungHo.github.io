---
layout  : wiki
title   : Knowledge
summary : Knowledge 를 반복하여 사용하지 말라
date    : 2022-12-01 16:01:32 +0900
updated : 2022-12-01 16:05:24 +0900
tag     : cleancode kotlin
toc     : true
comment : true
public  : true
parent  : [[/cleancode]]
latex   : true
---
* TOC
{:toc}

## Knowledge

> 프로젝트에서 이미 있던 코드를 복사해서 붙여넣고 있다면, 무언가가 잘못된 것이다.

- 실용주의 프로그래머에서 Don't Repeat Yourself, DRY 규칙으로 표현하고 있다.
- WET 안티패턴이라고도 불린다.
- DRY 는 또한 SSOT(Single Source of Truth) 라는 이름으로도 알려져 있다.

프로그래밍에서 `knowledge` 는 넓은 의미로 의도적인 정보를 뜻한다. knowledge 의 종류는 굉장히 다양하다.
- 알고리즘의 작동 방식
- UI 의 형태
- 우리가 원하는 결과 등

## Most important knowledge

1. Logic: 프로그램이 어떠한 식으로 동작하는지와 프로그램이 어떻게 보이는지
2. Common Algorithm: 원하는 동작을 하기 위한 알고리즘

둘의 가장 큰 차이점은 __시간에 따른 변화__ 이다. 로직은 시간에 따라 변하지만 알고리즘은 한 번 정의된 이후에는 크게 변하지 않는다.

## Keep changing knowledge

프로젝트의 knowledge 는 계속해서 변화한다. 변화의 몇 가지 이유는 다음과 같다.
- 사용자의 요구는 계속 변화한다.
- 디자인 표준이 변화했다.
- 플랫폼, 라이브러리, 도구 등이 변화한다.

> 슬랙(slack)은 원래 글리치라는 온라인 게임이었으나 소비자는 게임의 커뮤니케이션 방식을 굉장히 마음에 들어했다. 그래서 현재의 슬랙으로 변화하게 되었다.

__변화할 때 가장 큰 적은 knowledge 가 반복되는 부분(= 중복)__ 이다.

## Redundancy is a harm

- 중복 코드를 변경하는 것은 무엇보다 귀찮다.
- 코드를 변경하는 과정에서 실수로 누락하여 변경되지 못한 부분이 생길 수 있다.

__knowledge 의 반복은 확장성(scalable)을 막고 쉽게 깨지게(fragile) 만든다.__ 이러한 해결책으로는 __추상화(abstraction)__ 를 사용하는 것이 있다.

코드의 반복이 허용되는 경우는 "함께 변경될 가능성이 높은가" or "따로 변경될 가능성이 높은가" 로 어느 정도 결정할 수 있다.

- 서로 다른 곳에서 사용하는 knowledge 는 독립적으로 변경할 가능성이 많다.
- 다른 knowledge 는 분리해 두는 것이 좋다.

## References

- Effective Kotlin / Marcin Moskala 저 / 인사이트