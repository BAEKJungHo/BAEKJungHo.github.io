---
layout  : wiki
title   : Entity Versioning
summary : Optimistic Lock with version columns
date    : 2022-11-05 15:02:32 +0900
updated : 2022-11-05 15:12:24 +0900
tag     : spring jpa
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Entity Versioning

JPA 에서는 @Version Column 을 사용하여 Optimistic Lock 을 지원한다. 따라서 여러 사람이 동일한 데이터의 저장/수정/삭제를 요청한 경우 발생할 수 있는 __lost update(나중에 수정/삭제한 내용으로 덮어 쓰이는 것)__ 를 방지한다.

- __Entity__

```kotlin
@Version
@Column(nullable = false)
val version: Int
```

### Persist

```java
Product product = new Product();
product.setId(1L);
entityManager.persist(product);
```
```sql
INSERT INTO product (
    quantity,
    version,
    id
)
VALUES (
    0,
    0,
    1
)
```

### Update

```java
Product product = entityManager.find(
    Product.class,
    1L
);
product.setQuantity(5);
```

```sql
UPDATE
    product
SET
    quantity = 5,
    version = 1
WHERE
    id = 1 AND
    version = 0
```

### Delete

```java
Product product = entityManager.getReference(
    Product.class,
    1L
);
entityManager.remove(product);
```
```sql
DELETE FROM
    product
WHERE
    id = 1 AND
    version = 1
```

## Preventing lost updates

![](/resource/wiki/spring-jpa-version/optimistic.png)

## Links

- [How does the entity version property work when using JPA and Hibernate](https://vladmihalcea.com/jpa-entity-version-property-hibernate/)
- [A beginner’s guide to database locking and the lost update phenomena](https://vladmihalcea.com/a-beginners-guide-to-database-locking-and-the-lost-update-phenomena/)
