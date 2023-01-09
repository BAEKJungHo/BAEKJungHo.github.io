---
layout  : wiki
title   : Aliasing Bug by Reference Of Collections And Objects
summary : 가변 컬렉션과 읽기 전용 컬렉션
date    : 2023-01-07 17:54:32 +0900
updated : 2023-01-07 20:15:24 +0900
tag     : refactoring java kotlin
toc     : true
comment : true
public  : true
parent  : [[/refactoring]]
latex   : true
---
* TOC
{:toc}

## Aliasing Bug

Aliasing occurs when the same memory location is accessed through more than one reference.

```java
Person me = new Person("BAEK Jung Ho");
me.setPhoneNumber("010-1234-1234");
Person articleAuthor = Baek;
me.setPhoneNumber("999");
assertEquals("999", articleAuthor.getPhoneNumber());
```

자바의 컬렉션은 __가변(mutable) 컬렉션__ 이다. 따라서 Aliasing Bug 를 방지하기 위해서는 __공유된 컬렉션을 변경하지 않아야 한다.__ 

자바에서 UnmodifiableList 로 감싸면 컬렉션에서 상태 변경에 의존해서 생기는 문제를 해결할 수 있다. 하지만 원본 리스트를 변경할 수 있다면 UnmodifiableList 도 원본이 결코 변경되지 않음을 보장하지 못한다.

자바 10에서는 컬렉션을 AbstractImmutableList 로 복사해 주는 List.copyOf(collection) 이 생겼다. 이렇게 만든 AbstractImmutableList 객체는 변경이 불가능하며 원본 컬렉션의 변경과도 무관하다.

함수 경계에서 매번 방어적 복사를 수행하는 대신, 실무에서는 다음과 같은 전략을 기본으로 채택하는 것이 좋다.

__서로 떨어진 두 코드 사이에 공유된 컬렉션이 있다면 이를 불변 컬렉션으로 취급하는게 좋다.__

## Read only Collection

가변이 아닌 코틀린 컬렉션에 대한 공식 용어는 불변(immutable)이 아닌 __읽기 전용(read-only)__ 이다. 코틀린의 MutableList 는 List 의 하위 타입이며(List 를 상속) List 는 Collection 의 하위 타입이다. 따라서 List 의 모든 메서드를 MutableList 가 제공하고 호출 가능하기 때문에 List 가 필요한 코드에 MutableList 를 넘겨도 안전하다. 

__이러한 상속 관계 문제 때문에 읽기 전용 컬렉션은 불변이 아니다.__ 

## Links

- [AliasingBug - MartinFowler](https://martinfowler.com/bliki/AliasingBug.html)

## References

- 자바에서 코틀린으로: 코틀린으로 리팩터링하기 / 냇프라이스 와 덩컨맥그레거 저 / O'REILLY