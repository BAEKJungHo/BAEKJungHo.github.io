---
layout  : wiki
title   : Remove high coupling between Contexts through Event
summary : 이벤트와 컨텍스트간의 강결합
date    : 2022-12-07 22:57:32 +0900
updated : 2022-12-07 23:21:24 +0900
tag     : ddd msa
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## High coupling between Contexts

```java
public class Order {
    public void cancel(RefundService refundService) {
        // 주문 로직
        verifyNotYetShipped();
        this.state = OrderState.CANCELED;
        
        // 결제 로직
        this.refundStatus = State.REFUND_STARTED;
        try {
            refundSvc.refund(getPaymentId()); // 외부 서비스 성능에 직접 영향을 받는다.
            this.refundStatus = State.REFUND_COMPLETED;
        } catch(Exception e) {
            // ...
        }
    }
}
```

위 코드는 2가지 문제점이 있다.

1. 외부 서비스의 성능에 영향을 받는 문제
2. 도메인 객체에 서로 다른 도메인 로직에 섞이는 문제

Order 는 주문을 표현하는 도메인 객체인데 결제 도메인의 환불 관련 로직이 뒤섞이게 되고, 환불 기능이 바뀌면 주문도 영향을 받게된다. 이러한 문제는 __Bounded Context 간의 강결합(high coupling)__ 때문이다.

이러한 강결합을 없애는 방법으로는 __Event__ 를 사용하는 것이다.

## Event

> Event 란 '과거에 벌어진 어떤 것'을 의미한다. 이벤트가 발생한다는 것은 '상태'가 변경됐다는 것을 의미한다.

- __이벤트 관련 구성 요소__

![](/resource/wiki/ddd-event/event.png)

1. Event Create Service: 이벤트 생성 주체
2. Event Dispatcher(Publisher): 이벤트를 처리할 수 있는 핸들러에 이벤트를 전파
3. Event Handler: 이벤트를 처리

### Required Information

이벤트에 담아야할 필수 정보는 다음과 같다.
- 이벤트 종류: 클래스 이름으로 이벤트 종류 표현
- 이벤트 발생 시간
- 추가 데이터
  - e.g 주문 번호, 신규 배송지 정보 등 이벤트와 관련된 정보

### The past tense

이벤트를 위한 클래스는 __과거 시제__ 를 사용한다.

- __Event Class__

```java
public class ShippingInfoChangedEvent {
    // ...
}
```

- __Event 생성 주체__

```java
public class Order {
    public void changeShippingInfo(ShippingInfo shippingInfo) {
        verifyNotYetShipped();
        setShippingInfo(newShippingInfo());
        Events.raise(new ShippingInfoChangedEvent(number, newShippingInfo()));
    }
}
```

- __Event Handler__

```java
public class ShippingInfoChangedHandler {
    @EventListener(ShippingInfoChangedEvent.class)
    public void handle(ShippingInfoChangedEvent evt) {
        shippingInfoSynchronizer.sync(evt.getOrderNumber(), evt.getNewShippingInfo());
    }
}
```

### Purpose

이벤트의 두가지 용도는 다음과 같다.
- Trigger: 트리거를 통한 후처리 
- Synchronize: 서로 다른 시스템간의 동기화 처리

## Event class

- 원하는 클래스를 이벤트로 사용
- 클래스 네이밍은 과거시제 사용
- 클래스 네이밍 시 Event 를 Suffix 로 사용할 수도 있고, 간결하게 과거시제만 사용할 수도 있음
  - e.g OrderCanceledEvent, OrderCanceled

### Common Event Abstract Class

```java
public abstract class Event {
    private long timestamp;
    
    public Event() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public long getTimestamp() {
        return timestamp;
    }
}
```

### Implementation

```java
public class OrderCanceledEvent extends Event {
    private String orderNumber;
    // ...
}
```

## Events Class and ApplicationEventPublisher

Spring 에서는 이벤트 발생과 출판을 위해 ApplicationEventPublisher 를 제공한다. Events 클래스는 ApplicationEventPublisher 를 구현해서 이벤트를 발생시키도록 구현한다.

```java
import org.springframework.context.ApplicationEventPublisher;

public class Events {
    private static ApplicationEventPublisher publisher;
    
    static void setPublisher(ApplicationEventPublisher publisher) {
        Events.publisher = publisher;
    }
    
    public static void raise(Object event) {
        if (publisher != null) {
            publisher.publishEvent(event);
        }
    }
}
```

### EventConfiguration

```java
@Configuration
public class EventsConfiguration {
    @Autowired
    private ApplicationContext applicationContext;
    
    @Bean
    public InitializingBean eventsInitializer() {
        return () -> Events.setPublisher(applicationContext);
    }
}
```

### Event Occur and Event Handler

