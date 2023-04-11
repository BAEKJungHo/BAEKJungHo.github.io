---
layout  : wiki
title   : CAP Theory of Design Principles for Distributed Systems
summary : 
date    : 2023-03-21 15:02:32 +0900
updated : 2023-03-21 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## CAP

> 분산 시스템의 설계 원칙을 설명하는 이론

![](/resource/wiki/architecture-cap/cap.png)

- __Consistency__: 데이터를 보유하고 있는 모든 노드가, 클라이언트가 데이터를 읽거나 쓸 때 언제나 동일한 결과를 반환해야 함을 의미함
- __Availability__: 노드 중 일부에 장애가 발생하더라도 사용자는 해당 서비스를 계속 이용할 수 있어야 함
- __Partition tolerance__: 분할 내성은 Replica 간의 연결되어있는 Node 가 네트워크 문제나 서버 장애 등으로 인해 노드끼리의 통신이 불가능하더라도 정상적으로 작동해야 한다는 것을 의미함
  - Availability 와의 차이점은 Availability 는 특정 노드가 “장애”가 발생한 상황에 대한 것이고 Tolerance to network Partitions 는 노드의 상태는 정상이지만 네트워크 등의 문제로 서로간의 연결이 끊어진 상황에 대한 것이다.

이 중에서 2개만 선택 가능함. 따라서 시스템 설계 시 이러한 요구사항을 고려하여 적절한 트레이드오프를 고려해야 한다.

RDBMS 는 __CA__ 를 만족한다. 

C 는 쓰기 동작이 완료된 후 발생하는 읽기 동작은 마지막으로 쓰여진 데이터를 리턴해야 한다는 것이다. 모든 노드가 같은 시간에 같은 데이터를 보여줘야 한다.

A 는 특정 노드가 장애가 발생해도 서비스가 가능해야 한다는 것이다. RDBMS 는 Master 와 Slave 를 통해서 Master 에 쓰기작업만하고 읽기 작업은 Slave 를 통해 할 수 있다. 그리고 N 대의 Slave 에서 1대가 죽어도 나머지 Replica 로 읽기를 제공할 수 있으므로 가용성(availability)이 충족된다.

## Links

- [Please stop calling databases CP or AP](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html)
- [DZone - Quick Notes: What is CAP Theorem?](https://dzone.com/articles/quick-notes-what-cap-theorem)
- [CAP 이론](https://hamait.tistory.com/197)