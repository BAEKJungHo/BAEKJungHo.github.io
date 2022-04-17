---
layout  : wiki
title   : Sequence vs Iterable
summary : 코틀린의 Sequence 와 Iterable 비교
date    : 2022-04-16 15:54:32 +0900
updated : 2022-04-16 16:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

# Sequence vs Iterable

```kotlin
interface Iterable<out T> {
    operator fun iterator(): Iterator<T>
}
```

```kotlin
interface Sequence<out T> {
    operator fun iterator(): Iterator<T>
}
```

인터페이스만 봤을때는 이름 빼고 차이가 없어보이지만, `처리 방식`이 완전히 다르다.

## Sequence

- __lazy order(= element-by-element order)__
  - Java8 의 Stream 과 같은 방식으로 지연(Lazy) 처리
  - 시퀀스 생성 > 중간 연산 > 최종 연산으로 이루어진 처리 단계
  - 최종 연산(toList() 등)을 호출하기 전까지는 각 단계에서 연산이 일어나지 않음
  - 요소 하나하나에 지정한 연산을 한 꺼번에 적용
- __Sequence 를 사용하면 데코레이터 패턴으로 꾸며진 새로운 시퀀스가 리턴__

```kotlin
/**
 * 시퀀스 생성: asSequence()
 * 중간 연산: map, filter
 * 최종 연산: toList()
 */
val result = numbers.asSequence().map { ... }.filter { ... }.toList()
```

아래의 결과를 예측해보자.

```kotlin
// Output: F1, M1, E2, F2, F3, M3, E6
sequenceOf(1,2,3)
    .filter { print("F$it, "); it % == 1 }
    .map { print("M%it, "); it * 2}
    .forEach { print("E$it, ") }
```

### Flow

```kotlin
val words = "The quick brown fox jumps over the lazy dog".split(" ")
//convert the List to a Sequence
val wordsSequence = words.asSequence()

val lengthsSequence = wordsSequence.filter { println("filter: $it"); it.length > 3 }
    .map { println("length: ${it.length}"); it.length }
    .take(4)

println("Lengths of first 4 words longer than 3 chars")
// terminal operation: obtaining the result as a List
println(lengthsSequence.toList())
```

최종 연산자인 toList() 가 호출되는 순간 중간 연산자들이 호출된다. 즉, 아래 그림에 나와있는 것 처럼,
데이터를 하나씩 꺼내서 `filter > map > take` 순서로 반복하여 처리한다.

![sequence](https://user-images.githubusercontent.com/47518272/163670924-a3467e70-28b3-4bd3-ace7-7a5740762ac1.png)

### 특징

- __Lazy 하게 처리되기 때문에, 중간 단계의 결과 빌드를 피할 수 있어서, 성능이 향상__
  - 자연스러운 처리 순서를 유지
  - 각 아이템별로 pipe-line 을 통과하고, 별도의 컬렉션을 생성하지 않음
- __크고 무거운 컬렉션이나, 파일을 처리할 때 유용__
  - Ex. 시카고의 범죄 통계 분석
  
## Iterable

- __함수를 사용할 때마다 연산이 이루어져서 새로운 컬렉션을 생성__
  - 각, 처리 단계마다 새로운 컬렉션이 생성

아래의 결과를 예측해보자.

```kotlin
// Output: F1, F2, F3, M1, M3, E2, E6
listOf(1,2,3)
  .filter { print("F$it, "); it % == 1 }
  .map { print("M%it, "); it * 2}
  .forEach { print("E$it, ") }
```

### Flow

```kotlin
val words = "The quick brown fox jumps over the lazy dog".split(" ")
val lengthsList = words.filter { println("filter: $it"); it.length > 3 }
    .map { println("length: ${it.length}"); it.length }
    .take(4)

println("Lengths of first 4 words longer than 3 chars:")
println(lengthsList)
```

Iterable 에는 중간 연산과 최종 연산이라는 개념이 없으며, 모든 아이템들이 pipe-line 을 다같이 통과하고, 각 pipe-line 마다 새로운 리스트를 생성한다. 위의 경우에는 컬렉션이 세 번 만들어진다.

![iterator](https://user-images.githubusercontent.com/47518272/163670923-f78b3a7a-c7f0-41bf-9d35-fac6ca9b6e6c.png)

### 특징

- __각각의 단계에서 새로운 컬렉션을 반환하기 때문에 만들어진 결과를 활용할 수 있다.__
  - 그만큼 공간을 많이 차지한다.
- __크고 무거운 컬렉션이나, 파일을 처리할 때, OutOfMemoryError 가 발생할 수도 있다.__

## Sequences vs. Collections: Performance

![seqvsit](https://user-images.githubusercontent.com/47518272/163670925-8df08af4-6d5f-44ed-90be-69f9cae53fc4.png)

## 시퀀스가 빠르지 않은 경우

- 컬렉션 전체를 기반으로 처리해야 하는 연산은 시퀀스를 사용해도 빨라지지 않는다.
  - Ex. Kotlin stdlib 의 sorted

## Sequence vs Stream

> Sequence 는 Stream 과 철학이 비슷하다.

kotlin 의 Sequence 와 Java 의 Stream 은 어떤 기준으로 선택해야 할까?

- __플랫폼 / 함수__
  - Sequence 가 더 많은 처리 함수를 보유
  - Sequence 가 더 사용하기 쉽다
    - Stream 등장 이후에 나와서 몇 가지 문제를 해결
      - Ex. collect(Collectors.toList()) 를 toList() 로 해결
  - Sequence 는 Kotlin/JVM, Kotlin/JS, Kotlin/Native 등 일반적인 모듈에서 모두 사용 가능
    - Java 의 Stream 은 Kotlin/JVM 위에서만 동작하며, JVM 버전이 8 이상이어야 한다.
- __병렬__
  - 단, 병렬 처리를 하여 성능적 이득을 보아야 한다면 자바의 Stream 을 사용해야 한다.

## Debugger

- Kotlin Sequence Debugger
- Java Stream Debugger

## Benchmark

> 시퀀스와 컬렉션의 성능적 차이를 확실하게 알고 싶다면 벤치마크 툴을 사용하는게 좋다.
>
> [JMH Benchmark Tool](https://openjdk.java.net/projects/code-tools/jmh/)

## 결론

- __크고 무거운 컬렉션으로 여러 처리 단계를 거쳐야 한다면 시퀀스가 효율적이다.__
  - 크고 무겁다라는 의미는 수천, 수만개의 리스트를 갖고 있거나, 몇 MB 나 되는 긴 문자열을 갖고 있는 경우 등을 의미한다.
- __데이터 양이 적고, 처리 단계가 많지 않다면 성능상 큰 차이는 없다.__

### Use a Collection if:

- Few items
- Few operations
- Stateful operations
- Missing Sequence operators

### Use a Sequence if:

- Many items
- Many operations
- Stateless operations
- Short circuits

## Links

- [Kotlin Sequences](https://kotlinlang.org/docs/sequences.html)
- [When to Use Sequence](https://typealias.com/guides/when-to-use-sequences/)
- [Stateless and stateful operations](https://www.oreilly.com/library/view/introduction-to-programming/9781788839129/50f54a6f-dd25-40bc-89d2-31b73d95b6b7.xhtml)
- [kt.academy.cc-sequence](https://kt.academy/article/cc-sequence)
- [collections-and-sequences in kotlin](https://medium.com/androiddevelopers/collections-and-sequences-in-kotlin-55db18283aca)

## 참고 문헌

- Effective Kotlin Item 49 / Marcin Moskala 저 / 인사이트