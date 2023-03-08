---
layout  : wiki
title   : TransactionManager
summary : 스프링 트랜잭션 매니저
date    : 2022-10-22 21:28:32 +0900
updated : 2022-10-22 22:15:24 +0900
tag     : spring database
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## TransactionManager

[Transaction Management](https://docs.spring.io/spring-framework/docs/4.2.x/spring-framework-reference/html/transaction.html)

> Marker interface for Spring transaction manager implementations, either __traditional__ or __reactive__.

```java
public interface TransactionManager {
}
```

org.springframework.transaction Hierarchy:
- ![](/resource/wiki/spring-transactionmanager/hierarchy.png)

## How to find TransactionManager Bean by Spring

If you don't specify the transaction manager, the Spring framework will look for a default transaction manager to use. The default transaction manager is typically a bean with the name "transactionManager", so if you have defined a transaction manager bean with this name, it will be used by default.

If you have not defined a transaction manager bean with the name "transactionManager", Spring will try to create a transaction manager using the following steps:
- Look for a single bean of type PlatformTransactionManager in the application context. If there is exactly one such bean, it will be used as the default transaction manager.
- If there is no single bean of type PlatformTransactionManager, Spring will look for a single bean of type DataSource. If there is exactly one such bean, it will create a DataSourceTransactionManager using that DataSource as the default transaction manager.
- If there is no single bean of type PlatformTransactionManager or DataSource, Spring will throw an exception indicating that it could not find a default transaction manager.

- So, if you have not defined a transaction manager bean with the name "fmsTransactionManager" in your code and you haven't defined a default transaction manager bean with the name "transactionManager" either, then Spring will use the above steps to try to find a default transaction manager.

## PlatformTransactionManager

- __PlatformTransactionManager__: 트랜잭션 경계를 지정하는데 사용

```java
public interface PlatformTransactionManager extends TransactionManager {
    TransactionStatus getTransaction(@Nullable TransactionDefinition definition) throws TransactionException;
    void commit(TransactionStatus status) throws TransactionException;
    void rollback(TransactionStatus status) throws TransactionException;
}
```

- __TransactionDefinition__: 트랜잭션의 네 가지 속성을 나타내는 인터페이스
- __TransactionStatus__: 현재 참여하고 있는 트랜잭션의 ID 와 구분정보를 담고 있음. 커밋 or 롤백 시에 TransactionStatus 사용

### DataSourceTransactionManager

- Connection 의 트랜잭션 API 를 이용해서 트랜잭션을 관리함
- DataSource 가 스프링의 빈으로 등록돼야 함

DataSourceTransactionManager 가 사용할 DataSource 는 getConnection() 이 호출될 때마다 매번 새로운 Connection 을 돌려줘야 한다. ThreadLocal 등을 이용해 트랜잭션을 저장해두고 돌려주는 특별한 DataSource 를 사용하면 안된다. 애플리케이션 코드에서 트랜잭션 매니저가 관리하는 Connection 을 가져오려면 DataSource 의 getConnection() 이 아닌 스프링의 DataSourceUtils 클래스의 getConnection(DataSource) 를 통해 가져와야 한다.

### JpaTransactionManager

- JPA 사용하는 경우 JpaTransactionManager 사용
- JtaTransactionManager 를 사용하는 경우에는 필요 없음 

### JtaTransactionManager

하나 이상의 DB 또는 트랜잭션 리소스가 참여하는 글로벌 트랜잭션을 적용하려면 JTA 를 이용해야 한다. JTA 는 여러 개의 트랜잭션 리소스(DB, JMS 등)에 대한 작업을 하나의 트랜잭션으로 묶을 수 있고, 여러 대의 서버에 분산되어 진행되는 작업을 트랜잭션으로 연결해 주기도 한다.

- __Related Articles__
  - [Distributed Transactions with JTA](https://docs.spring.io/spring-boot/docs/2.1.13.RELEASE/reference/html/boot-features-jta.html)
  - [분산 데이터베이스 환경에서 RoutingDataSource 사용 시 JTA 를 이용한 트랜잭션 처리](https://d2.naver.com/helloworld/5812258)
  - [XA Transactions (2 Phase Commit): A Simple Guide - DZone](https://dzone.com/articles/xa-transactions-2-phase-commit)
  - [XA transactions using Spring](https://www.infoworld.com/article/2077714/xa-transactions-using-spring.html)

JTA 트랜잭션을 이용하려면 트랜잭션 서비스를 제공하는 WAS 를 이용하거나 독립 JTA 서비스를 제공해주는 프레임워크를 사용해야 한다.

JtaTransactionManager 를 사용할 때는 DataSource 도 서버에 등록된 XA DataSource 를 사용해야 한다. JNDI 를 이용해 XA DataSource 를 다음과 같이 빈으로 등록하고 DAO 나 EntityManagerFactory, SessionFactory 등에서 사용하게 해야 한다.

```
<jee:jndi-lookup id="dataSource" jndi-name="jdbc/myXADataSource"/>
```

## ReactiveTransactionManager

```java
public interface ReactiveTransactionManager extends TransactionManager {
    Mono<ReactiveTransaction> getReactiveTransaction(@Nullable TransactionDefinition definition) throws TransactionException;
    Mono<Void> commit(ReactiveTransaction transaction) throws TransactionException;
    Mono<Void> rollback(ReactiveTransaction transaction) throws TransactionException;
}
```

Kotlin Coroutine 을 사용 중이라면 WebMVC + JDBC 스택이 아닌 WebFlux + R2DBC 스택을 사용해야 Reactive Transaction 을 지원받을 수 있다.

Coroutines are leveraging the Reactive transaction support, as a consequence they are not designed to work with thread-bound transactions. So Coroutines transactions should be used with WebFlux and R2DBC, not WebMVC and JDBC.

## Links

- [TransactionManager Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/TransactionManager.html)
- [Reactive Transactions with Spring](https://spring.io/blog/2019/05/16/reactive-transactions-with-spring)
- [Coroutines are leveraging the Reactive transaction support](https://github.com/spring-projects/spring-framework/issues/26705)
- [Declarative transaction management](https://docs.spring.io/spring-framework/docs/3.0.0.M3/reference/html/ch11s05.html)

## References

- 토비의 스프링 3 / 이일민 저 / 에이콘 출판사