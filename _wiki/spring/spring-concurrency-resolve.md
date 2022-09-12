---
layout  : wiki
title   : Concurrency resolution
summary : 동시성 이슈 해결방법
date    : 2022-08-07 00:02:32 +0900
updated : 2022-08-07 00:15:24 +0900
tag     : spring
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

## Lock

> Database 에서 제공하는 Lock 을 활용하여 Race Condition 을 해결할 수 있다.

- __Optimistic lock__
  - 실제로 lock 을 걸지 않고 버전(version column)을 이용함으로써 정합성을 맞추는 방법
  - 먼저 데이터를 읽은 후에 update 를 수행할 대 현재 내가 읽은 버전이 맞는지 확인하여 업데이트
  - 내가 읽은 버전에서 수정사항이 생겼을 경우에는 application 에서 다시 읽은 후에 작업을 수행해야 함
- __Pessimistic lock__
  - 실제로 데이터에 lock 을 걸어서 정합성을 맞추는 방법. exclusive lock 을 걸게 되면 다른 트랜잭션에서는 lock 이 해제되기 전에 데이터를 가져갈 수 없음. Deadlock 이 걸릴 수 있기 때문에 주의하여 사용해야 함
  - 다른 트랜잭션이 특정 row 의 lock 을 얻는 것을 방지
    - A 트랜잭션이 끝날 때 까지 기다렸다가 B 트랜잭션이 lock 을 획득
  - 특정 row 를 update 하거나 delete 할 수 있음
  - 일반 select 는 별다른 lock 이 없기 때문에 조회 가능
- __Named lock__
  - 이름을 가진 metadata locking
  - 이름과 함께 lock 을 획득. 해당 lock 은 다른 세션에서 획득 및 해제가 불가능
  - 주의할 점은 transaction 이 종료될 때 lock 이 자동으로 해제되지 않음. 별도의 명령어로 해제를 수행해주거나 선점시간이 끝나야 해제가 됨

## Links

- [재고시스템으로 알아보는 동시성 이슈 해결방법](https://www.inflearn.com/course/%EB%8F%99%EC%8B%9C%EC%84%B1%EC%9D%B4%EC%8A%88-%EC%9E%AC%EA%B3%A0%EC%8B%9C%EC%8A%A4%ED%85%9C/dashboard)
- [concurrency stock source code](https://github.com/BAEKJungHo/concurrency-stock)
- [https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_exclusive_lock](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_exclusive_lock)
- [https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html)
- [https://dev.mysql.com/doc/refman/8.0/en/locking-functions.html](https://dev.mysql.com/doc/refman/8.0/en/locking-functions.html)
