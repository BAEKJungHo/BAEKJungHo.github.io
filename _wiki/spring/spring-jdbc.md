---
layout  : wiki
title   : JDBC
summary : 
date    : 2022-07-03 15:05:32 +0900
updated : 2022-07-03 15:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

# JDBC

JDBC(Java Database Connectivity) 는 자바 프로그램이 DBMS 에 접근할 수 있도록 하는 표준 API 를 의미한다.

## Connection Pool

> Connection Pool(DBCP)은 DB Connection 객체들을 미리 생성해 둔 다음, 꺼내 쓰고 반납하는 기술이다.

- __Connection Pool 이 필요한 이유__
  - DB Connection 객체를 생성하고 최초로 커넥션을 맺는 과정은 Cost 가 많이 든다. 
  - 물리적으로 DB 에 최초로 커넥션을 맺는 과정에서 TCP 3-way Handshake 를 거치고, 연결을 끊는 과정에서는 TCP 4-way Handshake 를 거치기 때문에 많은 시간이 소요된다. 따라서, Connection Pool 을 사용해서 위 연결 과정을 매번 반복하지 않게 하는게 핵심이다.

### TCP Handshake

> OSI 7 Layer 에서 전송 계층의 핵심은 __신뢰성 있는 데이터 전송__ 이다. TCP 3-way HandShake 란 정확한 데이터 전송을 보장하기 위한 연결 과정을 의미한다.

![](/resource/wiki/network-tcp/tcp.png)

가상 경로(socket)를 생성하기 위해, 서버는 OS 에게 특정 포트에 연결 요청이 오면, 자신에게 연결 요청을 해달라는 상태를 의미하는 LISTEN 상태가 된다.

이 LISTEN 상태에서 [TCP 3-way HandShake](https://baekjungho.github.io/wiki/network/network-layeredarchitectures/#tcp-3-way-handshake) 가 일어난다.

```idle
# 클라이언트와 서버의 대화
- C to S : 야!! 나 너랑 연결하고 싶어(SYN 1 로 설정하고 송신)
- S : 어? 그래 나도 너랑 연결하고 싶어 : SYN 과 ACK(클라이언트가 처음에 요청한 것에 대한 응답)을 1로 설정하여 송신
- C : 그래 좋아(응답 ACK 을 송신), 야 데이터 보내줄게 받아라(데이터도 같이 송신)
```

![](/resource/wiki/spring-jdbc/wireshark.png)

[wireshark](https://www.wireshark.org/) 를 활용해서 TCP 연결 과정을 직접 눈으로 확인할 수 있다.

### Thread Pool

![](/resource/wiki/spring-jdbc/tps.png)

- MySQL 에서는 Foreground Thread 를 미리 생성하여 대기 시켜 놓으며, 대기 공간을 Thread Pool 이라 한다.
- 최소한 서버에 접속된 클라이언트 수 만큼 존재해야 하며, 더 많을 수도 있다.
- 사용자가 DB Connection 을 종료하면 해당 스레드는 스레드 풀로 돌아간다.

## MySQL Inner Details

![](/resource/wiki/spring-jdbc/mysql.png)

대부분의 소프트웨어 시스템은 계산 계층과 저장 계층으로 나뉘어져 있다. 위 그림에서 SQL Parser, Optimizer, Execution Engine 이 계산 계층에 속하며, Storage Engine 이 저장 계층에 속한다.

MySQL 은 일반적으로 쿼리 처리 속도가 매우 빠른데 그 이유는 `버퍼풀(Buffer Pool)` 때문이다. 버퍼풀은 디스크의 데이터 파일이나 인덱스 정보를 `메모리(Memory)`에 캐싱해두는 공간이다. 버퍼풀은 쓰기작업을 지연시켜서 일괄적으로 작업을 처리해주기도 한다. 버퍼풀은 SQL 요청 결과를 일정한 크기의 페이지 단위로 캐싱한다. InnoDB 는 페이지 교체 알고리즘으로 LRU 알고리즘을 사용하고 있다.

- __버퍼풀의 용도__
  - 데이터 캐싱
  - 쓰기 지연 버퍼
    - Insert, Update, Delete 명령으로 변경된 페이지를 더티 페이지(Dirty Page) 라고 한다.
    - InnoDB 는 이러한 더티 페이지들을 모았다가 주기적으로 이벤트를 발생 시켜 한 번에 디스크에 반영한다. 
    - 이렇게 데이터를 한 번에 모았다가 처리하는 이유는 랜덤 I/O 를 줄이기 위해서이다. 
    - 변경된 데이터를 버퍼풀에 모았다가, 한 번에 디스크에 기록 한다.
  - 어댑티브 해시 인덱스(Adaptive Hash Index)
    - 페이지에 빠르게 접근하기 위한 해시 자료구조 기반 인덱스
    - 인덱스 키, 페이지 주소 값 쌍으로 구성
    - 자주 요청되는 페이지에 대해 InnoDB 가 자동으로 생성하는 인덱스

## Links

- [MySQL Enterprise Thread Pool](https://dev.mysql.com/doc/refman/8.0/en/thread-pool.html)
- [MySQL deep dive to inner details](https://medium.com/@zxue2011/mysql-from-5000ft-above-to-inner-details-i-6a81186064de)
- [Why Too Many Threads Hurts Performance, and What to do About It](https://www.codeguru.com/cplusplus/why-too-many-threads-hurts-performance-and-what-to-do-about-it/)
- [HikariCP Dead lock 에서 벗어나기](https://techblog.woowahan.com/2664/)
- [내가 만든 서비스는 얼마나 많은 사용자가 이용할 수 있을까? - 3편(DB Connection Pool)](https://hyuntaeknote.tistory.com/12)

## 참고 문헌

- 토비의 스프링 3 / 이일민 저 / 에이콘 출판사