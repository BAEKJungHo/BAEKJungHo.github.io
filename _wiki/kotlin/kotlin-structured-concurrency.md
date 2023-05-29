---
layout  : wiki
title   : Structured Concurrency
summary : 
date    : 2023-05-25 20:54:32 +0900
updated : 2023-05-25 21:15:24 +0900
tag     : kotlin java architecture
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Structured Concurrency

Structured Concurrency The core concept is the encapsulation of concurrent threads of execution by way of control flow constructs that have clear entry and exit points and that ensure all spawned threads have completed before exit.
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

[Notes on structured concurrency, or: Go statement considered harmful](https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/)
- Joe Armstrong said:
  - ![](/resource/wiki/kotlin-structured-concurrency/joe-armstrong.png)
- As I've argued in part I of this essay, to get a simple programming model you have to spawn a thread per TCP connection. But given that threads are expensive (and processes even more so) and that sharing state between threads is insane, bordering on suicidal, what you need are __lightweight green threads__ and a __simple communication mechanism__ to send messages between them. In UNIX of old they were called processes and pipes. In Go they are called goroutines and channels. In Erlang they are known as processes and mailboxes.
- In Structured Concurrency, Prevents lifetime of green thread B launched by green thread A to exceed lifetime of A.

Think about how to do the __cancellation__:
- The good news is that because of cooperative scheduling of green threads the code already has to be split in reasonably sized chunks.
- The chunks never take long to execute we don't have to cancel the thread at random point of execution.

In Kotlin:
- [Coroutines basics: Structured concurrency](https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency)

## Links

- [Kotlin JOB LIFE CYCLE](https://github.com/tmdgusya/kotlin-coroutine-series/blob/main/chapter/JOB_LIFE_CYCLE.md)