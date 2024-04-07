---
layout  : wiki
title   : Deferred Execution
summary : Lambdas, Reactive, Coroutines and Functional Interfaces
date    : 2023-09-26 21:28:32 +0900
updated : 2023-09-26 22:15:24 +0900
tag     : reactive lambda coroutine
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Defer

Defer 는 __지연__ 이라는 의미를 갖고 있다.

Lazy 도 지연이라는 의미를 갖고 있긴한데, [StackOverflow](https://stackoverflow.com/questions/2530755/difference-between-deferred-execution-and-lazy-evaluation-in-c-sharp) 에서는 다음과 같이 설명하고 있다.

- Lazy means _"don't do the work until you absolutely have to."_
- Deferred means _"don't compute the result until the caller actually uses it."_

예를 들어 PaymentService 에 후불 계산이라는 기능이 추가된다면 __Deferred__ 라는 단어를 사용하여 그 의미를 표현할 수 있다.

### Reactive Programming

```java
Mono<LocalDateTime> deferMono = Mono.defer(() -> Mono.just(LocalDateTime.now()));
deferMono.subscribe(System.out::println); // 구독하는 시점에 데이터를 emit 하는 Mono 를 생성
```

### Coroutines

[Job, Async, Deferred](https://baekjungho.github.io/wiki/kotlin/kotlin-coroutine-deferred-async/)

```kotlin
fun main(): Unit = runBlocking {
    val time = measureTimeMillis {
        val one: Deferred<Int> = async { call1() }
        val two: Deferred<Int> = async { call2() }
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms") // ex. Completed in 1017 ms
}

suspend fun call1(): Int {
    delay(1000L)
    return 1
}

suspend fun call2(): Int {
    delay(1000L)
    return 2
}
```

## Deferred Execution with Lambdas

Cay S. Horstmann 은 [Java SE 8 for the Really Impatient: Programming with Lambdas](https://www.informit.com/articles/article.aspx?p=2171751) 에서
Lambda 를 사용하는 주된 이유는 __Deferred Execution__ 을 위해서라고 말한다.

The main reason for using a lambda expression is to defer the execution of the code until an appropriate time. The point of all lambdas is __deferred execution__.

There are many reasons for executing code later, such as:

![](/resource/wiki/reactive-defer/deferred-execution-reason.png)

## Deferred Execution with Java's Supplier

[Supplier](https://docs.oracle.com/javase/10/docs/api/java/util/function/Supplier.html) 를 통해 Deferred Execution 을 구현할 수 있다.

![](/resource/wiki/reactive-defer/supplier-benefit.png)

다른 장점으로는 __Deferring Alternative Calculation for Optional Until Known to Be Necessary__ 가 있다.

Examples by ChatGPT:

```java
public class DeferredExample {
    public static void main(String[] args) {
        // Create a CompletableFuture to represent the deferred computation
        CompletableFuture<Integer> futureResult = CompletableFuture.supplyAsync(new DeferredComputation());

        // Get the result when it's ready
        futureResult.thenAccept(result -> System.out.println("Result: " + result));
    }
}

class DeferredComputation implements Supplier<Integer> {
    @Override
    public Integer get() {
        // Simulate a time-consuming computation
        try {
            Thread.sleep(3000); // Simulate a 3-second computation
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return 42;  // Return the result of the computation
    }
}
```

## Deferred Execution with Java’s Consumer

[Consumer](https://docs.oracle.com/javase/8/docs/api/java/util/function/Consumer.html) 를 통해서도 Deferred Execution 을 구현할 수 있다.

Examples by ChatGPT:

```java
public class DeferredConsumerExample {
    public static void main(String[] args) {
        // Create a CompletableFuture to represent the deferred computation
        CompletableFuture<Integer> futureResult = CompletableFuture.supplyAsync(() -> {
            // Simulate a time-consuming computation
            try {
                Thread.sleep(3000); // Simulate a 3-second computation
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return 42;  // Return the result of the computation
        });

        // Handle the result using a Consumer
        futureResult.thenAcceptAsync(result -> {
            // This is executed when the computation is complete
            System.out.println("Result: " + result);
        });
    }
}
```

## Links

- [Deferred Execution with Java's Supplier](http://marxsoftware.blogspot.com/2018/05/deferred-execution-java-supplier.html)
- [Deferred Execution with Java’s Consumer](https://www.javacodegeeks.com/2018/06/deferred-execution-java-consumer.html)
- [Functional interface and Lambda in Java 8](https://java-latte.blogspot.com/2014/02/functional-interface-and-lambda-in-java.html)
- [Syntax for Lambda expression in Java](https://java-latte.blogspot.com/2015/07/lambda-expression-examples-and-functional-interface-in-java.html)

## References

- Java SE8 for the Really Impatient / Cay S. Horstmann 저

