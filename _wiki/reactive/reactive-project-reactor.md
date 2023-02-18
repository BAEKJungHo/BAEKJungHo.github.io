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

## Documents

> [Docs](https://projectreactor.io/docs/core/release/api/) 와 같이 보면 좋을 내용들을 정리

- __reactor.adapter.JdkFlowAdapter__: Java9 Flow API 와 Flow 의 상호간 변환을 위한 어댑터
- __reactor.core__: Reactor is fully non-blocking and provides efficent demand management. It directly interacts with Java's Functional APIs. CompletableFuture, Stream, Duration.

### CorePublisher

react.core 에 존재하는 인터페이스.

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
- An internal Publisher.subscribe(Subscriber) that will bypass __Hooks.onLastOperator(Function) pointcut__.
- In addition to behave as expected by Publisher.subscribe(Subscriber) in a controlled manner, it supports direct subscribe-time __Context passing__.

CorePublisher 에서 주의 깊게 볼만한 부부은 __onLastOperator__ 와 __Context Passing__ 이다.

#### onLastOperator

먼저 onLastOperator 를 살펴보면 다음과 같다.

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

#### Context passing

[Context](https://projectreactor.io/docs/core/release/api/reactor/util/context/Context.html) passing 은 다음과 같다.

![](/resource/wiki/reactive-project-reactor/context.png)

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

### CoreSubscriber

__Signatures:__

```java
public interface CoreSubscriber<T>
extends Subscriber<T>
```

__Methods__
- default currentContext()
- void onSubscribe(Subscription s)
  - Implementors should initialize any state used by Subscriber.onNext(Object) before calling Subscription.request(long).
  - 해석하면 .. 구현자는 Subscription.request(long)를 호출하기 전에 Subscriber.onNext(Object)에서 사용하는 모든 상태를 초기화해야 합니다. 즉, Subscriber.onNext(Object) 에서 사용되는 `상태` 를 초기화 해야한다는 의미.

```java
public class AccumulatingSubscriber<T> implements Subscriber<T> {
    private Subscription subscription;
    private int accumulator; // Value initialized to zero(0) by Constructor.

    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;
        subscription.request(1);
    }

    @Override
    public void onNext(T item) {
        // Accumulate the value of the item
        accumulator += (Integer) item; // accumulator is state in AccumulatingSubscriber Class
        subscription.request(1);
    }

    @Override
    public void onError(Throwable t) {
        // Handle errors
    }

    @Override
    public void onComplete() {
        // Perform some operation on the accumulated value
        System.out.println("Accumulated value: " + accumulator);
    }
}
```

In this example, the AccumulatingSubscriber class initializes an instance variable called accumulator in the constructor. This variable is used to store the accumulated value of the items that the subscriber receives. In the onNext method, the value of each item is added to the accumulator, and then the next item is requested. Finally, in the onComplete method, the accumulated value is printed out.

Before calling subscription.request(1) in the onSubscribe method, the AccumulatingSubscriber class has already initialized the accumulator variable to a valid starting value (in this case, zero). This ensures that the subscriber is in a valid state to start receiving items from the publisher.

## Links

- [ProjectReactor Docs](https://projectreactor.io/docs/core/release/api/)