```java
public class Order {
    public void cancel() {
        // ...
        Events.raise(new OrderCanceledEvent(number.getNumber()));
    }
}
```

```java
@Service
public class OrderCanceledEventHandler {
    private RefundService refundService;
    
    public OrderCanceledEventHandler(RefundService refundService) {
        this.refundService = refundService;
    }
    
    @EventListener(OrderCanceledEvent.class)
    public void handle(OrderCanceledEvent event) {
        refundService.refund(event.getOrderNumber());
    }
}
```

## Problems with synchronous event processing

동기식으로 이벤트를 처리할 때는 아래와 같은 문제가 발생할 수 있다.

1. 외부 연동 과정에서 익셉션이 발생하면 트랜잭션 처리를 어떻게 할 것인지
2. 외부 연동을 사용하는 서비스에서 외부 연동 기능이 갑자기 느려지거나 예외가 발생하면 어떻게 할 것인지

__외부 시스템과의 연동을 동기로 처리할 때 발생하는 성능과 트랜잭션 범위 문제를 해소하는 방법은 이벤트를 비동기로 처리하거나 이벤트와 트랜잭션을 연계하는 것이다.__

## Asynchronous event processing

- Local Handler 를 비동기로 실행하기
- Message Queue 사용하기
- Event Store 와 Event Forwarder 사용하기
- Event Store 와 Event 제공 API 사용하기

### LocalHandler with asynchronous

