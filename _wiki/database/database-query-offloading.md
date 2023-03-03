---
layout  : wiki
title   : Query Offloading
summary : 
date    : 2023-02-28 15:28:32 +0900
updated : 2023-02-28 18:15:24 +0900
tag     : database
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Query Offloading

Software 에서 Offload Processing 이란 기본적으로 시간이 오래걸리는 작업을 다른 방식으로 처리하는 것을 의미하는 것 같다.

__Other Offloading:__
- [Offload Processing in Reactive](https://baekjungho.github.io/wiki/reactive/reactive-offload-processing/)
- [SSL Offloading: A Solution For a Slow Website](https://dzone.com/articles/ssl-ofloading-a-solution-for-the-slow-website)

Query Offloading 이란 읽기 처리량을 증가시키기 위한 방법이다. DB 트랜잭션의 70~90% 가 READ 처리이고 나머지가 CUD 이다. 이 Query 와 Command 성 트랜잭션을 분리하는 기법을 의미한다.

![](/resource/wiki/database-query-offloading/query-offloading.png)

Master DB 의 내용을 Staging DB 로 복제한다. 그리고 Staging DB 안의 데이터를 여러개의 Slave DB 로 복제 한다. 이 복제하는 과정에서 CDC(Change Data Capture) 가 사용된다. Staging DB 가 존재하는 이유는 Master 에서 N 개의 Slave 로 복제하는 과정에서 부하가 크기 때문이다. 복제하는 과정에서 BackLog 같은 것을 이용한다. MySQL 의 경우에는 __binLog__ 를 이용하면 될 듯 하다.

__Master processing Command, Slave processing Query__
- 명령과 쿼리를 별도로 처리하기 위해서 별도의 Connection 을 이용해야 함
- 쿼리의 경우 N 개의 Slave DB 로 부터 읽어야 하므로 N 개의 Slave DB 에 대한 요청을 Load Balancing 해야 하고 특정 Slave DB 장애 시 다른 Slave DB 인스턴스에 접근할 수 있도록 HA(High Availability) 을 제공해야 하는데, HA 기능을 가지고 있는 Connection Pool 을 이용하거나 JDBC Driver 과 같이 DBMS 용 Driver 자체에 Load Balancing 과 HA 기능을 사용한다.

## Links

- [Query Off Loading - Terry Cho](https://bcho.tistory.com/670)