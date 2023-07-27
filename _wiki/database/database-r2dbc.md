---
layout  : wiki
title   : Reactive Relational Database Connectivity
summary : 
date    : 2023-07-21 15:28:32 +0900
updated : 2023-07-21 18:15:24 +0900
tag     : database r2dbc reactive
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Reactive Relational Database Connectivity

__Picking a database driver and create a R2dbcEntityTemplate instance__:
- [Jasync-sql](https://github.com/jasync-sql/jasync-sql) is a Simple, Netty based, asynchronous, performant and reliable database drivers for PostgreSQL and MySQL written in Kotlin.

__The Spring Data R2DBC 3.x binaries require__:
- JDK level 17 and above
- Spring Framework 6.0.11 and above
- R2DBC and above

__Id Generation__:
- Use @Id
- When your database has an auto-increment column for the ID column, the generated value gets set in the entity after inserting it into the database.
- Spring Data R2DBC does not attempt to insert values of identifier columns when the entity is new and the identifier value defaults to its initial value. That is 0 for primitive types and null if the identifier property uses a numeric wrapper type such as Long.

__OptimisticLocking__:
- The @Version annotation provides syntax similar to that of JPA in the context of R2DBC and makes sure updates are only applied to rows with a matching version.

__Projections__:
- https://docs.spring.io/spring-data/r2dbc/docs/current/reference/html/#projections

__ReactiveAuditorAware with SpringSecurity__:
- [https://docs.spring.io/spring-data/r2dbc/docs/current/reference/html/#auditing.auditor-aware](https://docs.spring.io/spring-data/r2dbc/docs/current/reference/html/#auditing.reactive-auditor-aware)

__Mapping Configuration__:
- https://docs.spring.io/spring-data/r2dbc/docs/current/reference/html/#mapping.configuration

## Links

- [KakaoHairShop R2DBC Study](https://github.com/kakaohairshop/spring-r2dbc-study/tree/main)

## References

- [Spring Data R2DBC - Reference Documentation](https://docs.spring.io/spring-data/r2dbc/docs/current/reference/html/)
- [R2DBC](https://r2dbc.io/spec/1.0.0.RELEASE/spec/html/)