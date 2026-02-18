---
layout  : wiki
title   : SUSPEND MECHANISM
summary :
date    : 2026-02-18 12:02:32 +0900
updated : 2026-02-18 12:28:24 +0900
tag     : architecture kotlin coroutine
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---

* TOC
{:toc}

## SUSPEND MECHANISM

Kotlin Coroutine 의 ***suspend*** 함수는 비동기 코드를 동기 코드처럼 작성할 수 있게 하는 핵심 메커니즘이다. 그런데 "suspend 함수가 non-blocking 으로 동작한다"는 말은 정확히 무엇을 의미하는가?

전통적인 blocking I/O 모델에서는 네트워크 호출이나 디스크 접근 시 해당 Thread 가 결과를 받을 때까지 대기(block) 상태에 빠진다. Thread 는 OS 커널이 관리하는 자원이며, 각 Thread 마다 기본적으로 수백 KB ~ 1MB 의 Stack 메모리를 점유한다. Thread-Per-Request 모델에서 동시 요청이 수천 건을 넘어서면 Thread 생성 비용과 Context Switching 오버헤드가 급격히 증가한다.

```
Blocking Model:

Thread-1  ──[작업A]──[I/O 대기 ■■■■■■■■]──[작업A 계속]──
Thread-2  ──[작업B]──[I/O 대기 ■■■■■■■■■■■]──[작업B 계속]──
Thread-3  ──[작업C]──[I/O 대기 ■■■]──[작업C 계속]──

→ 각 Thread 가 I/O 대기 동안 점유된 채로 아무 일도 하지 않는다.
```

Kotlin Coroutine 은 이 문제를 근본적으로 다른 방식으로 해결한다. suspend 지점에서 Thread 를 반환하고, 나중에 결과가 준비되면 재개(resume) 한다.

```
Non-blocking Model (Coroutine):

Thread-1  ──[코루틴A]──[suspend]──[코루틴B]──[코루틴C]──[코루틴A resume]──
                          │
                          └─ Thread 를 반환. 다른 코루틴이 사용 가능.
```

여기서 주의할 점이 있다. `suspend` 키워드 자체가 함수를 non-blocking 으로 만드는 것은 아니다. `suspend` 는 ***컴파일러 마커(compiler marker)*** 로서, Kotlin 컴파일러에게 "이 함수는 코루틴을 중단할 수 있다"는 신호를 보내는 역할을 한다. 실제로 suspend 함수 내부에서 `Thread.sleep()` 을 호출하면 Thread 가 block 된다. non-blocking 동작은 `delay()`, `suspendCancellableCoroutine()` 같은 실제 중단 프리미티브를 호출할 때만 발생한다.

<mark><em><strong>suspend 의 본질은 "Thread 를 blocking 하지 않으면서 실행 흐름을 중단하고, 나중에 정확히 중단된 지점부터 재개할 수 있는 능력"이다. 이것은 JVM 의 네이티브 기능이 아니라, 컴파일러가 코드를 State Machine 으로 변환함으로써 가능해진다.</strong></em></mark>

[Kotlin Coroutines KEEP Proposal](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md) 에서는 이를 다음과 같이 설명한다.

> "Coroutines are completely implemented through a compilation technique (no support from the VM or OS side is needed), and suspension works through code transformation."

이 메커니즘은 언어 수준에서의 ***Cooperative Multitasking*** 을 구현한 것이다. OS 커널이 하드웨어 타이머 인터럽트를 통해 Thread 를 강제로 전환하는 ***Preemptive Multitasking*** 과 달리, 코루틴은 suspend 지점에서 자발적으로 제어권을 양보한다.

이 글에서는 suspend 함수가 컴파일 타임에 어떻게 변환되는지, JVM 의 Stack 기반 실행 모델을 어떻게 우회하는지, 그리고 중단과 재개의 전체 흐름을 단계별로 분석한다.

## CPS Transformation: How the Compiler Transforms Suspend Functions

suspend 함수의 non-blocking 동작을 이해하기 위한 첫 번째 열쇠는 ***CPS(Continuation Passing Style)*** 변환이다.

CPS 는 1970년대부터 프로그래밍 언어 이론에서 확립된 개념이다. Direct style 에서는 함수가 값을 반환(return)하지만, CPS 에서는 함수가 "이후에 실행할 나머지 연산"을 인자로 받아 그것에 결과를 전달한다.

