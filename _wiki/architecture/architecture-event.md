---
layout  : wiki
title   : EVENT
summary : 
date    : 2025-05-20 08:02:32 +0900
updated : 2025-05-20 08:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## EVENT

___Event___ 는 특정 시점에 발생한 의미 있는 상태 변화나 행위를 의미한다. 그리고 다음과 같은 특징을 지닌다.

- 시간성(Temporality): 특정 시점에 발생
- 불변성(Immutability): 이미 발생한 사실
- 의미성(Significance): 시스템에 의미 있는 변화
- 관찰 가능성(Observability): 감지하고 반응할 수 있음

__Event vs Command vs State__:

| Type   | Event              | Command           | State             |
|--------|--------------------|-------------------|-------------------|
| 시제     | 과거형 (OrderCreated) | 명령형 (CreateOrder) | 현재형 (OrderStatus) |
| 변경 가능성 | 불변                 | 실행 전까지 변경 가능      | 변경 가능             |
| 실패 가능성 | 이미 발생한 사실          | 실패 가능             | N/A               |
| 목적     | 알림, 기록             | 행위 요청             | 현재 상태 표현          |

### Event Sourcing

___이벤트 소싱(event sourcing)___ 은 ___[Domain-Driven Design](https://klarciel.net/wiki/ddd/)___ 에서 개발한 기법이다. CDC(change data capture)와 유사하게 애플리케이션의 상태 변화를 모두 변경 이벤트 로그(immutable)로 저장한다.
저장만 가능하며 갱신이나 삭제는 불가능하다. CDC 와 다른 점은 이 아이디어를 적용하는 ___[ABSTRACTION](https://klarciel.net/wiki/architecture/architecture-abstraction/)___ 레벨이 다르다는 것이다.

이벤트 소싱은 ___Data Modeling___ 에 쓸 수 있는 강력한 기법이다. 새로 발생하는 ___[Side Effect](https://klarciel.net/wiki/functional/functional-sideeffect/)___ 를 기존 이벤트에서 쉽게 분리할 수 있다.

이벤트 소싱의 핵심은 Command 와 Event 를 분리하는 것이다. 명령은 수행되기 전에 Validation 을 거치게 된다. 이벤트는 생성 시점에 ___사실(fact)___ 가 된다.

__Naming Rules__:

```java
// 좋은 이벤트 명명
public class OrderCreatedEvent { }        // 과거형, 명확한 의미
public class PaymentProcessedEvent { }    // 구체적인 행위
public class InventoryLevelChangedEvent { } // 상태 변화 명시

// 피해야 할 명명
public class OrderEvent { }               // 너무 일반적
public class CreateOrder { }              // 명령형 (Command와 혼동)
public class OrderInfo { }                // 이벤트임이 불분명
```

__Examples__:

```java
// 이벤트 스토어
@Repository
public class EventStore {
    private final JdbcTemplate jdbcTemplate;
    
    public void saveEvents(String aggregateId, List<DomainEvent> events) {
        events.forEach(event -> {
            jdbcTemplate.update(
                "INSERT INTO events (aggregate_id, event_type, event_data, version, timestamp) VALUES (?, ?, ?, ?, ?)",
                aggregateId,
                event.getClass().getSimpleName(),
                serialize(event),
                getNextVersion(aggregateId),
                event.getOccurredAt()
            );
        });
    }
    
    public List<DomainEvent> getEvents(String aggregateId) {
        return jdbcTemplate.query(
            "SELECT * FROM events WHERE aggregate_id = ? ORDER BY version",
            new EventRowMapper(),
            aggregateId
        );
    }
}

// 이벤트로부터 상태 재구성
public class BankAccount {
    private String accountId;
    private BigDecimal balance;
    private List<DomainEvent> uncommittedEvents = new ArrayList<>();
    
    // 이벤트로부터 계좌 상태 재구성
    public static BankAccount fromEvents(List<DomainEvent> events) {
        BankAccount account = new BankAccount();
        events.forEach(account::apply);
        return account;
    }
    
    public void withdraw(BigDecimal amount) {
        if (balance.compareTo(amount) < 0) {
            throw new InsufficientFundsException();
        }
        
        MoneyWithdrawnEvent event = new MoneyWithdrawnEvent(
            accountId, amount, balance.subtract(amount)
        );
        
        apply(event);
        uncommittedEvents.add(event);
    }
    
    private void apply(DomainEvent event) {
        if (event instanceof AccountOpenedEvent) {
            apply((AccountOpenedEvent) event);
        } else if (event instanceof MoneyDepositedEvent) {
            apply((MoneyDepositedEvent) event);
        } else if (event instanceof MoneyWithdrawnEvent) {
            apply((MoneyWithdrawnEvent) event);
        }
    }
    
    private void apply(MoneyWithdrawnEvent event) {
        this.balance = event.getNewBalance();
    }
}

// 사용 예시
public class BankAccountService {
    private final EventStore eventStore;
    
    public void withdraw(String accountId, BigDecimal amount) {
        // 1. 이벤트로부터 현재 상태 재구성
        List<DomainEvent> events = eventStore.getEvents(accountId);
        BankAccount account = BankAccount.fromEvents(events);
        
        // 2. 비즈니스 로직 실행
        account.withdraw(amount);
        
        // 3. 새로운 이벤트 저장
        eventStore.saveEvents(accountId, account.getUncommittedEvents());
    }
}
```

___[CQRS](https://klarciel.net/wiki/ddd/ddd-cqrs/)___ 와 조합하여 사용할 수 도 있다.

```java
// Command Side에서 이벤트 발생
@Service
public class OrderCommandService {
    private final EventStore eventStore;
    private final EventPublisher eventPublisher;
    
    public void createOrder(CreateOrderCommand command) {
        Order order = new Order(command);
        
        // 이벤트 저장
        eventStore.saveEvents(order.getId(), order.getUncommittedEvents());
        
        // 이벤트 발행 (Query Side 업데이트용)
        order.getUncommittedEvents().forEach(eventPublisher::publish);
    }
}

// Query Side 에서 이벤트 구독하여 읽기 모델 업데이트
@EventHandler
public class OrderViewUpdater {
    private final OrderViewRepository viewRepository;
    
    @EventListener
    public void on(OrderCreatedEvent event) {
        OrderView view = OrderView.builder()
            .orderId(event.getOrderId())
            .customerId(event.getCustomerId())
            .status("CREATED")
            .createdAt(event.getOccurredAt())
            .build();
            
        viewRepository.save(view);
    }
    
    @EventListener
    public void on(OrderShippedEvent event) {
        OrderView view = viewRepository.findById(event.getOrderId());
        view.updateStatus("SHIPPED");
        view.setShippedAt(event.getOccurredAt());
        viewRepository.save(view);
    }
}
```

### Audit Event

```java
// 감사 이벤트
public class AuditEvent extends DomainEvent {
    private final String userId;
    private final String action;
    private final String resource;
    private final String resourceId;
    private final Map<String, Object> beforeState;
    private final Map<String, Object> afterState;
    private final String ipAddress;
    private final String userAgent;
    
    // 민감한 정보 마스킹
    public Map<String, Object> getMaskedAfterState() {
        Map<String, Object> masked = new HashMap<>(afterState);
        if (masked.containsKey("password")) {
            masked.put("password", "***");
        }
        if (masked.containsKey("creditCard")) {
            masked.put("creditCard", maskCreditCard((String) masked.get("creditCard")));
        }
        return masked;
    }
}

// 감사 이벤트 자동 생성
@Aspect
@Component
public class AuditAspect {
    private final EventPublisher eventPublisher;
    
    @Around("@annotation(Auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        // 실행 전 상태 캡처
        Object beforeState = captureState(args);
        
        try {
            Object result = joinPoint.proceed();
            
            // 실행 후 상태 캡처
            Object afterState = captureState(result);
            
            // 감사 이벤트 발행
            AuditEvent auditEvent = new AuditEvent(
                getCurrentUserId(),
                methodName,
                getResourceType(args),
                getResourceId(args),
                beforeState,
                afterState,
                getCurrentUserIp(),
                getCurrentUserAgent()
            );
            
            eventPublisher.publish(auditEvent);
            
            return result;
        } catch (Exception e) {
            // 실패 감사 이벤트
            AuditEvent failureEvent = new AuditEvent(
                getCurrentUserId(),
                methodName + "_FAILED",
                getResourceType(args),
                getResourceId(args),
                beforeState,
                Map.of("error", e.getMessage()),
                getCurrentUserIp(),
                getCurrentUserAgent()
            );
            
            eventPublisher.publish(failureEvent);
            throw e;
        }
    }
}

// 사용 예시
@Service
public class UserService {
    
    @Auditable
    public User updateUser(String userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId);
        user.update(request);
        return userRepository.save(user);
    }
}
```

### Outbox Pattern

이벤트 유실 방지를 위해 Outbox Pattern 을 구현할 수 있다.

```java
// Outbox Pattern 구현
@Entity
public class OutboxEvent {
    @Id
    private String id;
    private String aggregateId;
    private String eventType;
    private String eventData;
    private LocalDateTime createdAt;
    private boolean processed;
}

@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxRepository;
    
    public void createOrder(CreateOrderCommand command) {
        // 1. 비즈니스 로직 실행
        Order order = new Order(command);
        orderRepository.save(order);
        
        // 2. 같은 트랜잭션에서 Outbox에 이벤트 저장
        OutboxEvent outboxEvent = new OutboxEvent(
            UUID.randomUUID().toString(),
            order.getId(),
            "OrderCreated",
            serialize(new OrderCreatedEvent(order)),
            LocalDateTime.now(),
            false
        );
        outboxRepository.save(outboxEvent);
        
        // 트랜잭션 커밋 시 둘 다 저장됨
    }
}

// 별도 프로세스에서 Outbox 이벤트 발행
@Component
public class OutboxEventPublisher {
    private final OutboxEventRepository outboxRepository;
    private final EventPublisher eventPublisher;
    
    @Scheduled(fixedDelay = 1000) // 1초마다 실행
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findByProcessedFalse();
        
        for (OutboxEvent outboxEvent : pendingEvents) {
            try {
                DomainEvent domainEvent = deserialize(outboxEvent.getEventData());
                eventPublisher.publish(domainEvent);
                
                // 발행 성공 시 처리 완료 표시
                outboxEvent.setProcessed(true);
                outboxRepository.save(outboxEvent);
                
            } catch (Exception e) {
                log.error("Failed to publish event: {}", outboxEvent.getId(), e);
                // 재시도 로직 또는 Dead Letter Queue 처리
            }
        }
    }
}
```

### Immutable Event

거래(transaction)가 일어나면 거래 정보를 ___원장(ledger)___ 에 append-only 방식으로 기록한다.
원장은 본질적으로 돈, 상품, 서비스를 교환한 정보를 설명한 이벤트 로그다. 따라서, 거래 실수에 대한 내역도 추가가된다.
이러한 내용은 회계 감사에 중요한 사유가 된다.

___불변 이벤트(immutable event)___ 는 훨씬 많은 정보를 포함한다. 예를 들어 사용자가 장바구니에 항목 하나를 넣었다가 제거한 경우, 주문 이행 관점에서는 첫 이벤트를 취소한 것에 불과하지만,
데이터 분석가에게는 고객이 특정 항목을 구매하려 했다가 하지 않았다는 것을 알 수 있다.

## References

- Designing Data-Intensive Application / Martin Kleppmann
