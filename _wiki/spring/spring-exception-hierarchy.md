---
layout  : wiki
title   : Exception Hierarchy
summary :
date    : 2023-04-23 15:05:32 +0900
updated : 2023-04-23 15:15:24 +0900
tag     : spring java architecture
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Exception Hierarchy

[Exception](https://docs.oracle.com/javase/7/docs/api/java/lang/Exception.html) Format is very important in Application Architecture. 

![](/resource/wiki/spring-exception-hierarchy/exception-hierarchy.jpeg)

## Checked, UnChecked Exceptions

CheckedException 은 Spring 에서 rollback 하지 않는 것을 기본 전략으로 하고 있다. (__The Exception itself is not relevant to the transaction.__)

__CheckedException has Recoverable Mechanism__. However, in reality, when a Checked Exception occurs, it is not often possible to recover with a recovery strategy. This is especially true of SQLException.

SQLException(e.g Duplicated UniqueKey) 처럼 CheckedException 을 만나면, 더 구체적인 UncheckedException 을 발생 시켜서 정확한 정보를 전달해야 한다.

__Rollback able CheckedException in Spring:__

```java
@Transactional(rollbackFor = {SQLException.class})
public void create(Member member) throws SQLException {
    // JDBC API
}
```

## Harmful SQLException was removed

스프링 JdbcTemplate 은 SQLException(Checked Exception) 을 DataAccessException(UncheckedException) 로 포장하여 예외를 던진다.

이렇게 __예외를 전환 하는 목적__ 은 다음과 같다.

1. 런타임 예외로 포장하여 불필요한 catch/throw 를 줄여주는 것
2. 로우 레벨의 예외를 좀 더 의미 있고 추상화된 예외로 바꾸어 주는 것

대부분 스프링 API 메서드에 정의되어 있는 대부분의 예외는 런타임 예외이다.

DB 를 사용하다보면 발생할 수 있는 예외의 원인들이 다양하다. 커넥션 문제, 문법 문제, 키가 중복되는 문제 등이 있을 것이다. 문제는 DB 벤더 마다 이러한 에러의 종류와 원인들이 제각각이다. 그래서 JDBC 는 데이터 처리 중에 발생하는 다양한 예외를 SQLException 하나에 담아버린다. 즉, JDBC API 는 SQLException 한 가지만 던지도록 설계되어있다. 따라서 DB 에 독립적인 유연한 코드를 작성하기 어렵다.
 
이러한 문제를 해결하고자 스프링 JdbcTemplate 이 SQLException 을 DataAccessException 으로 예외 전환을 하는 것이다. DataAccessException 서브 클래스에서는 데이터 처리 중에 발생할 수 있는 예외들에 대해서 세분화하여 정의하고 있다. 따라서, JdbcTemplate 이 DB 의 에러 코드를 DataAccessException 계층 구조의 클래스 중 하나로 매핑해준다.
 
이러한 이유들로 인해서 JdbcTemplate 에서는 SQLException 이 사라지게 되었다.

## How to Design Exception Hierarchy

In practice, Exception Hierarchy is very important. 

__DataAccessException__:

![](/resource/wiki/spring-exception-hierarchy/dataaccessexception.png)

Exception Hierarchy 를 구성할 때 ___[DataAccessException](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/dao/DataAccessException.html)___ 을 참고하여 설계할 수 있다.

__First Step - Define common specifications for exception classes:__

```kotlin
/**
 * Top of Exception Hierarchy extends RuntimeException
 * Is not empty customErrorMsg ? customErrorMsg : errorMsg in Database
 */
abstract class CustomException: RuntimeException {

    private var errorType: ErrorType
    private var customErrorMsg: String? = null
    private var args: MutableList<Any>

    constructor(errorType: ErrorType, customErrorMsg: String? = null) {
        this.errorType = errorType
        this.customErrorMsg = customErrorMsg
        this.args = mutableListOf()
    }

    constructor(errorType: ErrorType, vararg args: Any) {
        this.errorType = errorType
        this.args = args.toMutableList()
    }

    fun getErrorType() = errorType
    fun getCustomErrorMsg() = customErrorMsg
    fun getArgs() = args
}
```

__Second Step - Create a Sub exception classes:__

```kotlin
class OutOfStockException: CustomException {

    constructor(errorType: ErrorType, vararg args: Any): super(errorType, args)

    constructor(errorType: ErrorType, customErrorMsg: String? = null) : super(errorType, customErrorMsg)
}
```

```kotlin
class DuplicatedMemberException: CustomException {

    constructor(errorType: ErrorType, vararg args: Any): super(errorType, args)

    constructor(errorType: ErrorType, customErrorMsg: String? = null) : super(errorType, customErrorMsg)
}
```

Layer 별로 DomainException, InfraException 등을 만들고 ErrorType 으로만 구분할 수도 있을 것이다. 

```kotlin
throw DomainException(ErrorType.OutOfStock)
```

위 처럼 사용할 경우 몇가지 단점이 있다.

1. 코드가 길어진다. 생성자에 항상 ErrorType 을 할당해야 한다.
2. (Important!!) 모니터링에서 불편하다.

두 번째가 정말 큰 단점이라고 생각한다.

Datadog 같은 Monitoring Tool 을 사용하는 경우 [APM(Application Performance Monitoring)](https://www.datadoghq.com/product/apm/) 에서 Exception 으로 필터링을 할 수 있다. 어떤 예외가 빈번하게 발생했는지 발생 빈도 횟수도 보여준다.

__Filtering by ErrorType:__

```
Search for: env:real error.type:org.dope.backend.server.api.base.exception.OutOfStockException
```

APM Dashboard 를 구성할 때 Issues 에서 ISSUE DETAILS 를 구성하는 항목이 Java 의 경우에는 Exception 이름이다.
따라서 예외가 세분화되어있으면 어떤 예외가 발생 빈도가 높은지 파악하기 수월하다.

### Tips

- 예외를 Layer 별로 세분화 하면 모니터링 측면에서 이점이 있으며, 코드 리뷰나 API 설계 시 의도를 명확히 전달하는 데 유리하다.
- 예외를 Layer 별로 세분화 하면 계층 간 책임이 명확히 분리되고, 비즈니스 로직과 API 응답 스펙을 독립적으로 유지할 수 있다.
- api, domain, infra 등 각 Layer 를 각각의 팀이라고 생각하자. api, infra 변경의 이유가 domain 에 영향을 주면 안된다.
- common 모듈은 보통 프로젝트 전반에서 공유되는 유틸리티와 공통 기능을 제공하기 위해 만들어지지만, 장기적으로는 모듈 간 강한 의존성과 책임 불분명이라는 문제가 발생할 수 있다. 이를 해결하려면 common 모듈을 해체하고 각 기능의 책임에 따라 더 적합한 위치로 옮기는 리팩토링이 필요하다.
- 일반적으로 ResponseCode(or ErrorType) 을 Exception 클래스의 속성에 정의하여 사용하고, ExceptionHandler 로 발생한 예외를 클라이언트 응답으로 처리하곤 하는데, 이 경우 Infra, Domain 등 모든 Layer 에서 ResponseCode 를 의존하게 된다. ResponseCode 는 Application Layer 에 속하는게 맞다. 따라서, Domain, Infra Layer 에서 정의되는 예외 클래스들은 ResponseCode 를 굳이 가지고 있지 않아도 된다. 대신 해당 예외가 발생했을 때 어떤 ResponseCode 로 보낼지에 대해서는 ExceptionHandler 에서 Mapping 해야할 것이다.

## References

- 토비의 스프링 3 / 이일민 저 / 에이콘 출판사

