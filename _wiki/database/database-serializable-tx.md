---
layout  : wiki
title   : Serializability
summary : Serializable Transaction
date    : 2023-11-30 15:28:32 +0900
updated : 2023-11-30 18:15:24 +0900
tag     : database distributed
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Serializability

### Relaxing serializability

Standalone Database 환경에서는 트랜잭션 격리 수준과 관련된 3가지 문제가 존재한다.

- __Dirty Read__
  - 트랜잭션에서 처리 중인, 아직 커밋 되지 않은 데이터를 다른 트랜잭션에서 읽는 것을 허용하게 됨으로써 발생하는 문제이다.
- __Non-Repeatable Read__
  - 트랜잭션이 커밋되어 확정된 데이터를 읽는 것을 허용하게 됨으로써 발생하는 문제이다.
  - Tx1 이 데이터 조회 후 Tx2 가 update or delete 를 한다음 Tx1 이 조회를 한 번더 하면 변경된 값을 읽게 된다.
- __Phantom Read__
  - MySQL 의 기본 트랜잭션 격리 방식인 Reapeatable Read 도 Phantom Read 는 여전히 발생한다.
  - Tx1 이 데이터 개수 조회 후 Tx2 가 insert 를 한 다음 Tx1 이 count 조회를 한 번더 하면 업데이트된 개수를 읽게된다.

MySQL 의 경우에는 기본 트랜잭션 격리 수준을 Reapeatable Read 로 설정한다. 즉, Phantom Read 는 발생할 수 있다는 것이다.
Oracle 의 경우에는 기본 트랜잭션 격리 수준을 Read Committed 로 설정한다. 

Database Vendor 들이 가장 높은 격리 수준은 __[Serializable Read](https://github.com/NKLCWDT/cs/blob/main/Database/Transaction.md#%EB%A0%88%EB%B2%A8-3--serializable-read)__ 를 설정하지 않는 이유는
실제로 finances 와 같이 absolute correctness is not needed 한 경우가 많기 때문이다. 즉, 스펙에 따라 상품 목록을 조회할 때, 스펙에 부합하더라도 데이터가 업데이트된 지 얼마 되지 않은 상품이 목록에 나타나지 않아도 별 문제가 되지 않는 경우가 대부분이다.

이런 특징을 [Relaxing serializability](https://en.wikipedia.org/wiki/Serializability) 라고 한다.

### Strict serializability

그러면 Strict serializability 는 어떻게 달성할 수 있을까?

When you combine __standalone serializability__ and __linearizability__, then you get strict serializability.

Relaxing serializability 에 __[Linearizability](https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf)__ 를 결합하면 달성할 수 있다.

선형성이란 동시적으로 발생하는 작업을 순차적으로 정렬해서 처리한다고 이해하면 된다.

__Concurrent__:

![](/resource/wiki/database-serializable-tx/concurrent.png)

__Linearizability__:

![](/resource/wiki/database-serializable-tx/linear.png)

## Serializable Transaction

Serializable 격리 수준은 최고 수준의 격리를 제공하므로 트랜잭션이 동시에 실행될 수 있더라도 일련의 순서로 실행되는 것처럼 보일 수 있다.

직렬화 가능성을 달성하는 것은 전형적으로 잠금, 동시성 제어 메커니즘 및 트랜잭션 격리 프로토콜과 같은 기술을 사용하는 것을 포함한다. 이러한 방법은 충돌을 방지하고 데이터베이스의 불일치를 초래할 수 있는 방식으로 트랜잭션이 서로 간섭하지 않도록 보장하는 데 도움이 된다.

## Links

- [Serializability](https://en.wikipedia.org/wiki/Serializability)