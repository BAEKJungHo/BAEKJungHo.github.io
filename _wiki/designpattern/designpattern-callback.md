---
layout  : wiki
title   : Callback
summary : 콜백 패턴
date    : 2022-12-14 15:28:32 +0900
updated : 2022-12-14 18:15:24 +0900
tag     : designpattern kotlin
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Problems

### Use-case on Android

Client side 에서는 View 를 Rendering 하는 과정에서 Main Thread 가 Block 되지 않아야 한다.

```kotlin
fun renderSomeView() {
    val data = getSomePageScripting() // API Call
    val result = process(data) // Processing
    view.show(result)
}
```

위 코드의 경우에는 Process 를 하는 과정에서 Main Thread 가 Blocking 될 수 있는 문제가 있다.

### Thread Context Switching

```kotlin
fun renderSomeView() {
    thread {
      val data = getSomePageScripting() // API Call
      val result = process(data) // Processing
      view.show(result)
    }
}
```

Thread Context Switching 를 적용한 위 코드는 아래와 같은 문제가 있을 수 있다.
- Multi-Thread 프로그래밍을 할때 항상 다른 Thread 를 Interrupt 할 수 있는 수단이 존재해야 하는데 존재하지 않아 Memory Leak 을 유발할 수 있다.
- 잦은 Context Switching 은 관리하는 것이 어렵다.

이러한 문제를 __Callback Pattern__ 을 이용해 해결할 수 있다.

## Callback

Callback Pattern 은 Process 가 종료됐을때 실행하길 원하는 Function 을 넘겨준 뒤, 해당 Process 가 종료되면 넘겨받은 Function 을 실행하게끔 하는 것을 의미한다.

```kotlin
fun process(callback: () -> Unit) = thread {
    Thread.sleep(1000)
    // do some process
    callback.invoke() // invoke callback
}

fun main() {
    val callbackFn = { println(", World!") }
    process(callbackFn)
    println("Hello")
    Thread.sleep(2000) // join
}
```

위와 같이 process 내에서 도는 함수가 다 끝난뒤 넘겨 받은 __callback__ 을 __invoke()__ 하게 된다.

### Callback Hell

아래와 같은 코드를 __'Callback Hell'__ 혹은 __'아도겐 코드'__ 라고 부른다.

```kotlin
fun doSome() {
    f1(context) {
        f2 (context) {
            f3 (context) {
                doSomething()
            }
        }
    }
}
```

## Links

- [Why use Coroutine](https://github.com/tmdgusya/kotlin-coroutine-series/blob/main/chapter/WHY_USE_COROUTINE.md)