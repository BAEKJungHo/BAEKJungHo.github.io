---
layout  : wiki
title   : Tx
summary : 
date    : 2024-08-30 18:28:32 +0900
updated : 2024-08-30 20:15:24 +0900
tag     : database jpa tradeoff
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Transactions

___[Tx](https://en.wikipedia.org/wiki/Database_transaction)___ 는 ___하나의 논리적인 작업의 단위___ 를 의미한다.
데이터베이스에 저장된 모든 데이터는 <mark><em><strong>Integrity</strong></em></mark> 하여야 한다. 그렇기 위해서는 시스템 장애가 발생하더라도 데이터를 신뢰할 수 있어야 하며, 동시(concurrently)에 데이터베이스에 접근하는 프로세스로 부터 격리를 제공해야 한다.

즉, Tx 의 주 목적은 ___데이터의 무결성(Integrity)을 지키기 위한 것___ 이며, 무결성을 지키기 위한 Tx 의 4가지 성질이 ___[ACID](https://en.wikipedia.org/wiki/ACID)___ 이다.

| Character | Description                                                                                                                                                                      |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Atomicity        | All or Nothing <br> 트랜잭션의 연산은 데이터베이스에 모두 반영되든지 아니면 전혀 반영되지 않아야 한다. <br>트랜잭션 내의 모든 명령은 반드시 완벽히 수행되어야 하며, 모두가 완벽히 수 행되지 않고 어느하나라도 오류가 발생하면 데이터베이스 상태를 트랜잭션 작업 이전으로 되돌려서 원자성을 보장 해야 한다. |
| Consistency | 트랜잭션 수행 전과, 수행 완료 후의 상태가 같아야 한다. <br> 명시적인 일관성 : 기본 키, 외래 키 등과 같은 무결성 제약조건 <br> 비명시적인 일관성 : Ex. 계좌 이체에서, A 계좌에서 출금이 일어나고 그 돈이 B 계좌로 입금된다 했을 때, 트랜잭션의 전과 후 두 계좌 잔고의 합이 같아야 한다.
| Isolation | 둘 이상의 트랜잭션이 동시에 병행 실행되는 경우 어느 하나의 트랜잭션 실행중에 다른 트랜잭션의 연산이 끼어들 수 없다. |
| Durability | 성공적으로 완료된 트랜잭션의 결과는 시스템이 고장나더라도 영구적으로 반영되어야 한다. | 

데이터의 무결성을 지키기 위해서 동시 접근으로 부터 격리를 해야하는데 어느 수준(level)로 하는지가 문제가 된다. 크게 3가지 문제가 존재한다.

- __Dirty Read__ : 트랜잭션에서 처리 중인, 아직 커밋 되지 않은 데이터를 다른 트랜잭션에서 읽는 것을 허용하게 됨으로써 발생하는 문제이다.
- __Non-Repeatable Read__: 트랜잭션이 커밋되어 확정된 데이터를 읽는 것을 허용하게 됨으로써 발생하는 문제이다. Tx1 이 데이터 조회 후 Tx2 가 update or delete 를 한다음 Tx1 이 조회를 한 번더 하면 변경된 값을 읽게 된다.
- __Phantom Read__: MySQL 의 기본 트랜잭션 격리 방식인 Repeatable Read 도 Phantom Read 는 여전히 발생한다. Tx1 이 데이터 개수 조회 후 Tx2 가 insert 를 한 다음 Tx1 이 count 조회를 한 번더 하면 업데이트된 개수를 읽게된다.

위 문제들을 적절한 트랜잭션 격리 수준을 설정해서 해결할 수 있다. 즉, <mark><em><strong>트랜잭션 격리 수준을 이해해야 하는 이유는 일관성과 성능의 Trade-off 를 판단하는 기준</strong></em></mark>이 되기 때문이다.

__[Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html)__:

| Character        | Description                                                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Read Uncommitted | 트랜잭션에서 처리 중인, 아직 커밋 되지 않은 데이터를 다른 트랜잭션에서 읽는 것을 허용 <br> Dirty Read, Non-Repeatable Read, Phantom Read 현상 발생     |                    
| Read Committed   | Dirty Read 방지 - 트랜잭션이 커밋이 확정된 데이터만 읽는다. <br> Non-Repeatable Read, Phantom Read 현상은 여전히 발생                                                     |
| Repeatable Read      | 선행 트랜잭션이 읽은 데이터는 트랜잭션이 종료될 때가지 후행 트랜잭션이 갱신하거나 삭제하는 것은 불허함으로써 (Insert 는 가능) 같은 데이터를 두 번 쿼리했을 때 일관성 있는 결과를 리턴 <br> MySQL InnoDB 에서 기본으로 채택하고 있는 격리 수준 <br> Phantom Read 현상은 여전히 발생 |
| Serializable Read       | 선행 트랜잭션이 읽은 데이터를 후행 트랜잭션이 갱신하거나 삭제하지 못할 뿐만 아니라 중간에 새로운 레코드를 삽입하는 것도 막아줌. 완벽하게 읽기 일관성 모드를 제공 <br> 동시성 이슈 해결 가능                                                                    | 

Database Vendor 들이 가장 높은 격리 수준인 ___[Serializable Read](https://baekjungho.github.io/wiki/database/database-serializable-tx/)___ 를 설정하지 않는 이유는 실제로 finances 와 같이 absolute correctness is not needed 한 경우가 많기 때문이다. 즉, 스펙에 따라 상품 목록을 조회할 때, 스펙에 부합하더라도 데이터가 업데이트된 지 얼마 되지 않은 상품이 목록에 나타나지 않아도 별 문제가 되지 않는 경우가 대부분이다. 또한 Serializable Read 는 동시성을 해결할 수는 있지만 성능적인 문제가 발생할 수 있다.

그래서 일반적으로 ___[Concurrency](https://baekjungho.github.io/wiki/spring/spring-concurrency/)___ 이슈를 해결하기 위해 Consistency & Performance 의 Trade-off 로 Repeatable Read 격리 수준을 선택하며, ___[Lock Mechanism](https://baekjungho.github.io/wiki/spring/spring-concurrency-resolve/)___ 을 같이 사용한다.

MySQL InnoDB 의 Repeatable Read 는 어떻게 읽기 일관성을 보장하기 위해서 ___[Snapshot](https://dev.mysql.com/doc/refman/8.4/en/glossary.html#glos_snapshot)___ 을 사용한다. 스냅샷(snapshot)은 특정 시간의 데이터 표현으로, 첫 번째 읽기가 스냅샷(시간 지점)을 설정하고 이후의 모든 읽기가 서로에 대해 일관성을 유지한다는 의미이다.

JPA 가 ___[First Level Cache](https://vladmihalcea.com/jpa-hibernate-first-level-cache/)___ 를 통해 Repeatable Read 수준의 읽기 일관성을 제공한다.

```java
@DisplayName("Repeatable Read Test")
@SpringBootTest
class RepeatableReadTest {

    @Value("${persistence.unitname}")
    private String persistenceUnitName;

    @DisplayName("1차 캐시를 통한 Repeatable Read 를 지원하는지 테스트")
    @Test
    void repeatableReadByCache() throws Exception {
        // given
        EntityManagerFactory emf = Persistence.createEntityManagerFactory(persistenceUnitName);
        insertDummyData(emf);

        // when
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();

        tx.begin(); // 선행 트랜잭션 시작
        Member findMember1 = em.find(Member.class, 1L);
        /**
         * findMember1 : Member 를 데이터베이스에서 조회
         * Member 를 다시 조회하기 전에 H2 데이터 베이스에서 UPDATE 문 실행
         * findMember2 : Member 를 데이터베이스가 아닌 1차 캐시에서 조회
         */
        Member findMember2 = em.find(Member.class, 1L);
        tx.commit(); // 선행 트랜잭션 종료
        em.close();
        emf.close();

        // then
        assertThat(findMember1.getUserName()).isEqualTo(findMember2.getUserName());
    }

    @DisplayName("더미 데이터 삽입")
    private void insertDummyData(EntityManagerFactory emf) {
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();

        tx.begin();

        Member member = new Member();
        member.setUserName("JungHo");
        em.persist(member);
        tx.commit();

        em.close();
    }
}
```

Snapshot 은 양호한 수준의 읽기 일관성을 보장하지만, 데이터를 일시적으로 임의의 공간에 보관해야 하므로 성능적으로 약간의 희생이 발생한다.
JPA 에서는 비지니스로직을 처리하면서 데이터를 읽고, 변경까지 하는 경우에는 Snapshot 을 통해 Repeatable Read 수준의 읽기 일관성을 보장해야 할 것이다. 하지만, 비지니스 로직을 처리하는데 오직 읽기만 한다면 Snapshot 저장공간이 필요 없지 않을까?

이러한 아이디어를 통해 성능을 올리고자 ___[Declarative Transaction](https://baekjungho.github.io/wiki/spring/spring-declarative-transaction/)___ 을 사용할때, 트랜잭션을 ___read-only___ 로 설정하면, 별도의 Snapshot 저장공간이 필요 없어지게 되어 성능 향상에 도움이 된다. 즉, `START TRANSACTION READ ONLY` 구문을 사용하여 읽기 전용 트랜잭션을 명시적으로 정의하는 것이다.

## Advanced 

- [Cloud Actor-Oriented Database Transactions in Orleans](https://www.vldb.org/pvldb/vol17/p3720-eldeeb.pdf)
- [Distributed Transaction and Consensus Algorithm](https://baekjungho.github.io/wiki/msa/msa-xa/)