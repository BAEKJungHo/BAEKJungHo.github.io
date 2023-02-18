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

그러나 subscriberContext 가 deprecated 된 것으로 보인다. 대신 __Mono.deferContextual(Mono::just)__ 를 사용하면 된다.

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
  - 해석하면 .. 구현자는 Subscription.request(long)를 호출하기 전에 Subscriber.onNext(Object)에서 사용하는 모든 `상태`를 초기화해야 한다. 즉, Subscriber.onNext(Object) 에서 사용되는 `상태` 를 초기화 해야한다는 의미.

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

### Disposable

__Signatures:__

```java
@FunctionalInterface
public interface Disposable
```

__Roles:__
- Indicates that a task or resource can be cancelled/disposed.

__Methods:__
- void dispose(): `Cancel` or `dispose` the underlying task or resource. __리소스 해제 역할을 담당__
- default boolean isDisposed(): Optionally return true when the resource or task is disposed.

__cancelling and disposing:__

In reactive programming, "cancelling" and "disposing" are often used interchangeably to mean that a task or resource should be cleaned up and released. However, there can be some subtle differences in how the terms are used depending on the context.

In general, "cancelling" is often used to refer to stopping an ongoing computation or operation. For example, when you call the cancel method on a subscription to a publisher, you are telling the publisher to stop sending any more items to the subscriber. Similarly, when you cancel a running thread or task, you are telling it to stop executing its work and clean up any resources it has allocated.

On the other hand, "disposing" is often used to refer to cleaning up and releasing resources that were acquired by an object. For example, when you dispose of an object that implements the AutoCloseable interface, you are telling it to release any resources that it was holding, such as file handles, network connections, or database connections. Similarly, when you dispose of an object that is no longer needed, you are telling the system to release any memory or other resources that it was using.

In some cases, the terms "cancelling" and "disposing" can be used interchangeably, especially if the task or resource in question involves both ongoing computation and acquired resources. For example, if you have a long-running task that is reading from a network connection, you might use the term "cancelling" to refer to stopping the task and the term "disposing" to refer to releasing the network connection.

In summary, "cancelling" and "disposing" are often used interchangeably to mean cleaning up and releasing resources, but there can be some subtle differences in how the terms are used depending on the context.

Publisher 의 subscribe 메서드를 호출한다고 dispose 되는 것은 아님

When you call the subscribe() method on a Subscriber, the Disposable that is returned allows you to cancel or dispose of the subscription at a later time. It does not necessarily mean that the resource is immediately released as soon as you call subscribe().

In reactive programming, the __Disposable interface is used to allow the user to release resources that were acquired by a subscription__. __The Disposable interface has a dispose() method that can be called to release any resources that were acquired by the subscription__. The subscribe() method returns a Disposable so that the user can keep track of the subscription and release any acquired resources when they are no longer needed.

Here is an example that demonstrates __how to use the Disposable interface to release resources acquired by a subscription__:

```java
Disposable disposable = somePublisher.subscribe(someSubscriber);

// ...

// When you are done with the subscription, call dispose() to release any acquired resources
disposable.dispose();
```

놀랍게도 Spring WebFlux 를 사용하면, Spring WebFlux 엔드포인트 핸들러 메서드에서 Mono 또는 Flux 를 반환하면 프레임워크가 사용자를 대신하여 Mono 또는 Flux를 구독하고 응답이 클라이언트로 전송될 때 구독을 자동으로 폐기 한다. 즉, Mono 또는 Flux 에서 획득한 리소스를 해제하기 위해 dispose() 메서드를 수동으로 호출할 필요가 없다.

```java
// No need to deal with code for resource release.
@GetMapping("/users/{id}")
public Mono<User> getUserById(@PathVariable String id) {
    return userRepository.findById(id);
}
```

__Spring WebFlux 에 의해 내부적으로 처리되는 작업:__

1. __onSubscribe and request__: 클라이언트가 Mono 객체를 구독할 때(일반적으로 응답을 작성할 때 Spring WebFlux 에 의해 암묵적으로 수행됨) `Mono<User>` 객체의 구독 메서드가 호출되며, 이는 다시 구독자의 onSubscribe 메서드를 호출한다. 구독자의 onSubscribe 메서드는 구독의 request(1) 메서드를 호출하여 `Mono<User>` 개체가 하나의 항목을 내보내도록 요청한다.
2. __onNext__: `Mono<User>` 개체가 항목(즉, User 개체)을 내보내는 경우, 내보낸 User 개체를 사용하여 구독자의 onNext 메서드가 호출된다. 이 때 사용자 개체가 JSON 으로 직렬화되어 응답 본문의 클라이언트로 다시 전송된다.
3. __dispose__: 모든 작업이 끝나고 Spring WebFlux 가 리소스를 해제한다.

In this example, the getUserById method returns a `Mono<User>` that is obtained from a userRepository instance. When the endpoint is called, Spring WebFlux will automatically subscribe to the Mono and return the User object to the client. After the response has been sent, Spring WebFlux will automatically dispose of the subscription, which means that any resources that were acquired by the Mono will be released.

