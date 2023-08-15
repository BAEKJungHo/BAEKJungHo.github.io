---
layout  : wiki
title   : Lazy Write
summary : 
date    : 2023-08-08 09:28:32 +0900
updated : 2023-08-08 12:15:24 +0900
tag     : spring jpa
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Lazy Write

JPA 에서 쓰기 지연 저장소의 개념은 주로 트랜잭션 관리와 관련이 있다. JPA 는 영속성 컨텍스트라는 개념을 통해 엔티티(Entity)를 관리한다. 이 영속성 컨텍스트는 변경된 엔티티를 데이터베이스에 반영할 때 쓰기 지연 저장소를 사용하여 효율적으로 처리한다.

1. __변경 감지(Dirty Checking)__: JPA 는 엔티티의 상태를 지속적으로 모니터링하며 변경사항을 감지한다. 이러한 변경사항은 쓰기 지연 저장소에 임시로 저장된다.
2. __트랜잭션 커밋 시점에서 변경사항 반영__: JPA 는 트랜잭션을 커밋할 때 쓰기 지연 저장소에 저장된 변경사항을 한 번에 데이터베이스에 반영한다. 이를 통해 여러 개의 변경사항을 하나의 데이터베이스 쿼리로 처리하므로 성능이 향상된다.
3. __롤백 관리__: 만약 트랜잭션이 롤백되어야 하는 상황이 발생하면 쓰기 지연 저장소에 저장된 변경사항은 모두 롤백된다.

__Write-Behind Store__:
- 쓰기 지연 저장소(Write-Behind Store)는 변경된 엔티티의 상태를 임시로 저장하고 트랜잭션이 커밋되는 시점에 일괄적으로 데이터베이스에 반영하는 역할을 한다. 이는 여러 개의 변경사항을 하나의 데이터베이스 쿼리로 묶어서 처리함으로써 성능을 향상시키는 것이 목적이다.

__First-Level Cache__:
- 1차 캐시(First-Level Cache)는 영속성 컨텍스트 내부에 위치한 메모리 공간으로, 엔티티 객체의 상태를 보관하는 역할을 한다. 1차 캐시는 엔티티를 조회하거나 변경사항을 감지할 때 사용된다. 이를 통해 같은 엔티티가 여러 번 조회되는 경우 데이터베이스에서 가져오는 대신 메모리 내에서 캐시된 엔티티를 반환하여 성능을 향상시킨다.

쓰기 지연 저장소는 변경된 엔티티의 상태를 임시로 저장하고 트랜잭션이 커밋되는 시점에 일괄적으로 데이터베이스에 반영하는 목적으로 사용되며, 1차 캐시는 엔티티 객체의 상태를 메모리 내에서 보관하여 조회 성능을 개선하기 위해 사용. 두 개념은 JPA 의 영속성 컨텍스트 내에서 동작하지만 서로 다른 기능과 목적을 가지고 있다.

## Links

- [The JPA and Hibernate first-level cache](https://vladmihalcea.com/jpa-hibernate-first-level-cache/)
- [A beginner’s guide to Cache synchronization strategies](https://vladmihalcea.com/a-beginners-guide-to-cache-synchronization-strategies/)