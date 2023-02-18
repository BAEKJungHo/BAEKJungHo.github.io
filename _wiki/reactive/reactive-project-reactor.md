---
layout  : wiki
title   : Deepdive in ProjectReactor
summary : 
date    : 2023-02-16 15:05:32 +0900
updated : 2023-02-16 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## ProjectReactor

- Create Efficient Reactive Systems
- Reactor is a fourth-generation reactive library, based on the Reactive Streams
- specification, for building non-blocking applications on the JVM
- Reactive core: Reactor is fully non-blocking and provides efficent demand management. It directly interacts with Java's Functional APIs. CompletableFuture, Stream, Duration.

## Documents

### reactor.adapter

#### JdkFlowAdapter

- __Signatures:__

```java
public abstract class JdkFlowAdapter
extends Object
```

__Roles:__
- Convert a Java 9+ Flow.Publisher to/from a Reactive Streams Publisher.

__Methods:__ 
- publisherToFlowPublisher(...)
- flowPublisherToFlux(...)

### reactor.core

#### CorePublisher

- __Signatures:__

```java
public interface CorePublisher<T>
extends Publisher<T>
```

__Roles:__
- All publishers created through the Project Reactor library implement the CorePublisher interface.
- All of the built-in publishers in Project Reactor, such as Mono and Flux, implement the CorePublisher interface, as well as any custom publishers that you may create using the Project Reactor API.

__Methods:__
- `subscribe(CoreSubscriber<? super T> subscriber)`
- A. An internal Publisher.subscribe(Subscriber) that will bypass __Hooks.onLastOperator(Function) pointcut__.
- B.In addition to behave as expected by Publisher.subscribe(Subscriber) in a controlled manner, it supports direct subscribe-time __Context passing__.

A(onLastOperator) 를 살펴보면 다음과 같다.

```java
import reactor.core.publisher.Flux;
import reactor.core.publisher.Hooks;

public class OnLastOperatorExample {

    public static void main(String[] args) {

        Hooks.onLastOperator("myHook", (publisher, coreSubscriber) -> {
            System.out.println("Last operator is " + publisher.getClass().getSimpleName());
            return coreSubscriber;
        });

        Flux.range(1, 10)
                .map(i -> i * 2)
                .filter(i -> i % 3 == 0)
                .subscribe(System.out::println);
    }
}
```

In this example, we are using the Hooks.onLastOperator method to register a callback that will be executed when the last operator in the pipeline is executed. The callback simply prints out the name of the last operator.

Then, we create a simple reactive stream pipeline using the Flux class, which emits numbers from 1 to 10, multiplies them by 2, and then filters out any numbers that are not divisible by 3. Finally, we subscribe to the pipeline and print out the results.

When we run this code, we should see the following output:

```
Last operator is FilterFuseable
6
12
18
```

This shows that the Filter operator was the last operator in the pipeline, and that it emitted the numbers 6, 12, and 18.

The onLastOperator hook is a global hook in the Project Reactor library, which means that it will apply to all publishers in your application, regardless of where they are created or how they are used.

__ProjectReactor 를 통해 생성되는 모든 Publisher 들은, onLastOperator hook 에 의해 동작함.__

Last Operator 콜백을 등록하면 반응형 스트림 파이프라인이 생성되고 __파이프라인의 마지막 연산자가 실행될 때마다 콜백이 실행됨__. 이는 Mono, Flux 및 사용자가 생성할 수 있는 다른 사용자 정의 게시자와 같은 모든 유형의 게시자에 적용됨.

B(Context passing) 은 다음과 같다.

```java
Flux.just("Hello", "world")
  .map(String::toUpperCase)
  .subscriberContext(Context.of("user", "john.doe"))
  .subscribe(System.out::println);
```

In this example, we are creating a simple Flux that emits two strings, "Hello" and "world". We then use the map operator to convert the strings to uppercase. Finally, we use the subscriberContext method to attach a Context object to the stream with a key of "user" and a value of "john.doe".

This context can then be accessed by any operator in the stream using the Context class:

```java
Flux.just("Hello", "world")
.map(s -> s + " " + s.toUpperCase())
.map(s -> s + " by " + s.concat(Mono.subscriberContext().get("user")))
.subscribe(System.out::println);
```

In this example, we are using the map operator to first concatenate each string with its uppercase version, and then to concatenate it with the value stored in the user key in the Context object.

Context passing is a powerful feature of reactive programming that allows you to propagate important context information throughout the stream, making it available to all operators in the stream. This can simplify your code and make it easier to work with reactive streams.

그러나 subscriberContext deprecated 된 것으로 보인다. 대신 `Mono.deferContextual(Mono::just)` 를 사용하면 된다.

[Mono.subscriberContext methods are deprecated, but javadoc do not describe use what to replace them #2572](https://github.com/reactor/reactor-core/issues/2572)

## Links

- [ProjectReactor Docs](https://projectreactor.io/docs/core/release/api/)