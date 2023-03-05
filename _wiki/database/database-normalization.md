---
layout  : wiki
title   : Normalization
summary : 
date    : 2023-03-03 15:28:32 +0900
updated : 2023-03-03 18:15:24 +0900
tag     : database jpa
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Normalization

Database normalization is a process of organizing data in a database in a way that reduces redundancy and dependency between data.

### 1NF: First Normal Form Rules

- Each table cell should contain a single value.
- Each record needs to be unique.

1NF 는 컬럼이 __원자값(Atomic value)__ 을 가져야 한다. 예를 들면 1번 Row 에 잇는 Title 이라는 컬럼의 값에 Title-A, Title-B 이런식으로 두 개 이상 갖고 있으면 안된다.

1NF 는 __후보키 관계를 갖는 컬럼들에 대해 함수적 종속성__ 을 가지고 있다. 예를 들어 Full Names 와 Physical Address 라는 컬럼의 조합이 후보키인 경우 Books Rented 라는 컬럼이 후보키에 의존할 수 있다.

2NF 를 만족시키기 위해선 위 의존성을 제거해야 한다.

### 2NF: Second Normal Form Rules

- Rule 1- Be in 1NF
- Rule 2- Single Column Primary Key that does not functionally dependent on any subset of candidate key relation

보통 문제가 되는 컬럼(다른 컬럼에 의존하는 컬럼, 종속성을 띄고 있는 컬럼)을 대상으로 테이블을 분리하면 된다.

Books Rented 라는 컬럼이 종속성을 띄고있었다면 Book 을 관리하는 새로운 테이블을 만들고 Full Names 와 Physical Address 라는 컬럼을 갖고 있는 테이블의 PK 를 Book 을 관리하는 새로운 테이블에 매핑하면 된다.

이 과정에서 Foreign Key 가 탄생한다.

하지만 2NF 는 이행적 함수 종속이 존재할 수 있다.

A transitive [functional dependency](https://www.guru99.com/dbms-functional-dependency.html) is when changing a non-key column, might cause any of the other non-key columns to change

![](/resource/wiki/database-normalization/functional-dependency.png)

In database normalization, a transitive functional dependency __occurs when a non-key attribute is functionally dependent on another non-key attribute__.

### 3NF: Third Normal Form Rules

- Rule 1- Be in 2NF
- Rule 2- Has no transitive functional dependencies

이행적 함수 종속성(transitive functional dependency)을 없애는 것이 3NF 이다.

## Links

- [What is Normalization in DBMS (SQL)? 1NF, 2NF, 3NF Example](https://www.guru99.com/database-normalization.html)