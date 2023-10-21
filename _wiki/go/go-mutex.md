---
layout  : wiki
title   : Mutex
summary : 
date    : 2023-10-16 12:54:32 +0900
updated : 2023-10-16 13:15:24 +0900
tag     : go mutex
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Mutex

> Go’s mottos is “Share memory by communicating, don’t communicate by shar‐ ing memory.”
> 
> That said, Go does provide traditional locking mechanisms in the sync package. Most locking issues can be solved using either channels or traditional locks.

Mutex 는 __Memory Access Synchronization__ 을 위한 도구이다.

임계 구역을 보호하고 [Data Races](https://go.dev/doc/articles/race_detector) 를 방지하기 위한 해결 법 중 하나로 [sync](https://pkg.go.dev/sync) 패키지를 보면 __Mutex__ 를 제공하고 있다.

```go
// A Mutex is a mutual exclusion lock.
// The zero value for a Mutex is an unlocked mutex.
//
// A Mutex must not be copied after first use.
//
// In the terminology of the Go memory model,
// the n'th call to Unlock “synchronizes before” the m'th call to Lock
// for any n < m.
// A successful call to TryLock is equivalent to a call to Lock.
// A failed call to TryLock does not establish any “synchronizes before”
// relation at all.
type Mutex struct {
	state int32
	sema  uint32
}
```

__Mutex Locks__
- acquire() 함수로 락을 획득, release() 함수로 락을 반환
- Mutex 락은 available 이라는 boolean 변수를 가지는데, 이 변수 값이 락의 가용 여부를 표시한다. 락이 가용하면 acquire() 호출은 성공하면서 락은 사용 불가 상태가 된다.
- 사용 불가능한 락을 획득하려고 시도하는 프로세스/쓰레드는 락이 반환될 때 까지 봉쇄된다.

Acquire 와 Release 를 제공하는 [race](https://pkg.go.dev/internal/race) 를 보면 Enabled 라는 변수를 제공하고 있다.

```go
// Lock locks m.
// If the lock is already in use, the calling goroutine
// blocks until the mutex is available.
func (m *Mutex) Lock() {
	// Fast path: grab unlocked mutex.
	if atomic.CompareAndSwapInt32(&m.state, 0, mutexLocked) {
		if race.Enabled {
			race.Acquire(unsafe.Pointer(m))
		}
		return
	}
	// Slow path (outlined so that the fast path can be inlined)
	m.lockSlow()
}

// TryLock tries to lock m and reports whether it succeeded.
//
// Note that while correct uses of TryLock do exist, they are rare,
// and use of TryLock is often a sign of a deeper problem
// in a particular use of mutexes.
func (m *Mutex) TryLock() bool {
	old := m.state
	if old&(mutexLocked|mutexStarving) != 0 {
		return false
	}

	// There may be a goroutine waiting for the mutex, but we are
	// running now and can try to grab the mutex before that
	// goroutine wakes up.
	if !atomic.CompareAndSwapInt32(&m.state, old, old|mutexLocked) {
		return false
	}

	if race.Enabled {
		race.Acquire(unsafe.Pointer(m))
	}
	return true
}
```

__Unlock within a defer statement__:

```go
var count int
var lock sync.Mutex
increment := func() {
    lock.Lock()
    // If you missing defer statement, So will probably cause your program to deadlock.
    defer lock.Unlock() 
    count++
    fmt.Printf("Incrementing: %d\n", count)
}
```