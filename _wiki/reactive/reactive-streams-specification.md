---
layout  : wiki
title   : Reactive Streams Specification
summary : 
date    : 2023-02-14 15:05:32 +0900
updated : 2023-02-14 15:15:24 +0900
tag     : reactive spec
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Reactive Streams

Reactive Streams 란 비동기 스트림 처리(asynchronous stream processing) 과 논-블러킹(non-blocking) 과 배압(backpressure) 처리를 위한 JVM, Javascript 환경에서의 표준이다. 

- [Package org.reactivestreams Interfaces](https://www.reactive-streams.org/reactive-streams-1.0.4-javadoc/org/reactivestreams/package-summary.html)

![](/resource/wiki/reactive-duality/uml.png)

A Publisher is a provider of a potentially unbounded number of sequenced elements, publishing them according to the demand received from its Subscriber(s).

- Reactive Streams 는 단순히 JVM 기반에서 Async Non-Blocking 처리를 위한 스펙을 명세한 것
- Project Reactor 는 Reactive Streams 의 구현체
  - Project Reactor 대신 RxJava, Akka Streams 구현체를 사용할 수 있음
-  Spring Webflux 는 Netty + Project Reactor 사용

### Specification Enabling Backpressure

JDK9 made the reactive streams interfaces available under [java.util.concurrent.Flow](https://docs.oracle.com/javase/9/docs/api/java/util/concurrent/Flow.html), which is semantically equivalent to org.reactivestreams APIs. RxJava, Reactor, and Akka Streams all implement the interfaces under Flow.

- [Specification](https://github.com/reactive-streams/reactive-streams-jvm#specification)

![](/resource/wiki/reactive-duality/flow.png)

[The Reactive Streams interfaces are:](https://developer.ibm.com/articles/defining-the-term-reactive/)

  - __Subscriber and Publisher__
    - (1) subscribe(): sub -> pub
      - A Subscriber subscribes to a Publisher via the method Publisher.subscribe().
    - (2) onSubscribe(sub): pub -> sub
      - Then the Publisher calls Subscriber.onSubscribe to pass over the Subscription.
      - The Subscriber calls subscription.request(), which takes care of [backpressure](https://baekjungho.github.io/wiki/spring/spring-backpressure/) or subscription.cancel()
  - __Subscription__
    - (3) request(x): sub -> pub
      - x: Number of data subscriber want to receive
    - (4) onNext(i1) .. onNext(iX): pub -> sub
      - The publisher will not send more than 4 unless the subscriber requests more.
    - (5) onComplete(): pub -> sub
      - The Publisher invokes onNext() when an item is published or onComplete() if no item is to be published.
  - __Processor__
    - A processor is an intermediary between Publisher and Subscriber. It subscribes to a Publisher and then a Subscriber subscribes to Processor.

위의 API 를 통해서 Backpressure 를 사용할 수 있다.

### Flow

- [Reactive Streams with Armeria - LINE](https://engineering.linecorp.com/ko/blog/reactive-streams-with-armeria-1/)

> ![](/resource/wiki/reactive-duality/pub-sub-flow.png)
>
> 1. Subscriber 가 subscribe 함수를 사용해 Publisher 에게 구독을 요청.
> 2. Publisher 는 onSubscribe 함수를 사용해 Subscriber 에게 Subscription 을 전달. (구독 했으니 그거에 대한 Ticket 같은 개념). onSubscribe 사용은 데이터를 통지할 준비가 되었음을 알리는 행위이다.
> 3. Subscription 은 Subscriber 와 Publisher 간 통신의 매개체가 된다. Subscriber 는 Publisher 에게 직접 데이터 요청을 하지 않는다. Subscription.request 함수를 통해 Publisher 에게 전달 받을 데이터 개수를 요청한다.
> 4. Publisher 는 Subscription 을 통해 Subscriber 의 onNext 에 데이터를 전달하고, 작업이 완료되면 onComplete, 에러가 발생하면 onError 시그널을 전달한다.
> 5. Subscriber 와 Publisher, Subscription 이 서로 유기적으로 연결되어 통신을 주고받으면서 subscribe 부터 onComplete 까지 연결되고, 이를 통해 Backpressure 가 완성된다.

### Pub/Sub Implementation

- __Reactive Streams interfaces 를 구현한 코드__

```java
import java.util.concurrent.Flow;

public class PubSub {
    public static void main(String[] args) {
        Iterable<Integer> iter = Arrays.asList(1,2,3,4,5); // Collection Data
        Flow.Publisher pub = createPublisher(iter);
        Flow.Subscriber sub = createSubscriber();
        
        pub.subscribe(sub);
    }
    
    private Flow.Publisher createPublisher(Iterable<Integer> iter) {
        return new Flow.Publisher() {
            @Override
            public void subscribe(Flow.Subscriber subscriber) {
                // onSubscribe 는 무조건 호출되어야 하는 메서드: subscribe 하는 즉시 호출해줘야 함
                subscriber.onSubscribe(new Flow.Subscription() {
                    Iterator<Integer> it = iter.iterator();

                    @Override
                    public void request(long n) {
                        try {
                            while (n-- > 0) {
                                if (it.hasNext()) { // exists data
                                    subscriber.onNext(it.next()); // notify
                                } else { // empty data
                                    subscriber.onComplete(); // notify complete
                                    break;
                                }
                            }
                        } catch (RuntimeException e) {
                            subscriber.onError(e);
                        }
                    }

                    @Override
                    public void cancel() {

                    }
                });
            }
        };
    }
    
    private Flow.Subscriber createSubscriber() {
        Flow.Subscriber<Integer> s  = new Flow.Subscriber<Integer>() {
            Flow.Subscription subscription;

            @Override
            public void onSubscribe(Flow.Subscription subscription) { 
                System.out.println("onSubscribe");
                this.subscription = subscription;
                this.subscription.request(1); // Long.MAX_VALUE: 모든 데이터 다 받기
            }

            int bufferSize = 2;

            /**
             * publisher 에서 통지한 데이터를 처리
             * @param item the item
             */
            @Override
            public void onNext(Integer item) {
                // 기존 bufferSize 에 대한 요청이 끝나고 나면 다음 데이터를 다시 요청
                if (--bufferSize <= 0) {
                    bufferSize = 2;
                    this.subscription.request(2); 
                }
            }

            /**
             * Error Processing
             * Publisher 에서 어떤 종류의 에러가 발생하더라도 이 메서드에서 처리함
             * @param throwable the exception
             */
            @Override
            public void onError(Throwable throwable) {
                System.out.println("onError");
            }

            @Override
            public void onComplete() {
                System.out.println("onComplete");
            }
        };
    }
}
```

추가적으로 grpc 의 자바 구현을 보면, Observable 과 Subscriber API 로 구현되어있다.

실무에서는 직접 만들기 보다는, 이미 검증이 되어있는 구현체 e.g Flow.crate() 를 사용해서 Publisher 를 만드는 것이 좋다.

## Links

- [Reactive Streams](https://www.reactive-streams.org/)
- [Spring Reactive](https://spring.io/reactive)
- [Build Reactive REST APIs With Spring WebFlux - DZone](https://dzone.com/articles/build-reactive-rest-apis-with-spring-webflux)
- [Defining the term reactive](https://developer.ibm.com/articles/defining-the-term-reactive/)
- [Reactive in practice: A complete guide to event-driven systems development in Java](https://developer.ibm.com/series/reactive-in-practice/)