---
layout  : wiki
title   : EnableTransactionManagement
summary : EnableTransactionManagement Annotation
date    : 2022-10-14 21:28:32 +0900
updated : 2022-10-14 22:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## @EnableTransactionManagement

> Enables Spring's annotation-driven transaction management capability, similar to the support found in Spring's tx:* XML namespace. To be used on @Configuration classes to configure traditional, imperative transaction management or reactive transaction management.

## @EnableTransactionManagement required in Spring Boot?

> If we're using a Spring Boot project and have a spring-data-* or spring-tx dependencies on the classpath, then transaction management will be enabled by default.
> 
> Spring Boot detects spring-jdbc and h2 on the classpath and automatically creates a DataSource and a JdbcTemplate for you. Because this infrastructure is now available and you have no dedicated configuration, a DataSourceTransactionManager is also created for you. This is the component that intercepts the method annotated with @Transactional (for example, the book method on BookingService). The BookingService is detected by classpath scanning.
> 
> - [Managing Transactions](https://spring.io/guides/gs/managing-transactions/)

## Showing a Spring transaction in log

Can easily trace transaction behavior by adding the following property to your yml:

```
logging.level.org.springframework.transaction.interceptor=TRACE
```

In case of using JpaTransactionManager:

```
log4j.logger.org.springframework.orm.jpa=TRACE
```

Or:

```
logging:
   level:
      org.springframework.orm.jpa: DEBUG
      org.springframework.transaction: DEBUG
```

## Links

- [Annotation Type EnableTransactionManagement - Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/EnableTransactionManagement.html)
- [Showing a Spring transaction in log](https://stackoverflow.com/questions/1965454/showing-a-spring-transaction-in-log)
- [@EnableTransactionManagement required in Spring Boot?](https://stackoverflow.com/questions/40724100/enabletransactionmanagement-in-spring-boot)
- [Tips for debugging Spring's @Transactional annotation](https://tim.mattison.org/java-hacks/tips-for-debugging-springs-transactional-annotation)
- [Transactions with Spring and JPA - Baeldung](https://www.baeldung.com/transaction-configuration-with-jpa-and-spring)