- @EnableAsync 어노테이션을 사용하여 비동기 기능 활성화
- 이벤트 핸들러에 [@Async](https://baekjungho.github.io/wiki/spring/spring-async/) 어노테이션 사용

```java
@Service
public class OrderCanceledEventHandler {
    
    @Async
    @EventListener(OrderCanceledEvent.class)
    public void handle(OrderCanceledEvent event) {
        refundService.refund(event.getOrderNumber());
    }
}
```

### MessageQueue

Kafka 와 같은 [MessageQueue](https://baekjungho.github.io/wiki/msa/msa-eventual-consistency/#message-queue) 를 이용하여 처리할 수 있음

![](/resource/wiki/ddd-event/messagequeue.png)

[OutBox Pattern](https://microservices.io/patterns/data/transactional-outbox.html) 을 활용할 수도 있다.

- __Forces__
  - If the database transaction commits messages must be sent. Conversely, if the database rolls back, the messages must not be sent 
  - Messages must be sent to the message broker in the order they were sent by the service. This ordering must be preserved across multiple service instances that update the same aggregate.
- __Solution__
  - A service that uses a relational database inserts messages/events into an outbox table (e.g. MESSAGE) as part of the local transaction. An service that uses a NoSQL database appends the messages/events to attribute of the record (e.g. document or item) being updated. A separate Message Relay process publishes the events inserted into database to a message broker.

![](/resource/wiki/ddd-event/outbox.png)

- __Benefits__
  - 2PC is not used 
  - Messages are guaranteed to be sent if and only if the database transaction commits 
  - Messages are sent to the message broker in the order they were sent by the application
- __Drawbacks__
  - Potentially error prone since the developer might forget to publish the message/event after updating the database.
- __Issues__
  - The Message Relay might publish a message more than once. It might, for example, crash after publishing a message but before recording the fact that it has done so. When it restarts, it will then publish the message again. As a result, a message consumer must be idempotent, perhaps by tracking the IDs of the messages that it has already processed. Fortunately, since Message Consumers usually need to be idempotent (because a message broker can deliver messages more than once) this is typically not a problem.

### Event Forwarder

Outbox Pattern 과 유사하다.

![](/resource/wiki/ddd-event/forwarder.png)

포워더는 주기적으로 이벤트 저장소에서 이벤트를 읽어와 이벤트 핸들러를 실행한다. 포워더는 별도의 스레드를 이용하기 때문에 이벤트 발행과 처리가 비동기로 처리된다.

이 방식은 도메인 상태와, 이벤트 저장소로 동일한 DB 를 사용한다. __즉, 도메인 상태 변화와 이벤트 저장이 로컬 트랜잭션으로 처리 된다.__ 이벤트를 물리적인 저장소에 보관하기 때문에 핸들러가 이벤트 처리에 실패할 경우 포워더는 다시 이벤트 저장소에서 이벤트를 읽어와 핸들러를 실행하면 된다.

### API

![](/resource/wiki/ddd-event/api.png)

API 방식은 외부 핸들러가 API 서버를 통해 이벤트 목록을 가져간다. 포워더 방식은 이벤트를 어디까지 처리했는지 추적하는 역할이 포워더에 있으며 API 방식에서는 이벤트 목록을 요구하는 외부 핸들러(Event Handler)가 자신이 어디까지 이벤트를 처리했는지 기억해야 한다.

## Event Store Structure

![](/resource/wiki/ddd-event/eventstore.png)

## Consideration

- __이벤트 적용 시 추가 고려 사항__
  - 첫 번째. __Event Source 를 Event Entry 에 추가할지 여부.__
    - EventEntry 는 이벤트 발생 주체에 대한 정보를 갖지 않는다. 따라서 'Order 가 발생 시킨 이벤트만 조회하기' 처럼 특정 주체가 발생시킨 이벤트만 조회하는 기능을 구현할 수 없다. 이 기능을 구현하려면 이벤트에 발생 주체 정보를 추가해야 한다.
  - 두 번째. __포워더에서 전송 실패를 얼마나 허용할 것인지에 대한 여부.__ 
    - e.g 3회 실패했다면 해당 이벤트를 생략하고 다음 이벤트로 넘어간다던지 등의 정책이 필요
    - e.g 처리에 실패한 이벤트를 생략하지 않고 별도 실패용 DB 나 MessageQueue 에 저장하기도 한다. 처리에 실패한 이벤트를 물리적인 저장소에 남겨두면 이후 실패 이유 분석이나 후처리에 도움이 된다.
  - 세 번째. __이벤트 손실(event loss)__ 에 대한 것.
    - 이벤트 저장소를 사용하는 방식은 이벤트 발생과 이벤트 저장을 한 트랜잭션으로 처리하기 때문에 트랜잭션이 성공하면 이벤트가 저장소에 보관된다는 것을 보장할 수 있다. 반면에 로컬 핸들러를 이용해서 이벤트를 비동기로 처리할 경우 이벤트 처리에 실패하면 이벤트를 유실하게 된다.
  - 네 번째. __이벤트 순서(event sequence)__ 에 대한 것.
    - 이벤트 발생 순서대로 외부 시스템에 전달해야 하는 경우 이벤트 저장소를 사용하는 것이 좋다.
    - 반면, 메시징 시스템은 사용 기술에 따라 이벤트 발생 순서와 메시지 전달 순서가 다를 수도 있다.
  - 다섯 번째. __이벤트 재처리(event retry)__ 에 대한 것.
    - 동일한 이벤트를 다시 처리해야할 때 이벤트를 어떻게 할 것이지 결정해야 한다.
    - 가장 쉬운 방법은 마지막으로 처리한 이벤트의 순번을 기억해 두었다가 이미 처리한 순번의 이벤트가 도착하면 해당 이벤트를 처리하지 않고 무시하는 것.
    - 이외에 이벤트를 __멱등성(idempotent)__ 으로 처리하는 방법

> 멱등성(idempotent)이란 연산을 여러 번 적용해도 결과가 달라지지 않는 성질을 의미한다. 이벤트 처리에도 동일 이벤트를 한 번 적용하나 여러 번 적용하나 시스템이 같은 상태가 되도록 핸들러를 구현할 수 있다. 
> 
> 예를 들어 배송지 정보 변경 이벤트를 받아서 주소를 변경하는 핸들러는 그 이벤트를 한 번 처리하나 여러 번 처리하나 결과적으로 동일 주소를 값으로 갖는다. 같은 이벤트를 여러 번 적용해도 결과가 같으므로 이 이벤트 핸들러는 멱등성을 갖는다.
> 
> 이벤트 핸들러가 멱등성을 가지면 시스템 장애로 인해 같은 이벤트가 중복해서 발생해도 결과적으로 동일한 상태가 된다. 이는 이벤트 중복 발생이나 중복 처리에 대한 부담을 줄여준다.

- __이벤트 처리와 DB 트랜잭션 고려__
  - 이벤트 처리를 동기로 하든 비동기로 하든 이벤트 처리 실패와 트랜잭션 실패를 함께 고려해야 한다.
  - __트랜잭션이 성공할 때만 이벤트 핸들러를 실행하는 방법으로 구현하면 이벤트 처리 실패에 대한 케이스만 고려하면 된다.__

```java
@TransactionalEventListener(
        classes = OrderCanceledEvent.class,
        phase = TransactionPhase.AFTER_COMMIT
)
public void handle(OrderCanceledEvent event) {
    refundService.refund(event.getOrderNumber());    
}
```

## Links

- [MySQL 자동 증가 칼럼의 최신 데이터 조회시 주의 사항](https://javacan.tistory.com/entry/MYSQL-auto-inc-col-gotcha)
- [Change Data Capture](https://learn.microsoft.com/ko-kr/sql/relational-databases/track-changes/about-change-data-capture-sql-server?view=sql-server-ver16)

## References

- 도메인 주도 설계 / Eric Evans 저 / 위키북스
- 도메인 주도 개발 시작하기 / 최범균 저 / 한빛미디어