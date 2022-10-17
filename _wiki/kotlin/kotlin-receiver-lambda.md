---
layout  : wiki
title   : Lambda with Receiver
summary : 코틀린 수신 객체 지정 람다
date    : 2022-06-19 20:54:32 +0900
updated : 2022-06-19 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Lambda with Receiver

> __Lambdas with receivers are basically exactly the same as extension functions__ , they're just able to be stored in properties, and passed around to functions. This question is essentially the same as "What's the purpose of lambdas when we have functions?". The answer is much the same as well - it allows you to quickly create anonymous extension functions anywhere in your code.
>
> There are many good use cases for this (see [DSLs](https://kotlinlang.org/docs/type-safe-builders.html) in particular), but I'll give one simple example here.

For instance, let's say you have a function like this:

```kotlin
fun buildString(actions: StringBuilder.() -> Unit): String {
    val builder = StringBuilder()
    builder.actions()
    return builder.toString()
}
```

Calling this function would look like this:

```kotlin
val str = buildString {
    append("Hello")
    append(" ")
    append("world")
}
```

![](/resource/wiki/kotlin-receiver-lambda/extension.png)

다음은, 수신 객체 타입이 String 이며 파라미터로 두 Int 를 받고 Unit 을 반환하는 확장 함수를 정의하는 Syntax 이다.

확장 함수나 수신 객체 지정 람다에서는 모두 함수(람다)를 호출할 때 수신 객체를 지정해야만 하고, 함수 본문 안에서는 모두 그 수신 객체를 특별한 수식자(Ex. this) 없이 사용할 수있다.

```kotlin
buildString { this.append("!") } // this: implied receiver

fun buildString(builderAction: StringBuilder.() -> Unit): String {
    val sb = StringBuilder()
    sb.builderAction() // sb: receiver
}
```

apply 를 사용해서 buildString 을 더 간단하게 구현할 수 있다.

```kotlin
fun buildString(builderAction: StringBuilder.() -> Unit): String 
    = StringBuilder().apply(builderAction).toString()
```

apply 함수는 인자로 받은 람다나 함수를 호출하면서 자신의 수신 객체(여기서는 StringBuilder 의 인스턴스)를 람다나 함수의 묵시적 수신 객체로 사용한다.

__수신 객체 지정 람다를 사용하는 가장 큰 이유 중 하나는, 간결한 문법을 통해서 가독성을 향상시키는 것이라고 생각한다.__

## apply

```kotlin
inline fun <T> T.apply(block: T.() -> Unit): T {
    block() // this.block() 과 같다. this 는 implied receiver 이므로 생략 가능하다.
    return this // return receiver
}
```

apply 는 수신 객체 타입에 대한 확장 함수로 선언됐기 때문에 수신 객체의 메서드 처럼 불리며, 수신 객체를 묵시적 인자(this)로 받으며, 수신 객체를 반환한다.

- __apply 는 언제 사용할까?__
  - 수신 객체 람다 내부에서 수신 객체의 함수를 사용하지 않고 수신 객체 자신을 다시 반환 하려는 경우에 apply 를 사용
  - Ex. 객체의 초기화

```kotlin
// Before
fun createButton(): Button {
    val button = Button()
    button.text = "Some text"
    button.height = 40
    button.width = 60
    button.setOnClickListener(listener)
    button.background = drawable
    return button
}

// After
fun createButton() = Button().apply {
    text = "Some text"
    height = 40
    width = 60
    setOnClickListener(listener)
    background = drawable
}
```

## with

```kotlin
inline fun <T, R> with(receiver:T, block:T.() -> R): R = 
    receiver.block() // 람다를 호출해 얻은 결과를 반환한다.
```

with 은 수신 객체를 첫 번째 파라미터로 받는다. with 은 apply 와 다르게 람다를 호출해 얻은 결과를 반환한다.

- __with 은 언제 사용할까?__
  - Non-nullable 수신 객체 이며, 결과가 필요하지 않은 경우에만 with 를 사용

```kotln
val sb = StringBuilder()
with (sb) {
    append("A")
    appned("B")
}
```

## also

```kotlin
inline fun <T> T.also(block: (T) -> Unit): T {
    block(this)
    return this
}
```

also 또한 apply 와 마찬가지로 수신 객체 타입에 대한 확장 함수로 선언됐기 때문에 수신 객체의 메서드 처럼 불린다. 또한, 수신 객체를 반환하므로 블록 함수가 다른 값을 반환해야 하는 경우에는 also 를 사용할 수 없다.

- __also 는 언제 사용할까?__
  - 객체의 사이드 이펙트를 확인하는 경우
  - 수신 객체의 프로퍼티에 데이터를 할당하기 전, 유효성 검사를 위해 사용

```kotlin
// Before
class Reservation(person: Person) {
    init {
        requireNotNull(person.age)
        print(person.name)
    }
}

// After
class Reservation(person: Person) {
    val person = person.also {
      requireNotNull(it.age)
      print(it.name)
    }
}
```

## let

```kotlin
inline fun <T, R> T.let(block: (T) -> R): R {
    return block(this)
}
```

let 은 전달 받은 수신 객체를 사용하며, 코드 블록의 수신 결과를 반환한다.

- __let 은 언제 사용할까?__
    - 지정된 값이 null 이 아닌 경우에 코드를 실행해야 하는 경우
    - Nullable 객체를 다른 Nullable 객체로 변환하는 경우 
    - 단일 지역 변수의 범위를 제한 하는 경우

```kotlin
findReservation()?.let {
    doSomething(it)
}

val person: Person? = findReservation()?.let {
    service.findPerson(it) 
}

val person: Person = getPerson()
getPersonDao().let { dao ->
    dao.insert(person)
}
```

## run

```kotlin
inline fun <T, R> T.run(block: T.() -> R): R {
    return block()
}
```

run 은 전달 받은 수신 객체를 사용하며, block 함수의 결과를 반환한다.

- __run 은 언제 사용할까?__
    - 어떤 값을 계산할 필요가 있거나 여러개의 지역 변수의 범위를 제한하는 경우
    - Nullable 객체를 다른 Nullable 객체로 변환하는 경우
    - 단일 지역 변수의 범위를 제한 하는 경우

```kotlin
val inserted: Boolean = run {
    // person 과 personDao 의 범위를 제한 합니다.
    val person: Person = getPerson()
    val personDao: PersonDao = getPersonDao()
    // 수행 결과를 반환 합니다.
    personDao.insert(person)
}

fun printAge(person: Person) = person.run {
    // person 을 수신객체로 변환하여 age 값을 사용합니다.
    print(age)
}
```

## 주의 사항

- 수신 객체 지정 람다에 수신 객체가 묵시적으로 전달되는 apply, run, with 은 중첩해서 사용하면 안됨
  - 수신 객체를 this or 생략 하여 사용하기 때문에, 중첩 시 혼동하기 쉬워짐
- also 와 let 을 중첩 해야하는 경우에는 it 을 사용하면 안됨
  - 혼동하기 쉬워짐

## Links

- [What is a purpose of Lambda's with Receiver?](https://stackoverflow.com/questions/47329716/what-is-a-purpose-of-lambdas-with-receiver)
- [코틀린의 apply-with-let-also-run 은 언제 사용하는가](https://medium.com/@limgyumin/%EC%BD%94%ED%8B%80%EB%A6%B0-%EC%9D%98-apply-with-let-also-run-%EC%9D%80-%EC%96%B8%EC%A0%9C-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%EA%B0%80-4a517292df29)

## References

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