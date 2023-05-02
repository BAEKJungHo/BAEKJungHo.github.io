---
layout  : wiki
title   : ExecutorService
summary : 
date    : 2023-04-29 15:05:32 +0900
updated : 2023-04-29 15:15:24 +0900
tag     : reactive java netty
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Executor

```java
public interface Executor {

    /**
     * Executes the given command at some time in the future.  The command
     * may execute in a new thread, in a pooled thread, or in the calling
     * thread, at the discretion of the {@code Executor} implementation.
     *
     * @param command the runnable task
     * @throws RejectedExecutionException if this task cannot be
     * accepted for execution
     * @throws NullPointerException if command is null
     */
    void execute(Runnable command);
}
```

## ExecutorService

[ExecutorService](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html) provides a powerful and flexible way to manage concurrency in Java programs.

__Some of the key features of ExecutorService include the ability to:__
- Create a thread pool with a specified number of threads.
- Submit tasks to the thread pool for asynchronous execution.
- Manage the lifecycle of the thread pool, including starting and stopping it.
- Wait for all submitted tasks to complete using various synchronization mechanisms, such as __Future__ objects.

### ScheduledExecutorService

네티에서는 ScheduledExecutorService 를 이용하여 이벤트 루프 그룹을 구현한다. ScheduledExecutorService 를 이용하면, Timer 클래스보다 유연하게 작업을 예약하고, 작업의 취소, 지연, 주기 등을 더 세밀하게 제어할 수 있다.

![](/resource/wiki/reactive-executor-service/netty-executor-service.png)

__EVENT/TASK EXECUTION ORDER__ 

Events and tasks are executed in FIFO (first- in-first-out) order. This eliminates the possibility of data corruption by guaranteeing that byte contents are processed in the correct order.

## Factory: Executors

[Executors](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html) 는 "Executor, ExecutorService, ScheduledExecutorService, ThreadFactory, and Callable" 를 생성해주는
팩토리 클래스이다. 

(나중에 팩토리 클래스를 만들 때 이 구조를 참고해도 좋을 듯)

## References

- Netty In Action / Trustin Lee 저 / MANNING