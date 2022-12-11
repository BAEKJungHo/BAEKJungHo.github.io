---
layout  : wiki
title   : Event and High coupling between Contexts (작성중)
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


## References

- 도메인 주도 설계 / Eric Evans 저 / 위키북스
- 도메인 주도 개발 시작하기 / 최범균 저 / 한빛미디어