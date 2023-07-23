---
layout  : wiki
title   : Functor and Monad in Functional Programming
summary : 
date    : 2023-07-19 21:54:32 +0900
updated : 2023-07-19 22:15:24 +0900
tag     : kotlin functor monad fp reactive
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Reactive

RxJava was designed and built on top of very fundamental concepts like functors , monoids and monads.
RxJava, working on top of similarly imperative language, the library has its roots in functional programming

Reactive 에서도 그렇고, Java8 이후로 우리는 Functor 와 Monad 라는 개념을 계속 사용하고 있었다.

## Functor

Functor 는 __값(value)을 포함__ 하는 컨테이너(또는 객체)를 나타내는 인터페이스 또는 타입 클래스이다.

__Functor in Java__:

```java
import java.util.function.Function; 

interface Functor<T> { 
    <R> Functor<R> map(Function<T, R> f); 
}
```

__Functor in Kotlin__:

```kotlin
class Functor<T>(private val value: T) {
  fun <R> map(f: (T) -> R): Functor<R> = Functor(f(this.value))
}
```

여기서 map 은 우리가 흔히 사용하던 map 이 맞다. __함수를 받아 값을 변형하는 함수__ 이다. Functor 에서는 map 과 같이 함수를 받아 값을 변형하는 함수가 존재한다.

Formally, a functor is a type class or a concept that satisfies the following rules:

- __Identity__: Mapping an identity function over a functor should not change the functor. In other words, if we map the identity function id over a functor F, it should return the same functor F unchanged.
  - F.map(id) == F
- __Composition__: If we have two functions f: A -> B and g: B -> C, and we map them over a functor F, it should be the same as first mapping f over F and then mapping g over the result.
  - F.map(g.compose(f)) == F.map(f).map(g)

Kotlin 에서 Result 타입은 Functor 이다. 값 객체라는 것을 알 수 있다. 즉, [Value Semantics](https://baekjungho.github.io/wiki/kotlin/kotlin-value-object/) 를 따른다.

```kotlin
@JvmInline
public value class Result<out T> @PublishedApi internal constructor(
  @PublishedApi
  internal val value: Any?
) : Serializable {
  // ...

  @InlineOnly
  @SinceKotlin("1.3")
  public inline fun <R> runCatching(block: () -> R): Result<R> {
    return try {
      Result.success(block())
    } catch (e: Throwable) {
      Result.failure(e)
    }
  }
    
  @InlineOnly
  @SinceKotlin("1.3")
  public inline fun <R, T> Result<T>.map(transform: (value: T) -> R): Result<R> {
    contract {
      callsInPlace(transform, InvocationKind.AT_MOST_ONCE)
    }
    return when {
      isSuccess -> Result.success(transform(value as T))
      else -> Result(value)
    }
  }
}
```

Monad 로 넘어가기전에 Monad 가 Functor 의 어떤 문제를 해결하는지를 알아야 한다.

우리가 흔히 map 을 사용하다보면 __중첩(nested)__ 문제를 겪게 된다.

## Nested Functors

```kotlin
sealed class Option<out T>
data class Some<out T>(val value: T) : Option<T>()
object None : Option<Nothing>()

fun main() {
    val option1: Option<Int> = Some(5)
    val option2: Option<Option<Int>> = Some(option1)
    
    val mappedOption: Option<Option<Int>> = option2.map { innerOption -> innerOption.map { it * 2 } }

    // using when twice
    when (mappedOption) {
        is Some -> {
            when (val innerOption = mappedOption.value) {
                is Some -> println(innerOption.value) // Output: 10
                is None -> println("Inner Option is None")
            }
        }
        is None -> println("Outer Option is None")
    }
}
```

이러한 Nested Functors 문제를 해결해주는 것이 Monad 이다.

## Monad

Monad 를 이해하기 가장 쉬운 방법은 flatMap 을 떠올리는 것이다. flatMap 은 반환 결과를 값으로 그대로 사용한다.
즉, flatMap 을 사용하여 중첩된 컨테이너를 평면화하고, 여러 단계의 변형을 순차적으로 적용할 수 있다.

```kotlin
fun <V, R, E> Result<V, E>.flatMap(f: (V) -> Result<R, E>): Result<R, E> =
  when (this) {
    is Result.Success -> f(this.value)
    is Result.Failure -> this
  }
```

## Links

- [Railway-Oriented Programming](https://kciter.so/posts/railway-oriented-programming#railway-oriented-programming)
- [Functor and monad examples in plain Java](https://nurkiewicz.com/2016/06/functor-and-monad-examples-in-plain-java.html)
- [Douglas Crockford: Monads and Gonads (YUIConf Evening Keynote)](https://www.youtube.com/watch?v=dkZFtimgAcM)