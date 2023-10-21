---
layout  : wiki
title   : Explained Concurrency
summary : Do not communicate by sharing memory; instead, share memory by communicating
date    : 2023-10-15 12:54:32 +0900
updated : 2023-10-15 13:15:24 +0900
tag     : go concurrency lock coroutine goroutine
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Concurrency

Effective Go __[Concurrency](https://baekjungho.github.io/wiki/spring/spring-concurrency/)__ 의 __[Share by communicating](https://go.dev/doc/effective_go#concurrency)__ 을 보면 다음과 같이 설명이 되어있다.

> Do not communicate by sharing memory; instead, share memory by communicating.

__What is meaning of "share memory by communicating"?__:
- goroutine 간 데이터 공유를 공유된 메모리를 통해 하지 말고 communication 을 통해 하라는 의미
- goroutine 간 communication 은 channel 을 통해 이뤄짐

__CSP Primitives vs Memory Access Synchronization__:
- CSP primitives and memory access synchronizations are two different ways to solve the same problem: __sharing memory between concurrent processes__.
- goroutine 과 channel 을 이용하는 방식이 CSP Primitives 이고, mutex 등을 이용하는 방식이 Memory Access Synchronization 이다.

## Communicating Sequential Processes

멀티 스레드 프로그래밍에서 동시성이 어려운 이유는 __[complex designs](https://go.dev/doc/faq#csp)__:  such as pthreads and partly to overemphasis on low-level details such as mutexes, condition variables, and memory barriers. 따라서, 더 높은 수준의 인터페이스를 통해 복잡한 설계가 갖는 단점을 해소해야 했음. __Higher-level interfaces__ enable much simpler code, even if there are still mutexes and such under the covers.

Go 는 __communicating__ 방식으로 동시성을 해결한다. __CSP__ 는 Go 의 동시성 모델의 근간이다. goroutine 사이의 communicating 을 channel 을 통해서 하게 된다.

__kotlin vs go__
  - Kotlin 은 coroutine 을 (rich) 라이브러리 레벨에서 제공하고, Go 는 goroutine 을 언어 레벨에서 제공한다.

## Goroutine

Go program has at least one goroutine: the __main goroutine__ which is automatically created and started when the process begins

They’re a higher level of abstraction known as __[coroutines](https://baekjungho.github.io/wiki/kotlin/kotlin-continuation/)__. Coroutines are simply concurrent subroutines (functions, closures, or methods in Go) which are nonpreemptive — that is they cannot be interrupted. Instead, coroutines have multiple points throughout which allow for suspension or reentry.

Go’s mechanism for hosting goroutines is an implementation of what’s called a __M:N scheduler__ which means it maps __M green threads to N OS threads__. Goroutines are then scheduled onto the green threads. When we have more goroutines than green threads available, the scheduler handles the distribution of the goroutines across the available threads and ensures that when these groroutines become blocked, other goroutines can be run.

__Go follows a model of concurrency called the [fork-join](https://baekjungho.github.io/wiki/java/java-forkjoinframework/) model__:
- The heart of a fork/join framework lies in its lightweight scheduling mechanics. It's Work Stealing.

![](/resource/wiki/go-concurrency/forkjoin.png)

__Divide and Conquer Approach__:

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

__[synchronize goroutines with join-point](https://pkg.go.dev/sync#WaitGroup)__:

```go
func main() {
	var wg sync.WaitGroup
	var urls = []string{
		"http://www.golang.org/",
		"http://www.google.com/",
		"http://www.example.com/",
	}
	for _, url := range urls {
		// Increment the WaitGroup counter.
		wg.Add(1)
		// Launch a goroutine to fetch the URL.
		go func(url string) {
			// Decrement the counter when the goroutine completes.
			defer wg.Done()
			// Fetch the URL.
			http.Get(url)
		}(url)
	}
	// Wait for all HTTP fetches to complete.
	wg.Wait() // join point
}
```

A WaitGroup waits for a collection of goroutines to finish. The main goroutine calls Add to set the number of goroutines to wait for. Then each of the goroutines runs and calls Done when finished. At the same time, Wait can be used to block until all goroutines have finished.

__Worried about memory access synchronizing Goroutine__:
- Since multiple goroutines can operate against the same address space, we still have to worry about synchronization.

```go
var wg sync.WaitGroup
slice := []int{1, 2, 3, 4, 5}
for _, val := range slice {
	wg.Add(1)
	go func(v int) {
 		// Here we call Done using the defer keyword to ensure that before we exit the goroutine’s closure,
		// we indicate to the WaitGroup that we’ve exited.
		defer wg.Done()
		slice[0] = v // race condition
	}(val)
}
wg.Wait()
```

CSP primitives to [share memory by communication](https://go.dev/blog/codelab-share) 을 사용해서 동기화 문제를 해결할 수 있다. Ensures that only one goroutine has access to the data at a given time. 한 시점에 하나의 고루틴만 데이터에 액세스가 가능하도록 할 수 있는 이유가 Go 는 channel 과 goroutines 를 활용하기 때문이다. Go encourages the use of __channels__ to pass references to data between __goroutines__.

The [sync](https://pkg.go.dev/sync) package contains the concurrency primitives that are most useful for low level memory access synchronization.

## Channels

Channels are one of the synchronization primitives in Go derived from Hoare’s CSP. While they can be used to synchronize access of the memory, they are best used to communicate information between goroutines.

- __send__: ch <- x // send value x to ch
  - send only: `ch := make(chan<- int)`
- __receive__: x = <-ch // assign value from ch to x
  - receive only: `ch := make(<-chan int)`

채널은 차단(block) 될 수 있다. 꽉 찬 채널에 쓰려는 모든 고루틴은 채널이 비워질 때까지 기다리고, 비어 있는 채널에서 읽으려는 모든 고루틴은 적어도 하나의 항목이 배치될 때까지 기다린다.

__Closing a channel__:

Closing a channel is also one of the ways you can signal multiple goroutines simultaneously.

__Unbuffered Channel__:

- The sending goroutine blocks until another goroutine receives.
- A goroutine that attempts to receive will block until another goroutine sends.

__Buffered Channel__:

```go
var dataStream chan interface{}
dataStream = make(chan interface{}, N)
```

- If the buffer is empty, the receiver is blocked; if the buffer is full, the sender is blocked

Even if no reads are performed on the channel, a goroutine can still perform N writes, where N is the capacity of the buffered channel.

An __unbuffered channel__ has a capacity of zero and so it’s __already full__ before any writes.

N 개의 buffer 를 유지한 채로, N 개의 데이터가 채워져 있는 상황에서 N+1 번째 데이터가 들어오게되면 blocking 되고, read 가 수행되고 나서 buffer 에 공간이 생겨야 N+1 번째 데이터가 삽입된다.

### Deadlock

__AS-IS__:

```go
stringStream := make(chan string)
go func() {
    if 0 != 1 {
        return
    }
    stringStream <- "Hello channels!" // writing
}()
// 값을 읽어야 하는데, 채널에 항목이 존재하지 않으므로 Blocking 된다.
fmt.Println(<-stringStream) // reading
```

위 코드를 실행하면 fatal error: all goroutines are asleep - deadlock! 에러가 발생한다.

__TO-BE__:

```go
stringStream := make(chan string)
go func() {
    stringStream <- "Hello channels!"
}()
salutation, ok := <-stringStream 
fmt.Printf("(%v): %v", ok, salutation)
```

## Multiplexing with select

select allows multiplexing so we can receive from multiple channels without blocking

```go
select {
case <-ch1: // discard ch1 data
// ...
case x := <-ch2: // assign ch2 data
// ...
default:
// ...
}
```

## Links

- [The Go Memory Model](https://go.dev/ref/mem)
- [Frequently Asked Questions](https://go.dev/doc/faq)
- [Introducing the Go Race Detector](https://go.dev/blog/race-detector)
- [Coroutines for Go](https://research.swtch.com/coro)

## References

- Concurrency in Go / Katherine Cox-Buday / O'REILLY