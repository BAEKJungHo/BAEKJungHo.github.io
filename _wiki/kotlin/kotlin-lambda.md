---
layout  : wiki
title   : Lambda
summary : 코틀린 람다
date    : 2022-09-25 15:54:32 +0900
updated : 2022-09-25 20:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Lambda

람다는 값처럼 여기저기 전달할 수 있는 동작의 모음이다.

- __Grammar__
  - { 파라미터 -> 본문 }
    - Ex. { x: Int, y: Int -> x + y }
- __Bad__
  - ```kotlin
     val sum = { x: Int, y: Int -> x + y }
     println(sum(1, 2))
    ```
    - 위와 같은 구문은 읽기 어렵고 쓸모가 없다.
- __Good__
  - ```kotlin
    run { println(42) }
    ``` 
  - 코드의 일부분을 블록으로 둘러싸 실행할 필요가 있다면 run 을 사용한다.
  - 실행 시점에 코틀린 람다 호출에는 아무 부가 비용이 들지 않는다.

### 컴파일러의 파라미터 타입 추론

- __AS-IS__
  - ```kotlin
    product.maxBy { p: Product -> p.stock }
    ```
- __TO-BE__
  - ```kotlin
    // Compiler Type inference
    product.maxBy { p -> p.stock }
    ```
  - 컴파일러가 타입 추론을 못하는 경우도 있다. 이 때는 타입을 명시하면 된다.
- __람다의 파라미터가 하나 뿐이고 컴파일러가 추론할 수 있으면 it 을 사용할 수 있다.__
  - ```kotlin
    product.maxBy { it.stock }
    ```

### 인자 없는 람다

람다에 인자가 없으면 화살표 기호(->)를 생략할 수 있다.

```kotlin
fun measureTime(action: () -> Unit): Long {
  val start = System.nanoTime()
  aciton()
  return System.nanoTime() - start
}

val time = measureTime { 1 + 2 }
```

### 람다가 포획한 변수

함수내에서 정의된 람다는 함수의 파라미터나, 자기 위에 선언된 지역 변수를 람다 안에서 참조할 수 있다.

```kotlin
fun countErrors(prefix: String, target: Collection<String>): Int {
  val errors = 0
  repeat(target.size) {
    if (target.startWith("4")) {
      println(prefix)
      errors++
    }
  }
  return errors
}
```

위 처럼 람다 안에서 사용하는 외부 변수를 `람다가 포획(capture)한 변수` 라고 한다. 람다가 변수를 포획하면 람다가 생성되는 시점마다 새로운 무명 클래스 객체가 생기며, 이에 따른 부가 비용이 든다. 따라서 람다를 사용하는 구현은 똑같은 작업을 수행하는 일반 함수를 사용한 구현보다 덜 효율적이다.

### 변경 가능 변수 포획하기

자바에서는 final 변수(immutable variable)만 람다가 포획할 수 있다. 하지만 속임수를 통해 변경 가능한 변수(mutable variable)를 포획할 수 있다. 그 속임수는 변경 가능한 변수를 저장하는 원소가 단 하나뿐인 배열을 선언하거나, 변경 가능한 변수를 필드로 하는 클래스를 선언하는 것이다.

```kotlin
class Ref<T>(var value: T)
val counter = Ref(0)
val inc = { counter.value ++}
```

실제 코드에서는 Wrapper 를 만들지 않아도 된다.

```kotlin
var counter = 0
val inc = { counter++ }
```

첫 번째 코드가 변경 가능한 변수를 포획했을때 작동하는 방법을 나타낸다. 람다가 파이널 변수(val)를 포획하면 자바와 마찬가지로 그 변수의 값이 복사된다. 하지만 람다가 변경 가능한 변수(var)를 포획하면 Ref 클래스 인스턴스에 넣는다. 그 Ref 인스턴스에 대한 참조를 파이널로 만들면 람다가 포획할 수 있고, 람다 안에서 그 인스턴스의 필드를 변경할 수 있다.

### 람다와 비동기

람다를 이벤트 핸들러나 다른 비동기적으로 실행되는 코드로 활용하는 경우 함수 호출이 끝난 다음에 로컬 변수가 변경될 수 있기 때문에 주의해야 한다.

```kotlin
fun lambdaWithAsycn(button: Button): Int {
  var clicks = 0
  button.onClick { clicks++ } // always return zero
  return clicks
}
```

### callable reference

호출 가능 참조(callable reference) 혹은 멤버 참조(member reference)는 프로퍼티나 메서드를 단 하나만 호출하는 함수 값을 만들어 준다. `::` 는 참조하려는 멤버(프로퍼티나 메서드) 이름사이에 위치한다.

```kotlin
people.maxBy(People::age)
```

최상위에 선언된 함수나 프로퍼티도 참조할 수 있다.

```kotlin
fun salute() = println("Salute!")
run(::salute)
```

클래스 이름앞에 적용하면 클래스의 생성자에 대한 호출 가능 참조를 얻는다.

```kotlin
class Person(val firstName: String, val lastName: String)

fun main() {
  val createPerson = ::Person
  createPerson("Jungho", "Baek")  
}
```

### bound callable reference

코틀린 1.1부터는 바인딩된 호출 가능 참조(bound callable reference) 라는 사용법이 도입됐다.

```kotlin
class Person(val firstName: String, val lastName: String) {
    fun hasNameOf(name: String) = name.equals(firstName, ignoreCase = true)
}

fun main() {
  val isJungHo = Person("Jungho", "Baek")::hasNameOf
  println(isJungHo("John")) // false 
}
```

### property callable reference

프로퍼티에 대한 호출 가능 참조를 만들 수있다. 이런 참조 자체는 실제로는 함숫값이 아니고, 프로퍼티 정보를 담고있는 리플렉션(reflection) 객체이다.

```kotlin
import kotlin.reflect.jvm.isAccessible

class Person(val firstName: String, val lastName: String)

fun main() {
  val person = Person("Jungho", "Baek")
  val readName = person::firstName::getter
  val writeLastName = person::lastName::isAccessible::setter
  
  println(readName) // Jungho
  writeLastName("Lion")
  println(person.lastName) // Lion
}
```

### 수신 객체가 있는 호출 가능 참조

```kotlin
fun aggregate(numbers: IntArray, op:Int.(Int) -> Int): Int {
  val result = numbers.firstOrNull() ?: throw IllegalArgumentException("Empty Array")
  for (i in 1..numbers.lastIndex) result = result.op(numbers[i])
  return result
}

fun Int.max(other: Int) = if (this > other) this else other

fun main() {
  val numbers = intArrayOf(1, 2, 3, 4)
  println(aggregate(numbers, Int::plus))
  println(aggregate(numbers, Int::max))
}
```

### SAM

- [SAM with receiver](https://baekjungho.github.io/wiki/kotlin/kotlin-ksp/#sam-with-receiver)

## Links

- [High-order functions and lambdas](https://kotlinlang.org/docs/lambdas.html)

## References

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- Effective Kotlin / Marcin Moskala 저 / 인사이트