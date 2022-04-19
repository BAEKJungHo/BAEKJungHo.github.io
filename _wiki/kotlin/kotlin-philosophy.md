---
layout  : wiki
title   : Kotlin Philosophy
summary : 코틀린의 철학
date    : 2022-04-18 15:54:32 +0900
updated : 2022-04-18 20:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

# Philosophy

## Java 의 철학

- It should use the object-oriented programming methodology.
- It should allow the same program to be executed on multiple operating systems: WORA
- It should contain built-in support for using computer networks.
- It should be designed to execute code from remote sources securely.
- It should be easy to use by selecting what was considered the good parts of other object-oriented languages.

## Kotlin 의 철학

- 코틀린은 간결하고 실용적이며, 자바 코드와의 상호 운용성(Interoperability) 을 중시한다.

## JVM 언어의 제약

- equals() 가 true 를 반환하는 두 객체는 반드시 같은 hashCode() 를 반환해야 한다.
  - hashSet, hashXXX 들은 원소를 비교할 때, 비용을 줄이기 위해 먼저 객체의 해시 코드를 비교하고 해시 코드가 같은 경우에만 실제 값을 비교한다.
  - 따라서, 원소 객체들이 hashCode 에 대한 규칙을 지키지 않으면 hashSet 은 제대로 동작하지 않기 때문에 hashCode 를 반드시 구현해야 한다.

## Links

- [Java Philosophy](http://semantic-portal.net/concept:1397)

## 참고 문헌

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- Effective Kotlin / Marcin Moskala 저 / 인사이트