***[Continuation Passing Style](https://klarciel.net/wiki/kotlin/kotlin-continuation/)*** 에서 다룬 것처럼, CPS 변환은 프로그램의 실행 중 특정 시점 이후에 진행해야 하는 내용을 별도의 함수(***Continuation***)로 뽑고, 그 함수에게 현재까지의 실행 결과를 넘겨서 처리하게 만드는 소스코드 변환 기술이다.

### Suspend Function Before and After Compilation

다음과 같은 suspend 함수가 있다고 하자.

```kotlin
suspend fun fetchUserData(userId: String): UserData {
    val token = requestToken()       // suspend point 1
    val profile = getProfile(token)  // suspend point 2
    return UserData(profile)
}
```

Kotlin 컴파일러는 이 함수를 다음과 같은 형태로 변환한다.

```kotlin
// 컴파일 후 (개념적 표현)
fun fetchUserData(userId: String, $completion: Continuation<UserData>): Any? {
    // ...State Machine 로직...
}
```

핵심적인 변화는 두 가지이다.

__Part1 -- suspend 키워드 제거__: suspend 키워드가 사라지고, 대신 마지막 인자로 `Continuation<T>` 객체가 추가된다. 컴파일러 출력에서 이 파라미터는 `$completion` 으로 명명된다.

__Part2 -- 반환 타입 변경__: 원래의 반환 타입 `UserData` 대신 `Any?` (JVM 에서는 `Object`) 를 반환한다. 이 함수는 실제 결과값을 반환하거나, 또는 특수한 마커 객체인 ***COROUTINE_SUSPENDED*** 를 반환할 수 있다. 이 두 가지 가능성을 모두 담기 위해 `Any?` 타입이 사용된다.

```
suspend fun fetchUserData(userId: String): UserData
                    │
                    │ CPS Transformation (compile time)
                    ▼
fun fetchUserData(userId: String, $completion: Continuation<UserData>): Any?
                                   │                              │
                           Continuation 추가              COROUTINE_SUSPENDED
                           (상태 저장소)                   또는 실제 결과값
```

### Continuation Interface

***[Continuation](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/)*** 은 Kotlin 표준 라이브러리에 정의된 인터페이스이다.

```kotlin
public interface Continuation<in T> {
    public val context: CoroutineContext
    public fun resumeWith(result: Result<T>)
}
```

- `context`: 코루틴의 실행 환경(Dispatcher, Job, CoroutineName 등)을 담고 있다.
- `resumeWith(result)`: 중단된 코루틴을 재개하는 메서드이다. `Result<T>` 인라인 클래스를 통해 성공 결과 또는 예외를 전달할 수 있다.

자주 사용되는 `resume(value)` 과 `resumeWithException(exception)` 은 인터페이스 메서드가 아니라 ***확장 함수(extension function)*** 이다.

```kotlin
public inline fun <T> Continuation<T>.resume(value: T): Unit =
    resumeWith(Result.success(value))

public inline fun <T> Continuation<T>.resumeWithException(exception: Throwable): Unit =
    resumeWith(Result.failure(exception))
```

CPS 관점에서 보면 Continuation 은 "이후에 실행해야 할 나머지 연산"을 캡슐화한 ***[Callback](https://klarciel.net/wiki/architecture/architecture-callback/)*** 이다. Roman Elizarov 는 [KotlinConf 2017 Deep Dive into Coroutines on JVM](https://www.youtube.com/watch?v=YrrUCSi72E8) 에서 이를 명확히 표현했다.

- CPS is a **fancy theoretical name of callback**
- CPS == Callback

다만, Kotlin 컴파일러가 생성하는 Continuation 은 단순한 Callback 이 아니다. 내부에 State Machine 을 포함하고 있으며, label 기반 분기를 통해 재개 지점을 관리한다.

## State Machine: Label-based Branching

컴파일러는 suspend 함수 내의 각 ***suspension point*** (중단 가능 지점)를 기준으로 코드를 ***label*** 로 분할하고, `when` 문으로 분기하는 ***State Machine*** 을 생성한다. 중요한 점은, 컴파일러가 각 suspension point 마다 별도의 Continuation 을 생성하는 것이 아니라 **하나의 suspend 함수당 하나의 State Machine 을 생성**한다는 것이다. N개의 suspension point 에 대해 N개의 Continuation 이 아닌 단 1개의 Continuation 만 할당된다.

### Labeling Process

앞서 본 `fetchUserData` 함수는 두 개의 suspend point 를 가진다. 컴파일러는 이를 세 개의 label 로 분할한다.

```kotlin
suspend fun fetchUserData(userId: String): UserData {
    // ---- label 0 ----
    val token = requestToken()       // suspend point → label 0 → 1
    // ---- label 1 ----
    val profile = getProfile(token)  // suspend point → label 1 → 2
    // ---- label 2 ----
    return UserData(profile)
}
```

### Generated State Machine

컴파일러가 생성하는 코드를 바이트코드에서 역컴파일한 형태로 표현하면 다음과 같다.

```java
// Decompiled pseudocode
Object fetchUserData(String userId, Continuation<? super UserData> $completion) {
    FetchUserDataContinuation sm;

    if ($completion instanceof FetchUserDataContinuation) {
        sm = (FetchUserDataContinuation) $completion;
        if ((sm.label & Integer.MIN_VALUE) != 0) {
            sm.label -= Integer.MIN_VALUE;  // re-entry marker 제거
        } else {
            sm = new FetchUserDataContinuation($completion);
        }
    } else {
        sm = new FetchUserDataContinuation($completion);
    }

    Object result = sm.result;

    switch (sm.label) {
        case 0:
            sm.userId = userId;       // 지역변수를 Continuation 에 저장
            sm.label = 1;             // 다음 재개 시 label 1 로 진입
            Object r1 = requestToken(sm);
            if (r1 == COROUTINE_SUSPENDED) return COROUTINE_SUSPENDED;
            result = r1;              // suspend 되지 않았으면 fall through
            // FALL THROUGH
        case 1:
            ResultKt.throwOnFailure(result);  // 예외 검사
            Token token = (Token) result;
            sm.token = token;
            sm.label = 2;
            Object r2 = getProfile(token, sm);
            if (r2 == COROUTINE_SUSPENDED) return COROUTINE_SUSPENDED;
            result = r2;
            // FALL THROUGH
        case 2:
            ResultKt.throwOnFailure(result);
            Profile profile = (Profile) result;
            return new UserData(profile);
        default:
            throw new IllegalStateException("call to 'resume' before 'invoke' with coroutine");
    }
}
```

이 코드에서 주목할 핵심 구현 세부사항이 있다.

__Part1 -- Re-entry Marker (Integer.MIN_VALUE)__: `label` 필드의 최상위 비트(MSB)를 re-entry marker 로 사용한다. `invokeSuspend()` 에서 State Machine 에 재진입할 때 `label |= Integer.MIN_VALUE` 를 설정하고, 함수 진입 시 이 비트를 확인하여 새 Continuation 을 생성할지 기존 것을 재사용할지 판단한다. 이를 통해 같은 Continuation 이 재진입하는 경우 불필요한 객체 생성을 방지한다.

__Part2 -- Fall-through Optimization__: suspend 함수가 실제로 suspend 하지 않고 즉시 결과를 반환하는 경우(***fast path***), `COROUTINE_SUSPENDED` 검사 후 그대로 다음 case 로 떨어진다(fall through). 이로써 불필요한 Dispatcher 스케줄링 없이 바로 다음 단계를 실행한다.

__Part3 -- Error Handling__: 각 label 진입 시 `ResultKt.throwOnFailure(result)` 를 호출하여, 이전 suspension 의 결과가 예외인 경우 해당 지점에서 rethrow 한다.

__Part4 -- 지역변수 저장 범위__: **suspension point 를 넘어 유지해야 하는 지역변수만** Continuation 의 필드로 승격(promote)된다. 컴파일러가 liveness analysis 를 수행하여 suspension point 를 건너지 않는 변수는 JVM Stack 에 그대로 둔다. 이것은 중요한 최적화이다.

__State Machine 의 구조를 시각화하면 다음과 같다.__

```
                     ┌─────────────────────┐
                     │   fetchUserData()   │
                     │    sm.label = ?     │
                     └─────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         label = 0        label = 1        label = 2
              │                │                │
              ▼                ▼                ▼
      ┌───────────────┐ ┌──────────────┐ ┌─────────────┐
      │ requestToken()│ │ getProfile() │ │ UserData()  │
      │ sm.label = 1  │ │ sm.label = 2 │ │ return 결과 │
      └───────┬───────┘ └──────┬───────┘ └─────────────┘
              │                │
    COROUTINE_SUSPENDED  COROUTINE_SUSPENDED
              │                │
              ▼                ▼
       Thread 반환         Thread 반환
       (non-blocking)      (non-blocking)
```

### Continuation as State Machine

State Machine 의 상태를 저장하는 Continuation 구현체는 다음과 같은 구조를 갖는다.

```java
// Generated continuation class (decompiled pseudocode)
final class FetchUserDataContinuation extends ContinuationImpl {
    int label = 0;              // 현재 State Machine 의 위치
    Object result;              // 이전 suspend 함수의 반환값
    String userId;              // suspension point 를 넘어 유지되는 지역변수
    Token token;                // suspension point 를 넘어 유지되는 지역변수

    FetchUserDataContinuation(Continuation<?> completion) {
        super(completion);
    }

    @Override
    protected Object invokeSuspend(Object result) {
        this.result = result;
        this.label |= Integer.MIN_VALUE;  // re-entry marker 설정
        return fetchUserData(userId, this);  // State Machine 재진입
    }
}
```

<mark><em><strong>State Machine 은 Continuation 그 자체이다. label 은 "어디까지 실행했는가"를, 필드들은 "실행 중 어떤 값을 들고 있었는가"를 기록한다. 이 두 가지 정보만 있으면 중단된 지점에서 정확히 재개할 수 있다.</strong></em></mark>

### COROUTINE_SUSPENDED Sentinel

***COROUTINE_SUSPENDED*** 는 `kotlin.coroutines.intrinsics` 에 정의된 싱글턴 마커 객체이다.

```kotlin
// kotlin.coroutines.intrinsics
internal enum class CoroutineSingletons {
    COROUTINE_SUSPENDED,
    UNDECIDED,
    RESUMED
}

public val COROUTINE_SUSPENDED: Any get() = CoroutineSingletons.COROUTINE_SUSPENDED
```

suspend 함수가 `COROUTINE_SUSPENDED` 를 반환한다는 것은 다음을 의미한다.

- 결과를 아직 계산하지 못했다.
- Continuation 을 어딘가(콜백, 타이머 등)에 등록해 두었다.
- 결과가 준비되면 누군가가 `continuation.resumeWith(result)` 를 호출할 것이다.

이 sentinel 값은 호출 스택을 따라 위로 전파되면서 각 프레임을 정상적으로 unwind 하고, 최종적으로 코루틴 빌더(launch, async 등)에 도달하여 Thread 를 반환한다.

## Stack vs Heap: How Coroutines Bypass JVM Stack Limitations

JVM 은 기본적으로 ***Stack-based execution model*** 을 사용한다. 메서드가 호출되면 Stack Frame 이 생성되고, 지역변수와 반환 주소가 Stack Frame 에 저장된다. 메서드가 반환되면 Stack Frame 이 제거된다.

```
JVM Stack (Thread 별로 독립)

    ┌──────────────────┐
    │ getProfile()     │ ← 현재 실행 중인 Frame
    │  - token         │
    │  - return addr   │
    ├──────────────────┤
    │ fetchUserData()  │
    │  - userId        │
    │  - token         │
    │  - return addr   │
    ├──────────────────┤
    │ main()           │
    │  - args          │
    └──────────────────┘
```

JVM Specification (Section 2.5.2) 에 따르면, Stack Frame 은 메서드 호출 시 생성되고 완료 시 소멸한다. 이 모델에서는 함수가 "중간에 빠져나갔다가 나중에 돌아오는" 것이 불가능하다. 결과가 준비될 때까지 Stack Frame 을 유지하려면 Thread 자체를 block 해야 한다.

### Heap-based State Capture

Kotlin Coroutine 은 이 제약을 ***Continuation 객체를 Heap 에 할당***함으로써 우회한다.

```
JVM Stack Frame (volatile)          Continuation Object (heap-allocated)
+---------------------------+       +---------------------------+
| Local variable 0 (userId) |  -->  | field: userId             |
| Local variable 1 (token)  |  -->  | field: token              |
| Local variable 2 (profile)|       | (저장 안 함 - label 2     |
|                           |       |  내부에서만 사용)          |
| [Operand stack]           |       | field: label = 1          |
| [Return address]          |       | field: completion (parent) |
+---------------------------+       +---------------------------+
     return 시 소멸                    GC 까지 Heap 에 유지
```

***[Debugging to analyze suspend mechanisms](https://klarciel.net/wiki/kotlin/kotlin-suspend/)*** 에서 확인한 것처럼, 코루틴이 중단-재개되면서 함수 내에 사용되는 지역변수 정보들을 Continuation 에 저장하고 가져다 사용한다. **Continuation 은 실제 Function 에서 Thread Stack 영역에 물고 있어야 하는 정보를 저장하는 역할을 담당한다.**

### Stackless Coroutines

Kotlin Coroutine 은 ***stackless coroutine*** 이다. 이것은 Go 의 goroutine 이나 Java 의 Virtual Thread 같은 ***stackful coroutine*** 과 근본적으로 다르다.

| 특성 | Kotlin Coroutine (Stackless) | Go Goroutine / Virtual Thread (Stackful) |
|-----|------------------------------|------------------------------------------|
| suspend 시 저장 대상 | suspension point 를 넘는 지역변수만 | 전체 Stack (모든 Frame) |
| Stack 구조 | 별도의 Stack 없음. JVM Stack 을 공유 | 고유한 Stack 보유 (Heap 에 할당) |
| 중단 가능 지점 | 명시적 suspend 함수 호출 시에만 | blocking 호출 시 자동 (VT) / 함수 호출 프롤로그 (Go) |
| 컴파일러 개입 | CPS 변환 + State Machine 생성 | 최소 -- 런타임이 Stack 관리 |

suspension point 사이에서는 일반적인 JVM Stack Frame 이 사용된다. 코루틴이 suspend 되면 이 Stack Frame 들은 정상적으로 unwind 되고, 필요한 상태만 Continuation 객체에 보존된다.

***[Designing Context Structures for Suspend/Resume in Multitasking](https://klarciel.net/wiki/operatingsystem/os-multitasking/)*** 에서 다룬 것처럼, Process 가 탄생한 이유는 CPU 가 프로그램을 일시 중단했다가 재개하기 위해 context 를 저장할 구조가 필요했기 때문이다. Coroutine 의 Continuation 은 이와 동일한 역할을 **User Space 에서, Heap 메모리를 사용하여** 수행한다.

```
OS Level Context Switch         Coroutine Suspend/Resume
─────────────────────           ────────────────────────
PCB (Process Control Block)     Continuation Object
  - PC (Program Counter)          - label (재개 위치)
  - Registers                     - 지역변수 필드
  - Stack Pointer                 - result (이전 결과)
  - Memory Maps                   - context (CoroutineContext)

Kernel 이 관리                  User Space 에서 관리
Context Switch: 수 μs           Suspend/Resume: 수십~수백 ns
```

### BaseContinuationImpl and the Trampoline Loop

Kotlin 런타임은 Continuation 을 위한 클래스 계층 구조를 제공한다.

```
Continuation<T>                        (interface, kotlin.coroutines)
  │
  └── BaseContinuationImpl             (abstract, kotlin.coroutines.jvm.internal)
        │  - completion: Continuation<Any?>?   (부모 Continuation 링크)
        │  - invokeSuspend(result): Any?       (abstract - State Machine 진입점)
        │  - resumeWith(result: Result<Any?>)  (invokeSuspend 호출 + 결과 처리)
        │
        ├── ContinuationImpl           (abstract, kotlin.coroutines.jvm.internal)
        │     │  - intercepted(): Continuation<Any?>  (Dispatcher 연동)
        │     │  - _context: CoroutineContext
        │     │
        │     └── [각 suspend 함수마다 생성되는 Continuation 클래스]
        │           - label: Int
        │           - [저장할 지역변수 필드들]
        │
        └── RestrictedContinuationImpl  (sequence 등 제한된 코루틴용)
              - context = EmptyCoroutineContext
```

`BaseContinuationImpl.resumeWith()` 메서드는 코루틴 실행의 핵심 드라이버이다.

```kotlin
// kotlin-stdlib source (simplified)
public final override fun resumeWith(result: Result<Any?>) {
    var current = this
    var param = result
    while (true) {
        with(current) {
            val completion = completion!!
            val outcome: Result<Any?> =
                try {
                    val result = invokeSuspend(param)
                    if (result === COROUTINE_SUSPENDED) return  // 아직 suspend 중
                    Result.success(result)
                } catch (e: Throwable) {
                    Result.failure(e)
                }
            releaseIntercepted()
            if (completion is BaseContinuationImpl) {
                // Tail-call optimization: 재귀 호출 대신 루프
                current = completion
                param = outcome
            } else {
                // 루트 Continuation (코루틴 빌더) 에 도달
                completion.resumeWith(outcome)
                return
            }
        }
    }
}
```

이 while 루프는 ***trampoline*** 패턴을 구현한다. 하나의 Continuation 의 State Machine 이 완료되고 부모(completion)가 `BaseContinuationImpl` 인 경우, 재귀적으로 `resumeWith` 를 호출하는 대신 루프를 돌면서 처리한다. 이를 통해 깊이 중첩된 suspend 함수 체인이 동기적으로 완료될 때 Stack Overflow 를 방지한다.

## Suspension and Resumption Flow: Step-by-step Execution

실제 suspend 와 resume 이 어떻게 일어나는지 단계별로 추적한다.

### Step 1. Initial Call (label = 0)

```kotlin
// 코루틴 빌더 (launch, async 등) 에서 호출
fetchUserData("user-123", initialContinuation)
```

- `sm.label` 이 0 이므로 `switch(0)` 분기에 진입한다.
- `userId` 를 Continuation 의 필드에 저장한다.
- `sm.label` 을 1 로 설정한다 (다음 재개 시 진입점 기록).
- `requestToken(sm)` 을 호출한다.

### Step 2. Suspension at requestToken

`requestToken` 내부에서 실제 I/O 작업(네트워크 요청 등)이 필요한 경우, `COROUTINE_SUSPENDED` 를 반환한다. 이 반환이 호출 스택을 따라 전파되면서, 현재 Thread 의 제어권이 Dispatcher 에게 돌아간다.

**Thread 는 block 되지 않는다.** Stack Frame 은 정상적으로 unwind 되고, Thread 는 다른 코루틴을 실행할 수 있다. 모든 필요한 상태는 이미 Heap 의 Continuation 객체에 저장되어 있다.

### Step 3. Resumption via Continuation.resumeWith

I/O 작업이 완료되면, 콜백이나 이벤트 루프를 통해 `continuation.resumeWith(Result.success(token))` 이 호출된다.

`BaseContinuationImpl.resumeWith()` 는 내부적으로 `invokeSuspend()` 를 호출하고, 이것은 다시 `fetchUserData(userId, this)` 를 호출하여 State Machine 에 재진입한다.

### Step 4. Re-entry at label = 1

`fetchUserData` 가 다시 호출되지만, 이번에는 `sm.label` 이 1 이다.

- `switch(1)` 분기에 진입한다.
- `ResultKt.throwOnFailure(result)` 로 예외 검사를 수행한다.
- `sm.result` 에서 이전 suspend 함수의 결과(`Token`)를 복원한다.
- `sm.label` 을 2 로 설정한다.
- `getProfile(token, sm)` 을 호출한다.
- 이 호출도 suspend 되면 동일한 과정이 반복된다.

### Step 5. Final Completion (label = 2)

마지막 label 에서 `UserData(profile)` 을 생성하여 반환한다. 이 결과는 `BaseContinuationImpl.resumeWith()` 의 trampoline 루프를 통해 호출자의 Continuation(`completion`)에 전달된다.

__전체 흐름을 시각화하면 다음과 같다.__

```
Thread-1            Heap (Continuation)           I/O Subsystem
────────            ───────────────────           ─────────────
    │
    ├─ fetchUserData(label=0)
    │   ├─ save userId to sm
    │   ├─ sm.label = 1
    │   └─ requestToken(sm)
    │       └─ I/O 시작 ──────────────────────────▶ [네트워크 요청]
    │           return COROUTINE_SUSPENDED
    │   return COROUTINE_SUSPENDED
    │
    ├─ Thread 반환 (다른 코루틴 실행 가능)
    │       ...
    │                                              [응답 도착]
    │                                              callback 실행
Thread-2 (또는 Thread-1)                           │
    │◀── sm.resumeWith(token) ◀────────────────────┘
    │
    ├─ fetchUserData(label=1)
    │   ├─ throwOnFailure(result)
    │   ├─ token = sm.result
    │   ├─ sm.label = 2
    │   └─ getProfile(token, sm)
    │       └─ I/O 시작 ──────────────────────────▶ [DB 조회]
    │           return COROUTINE_SUSPENDED
    │   return COROUTINE_SUSPENDED
    │
    ├─ Thread 반환
    │       ...
    │                                              [조회 완료]
Thread-1                                           │
    │◀── sm.resumeWith(profile) ◀──────────────────┘
    │
    ├─ fetchUserData(label=2)
    │   ├─ throwOnFailure(result)
    │   ├─ profile = sm.result
    │   └─ return UserData(profile)
    │
    └─ completion.resumeWith(userData)  ← 호출자에게 최종 결과 전달
```

## Dispatcher and Thread Management

suspend 와 resume 시 "어떤 Thread 에서 실행되는가"를 결정하는 것이 ***CoroutineDispatcher*** 이다.

### How Dispatcher Works with Continuation

Coroutine 이 resume 될 때, `resumeWith` 가 직접 호출되는 것이 아니라 ***DispatchedContinuation*** 을 통해 Dispatcher 에게 스케줄링을 요청한다.

`ContinuationImpl.intercepted()` 메서드가 원래의 Continuation 을 `DispatchedContinuation` 으로 래핑한다.

```kotlin
// ContinuationImpl (kotlin-stdlib source, simplified)
public fun intercepted(): Continuation<Any?> =
    intercepted
        ?: (context[ContinuationInterceptor]?.interceptContinuation(this) ?: this)
            .also { intercepted = it }
```

```kotlin
// DispatchedContinuation (kotlinx.coroutines source, simplified)
internal class DispatchedContinuation<T>(
    val dispatcher: CoroutineDispatcher,
    val continuation: Continuation<T>
) : DispatchedTask<T>(), Continuation<T> by continuation {
    override fun resumeWith(result: Result<T>) {
        val context = continuation.context
        if (dispatcher.isDispatchNeeded(context)) {
            dispatcher.dispatch(context, this)  // Thread Pool 에 작업 제출
        } else {
            resumeUndispatchedWith(result)  // 현재 Thread 에서 바로 실행
        }
    }
}
```

[Debugging to analyze suspend mechanisms](https://klarciel.net/wiki/kotlin/kotlin-suspend/) 에서 Call Stack 을 분석하면, task 가 `DispatchedContinuation` 임을 확인할 수 있으며, `continuation` 과 `dispatcher` 를 인자로 가지고 있다.

### Dispatcher Types and Thread Behavior

| Dispatcher | Thread Pool | 용도 |
|-----------|------------|------|
| `Dispatchers.Default` | CPU 코어 수만큼의 Thread | CPU-intensive 작업 |
| `Dispatchers.IO` | 최대 64개 (또는 코어 수 중 큰 값) | Blocking I/O 작업 |
| `Dispatchers.Main` | Main Thread 1개 | UI 업데이트 (Android) |
| `Dispatchers.Unconfined` | 호출자의 Thread (resume 시 변경 가능) | 테스트, 특수 케이스 |

`Dispatchers.Default` 와 `Dispatchers.IO` 는 ***CoroutineScheduler*** 를 공유한다. CoroutineScheduler 는 ***work-stealing*** 알고리즘을 사용하여 각 Worker Thread 가 자신의 로컬 큐에서 먼저 작업을 꺼내고, 비어 있으면 다른 Worker 의 큐에서 작업을 훔치거나 글로벌 큐에서 가져온다.

Dispatcher 는 resume 시 Thread 전환이 일어날 수 있음을 의미한다. suspend 전에 Thread-1 에서 실행되던 코루틴이 resume 후에는 Thread-3 에서 실행될 수 있다. 이것이 가능한 이유는 실행 상태가 Thread Stack 이 아닌 Heap 의 Continuation 에 저장되어 있기 때문이다.

### EventLoop: Single-threaded Dispatcher

`runBlocking` 이나 단일 Thread Dispatcher 를 사용하는 경우, ***EventLoop*** 이 코루틴 스케줄링을 담당한다. EventLoop 은 `CoroutineDispatcher` 를 상속하며, 큐에 쌓인 Continuation 들을 순차적으로 처리한다.

`runBlocking` 은 `BlockingEventLoop` 을 생성하여 현재 Thread 에서 이벤트 루프를 실행한다. 루트 코루틴이 완료될 때까지 `processNextEvent()` 를 반복 호출하면서 디스패치된 작업을 처리하는 구조이다. 이 때문에 `runBlocking` 은 실제로 호출 Thread 를 block 한다.

이 구조는 하나의 Thread 위에서 여러 코루틴이 협력적으로 실행되는 Cooperative Multitasking 을 구현한다.

## SafeContinuation and Coroutine Bridging

### suspendCoroutine and suspendCancellableCoroutine

콜백 기반 API 를 코루틴 세계에 연결하는 브릿지 함수가 `suspendCoroutine` 과 `suspendCancellableCoroutine` 이다.

```kotlin
suspend fun readFileAsync(path: String): ByteArray =
    suspendCancellableCoroutine { cont ->
        val channel = AsynchronousFileChannel.open(Path.of(path))
        val buffer = ByteBuffer.allocate(4096)

        channel.read(buffer, 0, null, object : CompletionHandler<Int, Nothing?> {
            override fun completed(bytesRead: Int, attachment: Nothing?) {
                buffer.flip()
                cont.resume(ByteArray(bytesRead).also { buffer.get(it) })
            }
            override fun failed(exc: Throwable, attachment: Nothing?) {
                cont.resumeWithException(exc)
            }
        })

        cont.invokeOnCancellation { channel.close() }
    }
```

`suspendCancellableCoroutine` 은 `kotlinx.coroutines` 에 정의되어 있으며, 취소를 지원하는 `CancellableContinuation` 을 제공한다. `suspendCoroutine` 은 `kotlin-stdlib` 에 정의되어 있으며, 내부적으로 ***SafeContinuation*** 을 사용하여 Thread Safety 를 보장한다. 실무 코루틴 코드에서는 Structured Concurrency 와 취소를 지원하는 `suspendCancellableCoroutine` 이 거의 항상 사용된다.

### SafeContinuation Atomic State Machine

`SafeContinuation` 은 resume 가 최대 한 번만 호출되도록 보장하고, resume 과 suspension 사이의 경쟁 조건을 처리한다.

```
State Transitions:

UNDECIDED ──(getOrThrow 호출)──→ COROUTINE_SUSPENDED ──(resumeWith 호출)──→ RESUMED
    │                                                                        │
    └──(resumeWith 먼저 호출)──→ result 값 설정 (동기 완료)                    │
                                                                             ▼
                                                              delegate.resumeWith(result)
```

세 가지 상태가 있다.

- ***UNDECIDED***: 초기 상태. `resumeWith` 도 `getOrThrow` 도 아직 호출되지 않았다.
- ***COROUTINE_SUSPENDED***: `getOrThrow` 가 먼저 호출된 경우(일반적인 케이스). 코루틴이 실제로 suspend 되어 `resumeWith` 를 기다린다.
- ***RESUMED***: `resumeWith` 가 호출되어 delegate Continuation 에게 결과가 전달된 상태.

atomic CAS(Compare-And-Swap) 연산으로 상태 전이를 수행하므로, 다른 Thread 에서 `resumeWith` 가 호출되는 경우에도 안전하게 동작한다. 이 메커니즘은 `suspendCoroutine` 블록 내에서 동기적으로 `resume` 이 호출되는 경우(비동기 작업이 즉시 완료되는 경우)를 올바르게 처리한다.

## Comparison with OS Context Switch, Virtual Threads, and Callbacks

### Coroutine vs OS Thread Context Switch

[Designing Context Structures for Suspend/Resume in Multitasking](https://klarciel.net/wiki/operatingsystem/os-multitasking/) 에서 분석한 것처럼, OS 의 Thread Context Switch 와 Coroutine 의 Suspend/Resume 은 "상태를 저장하고 복원한다"는 동일한 원리를 공유한다. 차이는 실행 주체와 비용이다.

| 비교 항목 | OS Thread Context Switch | Coroutine Suspend/Resume |
|-----------|------------------------|--------------------------|
| 실행 주체 | OS Kernel (Preemptive) | User Space (Cooperative) |
| 상태 저장소 | PCB / TCB (Kernel Memory) | Continuation Object (JVM Heap) |
| 저장 대상 | PC, Registers, Stack Pointer, FPU State, TLB 등 | label, 지역변수, result |
| 비용 | 수 ~ 수십 μs (Kernel 전환, TLB flush, cache 영향 포함) | 수십 ~ 수백 ns (필드 쓰기 + method return) |
| 스케줄링 방식 | OS Scheduler (선점형) | Dispatcher (협력적) |
| 전환 단위 | Thread 전체 | 함수 내 suspension point |

### Coroutine vs Virtual Threads (Project Loom)

Java 의 ***[Virtual Thread](https://openjdk.org/jeps/444)*** (JDK 21+) 도 lightweight thread 를 구현하지만, 접근 방식이 근본적으로 다르다.

| 비교 항목 | Kotlin Coroutine | Java Virtual Thread |
|-----------|-----------------|---------------------|
| 코루틴 유형 | Stackless | Stackful |
| 구현 수준 | 컴파일러 변환 (CPS + State Machine) | JVM 런타임 수준 (Carrier Thread 위의 Virtual Thread) |
| 상태 관리 | Continuation 필드만 저장 | Virtual Thread 전체 Stack 을 Heap 에 복사 |
| 중단 방식 | suspend 함수 호출 (명시적) | blocking API 호출 시 자동 unmount |
| 코드 변경 | suspend 키워드 필요 | 기존 blocking 코드 그대로 사용 |
| 중단 비용 | ~100 ns (필드 쓰기) | ~1 μs (Stack 복사, depth 에 비례) |
| Structured Concurrency | CoroutineScope | StructuredTaskScope |

Virtual Thread 는 기존 Thread-Per-Request 코드를 변경 없이 확장 가능하게 만드는 것이 목표이다. 이를 위해 전체 Stack 을 Heap 에 복사하는 비용을 감수한다. Kotlin Coroutine 은 명시적인 suspend 지점을 통해 더 세밀한 제어와 더 적은 오버헤드를 제공하지만, 코드에 `suspend` 키워드를 사용해야 한다.

### Coroutine vs Callback

CPS 변환이 Callback 과 같다면, 왜 직접 Callback 을 쓰지 않는가?

```kotlin
// Callback Hell
requestToken { token ->
    getProfile(token) { profile ->
        processProfile(profile) { result ->
            updateUI(result) { /* ... */ }
        }
    }
}

// Coroutine (suspend)
val token = requestToken()
val profile = getProfile(token)
val result = processProfile(profile)
updateUI(result)
```

Coroutine 은 컴파일러가 CPS 변환을 자동으로 수행하므로, 개발자는 순차적 코드를 작성하면 된다. Callback 의 단점(가독성 저하, 에러 처리 복잡성, 취소 어려움)을 모두 해결하면서, 내부적으로는 동일한 메커니즘으로 동작한다.

## Performance Characteristics

### Memory Footprint

suspend 함수당 생성되는 Continuation 객체의 크기는 해당 함수에서 suspension point 를 넘어 유지해야 하는 지역변수 수에 비례한다. 일반적으로 200 ~ 400 Bytes 수준이다.

```
Thread Stack:     ~1MB (고정, OS 할당)
Continuation:     ~200-400 Bytes (가변, JVM Heap)

1,000,000 coroutines: ~200-400 MB heap  (실현 가능)
1,000,000 threads:    ~1 TB stack       (대부분의 머신에서 불가능)
```

### Suspend/Resume Cost

suspend/resume 의 실제 비용을 분해하면 다음과 같다.

- **Suspend**: 지역변수를 Continuation 필드에 저장, label 증가, `COROUTINE_SUSPENDED` 반환 -- 수십 ns
- **Resume**: `Dispatcher.dispatch()` 호출, Thread Pool 에서 Thread 할당, `invokeSuspend()` 호출, `when` 분기 진입 -- 수백 ns ~ 수 μs
- **OS Thread Context Switch** (비교): Kernel Mode 전환, Register 저장/복원, TLB 관리, cache 영향 -- 수 ~ 수십 μs

코루틴 전환은 저렴하지만 비용이 0은 아니다. Continuation 객체에 대한 Heap 할당, Dispatcher 큐의 enqueue/dequeue, Heap 객체 접근 시 cache miss 가능성 등이 존재한다.

### GC Implications

Continuation 객체는 일반 JVM Heap 객체이므로 GC 의 대상이다. 단기 코루틴의 Continuation 은 Young Generation 에서 빠르게 수집되고, 장기 suspend 상태의 Continuation 은 Old Generation 으로 승격될 수 있다. 다만 Continuation 객체는 크기가 작고 참조 그래프가 단순하므로, GC 에 미치는 영향은 일반적으로 미미하다.

### When Not to Suspend

모든 상황에서 suspend 가 유리한 것은 아니다. suspend/resume 자체에도 비용(Continuation 객체 생성, Dispatcher 스케줄링)이 존재하므로, 매우 짧은 CPU-bound 연산에서는 오히려 직접 호출이 효율적이다. Kotlin 컴파일러는 suspend 함수가 실제로 suspend 하지 않는 경우를 위해 fast path 최적화를 제공한다. suspend 함수가 `COROUTINE_SUSPENDED` 대신 실제 결과를 즉시 반환하면, State Machine 은 Dispatcher 를 거치지 않고 바로 다음 label 로 fall through 한다.

<mark><em><strong>Kotlin Coroutine 의 suspend 메커니즘은 "컴파일러가 CPS 변환으로 State Machine 을 생성하고, JVM Stack 대신 Heap 의 Continuation 객체에 상태를 저장함으로써 Thread 를 blocking 하지 않고 실행을 중단/재개하는" 기술이다. 이것은 OS 의 Context Switch 와 동일한 원리를 User Space 에서 극도로 저렴한 비용으로 구현한 것이다.</strong></em></mark>

## Links

- [Debugging to analyze suspend mechanisms](https://klarciel.net/wiki/kotlin/kotlin-suspend/)
- [Continuation Passing Style](https://klarciel.net/wiki/kotlin/kotlin-continuation/)
- [Designing Context Structures for Suspend/Resume in Multitasking](https://klarciel.net/wiki/operatingsystem/os-multitasking/)
- [KotlinConf 2017 - Deep Dive into Coroutines on JVM by Roman Elizarov](https://www.youtube.com/watch?v=YrrUCSi72E8)
- [Kotlin Coroutines KEEP Proposal](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md)
- [Kotlin Continuation API](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/)
- [JEP 444: Virtual Threads](https://openjdk.org/jeps/444)

## References

- Kotlin Coroutines: Deep Dive / Marcin Moskala / Kt. Academy
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova / Acorn Publishing
- Java Concurrency in Practice / Brian Goetz / Addison-Wesley
