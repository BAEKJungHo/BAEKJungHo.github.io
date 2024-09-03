---
layout  : wiki
title   : How to Implementation High Order Functions?
summary : 
date    : 2024-09-02 20:54:32 +0900
updated : 2024-09-02 21:15:24 +0900
tag     : kotlin 
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## How to Implementation High Order Functions?

A ___[higher-order function](https://kotlinlang.org/docs/lambdas.html#higher-order-functions)___ is a function that takes functions as parameters, or returns a function.

Kotlin 에서 고차 함수를 적절하게 사용하면 가독성을 끌어 올릴 수 있다.

간단한 예제를 살펴보자.

__First__:

```kotlin
fun operate(x: Int, y: Int, operation: (Int, Int) -> Int): Int {
    return operation(x, y)
}

fun main() {
    // 덧셈 함수를 인자로 전달
    val sum = operate(5, 3) { a, b -> a + b }
    println("Sum: $sum")  // 출력: Sum: 8

    // 곱셈 함수를 인자로 전달
    val product = operate(5, 3) { a, b -> a * b }
    println("Product: $product")  // 출력: Product: 15
}
```

첫 번째 케이스의 경우에는 operate 함수가 파라미터 x, y 를 받고 세번째 인자로 함수를 받는다. 
메서드 바디에서는 x, y 인자를 operation 함수가 사용하고 있다.

즉, 이 코드를 통해서 고차 함수는 아래와 같은 경우에 사용할 수 있다는 것을 알 수 있다.

```kotlin
// 고차함수의 함수가 아닌 매개변수(p1, p2)가, 함수 타입 매개변수(concat)에 사용되는 경우
fun hof(p1: String, p2: String, concat: (String, String) -> String) {
    return concat(p1, p2)
}
```

다음 코드를 보자.

```kotlin
/**
 * VIN 을 기준으로 비지니스 로직을 처리한다.
 * VIN 에 해당되는 비지니스 로직이 처리 중이라면 startTx 에서 예외를 발생시킨다.
 */
startTx(VIN)
try {
    // Do Something
} catch(e: Exception) {
    throw CustomException(e)
} finally {
    endTx()
}
```

위와 같은 코드는 특정 ___정책(Policy)___ 에 해당되는 비지니스 로직을 실행시키고 싶은 케이스에 해당된다.

```kotlin
@Component
class Tx(
    private val redisClient: RedisClient
) {
    fun process(policy: CommandPolicy, block: () -> Unit) {
        startTx(policy)
        try {
            block()
        } catch(e: Exception) {
            throw CustomException(e)
        } finally {
            endTx()
        }
    }
    
    private fun startTx(policy: CommandPolicy) { }
    
    private fun endTx(policy: CommandPolicy) { }
}

data class CommandPolicy(
    val vin: String
)
```

__Use__:

```kotlin
val policy = CommandPolicy(vin = "VIN")
tx.process(policy) {
    // Do Something
}
```

이번 케이스는 고차함수의 함수가 아닌 매개변수(policy)가, 함수 타입 매개변수(concat)에 사용되지 않는 경우에 해당된다.
이와 비슷한 케이스로는 kotlin 의 repeat 함수가 있다.

```kotlin
fun main() {
    repeat(times = 2) {
        println("Hello World")
    }
}
```