Similarly, you can return a Flux from a Spring WebFlux endpoint handler method, and Spring WebFlux will take care of disposing the subscription when the response has been sent to the client.

In summary, in Spring WebFlux, you don't have to explicitly dispose of a Mono or Flux because the framework will handle it for you automatically. When you return a Mono or Flux from an endpoint handler method, Spring WebFlux will automatically subscribe to it, send the response to the client, and dispose of the subscription when the response has been sent.

#### How to cancelling ?

__Example 1: Using a Disposable__

```java
Disposable disposable = somePublisher.subscribe(someSubscriber);

// ...

// When you are done with the subscription, call dispose() to cancel it
disposable.dispose();
```

__Example 2: Using a Subscription__

```java
Subscription subscription = somePublisher.subscribe(someSubscriber);

// ...

// When you are done with the subscription, call cancel() to cancel it
subscription.cancel(); // 구독 취소
```

__Example 3: Using a Disposable from a Flux__

```java
Flux<Integer> flux = Flux.range(1, 10);
Disposable disposable = flux.subscribe(
    value -> System.out.println("Received value: " + value),
    error -> System.err.println("Error: " + error),
    () -> System.out.println("Subscription complete")
);

// ...

// When you want to cancel the subscription, call dispose() on the Disposable
disposable.dispose();
```

### Fuseable

__Signatures:__

```java
public interface Fuseable
```

__Roles:__
- A micro API for stream fusion, in particular marks producers that support a Fuseable.QueueSubscription.

Mono 의 just 메서드 또는 Flux 의 range 메서드 등의 구현을 보면 Fuseable 인터페이스를 구현하고 있다. __Fuseable 인터페이스를 구현하면 Stream 작업을 융합할 수 있다__.

```java
Mono<Integer> mono = Mono.just(1)
        .map(i -> i * 2)
        .filter(i -> i % 3 == 0)
        .map(i -> i / 3)
        .log();

if (mono instanceof Fuseable) {
    System.out.println("Fuseable supported");
    Mono<Integer> fusedMono = mono
            .map(i -> i * 100)
            .map(i -> i / 100)
            .log();
    fusedMono.subscribe();
} else {
    System.out.println("Fuseable not supported");
    mono.subscribe();
}

Flux<Integer> flux = Flux.range(1, 5)
        .map(i -> i * 10)
        .filter(i -> i % 20 == 0)
        .map(i -> i / 20)
        .log();

if (flux instanceof Fuseable) {
    System.out.println("Fuseable supported");
    Flux<Integer> fusedFlux = flux
            .map(i -> i * 100)
            .map(i -> i / 100)
            .log();
    fusedFlux.subscribe();
} else {
    System.out.println("Fuseable not supported");
    flux.subscribe();
}
```

### Signal

__Signatures:__

```java
public interface Signal<T>
extends Supplier<T>, Consumer<Subscriber<? super T>>
```

__Roles:__
- A domain representation of a Reactive Stream signal. There are 4 distinct signals and their possible sequence is defined as such: `onError | (onSubscribe onNext* (onError | onComplete)?)`
  - onError, onSubscribe, onComplete, onNext 는 Subscriber Interface 의 API 이다.

1. __Combining multiple streams__: In this example, we have two Flux streams that we want to combine into a single stream using the zip() operator. We also want to log each Signal in the resulting stream:

```java
Flux<Integer> stream1 = Flux.just(1, 2, 3);
Flux<String> stream2 = Flux.just("A", "B", "C");

Flux.zip(stream1, stream2)
    .materialize()
    .doOnNext(signal -> {
        System.out.println("Received signal " + signal);
    })
    .dematerialize()
    .subscribe();
```

2. __Handling errors__: In this example, we have a Mono stream that may emit an error signal. We want to log the error if it occurs, and then continue processing the stream as normal:

```java
Mono.just("foo")
    .map(s -> Integer.parseInt(s))
    .materialize()
    .doOnNext(signal -> {
        if (signal.isOnError()) {
            Throwable error = signal.getThrowable();
            System.out.println("Error occurred: " + error);
        }
    })
    .dematerialize()
    .onErrorResume(e -> Mono.empty())
    .subscribe();
```

3. __Using Signal in custom operators__: You can also use Signal to implement custom operators that work with the metadata of the stream. For example, the following operator takes a Flux of Signals, filters out any onNext() signals with a value less than 0, and then converts the resulting Signals back into onNext() events:

```java
Flux<Integer> stream = Flux.just(1, -2, 3, -4, 5);

stream.materialize()
    .filter(signal -> {
        if (signal.isOnNext()) {
            Integer value = (Integer) signal.get();
            return value >= 0;
        } else {
            return true;
        }
    })
    .dematerialize()
    .subscribe(System.out::println);
```

## Links

- [ProjectReactor Docs](https://projectreactor.io/docs/core/release/api/)