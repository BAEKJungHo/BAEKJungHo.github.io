---
layout  : wiki
title   : @Async
summary : 
date    : 2022-05-17 21:28:32 +0900
updated : 2022-05-17 22:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## @Async

- @Async 는 Spring 에서 제공하는 Thread Pool 을 활용하는 비동기 메소드 지원 Annotation 이다.
- 기본 전략은 비동기 작업마다 스레드를 생성하는 SimpleAsyncTaskExecutor 를 사용한다.
- 스레드 관리 전략을 ThreadPoolTaskExecutor 로 바꿔서 스레드풀을 사용하게끔 할 수 있다.

### 자바에서의 비동기 코드

```java
public class Async {

    static ExecutorService executorService = Executors.newFixedThreadPool(5);

    public void asyncMethod(final String message) throws Exception {
        executorService.submit(new Runnable() {
            @Override
            public void run() {
                // do something
            }            
        });
    }
}
```

비동기 관련 코드를 작성할 때마다 Runnable 을 구현하고 run 메서드를 오버라이딩 해줘야 하는 불편함이 있다. 또한 비동기 코드를 작성하기 위해서 많은 노력을 들여야한다.

### 어노테이션 기반 비동기 코드

```kotlin
@Async("asyncThreadPoolTaskExecutor")
fun asyncMethod(message: String) {
    // do something
}
```

@Async 어노테이션을 사용하면 비동기 관련 코드를 작성하기 위한 불편함이 사라진다.

### @Async 를 사용하기 위한 설정

```kotlin
@EnableAsync
@SpringBootApplication
class AsyncServiceApplication

fun main(args: Array<String>) {
	runApplication<AsyncServiceApplication>(*args)
}
```

이 경우에는 `SimpleAsyncTaskExecutor` 를 사용하게된다.

## SimpleAsyncTaskExecutor

> TaskExecutor implementation that fires up a new Thread for each task, executing it asynchronously.
Supports limiting concurrent threads through the "concurrencyLimit" bean property. By default, the number of concurrent threads is unlimited.
>
> NOTE: __This implementation does not reuse threads!__ Consider a thread-pooling TaskExecutor implementation instead, in particular for executing a large number of short-lived tasks. - Spring Docs

SimpleAsyncTaskExecutor 는 각 작업에 대해서 새로운 스레드를 생성하여 TaskExecutor 를 구현하여 비동기적으로 실행시킨다.

SimpleAsyncTaskExecutor 는 __스레드를 재사용하지 않기 때문에__ thread-pooling TaskExecutor 구현을 고려하라고 제시하고 있다.

## Links

- [Effective Advice on Spring Async](https://dzone.com/articles/effective-advice-on-spring-async-part-1)
- [SimpleAsyncTaskExecutor Spring Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/task/SimpleAsyncTaskExecutor.html)