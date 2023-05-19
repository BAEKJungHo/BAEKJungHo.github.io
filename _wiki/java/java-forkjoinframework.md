---
layout  : wiki
title   : ForkJoinFramework
summary : 
date    : 2023-05-15 11:28:32 +0900
updated : 2023-05-15 12:15:24 +0900
tag     : java
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## ForkJoin Framework

ForkJoin framework, __problems or tasks are recursively broken down into sub-tasks__.
Tasks are solved with the help of __worker threads__ provided by a thread pool.
Each worker thread will have sub-tasks it's responsible for. These are stored in double-ended queues (deques).
When a worker thread's deque is empty, it means that all the sub-tasks have been popped off and completed.

__Divide and Conquer Approach:__

```
Result solve(Problem problem) {
    if (problem is small)
        directly solve problem
    else {
        split problem into independent parts
        fork new subtasks to solve each part
        join all subtasks
        compose result from subresults
    }
}
```

__The heart of a fork/join framework lies in its lightweight
scheduling mechanics. It's Work Stealing:__
- Work stealing was introduced in Java with the aim of reducing contention in multi-threaded applications.
- The key concept in the ForkJoinPool is the "work-stealing" algorithm. Each thread in the pool has its own deque (double-ended queue) to which tasks are added. When a thread finishes its tasks, it can "steal" tasks from the deque of another idle thread, allowing for efficient workload distribution and load balancing. This feature makes ForkJoinPool particularly suitable for scenarios where some subtasks may take longer than others, as it helps ensure that idle threads are always kept busy.
- [Baeldung - Guide to Work Stealing in Java](https://www.baeldung.com/java-work-stealing)
- [DZone - Diving Into Java 8's newWorkStealingPools](https://dzone.com/articles/diving-into-java-8s-newworkstealingpools)

![](/resource/wiki/java-forkjoinframework/workstealing.png)

__Create Work Stealing Thread Pool:__
- [ForkJoinPool commonPool](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ForkJoinPool.html) is using __LIFO__ Queue Configuration
  - [DZone - Be Aware of ForkJoinPool#commonPool()](https://dzone.com/articles/be-aware-of-forkjoinpoolcommonpool)
- Async - [ExecutorService workStealingPool](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html#newWorkStealingPool--) is using __FIFO__ Queue Configuration
  - Setting [asyncMode to true may be suitable for use with event-style tasks](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ForkJoinPool.html) that are never joined.

__Execute ForkJoinTasks in a ForkJoinPool:__
- [Understanding Java Fork-Join Framework with Examples](https://wwconfirmedw.codejava.net/java-core/concurrency/understanding-java-fork-join-framework-with-examples)
- `<T> T invoke(ForkJoinTask<T> task)`: executes the specified task and returns its result upon completion. This call is synchronous, meaning that the calling thread waits until this method returns. For a resultless task (RecursiveAction), the type parameter Tis Void.
- `void execute(ForkJoinTask<?> task)`: executes the specified task asynchronously - the calling code doesn’t wait for the task’s completion - it continues to run.

Alternatively, you can execute a ForkJoinTask by calling its own methods fork() or invoke(). In this case, the common pool will be used automatically, if the task is not already running within a ForkJoinPool.
A noteworthy point: ForkJoinPool uses daemon threads that are terminated when all user threads are terminated. That means you don’t have to explicitly shutdown a ForkJoinPool (though it is possible). In the case of common pool, calling shutdown() has no effect because the pool is always available for use.

Threads in ForkJoinPool are daemon. You don’t have to explicitly shutdown the pool.

__RecursiveAction and RecursiveTask:__
- [From Imperative Programming to Fork/Join to Parallel Streams in Java 8](https://www.infoq.com/articles/forkjoin-to-parallel-streams/)
- [RecursiveAction](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/RecursiveAction.html) is a ForkJoinTask that doesn’t return a result.
- [RecursiveTask](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/RecursiveTask.html) is a ForkJoinTask that returns a result.

## References

- [A Java Fork/Join Framework - Doug Lea](https://gee.cs.oswego.edu/dl/papers/fj.pdf)
