---
layout  : wiki
title   : Kotlin Delegate
summary : 코틀린의 위임
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

2019년 한국 코틀린 행사에서 Pluu 님이 발표했던 Kotlin 을 여행하는 히치하이커의 준비서를 보면 자세하게 설명하고 있으니 참고하면 좋다.

<div class="deck-embed js-deck-embed" style="aspect-ratio:1024/575;" data-ratio="1.77777777777778" data-state="processed">
    <div class="speakerdeck-embed" data-title="false" data-skip-resize="true" data-id="fcd3b563bce247fe86f66b8d29d08324" data-name="Kotlin을 여행하는 히치하이커의 준비서" data-ratio="1.77777777777778" data-host="speakerdeck.com"></div>
</div>

[What does ‘by’ keyword do in Kotlin? - StackOverflow](https://stackoverflow.com/questions/38250022/what-does-by-keyword-do-in-kotlin) 해당 글에서는
Delegation 에 대해서 크게 두 가지로 나타내고 있다.

- by 키워드를 활용한 Properties 에서의 활용
- interface 를 class delegation 에서의 활용

## Delegate Property

kotlin.properties.ReadOnlyProperty, kotlin.properties.ReadWriteProperty 두 개를 각각 상속받아 property 활용이 가능하다.

![]( /resource/wiki/kotlin-delegate/delgate.png)

### Syntax

The syntax is:

```kotlin
val/var <property name>: <Type> by <expression>. 
```

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

프로퍼티 위임 관례를 따르는 Delegate 클래스는 `getValue` 와 `setValue` 메서드를 제공해야 한다.(단, 변경 가능한 프로퍼티만 setValue 를 필요로 한다.)

```kotlin
class Delegate {
    // for get() method, ref - a reference to the object from 
    // which property is read. prop - property
    operator fun getValue(ref: Any?, prop: KProperty<*>) = "textA"
    // for set() method, 'v' stores the assigned value
    operator fun setValue(ref: Any?, prop: KProperty<*>, v: String) {
        println("value = $v")
    }
}
```

## Links

- [Delegated properties](https://kotlinlang.org/docs/delegated-properties.html)
- [What does ‘by’ keyword do in Kotlin? - StackOverflow](https://stackoverflow.com/questions/38250022/what-does-by-keyword-do-in-kotlin)
- [Kotlin Delegation](https://thdev.tech/kotlin/2020/11/27/kotlin_delegation/)

## 참고 문헌

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