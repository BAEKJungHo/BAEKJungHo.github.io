---
layout  : wiki
title   : Surrogate Key
summary : 대체키의 필요성
date    : 2022-08-01 15:28:32 +0900
updated : 2022-08-01 18:15:24 +0900
tag     : database
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Surrogate Key

> 대체키(Surrogate key)란 자연키에 대한 대체용으로 인공적이거나 합성적인 키를 말하며, 주로 주민등록번호 같은 중요한 자료를 숨기기 위해 대체키로 사용하거나, 여러 개의 컬럼을 합성하여 검색 시 속도 향상을 위해 사용한다.

- DDD 에서는 Entity 의 식별자와 동급의 의미를 가지는 추가 식별자 정도의 의미를 지니기도 한다.
- Entity 의 식별자는 외부에 오픈하거나 오용되지 않도록 주의해야 한다. 
- 식별자 대신 대체키를 오픈하는 것이 좋다.
- Entity 식별자를 외부에 오픈하는 경우 이슈가 발생할 수 있다.
  - Ex. 별도의 인증 절차 없이 URL 을 통해 상세 데이터를 조회할 수 있는 경우. URL 의 키값만 바꿔주면 다른 사람의 상세 정보도 볼 수 있다.
  - Ex. 외부와 협력하여 서비스를 개발하는 경우, 외부 시스템의 PK 값을 우리 쪽 데이터베이스에 저장하거나 혹은 그 반대인 경우, 데이터베이스를 NoSQL 기반으로 바꾸게 되면 PK 체계가 달라지기 때문에 이슈가 발생할 수 있다. 따라서 UUID 같은 대체키를 사용하는 것이 좋다.
- 대체키를 사용할 때에는 역시 성능에 대한 고민이 많을 것인데 MySQL 기준으로 1천만 건 이상으로 넘어가기 전까지는 random string 으로 사용해도 조회 성능에 크게 이슈가 없고, 성능을 고려한다면 UUID 를 rearranged 하여 사용하는 것을 검토할 수 있다.

## Links

- [store uuid optimized way](https://www.percona.com/blog/2014/12/19/store-uuid-optimized-way/)