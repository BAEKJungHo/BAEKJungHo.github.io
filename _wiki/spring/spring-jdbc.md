---
layout  : wiki
title   : JDBC
summary : Connection Pool, HikariCP, TCP 3-way Handshake
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

## Thread Pool

> WAS Thread Pool 뿐만 아니라, MySQL 또한 Thread Pool 이 존재한다.

![](/resource/wiki/spring-jdbc/mysql-thread.png)

- MySQL 에서는 Foreground Thread 를 미리 생성하여 대기 시켜 놓으며, 대기 공간을 Thread Pool 이라 한다.
- 최소한 서버에 접속된 클라이언트 수 만큼 존재해야 하며, 더 많을 수도 있다.
- 사용자가 DB Connection 을 종료하면 해당 스레드는 스레드 풀로 돌아간다.

![](/resource/wiki/spring-jdbc/tps.png)

- __Connection Pool vs Thread Pool__
  - Connection Pool 은 커넥션 재사용을 가능하게 하며 MySQL 서버 연결 수행 비용을 절약. 클라이언트 측(Application)에서 동작
  - Thread Pool 은 동시적인 쿼리 수행 수를 제한하기 위해 서버 측(MySQL)에서 동작
- __Thread Pool 의 이점__
  - 많은 수의 데이터베이스 연결을 처리할 수 있으며 리소스 경합 및 컨텍스트 전환이 줄어듦
  - MySQL 서버가 쿼리 수행을 위한 충분한 CPU 와 메모리 리소스를 확보할 때까지 쿼리 수행을 기다림
  - 커넥션에 대한 진행중인 트랜잭션 쿼리의 우선순위를 매김
  - 쓰레드를 그룹으로 나누어 그룹당 하나의 액티브 쓰레드를 관리하는데 목표를 두고 동작
  - 쿼리가 지연(stalled) 되거나 오랜시간 수행될 때 데드락을 피함

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

## JDBC

> JDBC(Java Database Connectivity) 는 자바 프로그램이 DBMS 에 접근할 수 있도록 하는 표준 API 를 의미한다. 각 DB Vendor 가 JDBC 표준을 따라 만들어진 드라이버를 제공해 준다. `내부 구현은 다를지라도` JDBC 의 Connection, Statement, ResultSet 등의 `표준 인터페이스`를 통해 기능을 제공하기 때문에 DB Vendor 에 상관 없이 일관된 방법으로 프로그램을 개발할 수 있다. 즉 구현에 의존하는 것이 아닌 역할에 의존하는 객체지향 프로그래밍 방법의 장점을 잘 활용한 사례라 할 수 있다.

```java
public void deleteAll() throws SQLException {
    Connection c = dataSource.getConnection();
    
    // 이 과정에서 에러가 발생하면 메서드 실행이 중단된다.
    PreparedStatement ps = c.prepareStatement("delete from users");
    ps.executeUpdate();
    
    ps.close();
    c.close();
}
```

리소를 반환하기 전에 예외가 발생하게 되면, 메서드 실행이 중단되어 제대로 리소스가 반환되지 않을 수 있다. 따라서, JDBC 에서는 어떤 상황에서도 리소스를 반환하도록 `try-catch-finally` 구문을 사용하도록 권장하고 있다.

DB 커넥션과 같이 제한적인 리소스를 공유해서 사용하는 서버에서는 반드시 예외처리를 해줘야 한다 예외가 발생했을 경우, 사용한 리소스를 반드시 반환해야 하기 때문이다.

Connection 이나 PreparedStatement 에서 제공하는 close() 메서드는 "리소스를 반환하다" 라고 이해하는 것이 좋다.

```java
public void deleteAll() throws SQLException {
    Connection c = null;
    PreparedStatement ps = null;
    
    try {
        c = dataSource.getConnection();
        ps = c.prepareStatement("delete from users");
        ps.executeUpdate();
    } catch (SQLException e) {
        throw e;     
    } finally{
        if(ps!=null) {
            try {
              ps.close();
            } catch (SQLException e) {}
        }
        if(c!=null) {
          try {
          c.close();
          } catch (SQLException e) {}
        }
    }
}
```

### 변하는 것과 변하지 않는 것

- __JDBC try/catch/finally 코드의 문제점__
  - `폭탄 같은 코드`
  - try/catch/finally 블록의 2중 중첩과 모든 메서드 마다 반복
- __이러한 코드를 효과적으로 다루는 방법__
  - 변하는 것과 변하지 않는 것을 분리해내는 작업이 필요

```java
// 변하는 부분은 이 곳 뿐이다.
ps = c.prepareStatement("delete from users")
```

- __어떻게 리팩토링 할 것인가?__
  - 템플릿 메서드 패턴 
  - 전략 패턴
  - 템플릿 콜백 패턴

## HikariCP

SpringBoot 2.x가 출범하면서 HikariCP를 기본 JDBC Connection Pool 로 사용할 수 있게 되었다. HikariCP 는 다른 Connection Pool 에 비해 성능이 압도적이라고 한다.

HikariPool 에서는 Connection 객체를 한번 wrapping 한 `PoolEntry` 라는 Type 으로 내부적으로 Connection 을 관리한다.

