---
layout  : wiki
title   : Structured Concurrency
summary : 
date    : 2023-05-25 20:54:32 +0900
updated : 2023-05-25 21:15:24 +0900
tag     : kotlin java architecture coroutine
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Structured Concurrency

[Structured Concurrency](https://en.wikipedia.org/wiki/Structured_concurrency) The core concept is the encapsulation of concurrent threads of execution by way of control flow constructs that have clear entry and exit points and that ensure all spawned threads have completed before exit.
Structured concurrency is analogous to structured programming, which introduced control flow constructs that encapsulated sequential statements and subroutines.

[JEP 428: Structured Concurrency (Incubator)](https://openjdk.org/jeps/428) It embodies the principle that:
- If a task splits into concurrent subtasks then they all return to the same place, namely the task's code block.
- In structured concurrency, subtasks work on behalf of a task. The task awaits the subtasks' results and monitors them for failures.

Structured concurrency is a great match for virtual threads, which are lightweight threads implemented by the JDK. Many virtual threads share the same operating-system thread, allowing for very large numbers of virtual threads.

The principal class of the structured concurrency API is [StructuredTaskScope](https://download.java.net/java/early_access/loom/docs/api/jdk.incubator.concurrent/jdk/incubator/concurrent/StructuredTaskScope.html). This class allows developers to structure a task as a family of concurrent subtasks, and to coordinate them as a unit. Subtasks are executed in their own threads by forking them individually and then joining them as a unit and, possibly, cancelling them as a unit. The subtasks' successful results or exceptions are aggregated and handled by the parent task.
- StructuredTaskScope supports cases where a task splits into several concurrent subtasks, to be executed in their own threads, and where the subtasks must complete before the main task continues.
- Concurrent subtasks it is common to use __short-circuiting__ patterns to avoid doing unnecessary work.

Here is a StructuredTaskScope with a [shutdown-on-failure policy](https://openjdk.org/jeps/428#Shutdown-policies) (used also in the handle() example above) that runs a collection of tasks concurrently and fails if any one of them fails:

```java
<T> List<T> runAll(List<Callable<T>> tasks) throws Throwable {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        List<Future<T>> futures = tasks.stream().map(scope::fork).toList();
        scope.join();
        scope.throwIfFailed(e -> e);  // Propagate exception as-is if any fork fails
        // Here, all tasks have succeeded, so compose their results
        return futures.stream().map(Future::resultNow).toList();
    }
}
```

Here is a StructuredTaskScope with a shutdown-on-success policy that returns the result of the first successful subtask:

```java
<T> T race(List<Callable<T>> tasks, Instant deadline) throws ExecutionException {
    try (var scope = new StructuredTaskScope.ShutdownOnSuccess<T>()) {
        for (var task : tasks) {
            scope.fork(task);
        }
        scope.joinUntil(deadline);
        return scope.result();  // Throws if none of the forks completed successfully
    }
}
```

[Sústrik, Martin - Structured Concurrency](https://250bpm.com/blog:71/)
- Joe Armstrong said:
  - ![](/resource/wiki/kotlin-structured-concurrency/joe-armstrong.png)
- As I've argued in part I of this essay, to get a simple programming model you have to spawn a thread per TCP connection. But given that threads are expensive (and processes even more so) and that sharing state between threads is insane, bordering on suicidal, what you need are __lightweight green threads__ and a __simple communication mechanism__ to send messages between them. In UNIX of old they were called processes and pipes. In Go they are called goroutines and channels. In Erlang they are known as processes and mailboxes.
- In Structured Concurrency, Prevents lifetime of green thread B launched by green thread A to exceed lifetime of A.

Think about how to do the __cancellation__:
- The good news is that because of cooperative scheduling of green threads the code already has to be split in reasonably sized chunks.
- The chunks never take long to execute we don't have to cancel the thread at random point of execution.

More Articles:
- [Notes on structured concurrency, or: Go statement considered harmful](https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/)

## Structured Concurrency with Kotlin

> __[tmdgusya - Structured Concurrency](https://github.com/tmdgusya/kotlin-coroutine-series/blob/main/chapter/JOB_LIFE_CYCLE.md#structured-concurrency)__:
> 
> Structured Concurrency 는 Async 연산이나 Concurrent 연산을 구조화 시키는 방법을 말한다. 그래서 부모 연산이 종료되더라도 Child 연산의 작업이 정상적으로 종료되는것을 보장해야 하며, Child 연산이 하나라도 취소됬다면 이후 연산은 실행되지 않도록 보장해줘야 한다. 
>
> 그렇다면, 왜 Structured Concurrency 와 같은 기술이 도입됬을까? 우리가 Coroutine 을 쓰면 하나의 Task 를 Sub-Task 로 나누어 진행하게 되는데 사실 호출자(Caller) 입장에서는 하나의 Task 일 뿐이다. 즉, Caller 입장에서는 Sub-Task 가 몇개로 나누어져 있든 말든 상관할 빠가 아니고 결국 하나의 Task 가 완료됬냐 안됬냐가 중요한 것이다. 따라서, __동시적(Concurrency)으로 일어나는 Sub-Task 들을 하나의 Task 로 구조화 시켜야 하는데 이를 위해 Structured Concurrency 가 도입된 것이다.__ 그래서 하나의 자식 코루틴(Sub-Task) 이 취소되더라도, Cancellation 이 전파되는 이유가 결국 하나의 Task 로 봤을때는 안의 Sub-Task 가 실패하는 순간 전부 실패한것과 다름없기 때문이다. 그리고 Child 가 끝나기까지 기다리는 이유도 모든 Sub-Routine 들이 끝나야 하나의 Task 가 되기 때문이다.

__[Coroutines basics: Structured concurrency](https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency)__:

```kotlin
/**
 * @title Structured Concurrency Practice
 *   - Task 가 완료(completed)가 되기 위해서는 sub-task 들이 먼저 완료가 되어야 한다.
 *   - 하나의 sub-task 가 실패하면 Task 는 실패한다.
 */
suspend fun structuredConcurrency(): Unit = coroutineScope {
    val parentJob = launch {
        println("Parent Job is Start!!")

        val childJob = launch {
            delay(200)
            println("Child Job 1 is Start!!")
        }

        val childJob2 = launch {
            delay(300)
            println("Child Job 2 is Start!!")
        }

        println("Child Job1 is Finished ? ${childJob.isCompleted}") // false
        println("Child Job2 is Finished ? ${childJob2.isCompleted}") // false

        // SubParentJob 자체의 연산은 성공했을 수 있지만, 내부에 있는 childJob1, childJob2 의 성공 여부는 아직 확인할 수 없다.
        // 따라서, SubParentJob 을 completed 상태로 곧바로 바꿔버린다면, 내부에 있는 Job 들의 실행완료를 보장해줄 수 없게 된다.
        // 일단은 Completed 가 아닌 Completing 상태에 머물게 된다.
        println("Parent Job is Done!!")
    }

    delay(100)

    parentJob.printChildJobState()
    
    // Job becomes complete only after all its children complete. (isCompleted docs)
    println("[IMPORTANT-LOG-1] Parent Job is Finished ? ${parentJob.isCompleted}") // false

    delay(300)
    parentJob.printChildJobState()
    println("[IMPORTANT-LOG-2] Parent Job is Finished ? ${parentJob.isCompleted}") // true
}
```