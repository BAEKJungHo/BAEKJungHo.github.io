---
layout  : wiki
title   : Improve statement caching efficiency
summary : 
date    : 2023-05-21 15:05:32 +0900
updated : 2023-05-21 15:15:24 +0900
tag     : spring jpa
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Improve statement caching efficiency

__Relational database provides an Execution Plan cache:__


![](/resource/wiki/spring-query-cache-plan/plan.png)

Since query compilation takes time, Hibernate provides a [QueryPlanCache](https://docs.jboss.org/hibernate/orm/5.0/javadocs/org/hibernate/engine/query/spi/QueryPlanCache.html) for better performance.
For native queries, Hibernate extracts information about the named parameters and query return type and stores it in the [ParameterMetadata](https://docs.jboss.org/hibernate/orm/5.0/javadocs/org/hibernate/engine/query/spi/ParameterMetadata.html).

The IN clause parameter padding feature increases the chance of reusing an already generated Execution Plan, especially when using a large number of IN clause parameters.

__In clause parameter padding:__
- spring.jpa.properties.hibernate.query.in_clause_parameter_padding=true

### Query plan cache configuration

- hibernate.query.plan_cache_max_size – controls the maximum number of entries in the plan cache (defaults to 2048)
- hibernate.query.plan_parameter_metadata_max_size – manages the number of ParameterMetadata instances in the cache (defaults to 128)
  
Increasing the number of queries that Hibernate is allowed to cache consequently reduces the compilation time.

__Using Hibernate [Statistics](https://docs.jboss.org/hibernate/orm/5.0/javadocs/org/hibernate/stat/Statistics.html):__
- getQueryPlanCacheHitCount 
- getQueryPlanCacheMissCount

### Optimization Analysis

[QuickPerf](https://github.com/quick-perf/quickperf) 로 lazy loading 발생여부 확인 가능(실제로는 쿼리가 날라간 갯수를 테스트 코드로 검증가능)

## Links

- [Hibernate Docs - Improving performance](https://docs.jboss.org/hibernate/orm/4.3/manual/en-US/html/ch20.html)
- [How to improve statement caching efficiency with IN clause parameter padding](https://vladmihalcea.com/improve-statement-caching-efficiency-in-clause-parameter-padding/)
- [Hibernate Query Plan Cache](https://www.baeldung.com/hibernate-query-plan-cache)