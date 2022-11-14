---
layout  : wiki
title   : Difference Between save and saveAndFlush
summary : 
date    : 2022-11-06 15:02:32 +0900
updated : 2022-11-06 15:12:24 +0900
tag     : spring jpa
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## save

save 는 insert or update 를 수행한다:
- [Save 는 Insert 와 Update 를 어떻게 구분할까?](https://brunch.co.kr/@anonymdevoo/37)

```java
/*
 * (non-Javadoc)
 * @see org.springframework.data.repository.CrudRepository#save(java.lang.Object)
 */
@Transactional
@Override
public <S extends T> S save(S entity) {
    Assert.notNull(entity, "Entity must not be null.");
 
    if (entityInformation.isNew(entity)) {
        em.persist(entity);
        return entity;
    } else {
        return em.merge(entity);
    }
}
```

When we use the save() method, the data associated with the save operation won't be flushed to the DB unless, and until, an explicit call to the __flush() or commit()__ method is made.

### without @Transactional

```kotlin
fun task() {
    val member = Member("BAEKJungHo")
    val registeredMember = memberRepository.save(member) // flush and commit 되어 DB 에 값이 변경된다.
    // PersistenceContext 는 트랜잭션마다 관리된다.
    // EntityManager 는 실제 Transaction 단위를 수행할 때마다 생성한다. 트랜잭션이 끝나면 닫힘
    // 따라서, registeredMember 는 PersistenceContext 에 의해 관리되는 객체가 아니므로 Dirty Checking 이 불가능하다
    registeredMember.update("JungHoBAEK") // update 쿼리가 나가지 않는다.
}
```

### with @Transactional

```kotlin
@Transactional
fun task() {
    // create
    var member = Member("BAEKJungHo")
    member = memberRepository.save(member) // insert 쿼리가 콘솔에 출력된다. (DB 에 반영 X)
    
    // update
    member.update("JungHoBAEK")
    member = memberRepository.save(member) // update 쿼리가 콘솔에 출력되지 않는다.
    
    // update
    member.update("JungHo")
    member = memberRepository.save(member) // update 쿼리가 콘솔에 출력되지 않는다.
    
    // 트랜잭션이 커밋되고나서 마지막 변경사항인 JungHo 가 반영된다. 이때 update 쿼리가 나가고 DB 에 반영된다.
}
```

__save 는 마지막 시점의 PersistenceContext 에 존재하는 Member 의 데이터를 반영하기 위한 쿼리를 Query Space(or SQL 저장소)로 보내고 트랜잭션이 커밋되는 시점에 db 에 업데이트를 한다.__

## saveAndFlush

saveAndFlush() method flushes the data __immediately during the execution__. But be aware, that even if you flush the changes in transaction and do not commit them, the changes still won't be visible to the outside transactions until the commit in this transaction. 단, Transaction's isolation level 이 __READ_UNCOMMITTED__ 면 외부에서 flush 되었지만 commit 되지 않은 결과를 볼 수 있다. 

MySQL 은 Repeatable Read, Oracle 은 Read Committed 를 기본 isolation level 로 채택하고 있기 때문에, 한 트랜잭션 안에서 saveAndFlush 를 하더라도 해당 트랜잭션이 커밋되지 않는한, 다른 트랜잭션에서는 flush 한 결과를 볼 수 없다.

```java
/*
 * (non-Javadoc)
 * @see org.springframework.data.jpa.repository.JpaRepository#saveAndFlush(java.lang.Object)
 */
@Transactional
@Override
public <S extends T> S saveAndFlush(S entity) {
    S result = save(entity);
    flush();
 
    return result;
}
```

Normally we use this method when our __business logic needs to read the saved changes at a later point during the same transaction, but before the commit__.

The saveAndFlush method calls the save method and forces a flush of the entire persistence context afterward. That prevents several of Hibernate’s performance optimizations and slows down your application. Due to that, __you should avoid using the saveAndFlush method and call the save method instead__.
- [The differences between Spring Data JPA’s save, saveAndFlush and saveAll methods](https://thorben-janssen.com/spring-data-jpa-save-saveandflush-and-saveall/)

### without @Transactional

@Transactional 어노테이션 없이 saveAndFlush 를 사용할 경우 실제 DB 가 변경된다.

```kotlin
fun task() {
    val member = Member("BAEKJungHo")
    val registeredMember = memberRepository.saveAndFlush(member) // flush and commit 되어 DB 에 값이 변경된다.
    // PersistenceContext 는 트랜잭션마다 관리된다.
    // EntityManager 는 실제 Transaction 단위를 수행할 때마다 생성한다. 트랜잭션이 끝나면 닫힘
    // 따라서, registeredMember 는 PersistenceContext 에 의해 관리되는 객체가 아니므로 Dirty Checking 이 불가능하다
    registeredMember.update("JungHoBAEK") // update 쿼리가 나가지 않는다.
}
```

### with @Transactional

@Transactional 어노테이션 사용 시, 해당 메서드가 끝나고 트랜잭션이 커밋이 되어야 실제 DB 가 변경된다.

```kotlin
@Transactional
fun task() {
    // create
    var member = Member("BAEKJungHo")
    member = memberRepository.save(member) // insert 쿼리가 콘솔에 출력된다. (DB 에 반영 X)

    // update
    member.update("JungHoBAEK")
    member = memberRepository.save(member) // update 쿼리가 콘솔에 출력된다. (DB 에 반영 X)

    // update
    member.update("JungHo")
    member = memberRepository.save(member) // update 쿼리가 콘솔에 출력된다. (DB 에 반영 X)

    // 트랜잭션이 커밋되고나서 모든 변경사항이 반영된다.
}
```

__saveAndFlush 는 호출할 때마다 쿼리를 Query Space(or SQL 저장소)로 보내고 트랜잭션이 커밋되는 시점에 db 에 업데이트를 한다.__

## Links

- [Hibernate - Working with objects Flushing the Session](https://docs.jboss.org/hibernate/core/4.3/manual/en-US/html/ch11.html#objectstate-flushing)
- [The best Spring Data JpaRepository](https://vladmihalcea.com/best-spring-data-jparepository/)
- [Difference Between save() and saveAndFlush() in Spring Data JPA - Baeldung](https://www.baeldung.com/spring-data-jpa-save-saveandflush)
- [save vs saveAndFlush - stackoverflow](https://stackoverflow.com/questions/21203875/difference-between-save-and-saveandflush-in-spring-data-jpa)
