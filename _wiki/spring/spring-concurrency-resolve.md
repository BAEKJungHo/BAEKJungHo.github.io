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

> 경쟁 상태란 두 개 이상의 스레드가 공유 데이터에 액세스할 수있고, 동시에 변경을 하려고 할 때 발생하는 문제이다.

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

## Links

- [재고시스템으로 알아보는 동시성 이슈 해결방법](https://www.inflearn.com/course/%EB%8F%99%EC%8B%9C%EC%84%B1%EC%9D%B4%EC%8A%88-%EC%9E%AC%EA%B3%A0%EC%8B%9C%EC%8A%A4%ED%85%9C/dashboard)
