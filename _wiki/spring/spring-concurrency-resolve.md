---
layout  : wiki
title   : Concurrency resolution
summary : 동시성 이슈 해결방법
date    : 2022-08-07 00:02:32 +0900
updated : 2022-08-07 00:15:24 +0900
tag     : spring concurrency redis lock
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

- __Prerequisite__
  - [Concurrency](https://baekjungho.github.io/wiki/spring/spring-concurrency/)

## Race Condition

> 경쟁 상태란 두 개 이상의 스레드가 공유 데이터에 액세스할 수있고, 동시에 변경을 하려고 할 때 발생하는 문제이다. 다수의 프로세스 혹은 쓰레드가 동기화 없이 공유 자원에 접근하여 값을 변경하려는 현상을 의미한다.

예를 들어, 물품의 재고를 감소하는 로직을 100개의 스레드가 동시에 요청하여 실행하는 경우, 동시성 이슈를 고려하여 설계하지 않는다면 데이터베이스에서 경쟁 상태가 발생할 수 있다. 

- __Race Condition 이 발생하는 과정__

```idle
# 초기 재고 10
1. Thread-A 가 재고 조회 Query 수행 (findById) -- 재고 10
2. Thread-B 가 재고 조회 Query 수행 (findById) -- 재고 10
3. Thread-A 가 재고 감소 로직 수행 및, DB Update -- 재고 9
4. Thread-B 가 재고 감소 로직 수행 및, DB Update -- 재고 9

# 결과
동시성 이슈로 인해 재고 갱신이 누락됨
```

이를 해결하기 위해서는 __데이터에 하나의 스레드만 접근하도록(동기화, synchronized)__ 로직을 작성해야 한다.

### in databases

데이터베이스에서의 경쟁상태 예시를 하나 더 보자. 예를 들어 다음과 같은 쿼리가 있다고 가정하자.

```sql
-- 현재 PK 의 최댓값에 1을 더해 새로운 PK 로 사용 
SELECT MAX(PK) + 1 AS NEXT_PK FROM USER;
```

이러한 방식은 두 개의 클라이언트가 동시에 쿼리를 실행할 수 있다면 안전하지 않다. 두 클라이언트에서 같은 값을 사용하게 될 수도 있기 때문이다. 

이러한 문제를 `시퀀스(Sequence)`를 사용하여 해결할 수 있다.

시퀀스(Sequence)는 트랜잭션 범위 밖에서 동작해 이 문제를 해결한다. 시퀀스는 여러 클라이언트에 절대 같은 값을 할당하지 않고, 삽입할 행에 사용한 값을 커밋했는지 여부와 상관없이 한 번 할당한 값을 되돌리지도 못한다. 시퀀스는 이런 식으로 동작하기 때문에, 여러 클라이언트가 동시에 유일한 값을 할당받을 수 있고 중복된 값을 할당 받지 않는다고 확신할 수 있다.

다른 클라이언트가 동시에 자신이 사용할 값을 생성하더라도, 시퀀스가 생성한 마지막 값을 확인할 수 있는 함수는 현재 세션에서 생성한 마지막 값을 리턴하므로 경쟁 상태가 없다.

## Synchronized

Java 에서는 synchronized 키워드를 사용하여 공유 자원에 하나의 스레드만 접근 가능하도록 해준다.

### @Transactional + synchronized

@Transactional 과 synchronized 를 같이 사용하게되면 똑같이 경쟁상태가 발생한다.  그 이유는 @Transactional 을 사용하면스프링은 DI 대상인 필드(클래스)를 새로 만들어서 사용한다.

```java
// Race Condition 이 발생할 수 있는 코드
@Transactional
public synchronized void decrease(Long id, Long quantity) {
    Stock stock = stockRepository.findById(id).orElseThrow();
    stock.decrease(quantity);
    stockRepository.saveAndFlush(stock);
}
```

```java
@Service
public class TransactionStockService {

    private final StockService stockService;

    public TransactionStockService(StockService stockService) {
        this.stockService = stockService;
    }

    public void decrease(Long id, Long quantity) {
        startTransaction();
        stockService.decrease(id, quantity);
        endTransaction();
    }
    
    public void startTransaction() {}
  
    public void endTransaction() {}
}
```

즉, 위 코드에서는 StockService 가 새로 생성되어 실행된다. 그리고 __트랜잭션이 끝나는 시점(endTransaction 이 끝난 시점)에 값이 DB 에 반영__ 된다. __따라서 실제로 값이 DB 에 반영되기 전까지의 시간이 있기 때문에__ 값이 갱신되기 전, 다른 스레드가 stockService.decrease() 를 실행할 수 있게 되며, 갱신 되기 전의 값을 가져가기 때문에 경쟁상태가 발생한다.

### synchronized + saveAndFlush

@Transactional 과 synchronized 를 같이 사용했을때 경쟁상태가 발생할 수 있다는 점을 배웠다. 이를 해결하기 위한 방법은 
`synchronized + saveAndFlush` 를 같이 사용하는 것이다.

```java
// Race Condition 이 발생하지 않는 코드
// decrease 메서드가 트랜잭션으로 묶여있지 않기 때문에, saveAndFlush 호출하는 시점에 값이 DB 에 갱신 됨
public synchronized void decrease(Long id, Long quantity) {
    Stock stock = stockRepository.findById(id).orElseThrow();
    stock.decrease(quantity);
    stockRepository.saveAndFlush(stock);
}
```

- __flush__
  - DB 에 값이 저장되기 위해선 영속성 컨텍스트에 있는 값이 트랜잭션에 의해서 커밋(commit) 되어야 한다.
  - flush 는 영속성 컨텍스트의 변경 내용을 DB 에 동기화하는 것을 의미한다.
- __saveAndFlush()__
  - Unlike save(), the saveAndFlush() method flushes the data immediately during the execution
  - Commit 을 하는게 아니라 실행중에 즉시 data 를 flush 한다.
  - @Transactional 과 같이 사용한다면 repository.saveAndFlush() 를 호출하는 시점에 값이 바로 DB 에 반영되지 않는다.

### synchronized 문제점

- synchronized 는 하나의 프로세스 안에서만 보장됨. 따라서, 서버가 1대일 때는 문제 없지만, 서버가 여러대라면 문제가 발생할 수 있음
- synchronized 는 2대이상의 서버를 사용할 때 문제가 발생할 수 있으므로 실무에서는 거의 사용되지 않음
- 사용되는 경우는 서버가 1대로만 운영이 되거나, 서버내에서만 정합성이 보장되면 될 때 사용

## Lock

> Database 에서 제공하는 Lock 을 활용하여 Race Condition 을 해결할 수 있다.

- __Pessimistic Lock__
  - 실제로 데이터에 lock 을 걸어서 정합성을 맞추는 방법. exclusive lock 을 걸게 되면 다른 트랜잭션에서는 lock 이 해제되기 전에 데이터를 가져갈 수 없음. Deadlock 이 걸릴 수 있기 때문에 주의하여 사용해야 함
  - 실제로 Lock 을 걸기 때문에 성능 이슈가 있을 수 있음
  - 다른 트랜잭션이 특정 row 의 lock 을 얻는 것을 방지
    - A 트랜잭션이 끝날 때 까지 기다렸다가 B 트랜잭션이 lock 을 획득
  - 특정 row 를 update 하거나 delete 할 수 있음
  - 일반 select 는 별다른 lock 이 없기 때문에 조회 가능
- __Optimistic Lock__
  - 실제로 lock 을 걸지 않고 버전(version column)을 이용함으로써 정합성을 맞추는 방법
  - 별도의 lock 을 걸지 않기 때문에 Pessimistic Lock 보다 성능상 이점이 있음. 단점으로는 업데이트가 실패했을 때 재시도 로직을 개발자가 직접 작성해야 함. 또한 충돌이 빈번하게 일어나거나 그렇게 예상 되면 Pessimistic Lock 이 더 좋을 수 있음
  - 먼저 데이터를 읽은 후에 update 를 수행할 대 현재 내가 읽은 버전이 맞는지 확인하여 업데이트
  - 내가 읽은 버전에서 수정사항이 생겼을 경우에는 application 에서 다시 읽은 후에 작업을 수행해야 함
- __Named Lock__
  - 이름을 가진 metadata locking
  - 이름과 함께 lock 을 획득. 해당 lock 은 다른 세션에서 획득 및 해제가 불가능
  - Pessimistic Lock 은 Stock 자체에 Lock 을 걸었다면, Named Lock 은 별도 Lock 이라는 공간을 통해서 Lock 을 설정
  - 주의할 점은 transaction 이 종료될 때 lock 이 자동으로 해제되지 않음. 별도의 명령어로 해제를 수행해주거나 선점시간이 끝나야 해제가 됨
  - Named Lock 사용 시 데이터 소스를 분리(Ex. JDBCTemplate 등) 해야 함. 데이터소스를 분리하지않고 하나로 사용하게되면 커넥션풀이 부족해지는 현상을 겪을 수 있어서 락을 사용하지 않는 다른서비스까지 영향을 끼칠 수 있음

### Pessimistic Lock

- __Spring Data Jpa 에서 제공하는 @Lock 어노테이션 사용__

```java
public interface StockRepository extends JpaRepository<Stock, Long> {

    @Lock(value = LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Stock s where s.id=:id")
    Stock findByIdWithPessimisticLock(@Param("id") Long id);
}
```

- __@Transactional + saveAndFlush + Pessimistic lock__

```java
@Transactional
public void decrease(Long id, Long quantity) {
    Stock stock = stockRepository.findByIdWithPessimisticLock(id);
    stock.decrease(quantity);
    stockRepository.saveAndFlush(stock);
}
```

- __Test Code__

```java
@Test
void requests_100_at_the_same_time() throws InterruptedException {
    int threadCount = 100;
    ExecutorService executorService = Executors.newFixedThreadPool(32);
    CountDownLatch latch = new CountDownLatch(threadCount);

    for (int i = 0; i < threadCount; i++) {
        executorService.submit(() -> {
            try {
                stockService.decrease(1L, 1L);
            } finally {
                latch.countDown();
            }
        });
    }

    latch.await();

    Stock stock = stockRepository.findById(1L).orElseThrow();
    assertEquals(0L, stock.getQuantity());
}
```

- __Console 에 찍힌 쿼리 로그__

```sql
-- for update 구문이 추가됨
select stock0_.id as id1_0_, stock0_.product_id as product_2_0_, stock0_.quantity as quantity3_0_ from stock stock0_ where stock0_.id=? for update
```

### Optimistic Lock

- __Optimistic Lock 을 사용하기 위해서 Entity 에 Version Column 을 추가__

```java
@Entity
public class Stock {
    // 생략 
  
    @Version
    private Long version;
}
```

- __Spring Data Jpa 에서 제공하는 @Lock 어노테이션 사용__

```java
public interface StockRepository extends JpaRepository<Stock, Long> {
    @Lock(value = LockModeType.OPTIMISTIC)
    @Query("select s from Stock s where s.id = :id")
    Stock findByIdWithOptimisticLock(@Param("id") Long id);
}
```

- __실패 시 재시도를 위한 로직 작성__

```java
@Service
public class OptimisticLockStockFacade {

  private final OptimisticLockStockService optimisticLockStockService;

  public OptimisticLockStockFacade(OptimisticLockStockService optimisticLockStockService) {
    this.optimisticLockStockService = optimisticLockStockService;
  }

  // 실패 시 재시도 로직은, 어떻게 구현할 것인지 정책에 따라 달라질 수 있다.
  // Ex. 3번만 재시도 등
  public void decrease(Long id, Long quantity) throws InterruptedException {
    while (true) {
      try {
        optimisticLockStockService.decrease(id, quantity);

        break;
      } catch (Exception e) {
        Thread.sleep(50);
      }
    }
  }
}
```

- __Console 에 찍힌 쿼리 로그__

```sql
-- where 조건에 version 이 추가됨
update stock set product_id=?, quantity=?, version=? where id=? and version=?
```

### Named Lock

- __Query 작성__

```java
public interface LockRepository extends JpaRepository<Stock, Long> {
    @Query(value = "select get_lock(:key, 3000)", nativeQuery = true)
    void getLock(@Param("key") String key);

    @Query(value = "select release_lock(:key)", nativeQuery = true)
    void releaseLock(@Param("key") String key);
}
```

- __부모 트랜잭션 로직 작성__

```java
@Component
public class NamedLockStockFacade {

  private final LockRepository lockRepository;

  private final NamedLockStockService stockService;

  public NamedLockStockFacade(LockRepository lockRepository, NamedLockStockService stockService) {
    this.lockRepository = lockRepository;
    this.stockService = stockService;
  }

  public void decrease(Long id, Long quantity) {
    try {
      lockRepository.getLock(id.toString());
      stockService.decrease(id, quantity);
    } finally {
      lockRepository.releaseLock(id.toString());
    }
  }
}
```

- __StockService 로직 작성__

```java
@Service
public class NamedLockStockService {

    private final StockRepository stockRepository;

    public NamedLockStockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    /**
     * 부모의 트랜잭션과 동일한 범위로 묶인다면 Database 에 commit 되기 전에 Lock 이 풀리는 현상이 발생함
     * 그렇기 때문에 별도의 트랜잭션으로 분리하여 Database 에 commit 이 된 후, Lock 을 해제하도록 함
     * 즉, Propagation.REQUIRES_NEW 설정을 통해, Lock 을 해제하기 전에 Database 에 commit 이 되도록 함
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void decrease(Long id, Long quantity) {
        Stock stock = stockRepository.findById(id).orElseThrow();
        stock.decrease(quantity);
        stockRepository.saveAndFlush(stock);
    }
}
```

- __Console 에 찍힌 쿼리 로그__

```sql
select get_lock(?, 3000)
select release_lock(?)
```

## Distributed Lock

### Lettuce

- setnx(SET IF NOT EXIST, KEY 와 VALUE 를 SET 할 때 기존에 값이 없을 때만 SET) 명령어를 활용하여 분산락 구현
- Spin Lock 방식
  - Retry 로직을 개발자가 작성해야 함
  - Lock 에 타임아웃이 지정되지 않아서 락을 획득하지 못하면 무한 루프를 돌게 됨. 따라서 일정 시간이 지나면 락이 만료되도록 구현해야 함. 그래서 락을 획득하는 최대 허용시간을 정해주거나, 최대 허용 횟수를 정해주는 것이 좋음. 만약 락을 획득하는데에 실패한다면 연산을 수행할 수 없는 상태이기에 Exception 을 던짐
  - Lock 을 획득하려는 스레드가 Lock 을 사용할 수 있는 반복적으로 확인하면서 Lock 획득(acquire)을 시도하는 방식
      1. Thread-A 가 setnx 로 lock 획득  
      2. Thread-B 가 setnx 로 lock 획득 시도 -> 실패 -> 락을 획득할 때 까지 일정시간(Ex. 100ms) 후 재시도
  - 단점은 Lock 을 획득하려고 계속 시도하기 때문에 트래픽이 증가하고, 요청/응답시간이 늘어남

### Redisson

- redisson-spring-boot-starter Library 를 별도로 추가해야 함
- pubsub 기반 으로 Lock 구현 제공(Spin Lock 사용 X)
  - channel 을 하나 만들고, Lock 을 점유 중인 스레드가 Lock 을 획득하려고 대기중인 스레드에게 해제를 알려주면, 안내를 받은 스레드가 Lock 획득을 시도하는 방식
  - pubsub 기능을 사용해 Spin Lock 이 레디스에 주는 엄청난 트래픽을 줄임
- tryLock 메서드에 타임아웃을 명시하도록 되어있음
  - ```java
    // RedissonLock 의 tryLock 메소드 시그니처
    // @Param waitTIme 락 획득을 대기할 타임아웃
    // @Param leaseTime 락이 만료되는 시간
    public boolean tryLock(long waitTime, long leaseTime, TimeUnit unit) throws InterruptedException
    ```
  - waitTime 만큼의 시간이 지나면 false 가 반환되며 락 획득에 실패했다고 알려줌
  - leaseTime 만큼의 시간이 지나면 락이 만료되어 사라지기 때문에 애플리케이션에서 락을 해제해주지 않아도 다른 스레드 혹은 애플리케이션에서 락을 획득할 수 있음. 따라서 무한 루프에 빠질 위험이 사라짐
- __Redisson Lock 획득 프로세스__
  - 대기 없는 tryLock 오퍼레이션을 하여 락 획득에 성공하면 true 반환. 이는 경합이 없을 때 아무런 오버헤드 없이 락을 획득할 수 있도록 해줌
  - pubsub 을 이용하여 메시지가 올 때까지 대기하다가 락이 해제되었다는 메시지가 오면 대기를 풀고 다시 락 획득을 시도. 락 획득에 실패하면 다시 락 해제 메시지를 기다림. 이 프로세스를 타임아웃시까지 반복함
  - 타임아웃이 지나면 최종적으로 false 를 반환하고 락 획득에 실패했음을 알림. 대기가 풀릴 때 타임아웃 여부를 체크하므로 타임아웃이 발생하는 순간은 파라미터로 넘긴 타임아웃시간과 약간 차이가 있을 수 있음
- __실무에서는__
  - 재시도가 필요하지 않은 Lock 은 Lettuce 사용
  - 재시도가 필요한 경우에는 Redisson 사용

### @DistributedLock

> AOP + Custom Annotation + Reflection + Redisson 을 사용하여 분산락을 구현할 수 있다.

- __고려 사항__
  - 선착순 콘서트 티켓 100장을 판매하려함

#### CustomAnnotation

```kotlin
@Target(AnnotationTarget.TYPE, AnnotationTarget.FUNCTION)
@Retention
annotation class DistributedLock(
    val fieldName: String = ""
)
```

#### AOP 설정

- __Config__
  - spring-boot-starter-aop dependency 
  - @EnableAspectJAutoProxy 
  - @Aspect 
  - @Component(or component scan 가능한 어노테이션 사용)

```kotlin
@Component
@EnableAspectJAutoProxy
@Aspect
class DistributedLockAdvice {

  private val log = LoggerFactory.getLogger(this::class.java)

  @Around("execution(* org.ticket.server..controller..*Controller.*(..))")
  fun invoke(point: ProceedingJoinPoint): Any {
      val methodSignature = point.getSignature() as MethodSignature
      val method = methodSignature.getMethod()
      val payload = point.getArgs()?.[0]
      val lockAnnotation = method.getDeclaredAnnotation(DistributedLock::class.java)

      val acquireLock = lockAnnotation?.let {
          lock = getLock(payload, lockAnnotation.fieldName)
      }
    
      if (acquireLock != null) {
          // TODO tryLock implementation
      }
    
      return try {
          point.proceed()
      } finally {
          if (acquireLock != null && acquireLock.isLocked()) {
              try {
                  acquireLock.forceUnlock()
              } catch(e: Exception) {
                  log.error(e.message)
              }
          }
      }
  }

  private fun getLock(payload: Any?, fieldName: String): RLock? {
      if (payload == null) {
          return null   
      }
    
      val field = getField(payload.javaClass, fieldName)
      field.setAccessible(true)
      val value = field.get(request)?.toString() ?: null
    
      return redisClient.getLock(value)
  }
  
  private fun getField(payload: Any, fieldName: String) {
      // TODO Reflection 
  }
}
```

#### Controller

```kotlin
class TicketDto {
    data class OrderRequest(
      private val convertId: Long,
      private val dateTime: LocalDateTime
    )

    data class CancelRequest(
      private val convertId: Long,
      private val ticketId: Long,
      private val dateTime: LocalDateTime
    )
}

// 예매
@DistributedLock(fieldName = "concertId")
fun cancel(@RequestBody request: TicketDto.OrderRequest) {
  // TODO implementation
}

// 예매 취소
@DistributedLock(fieldName = "concertId")
fun cancel(@RequestBody request: TicketDto.CancelRequest) {
    // TODO implementation
}
```

### Test

```java
@SpringBootTest
class DistributedLockTest {

    @Autowired private RedisClient redisClient;

    static class ThreadConstraints {
        private static final int THREAD_COUNT = 10;
        private static final int THREAD_POOL = 5;
        private static final int COMPLETE_TASK_DURATION_MILLIS_TIME = 2000;
    }

    static class LockConstraints {
        private static final String LOCK_ID = "ticketId";
        private static final int WAIT_TIME = 60;
        private static final int LEASE_TIME = 5;
        private static final TimeUnit TIME_UNIT = TimeUnit.SECONDS;
    }

    @Test
    void tryLock() throws InterruptedException {
        ExecutorService executorService = Executors.newFixedThreadPool(ThreadConstraints.THREAD_POOL);
        CountDownLatch countDownLatch = new CountDownLatch(ThreadConstraints.THREAD_COUNT);

        for (int i = 0; i < ThreadConstraints.THREAD_COUNT; i++) {
            int index = i;
            executorService.submit(() -> {
                try {
                    proceedTask(index);
                } finally {
                    countDownLatch.countDown();
                }
            });
        }

        countDownLatch.await();
    }

    private void proceedTask(int index) {
        log.info("Index{} - Current Thread Name {}", index, Thread.currentThread().getName());
        RLock acquireLock = redisClient.getLock(LockConstraints.LOCK_ID);
        boolean isAcquisitionFailure = false;
        try {
            isAcquisitionFailure = !acquireLock.tryLock(
                    LockConstraints.WAIT_TIME, 
                    LockConstraints.LEASE_TIME,
                    LockConstraints.TIME_UNIT
            );
            log.info("Index{} - isAcquisitionFailure {}", index, isAcquisitionFailure);
            if (isAcquisitionFailure) {
                log.info("Index{} - AcquisitionFailure {}", index, Thread.currentThread().getName());
                throw new Exception();
            } else {
                // Acquisition Lock
                log.info("Index{} - Acquisition Lock and Task Proceeding", index);
                Thread.sleep(ThreadConstraints.COMPLETE_TASK_DURATION_MILLIS_TIME);
                log.info("Index{} - Task Completed", index);
            }
        } catch (InterruptedException e) {
            log.info("Index{} - InterruptedException Occur. stackTrace : {}", index, e.getMessage());
        } finally {
            // After All The Processes are finished then Unlock
            if (!isAcquisitionFailure && acquireLock.isLocked()) {
                log.info("Index{} - forceUnlock", index);
                acquireLock.forceUnlock();
            }
        }
    }
}
```

1. ThreadPool 에 1,2,3,4,5 스레드가 초기에 할당되고 1이 락을 획득
2. 1의 Task 가 완료되고 락을 해제한 다음, 스레드 6이 스레드 풀에 진입
3. 2,3,4,5,6 상태에서 기존에 있던 2,3,4,5 중 하나의 스레드가 락을 획득하길 예상했지만 예상과 달리 스레드 6이 락을 선점

이 결과로 미루어보아, 스레드 풀에 먼저들어온 순서대로 락을 획득하는 것은 아닌 것 같음. 경우에 따라서는 락을 먼저 획득해야하는 스레드에 우선순위를 높게 줘서, 순서와 상관없이 스레드 풀에 존재하고, 아직 락을 획득하지 못한 상태라면 락이 해제되고 해당 스레드가 락을 획득할 수 있도록 해주는 방법도 있을 것 같음.

## MySQL vs Redis

- __MySQL__
  - 이미 MySQL 을 사용하고 있다면 별도의 비용 없이 사용 가능
  - Redis 보다는 성능이 좋지 않음
- __Redis__
  - 활용 중인 Redis 가 없다면 별도의 구축비용과 인프라 관리비용이 발생함
  - In Memory DB 이기 때문에 MySQL 보다 성능이 좋아서 더 많은 요청을 처리함

## Links

- [재고시스템으로 알아보는 동시성 이슈 해결방법](https://www.inflearn.com/course/%EB%8F%99%EC%8B%9C%EC%84%B1%EC%9D%B4%EC%8A%88-%EC%9E%AC%EA%B3%A0%EC%8B%9C%EC%8A%A4%ED%85%9C/dashboard)
- [Concurrency and Locking With JPA: Everything You Need to Know](https://dzone.com/articles/concurrency-and-locking-with-jpa-everything-you-ne)
- [https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_exclusive_lock](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_exclusive_lock)
- [https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html)
- [https://dev.mysql.com/doc/refman/8.0/en/locking-functions.html](https://dev.mysql.com/doc/refman/8.0/en/locking-functions.html)
- [Pessimistic Locking in JPA](https://www.baeldung.com/jpa-pessimistic-locking)
- [Optimistic Locking in JPA](https://www.baeldung.com/jpa-optimistic-locking)
- [Hyperconnect Redis Distributed Lock](https://hyperconnect.github.io/2019/11/15/redis-distributed-lock-1.html)
- [Redisson](https://github.com/redisson/redisson/wiki/Table-of-Content)
- [Talking about Several Ways of Using Distributed Locks](https://developpaper.com/talking-about-several-ways-of-using-distributed-locks-redis-zookeeper-database/)
- [JPA entity versioning (@Version and Optimistic Locking)](https://www.byteslounge.com/tutorials/jpa-entity-versioning-version-and-optimistic-locking)
- [Locking in JPA (LockModeType)](https://www.byteslounge.com/tutorials/locking-in-jpa-lockmodetype)
- [Read/Write Locks in Java (ReentrantReadWriteLock)](https://www.byteslounge.com/tutorials/read-write-locks-in-java-reentrantreadwritelock)
- [Lock Conditions in Java](https://www.byteslounge.com/tutorials/lock-conditions-in-java)
- [Distributed Java Locks With Redis](https://dzone.com/articles/distributed-java-locks-with-redis)
- [Distributed Lock Implementation With Redis](https://dzone.com/articles/distributed-lock-implementation-with-redis)
- [About Redisson Lock](https://www.sobyte.net/post/2021-08/about-redisson-lock/)
- [Distributed locks and synchronizers](https://github.com/redisson/redisson/wiki/8.-Distributed-locks-and-synchronizers)
- [Why Do We Need Thread.currentThread().interrupt() in Interruptible Methods](https://dzone.com/articles/why-do-we-need-threadcurrentthreadinterrupt-in-int)
- [The Redlock Algorithm](https://redis.io/docs/reference/patterns/distributed-locks/#the-redlock-algorithm)