---
layout  : wiki
title   : Interface; Data Transfer Object, Business Object
summary : 
date    : 2024-11-25 15:54:32 +0900
updated : 2024-11-25 20:15:24 +0900
tag     : kotlin swift
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## DataTransferObject, Business Object

DTO does not have any behavior except for storage, retrieval, serialization and deserialization of its own data (mutators, accessors, serializers and parsers).

A ___[business object](https://en.wikipedia.org/wiki/Business_object)___ is an entity within a multi-tiered software application that works in conjunction with the data access and business logic layers to transport data.

## Interface

Kotlin 에서 데이터를 표현하고 전달하기 위해서 data class 를 주로 사용한다. 일반적으로 ___[Data transfer object (DTO)](https://en.wikipedia.org/wiki/Data_transfer_object)___ 목적으로 사용된다.
즉, DTO 목적으로 사용되는 data class 내에는 비지니스 로직이 존재하면 안된다. 

반면 ___[DomainModel](https://klarciel.net/wiki/architecture/architecture-domain-model/)___ 을 표현할 때, interface 를 사용할 수 있다.

```kotlin
interface Account {
  val account: String
  val balance: BigDecimal
  val owner: String

  fun calculateInterest(): BigDecimal
}
```

Interface 는 아래 기준을 두고 사용할 수 있다. 

- 객체의 행동 또는 역할을 정의할 때 사용한다.
- interface 는 기본적으로 구현을 강제하는 계약이다. 따라서 데이터 저장뿐 아니라, 동작(메서드)과 특성이 구현마다 달라질 수 있을 때 사용한다.
- 추상화와 확장성을 위해서 사용한다.
- 데이터 외에도 특정 비즈니스 동작을 추가로 정의하는 역할로 사용한다.
- 여러 서비스나 레이어에서 사용하고, 다른 데이터 소스나 도메인 요구사항에 맞게 확장하고 싶을 때 사용한다.

## Links

- [Swift Protocol](https://bbiguduk.gitbook.io/swift/language-guide-1/protocols)