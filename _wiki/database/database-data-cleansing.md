---
layout  : wiki
title   : Data Cleansing
summary : Foreign Key 와 Data Cleansing
date    : 2022-10-08 15:28:32 +0900
updated : 2022-10-08 18:15:24 +0900
tag     : database
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Foreign Key

> The reason foreign key constraints exist is to guarantee that the referenced rows exist.

- 테이블간 관계를 설정하는 키
- 외래키 설정 시 제약 조건 옵션을 설정할 수 있음
- 참조의 정확성을 보장
  -  It means you can't physically create a record that dosen't fulfill relation.
- FK 가 없더라도 조인 가능

### In Practice

실무에서는 FK 를 설정하는 경우도 있고, FK 를 아예 제거하는 경우도 있다. FK 가 필요한 경우는 주문/결제 처럼 __데이터 정합성__ 이 중요한 관계에 설정하는 것이 좋다. 그 외에는 FK 가 오히려 해가 될 수 있다.

- __Related Articles__
  - [The problem with MySQL foreign key constraints in Online Schema Changes](https://code.openark.org/blog/mysql/the-problem-with-mysql-foreign-key-constraints-in-online-schema-changes)
  - [Thoughts on Foreign Keys](https://github.com/github/gh-ost/issues/331)

물론 FK 가 없다면 중복된 데이터 혹은 잘못된 데이터들이 있을 가능성은 충분하다. 이런 상황을 위해서 Data Cleansing 이라는 것이 존재한다.

## Data Cleansing

> Help improve the quality of your data.

Data Cleansing 은 데이터의 정합성을 맞추기 위해 불필요한 데이터 삭제, 데이터 보정 등의 작업을 수행하는 것을 의미한다.

Database 가 FK 가 존재하지 않는 형태로 설계되어있다면 Data Cleansing Guide 를 문서화하여 팀에 공유하는 것이 좋다.

- __Data Cleansing__

```sql
-- Step1: 상품 아이디로 주문 조회 후 orderId 확보
select order_id from order where product_id = 1

-- Step2: 주문 아이디로 주문 상품 조회 후 orderItemId 확보
select order_item_id from order_item where order_id = 1

-- Step3: Update 수행
```

## Links

- [What are the advantages of defining a foreign key](https://stackoverflow.com/questions/10183116/what-are-the-advantages-of-defining-a-foreign-key)
- [Why are foreign keys more used in theory than in practice?](https://stackoverflow.com/questions/1876013/why-are-foreign-keys-more-used-in-theory-than-in-practice)
- [Operating without foreign key constraints](https://planetscale.com/docs/learn/operating-without-foreign-key-constraints)
- [The Importance of the Foreign Key Constraint](https://www.linkedin.com/pulse/importance-foreign-key-constraint-tim-miles/)