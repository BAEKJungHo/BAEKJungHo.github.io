---
layout  : wiki
title   : Delegated properties
summary : 코틀린의 위임 프로퍼티
date    : 2022-05-24 15:54:32 +0900
updated : 2022-05-24 20:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Delegate

> 위임은 객체가 직접 작업을 수행하지 않고 다른 도우미 객체가 그 작업을 처리하게 맡기는 디자인 패턴을 의미한다. 이때 작업을 처리하는 도우미 객체를 위임 객체(delegate) 라고 부른다.

## Kotlin Delegate Property

### Syntax

위임 프로퍼티의 일반적인 문법은 다음과 같다.

```kotlin
class Foo {
    var p: Type by Delegate()
}
```

컴파일 결과는 다음과 같다.

```kotlin
class Foo {
    private val delegate = Delegate()
    var p: Type
    set(value: Type) = delegate.setValue(..., value)
    get() = delegate.getValue(...)
}
```

프로퍼티 위임 관례를 따르는 Delegate 클래스는 `getValue` 와 `setValue` 메서드를 제공해야 한다.

## Links

- [Delegated properties](https://kotlinlang.org/docs/delegated-properties.html)

## 참고 문헌

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