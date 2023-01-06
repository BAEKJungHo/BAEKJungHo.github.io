---
layout  : wiki
title   : Suspension Mechanism
summary : 코루틴 중단 매커니즘
date    : 2022-12-15 20:54:32 +0900
updated : 2022-12-15 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Suspension Mechanism

> Coroutine 은 __suspend point(중단 지점)__ 에서 __중단(suspend)__ 될 수 있고, 다시 해당 __suspend point__ 에서 __재개(resume)__ 할 수 있다.

- Suspend mechanism = suspend(중단) + resume(재개)
- suspend 와 resume 을 쓰는 메커니즘에서 스레드는 Blocking 되는 것이 아니라, 다른 일을 할 수 있게 되는 것이다.
- suspend 키워드는 이 함수가 코루틴의 실행을 일시 중지 시킬 수 있다는 것을 나타낸다.

### suspendable computation

> suspendable computation 이란 프로그램이 특정 위치에서 유보(suspend)할 수 있고 나중에 다른 Thread 에서 실행을 재개할 수 있는 것을 말한다.

코루틴은 __suspendable computation(유보가능 연산, 일시정지 가능한 연산)__ 의 인스턴스라 할 수 있다. 따라서 특정 지점에서 연기시킨 코루틴은 나중에 다른 Thread 에서 재개 될 수 있다. 코루틴은 생성되고 시작되지만 특정 Thread 에 바인딩되진 않는다. 코루틴끼리는 서로가 데이터를 주고 받으며 호출할 수 있으므로 협업 멀티태스킹을 위한 매커니즘을 구현할 수 있다. 따라서, 코루틴이란 서로 협력해서 실행을 주고 받으면서 작동하는 여러 서브루틴을 의미한다.

### suspending function

> suspend 키워드를 붙여 만든 함수. 다른 suspending 함수를 호출해 현재 실행 스레드를 차단하지 않고 코드 실행을 일시 중단할 수 있다. suspending 함수는 일반 코드에서 호출할 수 없고 다른 suspend 함수나 suspending 람다(아래서 설명)에서만 호출할 수 있다.

- await()같은 일반적인 유보 구현은 다음과 같다.

```kotlin
suspend fun <T> CompletableFuture<T>.await(): T =
    suspendCoroutine<T> { cont: Continuation<T> ->
        whenComplete { result, exception ->
            if (exception == null) // 일반적으로 future 가 완료될 때
                cont.resume(result)
            else // future 가 예외로 종료된 경우
                cont.resumeWithException(exception)
        }
    }
```

suspend 키워드는 이 함수가 코루틴의 실행을 일시 중지 시킬 수 있다는 것을 나타낸다. 이 CompletableFuture 의 확장 함수는 실제 사용 시 좌에서 우로 따라 자연스레 읽힌다.

```kotlin
doSomethingAsync(...).await()
```

suspending 함수는 보통 함수도 부를 수 있지만 __일시중지를 위해서는 반드시 다른 suspending 함수를 불러야 한다.__ 특히 이 await 구현은 표준라이브러리에 정의된 최상위 suspending 함수인 suspendCoroutine 을 호출한다.

```kotlin
suspend fun <T> suspendCoroutine(block: (Continuation<T>) -> Unit): T
```

suspendCoroutine 이 코루틴 내에서 호출될 때 컨티뉴에이션의 인스턴스가 코루틴의 상태를 캡쳐하고 지정된 블록에 인자로 전달된다. 코루틴을 다시 실행하려면 블록은 해당 쓰레드나 다른 쓰레드에서 continuation.resumeWith()를 직접 호출하거나 continuation.resume() 또는 continuation.resumeWithException()을 호출해야 한다.

continuation.resumeWith()에 전달된 결과는 suspendCoroutine 호출의 결과가 되며, 이는 .await()의 결과가 된다.
같은 continuation 은 resume 을 두번 호출할 수 없으면 그럴 경우 IllegalStateException 을 발생시킨다.

### suspending lambda

> 코루틴에서 실행할 코드블록. 일반 람다와 같은 모양이지만 함수타입은 suspend modifier 가 된다. 보통 람다처럼, suspending 람다는 suspending 함수의 간단한 익명 구문이다. suspending 함수를 호출해 현재 실행 스레드를 차단하지 않고 코드 실행을 일시 중지 할 수 있다. 예를 들어 launch, sequence 함수 다음에 중괄호로 묶인 코드 블록은 모두 suspending 람다다.

## Links

- [Kotlin Coroutines - KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md)
- [Kotlin Coroutine series](https://github.com/tmdgusya/kotlin-coroutine-series)
- [Kotlin CoroutineKR](https://github.com/hikaMaeng/kotlinCoroutineKR)

## References

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