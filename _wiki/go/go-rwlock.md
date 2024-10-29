---
layout  : wiki
title   : rwlock
summary : 
date    : 2024-10-27 12:54:32 +0900
updated : 2024-10-27 13:15:24 +0900
tag     : go rust lock concurrency mutex deadlock
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## A reader-writer lock

___Mutex___ 는 read lock 과 write lock 분리되어있지 않다. 하나의 lock 으로 읽기/쓰기 잠금을 모두할 수 있다.
하나의 쓰레드만 자원에 접근하도록 보장하는 잠금 방식이며, 단일 접근 제어에 사용된다. 

반면, ___[rwlock](https://doc.rust-lang.org/std/sync/struct.RwLock.html)___ 은 read/write lock 을 분리하여 ___read performance___ 을 향상 시키는 것이 목적이다.
rwlock 은 공유 데이터에 액세스할 때 더 높은 수준의 동시성을 허용한다.

- __read lock__: 여러 쓰레드가 동시에 읽기를 수행할 수 있다. 읽기 작업은 공유가 가능하므로 여러 쓰레드가 동시에 접근해도 무방하다.
- __write lock__: 쓰기 작업이 발생하면, 다른 쓰레드의 읽기/쓰기 접근을 모두 막고 단일 쓰레드만 접근할 수 있다.

읽기 작업이 빈번하고 쓰기 작업이 드문 경우 적합하다.

### Potential Deadlock

```
// Thread 1              |  // Thread 2
let _rg1 = lock.read();  |
                         |  // will block
                         |  let _wg = lock.write();
// may deadlock          |
let _rg2 = lock.read();  |
```

## Links

- [Synchronization primitives in the Linux kernel](https://0xax.gitbooks.io/linux-insides/content/SyncPrim/linux-sync-5.html)
- [Java ReadWriteLock](https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/concurrent/locks/ReadWriteLock.html)

## References

- [Reader-Writer Synchronization for Shared-Memory Multiprocessor Real-Time Systems](https://www.cs.unc.edu/~anderson/papers/ecrts09b.pdf)