HikariCP에 서는 내부적으로 ConcurrentBag 이라는 구조체를 이용해 Connection 을 관리한다.
HikariPool.getConnection() -> ConcurrentBag.borrow()라는 메서드를 통해 사용 가능한(idle) Connection 을
리턴하도록 되어있다.

### getConnection()

HikariPool 에서 getConnection() 로직은 총 3단계를 통해 Connection 을 리턴하고 있다.

![](/resource/wiki/spring-jdbc/hikaricp.png)

Thread 가 repository.save(entity) 를 실행하기 위해 Root Transaction 용 Connection 을 가져온 상태에서, save 를 수행하기 위해 하나의 Connection 이 더 필요하다고 가정.

- __Thread-1 은 Hikari Pool 에 Connection 을 요청__
  - 현재 자기 Thread 의 방문 내역을 살펴본다.
    - (PoolStats : total=1, active=1, idle=0, waiting=0)
  - 전체 Hikari Pool 에서 idle 상태의 Connection 을 스캔한다.
    - Pool Size 는 1개이고 1개 있던 Connection 은 Thread-1에서 이미 사용중이다.
  - 마지막으로 handOffQueue 에서 누군가 반납한 Connection 이 있길 기대하면 30초 동안 기다린다.
    - 이 기간이 지날 동안 Connection 을 얻지 못하면 Connection Timeout 이 발생한다.
      - `hikari-pool-1 - Connection is not available, request timed out after 30000ms`
    - (PoolStats : total=1, active=1, idle=0, waiting=1)
- SQLTransientConnectionException 으로 인해 Sub Transaction 이 Rollback 된다.
- Sub Transaction 의 Rollback 으로 인해 Root Transaction 이 rollbackOnly = true 가 되며 Root Transaction 이 롤백
- Rollback 됨과 동시에 Root Transaction 용 Connection 은 다시 Pool 에 반납 된다.
  - (PoolStats : total=1, active=0, idle=1, waiting=0)

이렇게 Thread 내에서 하나의 Task  에 수행하는데 필요한 Connection 갯수가 모자라게 되면 Dead Lock 상태에 빠져 Insert Query 를 실행할 수 없게 된다.

### Connection Pool 이 커지면 무조건 성능이 좋아질까?

Connection Pool 의 크기가 작으면 Connection 을 획득하기 위해 대기하는 Thread 가 많아지고 TPS 가 감소하게 된다.

Connection Pool 의 크기가 커진다고 해서 무조건 성능이 좋아지는 것은 아니다.

WAS 에서 Connection 을 사용하는 주체는 Thread 이고, Thread Pool 의 크기보다 Connection Pool 의 크기가 크면 사용되지 않는 Connection 을 메모리 공간을 차지하게 된다.

실제 CPU 코어는 한 번에 Thread 하나의 작업만 처리할 수 있다.(CPU 의 처리속도가 워낙 빨라서 동시에 처리되는 것처럼 보이는 것이다.) 다음 Thread 의 작업을 수행하기 위해서 Context Switching 이 일어나는데 이 순간 작업에 필요한 Thread 의 Stack 영역 데이터를 로드하는 등 추가적인 작업이 필요하기 때문에 오버헤드가 발생하게 된다. 따라서, Connection Pool 을 늘려서 많은 Thread 를 받았다 하더라도 Disk I/O, Context Switching 등으로 인한 성능적인 한계가 존재하게 된다.

### 최적의 Connection Pool 설정 방법

HikariCP 에서는 다음과 같은 공식을 제안하고 있다.

- __pool size = Tn x (Cm - 1) + 1__
  - `-1`: 마지막 Connection 이 필요한 Sub Transaction 에 대해
  - `+1`: Connection 1개가 마지막 Sub Transaction 을 해결할 수 있게 해준다.

하지만, Dead lock 을 피하기 위한 최적의 pool size 를 설정하기 위해서는 `pool 갯수 + a` 가 되어야 한다. 이에 대해 성능 테스트를 수행하면서 최적의 Pool Size 를 찾는 방법이 있다.

## Links

- [HikariCP](https://baekjungho.github.io/wiki/database/hikaricp-concepts/)
- [MySQL Enterprise Thread Pool](https://dev.mysql.com/doc/refman/8.0/en/thread-pool.html)
- [MySQL deep dive to inner details](https://medium.com/@zxue2011/mysql-from-5000ft-above-to-inner-details-i-6a81186064de)
- [Why Too Many Threads Hurts Performance, and What to do About It](https://www.codeguru.com/cplusplus/why-too-many-threads-hurts-performance-and-what-to-do-about-it/)
- [HikariCP Dead lock 에서 벗어나기](https://techblog.woowahan.com/2664/)
- [내가 만든 서비스는 얼마나 많은 사용자가 이용할 수 있을까? - 3편(DB Connection Pool)](https://hyuntaeknote.tistory.com/12)
- [How to prevent SQL Injection In Spring Framework](https://baekjungho.github.io/wiki/spring/spring-sqlinjection/)

## 참고 문헌

- 토비의 스프링 3 / 이일민 저 / 에이콘 출판사