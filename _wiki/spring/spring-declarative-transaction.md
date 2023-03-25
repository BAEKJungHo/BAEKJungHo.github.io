---
layout  : wiki
title   : Declarative Transaction with Proxy
summary : 
date    : 2022-08-21 21:28:32 +0900
updated : 2022-08-21 22:15:24 +0900
tag     : spring database jpa proxy
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Declarative Transaction

[Declarative transaction management](https://docs.spring.io/spring-framework/docs/3.0.0.M3/reference/html/ch11s05.html):
- The Spring Framework's declarative transaction management is made possible with Spring AOP
- The most important concepts to grasp with regard to the Spring Framework's declarative transaction support are that this support is enabled via __AOP proxies__, and that the transactional advice is driven by metadata (currently XML- or annotation-based). The combination of AOP with transactional metadata yields an AOP proxy that uses a [TransactionInterceptor](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/interceptor/TransactionInterceptor.html) in conjunction with an appropriate PlatformTransactionManager implementation to drive transactions around method invocations.

Conceptually, calling a method on a transactional proxy looks like this...

![](/resource/wiki/spring-declarative-transaction/tx-proxy.png)

스프링의 선언적 트랜잭션(xml or annotation-based)은 대표적인 [AOP(Aspect Oriented Programming)](https://baekjungho.github.io/wiki/spring/spring-aop/) 중 하나이다.

__Question:__

아래 코드에서 inner-method 에서 Exception 이 발생하면 정상적으로 rollback 이 될까?

```kotlin
@Service
class TeamService(
    private val teamRepository: TeamRepository
) {

    fun outer() {
        inner() // 65 Line
    }

    @Transactional
    fun inner() {
        val team = Team(name = "sports")

        val member1 = Member(phone = "1", team = team)
        val member2 = Member(phone = "2", team = team)
        val member3 = Member(phone = "3", team = team)
        val member4 = Member(phone = "4", team = team)
        val member5 = Member(phone = "5", team = team)

        team.setMembers(member1, member2, member3, member4, member5)
        teamRepository.save(team)
        throw RuntimeException()
    }
}
```

정답은 rollback 이 되지 않고, 데이터베이스에 team 과 member 가 등록이 된다.

innerMethod 에 breakpoint 를 찍고 __callStack__ 을 확인하자.

__CallStack:__

![](/resource/wiki/spring-declarative-transaction/callstack.png)

밑에서 2번째 라인을 보면 outer:-1, TeamService$$EnhancerBySpringCGLIB$$1d75d72a (com.example.demo.service) 를 볼 수 있다. TeamService 안에 @Transactional 이 선어되어 AOP 적용을 위해서 Proxy 객체로 감싸진 모습이다. TeamService 는 Concrete Class 이므로 CGLIB 으로 생성됨을 알 수 있다.

그리고 intercept:704, CglibAopProxy$DynamicAdvisedInterceptor (org.springframework.aop.framework) 부분을 클릭해서 디버깅해서 보자.

![](/resource/wiki/spring-declarative-transaction/intercept.png)

Proxy 로 감싸진 것을 확실히 알 수 있고, 호출된 메서드는 outer 임을 알 수 있다.

그리고 invoke:218, MethodProxy (org.springframework.cglib.proxy) 이 부분을 보면 outer 메서드는 프록시 객체 내부에서 호출됨을 알 수 있다. 

그리고 맨위 inner:70 을 클릭하면, outer() 에서 inner() 를 호출함을 알 수 있다. __여기가 아주 중요한데 TeamService 가 Proxy 객체더라도, 같은 클래스 내의 outer() 에서 inner() 를 호출하는 경우는 프록시가 아니라 target method 를 직접 호출한다. 그래서 Transaction 부가 로직이 적용되지 않는다.__

```kotlin
@Service
class TeamService( // Proxy Class by CGLIB
    private val teamRepository: TeamRepository // JDKDynamicAOPProxy
) {

    fun outer() { // call proxy method
        inner() // call target method (not proxy)
    }

    @Transactional
    fun inner() {
        // If An Exception Occurs, It Is Not RollBack.
    }
}
```

이런 구조이다. outer class 는 선언적 트랜잭션이 적용되지 않았으므로, 롤백이 당연히 적용되지 않는다.

```kotlin
@Service
class TeamService( 
    private val teamRepository: TeamRepository 
) {

    @Transactional
    fun outer() { 
        inner() 
    }

    
    fun inner() {
        throw RuntimeException()
    }
}
```

위 코드에서는 outer 에 트랜잭션 부가로직이 적용되기 때문에 inner 에서 예외가 발생해도 inner, outer 모두 롤백된다.

## Exception Propagation

위에서 사용한 예제를 가지고 전파레벨 테스트를 해보자.

__@Transactional(propagation = Propagation.REQUIRES_NEW): 부모 트랜잭션과 상관없이 새로운 트랜잭션 생성__

```kotlin
@Service
class TeamService( 
    private val teamRepository: TeamRepository 
) {

    @Transactional
    fun outer() { 
        inner() 
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun inner() {
        throw RuntimeException()
    }
}
```

위 코드에서 inner() 에서 예외가 발생하면 outer() 가 롤백이 될까? 

정답은 롤백 된다. 새로운 트랜잭션을 생성할 것을 기대했지만 같은 객체 내에서 호출되기 때문에 사실상 __Propagation.REQUIRED__ 로 동작한다.  Spring Framework 에서는 같은 객체에서 호출되는 @Transactional 메서드는 하나의 트랜잭션에서 실행된다.

그러면 클래스를 분리해서 테스트해보자.

```kotlin
@Service
class TeamService( 
    private val otherService: OtherService,
    private val teamRepository: TeamRepository
) {

    @Transactional
    fun outer() {
        // Do something
        otherService.outer() 
    }
}
```
```kotlin
@Service
class OtherService( 
    private val teamRepository: TeamRepository 
) {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun outer() { 
        // Do something
        throw RuntimeException()
    }
}
```

자! OtherService 의 outer() 에서 예외가 발생하면 TeamService outer() 는 롤백이 될까 안될까? 

정답은 롤백 된다. 

먼저 JPA 를 사용하는 경우 JpaTransactionManager 를 사용할 것이다.

```java
public class JpaTransactionManager extends AbstractPlatformTransactionManager
		implements ResourceTransactionManager, BeanFactoryAware, InitializingBean { ... }
```

AbstractPlatformTransactionManager 를 살펴보자. 해당 클래스 내부에 아래와 같은 로직을 볼 수 있다.

```java
TransactionSynchronizationManager.isCurrentTransactionReadOnly();
```

TransactionSynchronizationManager 를 살펴보자. 해당 클래스의 주석 맨윗줄을 보면 다음과 같이 설명이 되어있다.

__Central delegate that manages resources and transaction synchronizations per thread.__

즉, Spring 에서 Transaction 은 ThreadLocal 을 통해 Thread 마다 관리하고 있다는 것을 알 수 있다. 커넥션은 다르더라도 스레드는 동일하다.

따라서, 서로 다른 클래스에서 @Transactional(propagation = Propagation.REQUIRES_NEW), @Transactional 와 같이 전파레벨을 줘서 사용하더라도 스레드가 같기 때문에 예외가 전파된다.

사실 이건 자바의 [Exception Propagation - Run-Time Handling of an Exception](https://docs.oracle.com/javase/specs/jls/se11/html/jls-11.html#jls-11.3) 과 연관이 있다.

Java 에서는 다음과 같은 규칙으로 예외를 처리한다.

__If no catch clause that can handle an exception can be found, then the current thread (the thread that encountered the exception) is terminated. Before termination, all finally clauses are executed and the uncaught exception is handled according to the following rules:__
- If the current thread has an uncaught exception handler set, then that handler is executed.
- Otherwise, the method `uncaughtException` is invoked for the ThreadGroup that is the parent of the current thread. If the ThreadGroup and its parent ThreadGroups do not override uncaughtException, then the default handler's uncaughtException method is invoked.

따라서, 아래 처럼 예외를 Catch 해야한다.

```kotlin
@Service
class TeamService( 
    private val otherService: OtherService,
    private val teamRepository: TeamRepository
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun outer() {
        // Do something
        try {
            otherService.outer()
        } catch(e: RuntimeException) {
            log.info("# Catch Exception")
        }
    }
}
```

혹은 @Async 를 사용하여 다른 클래스에 있는 트랜잭션을 별도의 Thread 에서 동작하게 할 수 있다.

```kotlin
@Service
class OtherService( 
    private val teamRepository: TeamRepository 
) {

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun outer() { 
        // Do something
        throw RuntimeException()
    }
}
```

## UnexpectedRollbackException

UnexpectedRollbackException 은 [응? 이게 왜 롤백되는거지?](https://techblog.woowahan.com/2606/) 에 잘 설명이 되어있다.

이제 아래 코드에서 TeamService 의 outer 가 롤백될지 안될지 맞춰보자.

```kotlin
@Service
class TeamService( 
    private val otherService: OtherService,
    private val teamRepository: TeamRepository
) {

    @Transactional
    fun outer() {
        // Do something
        try {
            otherService.outer()
        } catch(e: RuntimeException) {
            log.info("# Catch Exception")
        }
    }
}
```
```kotlin
@Service
class OtherService( 
    private val teamRepository: TeamRepository 
) {

    @Transactional
    fun outer() { 
        // Do something
        throw RuntimeException()
    }
}
```

정답은 롤백 된다. 위 처럼 코딩했을 경우 __marked as rollback-only__ 에러 메시지를 마주하게 될 것이다. __단일 스레드 내에서 참여중인 트랜잭션의 예외를 자신의 메서드에서 잡지 않고 상위로 넘길 경우 전역 롤백된다.__

AbstractPlatformTransactionManager 클래스의 아래 코드를 보면 된다.

```java
// Participating in larger transaction
if (status.hasTransaction()) {
    if (status.isLocalRollbackOnly() || isGlobalRollbackOnParticipationFailure()) {
        if (status.isDebug()) {
            logger.debug("Participating transaction failed - marking existing transaction as rollback-only");
        }
        doSetRollbackOnly(status);
    }
    else {
        if (status.isDebug()) {
            logger.debug("Participating transaction failed - letting transaction originator decide on rollback");
        }
    }
}
```

isGlobalRollbackOnParticipationFailure 메서드의 기본값은 true 이다. 즉, 참여중인 트랜잭션이 실패했을 때 __전역 롤백을 기본 정책__ 으로 하고 있다.

TeamService outer 메서드에서는 catch 를 해서 디버깅할 때 당장 에러가 안나는 것처럼 보여도 아래의 processCommit 시점에 global rollback-only 를 가지고 있어서 UnexpectedRollbackException 예외를 던진다.

```kotlin
// AbstractPlatformTransactionManager
private void processCommit(DefaultTransactionStatus status) throws TransactionException {
    
    // ...
    
    // Throw UnexpectedRollbackException if we have a global rollback-only
    // marker but still didn't get a corresponding exception from commit.
    if (unexpectedRollback) {
        throw new UnexpectedRollbackException(
                "Transaction silently rolled back because it has been marked as rollback-only");
    }
}
```

따라서, 최종으로 Console 에서 마주하는 에러는 __org.springframework.transaction.UnexpectedRollbackException: Transaction silently rolled back because it has been marked as rollback-only__ 이다.