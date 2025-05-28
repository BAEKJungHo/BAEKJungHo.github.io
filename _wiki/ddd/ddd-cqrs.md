---
layout  : wiki
title   : Command Query Responsibility Segregation
summary : 
date    : 2025-05-19 15:02:32 +0900
updated : 2025-05-19 15:12:24 +0900
tag     : ddd cqrs
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Command Query Responsibility Segregation

___[CQRS](https://en.wikipedia.org/wiki/Command_Query_Responsibility_Segregation)___ 는 명령(Command)과 조회(Query)의 책임을 분리하는 아키텍처 패턴이. 전통적인 CRUD 모델에서 벗어나 데이터를 변경하는 작업과 데이터를 읽는 작업을 완전히 분리한다.
- Command: 시스템의 상태를 변경하지만 값을 반환하지 않음
- Query: 값을 반환하지만 시스템의 상태를 변경하지 않음

___[Command Query Responsibility Segregation](https://martinfowler.com/bliki/CQRS.html)___ is suited to complex domains, the kind that also benefit from ___[Domain-Driven Design](https://klarciel.net/wiki/ddd/)___.

__Traditional__:

```java
// 전통적인 CRUD - 하나의 모델로 모든 작업 처리
@Entity
public class Order {
    private String orderId;
    private String customerId;
    private List<OrderItem> items;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // CRUD 메서드들이 같은 모델을 사용
}

@Repository
public class OrderRepository {
    public void save(Order order) { /* 생성/수정 */ }
    public Order findById(String id) { /* 조회 */ }
    public void delete(String id) { /* 삭제 */ }
    public List<Order> findByCustomerId(String customerId) { /* 조회 */ }
}
```

__CQRS__:

```java
// Command Side - 쓰기 모델
public class CreateOrderCommand {
    private final String customerId;
    private final List<OrderItemDto> items;
    private final String shippingAddress;
    
    // 비즈니스 로직에 필요한 최소한의 데이터만 포함
}

public class OrderAggregate {
    private String orderId;
    private String customerId;
    private List<OrderItem> items;
    private OrderStatus status;
    
    public void createOrder(CreateOrderCommand command) {
        // 비즈니스 로직 실행
        // 이벤트 발생
    }
}

// Query Side - 읽기 모델
public class OrderSummaryView {
    private String orderId;
    private String customerName;
    private String statusDisplay;
    private BigDecimal totalAmount;
    private String formattedDate;
    
    // 화면 표시에 최적화된 데이터 구조
}

public class OrderDetailView {
    private String orderId;
    private CustomerInfo customer;
    private List<OrderItemView> items;
    private ShippingInfo shipping;
    private PaymentInfo payment;
    
    // 상세 조회에 최적화된 데이터 구조
}
```

__Command Side__:

```java
// Command
public class UpdateInventoryCommand {
    private final String productId;
    private final int quantity;
    private final String reason;
    private final String updatedBy;
}

// Command Handler
@Component
public class UpdateInventoryCommandHandler {
    private final InventoryRepository repository;
    private final EventPublisher eventPublisher;
    
    public void handle(UpdateInventoryCommand command) {
        // 1. 도메인 객체 로드
        Inventory inventory = repository.findById(command.getProductId());
        
        // 2. 비즈니스 로직 실행
        inventory.updateQuantity(command.getQuantity(), command.getReason());
        
        // 3. 변경사항 저장
        repository.save(inventory);
        
        // 4. 이벤트 발행
        eventPublisher.publish(new InventoryUpdatedEvent(
            command.getProductId(),
            command.getQuantity(),
            command.getReason()
        ));
    }
}

// Domain Model
public class Inventory {
    private String productId;
    private int currentQuantity;
    private int reservedQuantity;
    
    public void updateQuantity(int newQuantity, String reason) {
        validateQuantityUpdate(newQuantity, reason);
        this.currentQuantity = newQuantity;
        // 비즈니스 규칙 적용
    }
    
    private void validateQuantityUpdate(int quantity, String reason) {
        if (quantity < 0) {
            throw new InvalidQuantityException("Quantity cannot be negative");
        }
        // 추가 비즈니스 규칙 검증
    }
}
```

__Query Side__:

```java
// Query
public class GetProductInventoryQuery {
    private final String productId;
    private final boolean includeReserved;
}

// Query Handler
@Component
public class GetProductInventoryQueryHandler {
    private final InventoryReadRepository readRepository;
    
    public InventoryView handle(GetProductInventoryQuery query) {
        return readRepository.findInventoryView(
            query.getProductId(),
            query.isIncludeReserved()
        );
    }
}

// Read Model
public class InventoryView {
    private String productId;
    private String productName;
    private int availableQuantity;
    private int reservedQuantity;
    private String lastUpdated;
    private String status;
    
    // 조회에 최적화된 구조
}

// Read Repository
@Repository
public class InventoryReadRepository {
    private final JdbcTemplate jdbcTemplate;
    
    public InventoryView findInventoryView(String productId, boolean includeReserved) {
        String sql = """
            SELECT 
                p.product_id,
                p.product_name,
                i.available_quantity,
                i.reserved_quantity,
                i.last_updated,
                i.status
            FROM products p
            JOIN inventory i ON p.product_id = i.product_id
            WHERE p.product_id = ?
        """;
        
        return jdbcTemplate.queryForObject(sql, new InventoryViewRowMapper(), productId);
    }
}
```

### Command/Query Bus

__Command Bus__:

```java
@Component
public class CommandBus {
    private final ApplicationContext applicationContext;
    private final Map<Class<?>, CommandHandler> handlers = new HashMap<>();
    
    @PostConstruct
    public void initializeHandlers() {
        applicationContext.getBeansOfType(CommandHandler.class)
            .values()
            .forEach(handler -> {
                Class<?> commandType = getCommandType(handler);
                handlers.put(commandType, handler);
            });
    }
    
    @SuppressWarnings("unchecked")
    public <T> void send(T command) {
        CommandHandler<T> handler = handlers.get(command.getClass());
        if (handler == null) {
            throw new IllegalArgumentException("No handler found for command: " + command.getClass());
        }
        handler.handle(command);
    }
}

public interface CommandHandler<T> {
    void handle(T command);
}

@Component
public class CreateOrderCommandHandler implements CommandHandler<CreateOrderCommand> {
    private final OrderRepository repository;
    private final EventPublisher eventPublisher;
    
    @Override
    @Transactional
    public void handle(CreateOrderCommand command) {
        Order order = Order.create(command);
        repository.save(order);
        
        eventPublisher.publish(new OrderCreatedEvent(order.getId(), order.getCustomerId()));
    }
}
```

__Query Bus__:

```java
@Component
public class QueryBus {
    private final ApplicationContext applicationContext;
    private final Map<Class<?>, QueryHandler> handlers = new HashMap<>();
    
    @SuppressWarnings("unchecked")
    public <T, R> R send(T query) {
        QueryHandler<T, R> handler = handlers.get(query.getClass());
        if (handler == null) {
            throw new IllegalArgumentException("No handler found for query: " + query.getClass());
        }
        return handler.handle(query);
    }
}

public interface QueryHandler<T, R> {
    R handle(T query);
}

@Component
public class GetOrderQueryHandler implements QueryHandler<GetOrderQuery, OrderView> {
    private final OrderViewRepository repository;
    
    @Override
    public OrderView handle(GetOrderQuery query) {
        return repository.findById(query.getOrderId())
            .orElseThrow(() -> new OrderNotFoundException(query.getOrderId()));
    }
}
```