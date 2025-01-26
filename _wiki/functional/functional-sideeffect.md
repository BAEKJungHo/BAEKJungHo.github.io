---
layout  : wiki
title   : Side Effect
summary : Procedure
date    : 2023-09-27 15:02:32 +0900
updated : 2023-09-27 15:12:24 +0900
tag     : fp
toc     : true
comment : true
public  : true
parent  : [[/functional]]
latex   : true
---
* TOC
{:toc}

## Side Effect

부수 효과(side effect)란 함수에서 결괏값을 주는 것 외에 하는 모든 행동을 의미한다.
부수 효과는 일반적으로 해당 메서드 밖에 있는 상태를 변경하거나, I/O 를 수행하는 것으로 정의된다.
부수 효과만을 위해 실행되는 메서드를 프로시저(procedure) 라고 부른다.

__Pseudo Code__:

```kotlin
fun call() {
    // Do something is side effect
    return "result"
}
```

__Examples__:

```kotlin
// 순수 함수: 부수 효과 없이 결괏값만 반환
def add(a: Int, b: Int): Int = {
  a + b
}

// 부수 효과가 있는 함수: 상태를 변경하거나 I/O를 수행
var globalState: Int = 0

def addWithSideEffect(a: Int, b: Int): Int = {
  globalState += (a + b) // 전역 상태(globalState) 변경 -> 부수 효과
  println(s"Global state updated to: $globalState") // 콘솔 출력 -> 부수 효과
  a + b
}

// 프로시저: 반환값 없이 부수 효과만 수행
def logMessage(message: String): Unit = {
  println(s"Log: $message") // 콘솔 출력 -> 부수 효과
}

// 사용 예제
object SideEffectExample extends App {
  println("Pure function result: " + add(3, 5)) // 순수 함수 호출
  
  println("Function with side effect result: " + addWithSideEffect(3, 5))
  println(s"Global state is now: $globalState")
  
  logMessage("This is a side effect example.") // 프로시저 호출
}
```

부수 효과가 있는 함수를 나타내는 분명한 지표는 결과 타입이 Unit 인가 하는 점이다. 어떤 함수가 관심의 대상이 될 만한 값을 반환하지 않는다면, 그런 함수가 주변 세계에 영향을 끼칠 수 있는 유일한 방법은 어떤 형태로든 부수 효과를 통하는 것일 수 밖에 없다.

## References

- Programming in Scala 4/e / Martin Odersky