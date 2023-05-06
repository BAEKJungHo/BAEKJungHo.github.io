---
layout  : wiki
title   : Dependency for Reactive, Kotlin, WebFlux 3.x with LINE
summary : Hibernate Reactive, Vert.x and Kotlin JDSL
date    : 2023-05-01 15:05:32 +0900
updated : 2023-05-01 15:15:24 +0900
tag     : reactive jpa hibernate netty
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Reactive + WebFlux 3.x with LINE

Spring WebFlux 3.x + Kotlin + Spring Data JPA + [Kotlin JDSL](https://github.com/line/kotlin-jdsl/blob/main/spring/README.md) 을 조합해서 사용하는 것이 꽤나 힘들다. 특히 Spring Boot 가 3 version 으로 올라가면서 javax to jakarta 로 명칭이 변경되었다.
[Jakarta and RFC7807 with Spring Boot 3.0+](https://baekjungho.github.io/wiki/spring/spring-jakarta/) 따라서 Kotlin 에서 all-open 을 설정할 때에도 javax 가 아닌 jakarta 로 변경해야 한다.

Kotlin JDSL 을 만드신 개발자분의 [Examples](https://github.com/cj848/kotlin-jdsl-example) 를 보면 설정하는데 도움이 많이 된다. (이걸 찾기 전 까진,, 너무 힘들었음)

- [Support Reactive JPA](https://github.com/line/kotlin-jdsl/wiki/Support-Reactive-JPA) 이 내용도 같이 보면 좋다.
- [Quick Start JPA 3.0](https://github.com/line/kotlin-jdsl/blob/main/reactive-core/README.md) 트랜잭션 보장 관련 코드도 설명되어있다.
- [Reactive Quick Start JPA 3.0](https://github.com/line/kotlin-jdsl/blob/main/spring/data-reactive-core/README.md#quick-start---jpa-30)

위 Tech Stack 으로 Project 를 설정하기 위해서 어떤 Dependencies 가 필요한지 정리한다.

## Hibernate Reactive

[Hibernate Reactive](https://hibernate.org/reactive/) is a reactive API for Hibernate ORM, supporting non-blocking database drivers and a reactive style of interaction with the database.

__Dependency:__

```kotlin
implementation("org.hibernate.reactive:hibernate-reactive-core-jakarta:1.1.9.Final")
```

## Vertx

The [vert.x](https://www.javacodegeeks.com/2012/07/osgi-case-study-modular-vertx.html) open source project provides a JVM alternative to node.js: an asynchronous, event-driven programming model for writing web applications in a number of languages including Java, Groovy, JavaScript, and Ruby.

![](/resource/wiki/reactive-hibernate/vertx.png)

Sql Client is the vert.x reactive API to communicate with SQL databases.

__Dependency:__

```kotlin
// https://vertx.io/docs/vertx-jdbc-client/java/
implementation("io.vertx:vertx-jdbc-client:4.3.1")
```

### Agroal pool

Vertx 를 사용하여 DB Pool 을 생성할 때, 작성한 속성(properties) 들이 안전한지 Compiler 에 의해서 검사(validate)되려면 agroal pool 을 사용해야만 한다.

__Dependency:__

```kotlin
implementation("io.agroal:agroal-pool:2.0")
```

위 의존성이 없으면 아래와 같은 에러가 발생한다.

```
java.lang.NoClassDefFoundError: io/agroal/api/configuration/supplier/AgroalDataSourceConfigurationSupplier
Exception in thread "vert.x-eventloop-thread-1" java.lang.NoClassDefFoundError: io/agroal/api/configuration/supplier/AgroalDataSourceConfigurationSupplier
	at io.vertx.jdbcclient.impl.AgroalCPDataSourceProvider.getDataSource(AgroalCPDataSourceProvider.java:66)
```

아래는 구현 방법이다.

```kotlin
class MySQLConnectionPool: DefaultSqlClientPool() {
    override fun createPool(
        uri: URI,
        connectOptions: SqlConnectOptions,
        poolOptions: PoolOptions,
        vertx: Vertx
    ): Pool {
        return JDBCPool.pool(
            vertx,
            JDBCConnectOptions()
                .setJdbcUrl(connectOptions.host)
                .setUser(connectOptions.user)
                .setPassword(connectOptions.password)
                .setDatabase(connectOptions.database),
            poolOptions
        )
    }
}
```

## Kotlin JDSL 

Spring Boot 3.x 와 Spring Data 그리고 Kotlin JDSL 을 사용하려면 아래 의존성을 추가해야 한다.

__Dependency:__

```kotlin
// https://github.com/line/kotlin-jdsl/tree/main/spring/data-hibernate-reactive-jakarta
implementation("com.linecorp.kotlin-jdsl:spring-data-kotlin-jdsl-hibernate-reactive-jakarta:2.2.1.RELEASE")
```

## Mutiny

[Mutiny](https://smallrye.io/smallrye-mutiny/2.2.0/) – Intuitive Event-Driven Reactive Programming Library for Java

An API for Hibernate Reactive where non-blocking operations are represented by a Mutiny Uni.
Mutiny uses the Reactive Streams protocol for back-pressure management and the Java Flow APIs.

Hibernate Reactive 에서는 Mutiny 를 내부적으로 사용한다. Mutiny 는 Reactive Streams 의 구현체 중 하나이다.
Mutiny Interface 에서 내부적으로 SessionFactory 인터페이스를 가지고 있고 아래 주석은 꼭 읽는 것이 좋다.

![](/resource/wiki/reactive-hibernate/mutiny-sessionfactory.png)

__Dependency:__

```kotlin
implementation("io.smallrye.reactive:mutiny-kotlin:1.6.0")
```

## Jakarta Persistence API

__Dependency:__

```kotlin
compileOnly("jakarta.persistence:jakarta.persistence-api:3.1.0")
```

@Entity 같은 jakarta.persistence API 를 사용하기 위함이다.

## Spring Data JPA

__Dependency:__

```kotlin
// Resolve conflict to other hibernate versions
implementation("org.springframework.boot:spring-boot-starter-data-jpa") {
    exclude(module = "hibernate-core")
    exclude(module = "hibernate-commons-annotations")
}
```