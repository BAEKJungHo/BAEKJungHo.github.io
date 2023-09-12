---
layout  : wiki
title   : Hash
summary : 
date    : 2023-03-13 15:28:32 +0900
updated : 2023-03-13 18:15:24 +0900
tag     : algorithm hash crypto datastructures
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Hash

[해시(hash)](http://wiki.hash.kr/index.php/%ED%95%B4%EC%8B%9C)란 다양한 길이를 가진 데이터를 고정된 길이를 가진 데이터로 매핑(mapping)한 값이다.

## Hashing

해싱(hashing)이란 해시함수를 사용하여 주어진 값을 변환한 뒤, 해시 테이블에 저장하고 검색하는 기법을 말한다. 해싱에 사용되는 자료구조는 배열(array)과 연결리스트(linked list)가 조합된 형태이다. 짧은 해시 키를 사용하여 항목을 찾으면, 원래의 값을 이용하여 찾는 것보다 더 빠르기 때문에, 해싱은 데이터베이스 내의 항목들을 색인하고 검색하는데 사용된다.

해싱은 데이터들을 저장하거나 찾을 때 인덱스(index)라는 또다른 데이터 스트럭쳐를 이용하는 대신, 각 데이터들이 테이블의 어느 영역에 위치할 것인가를 결정해주는 __해시함수를 사용__ 하여 일정한 시간 내에 데이터들을 효과적으로 찾을 수 있도록 해주는 것이다. 따라서 데이터들은 순차적으로 저장되는 것이 아니라 테이블 전 영역에 걸쳐서 골고루 분포하게 되며, 저장된 데이터를 찾을 때에도 해시함수를 사용하면 곧바로 그 위치를 알아내는 것이 가능하기 때문에 매우 빠른 속도로 데이터를 검색할 수가 있게 된다.

단, __동등 연산__ 인 경우에만 사용 가능하다. 부등호 연산 안됨. Index 의 경우에는 부등호 연산도 생각해야 하므로 Hash 를 사용하지 않음.

## Hash Function

좋은 해시함수란 데이터를 고르게 분포하여 충돌을 최소화할 수 있는 함수.

[Naver - Java HashMap 은 어떻게 동작하는가?](https://d2.naver.com/helloworld/831311) 글에 HashMap 에 대해서 자세하게 설명되어있다.

__간단하게 사용할 수 있는 해시 함수:__
```java
String key
char[] ch = key.toChar();
int hash = 0;
for(int i=0;i<key.length;i++)
  hash = hash*31 + char[i]
```

## HashTable

HashMap 과 HashTable 을 정의한다면, __'키에 대한 해시 값을 사용하여 값을 저장하고 조회하며, 키-값 쌍의 개수에 따라 동적으로 크기가 증가하는 associate array'__ 라고 할 수 있다. 이 associate array 를 지칭하는 다른 용어가 있는데, 대표적으로 Map, Dictionary, Symbol Table 등이다.

![](/resource/wiki/datastrcutures-hash/hash-table.png)

전체 데이터 양을 __N(size_of_array)__ 이라 가정하고, John Smith의 데이타를 저장할때 __index = hash_function(“John Smith”) % N__  를 통해서 index 값을 구해내고, array[N] = “John Smith의 전화 번호 521-8976”을 저장한다.

> index(bucket address) = hash_function("key") % N

이런 자료구조의 장점은 특정 key 에 대한 value 를 찾을 때 hash_function 한 번만 수행하면 index 를 구할 수 있기 때문에 데이터의 저장과 삭제가 매우 빠르다.

문제는 index 를 구하는 수식을 돌릴 때 나오는 index 값이 중복 될 수있다. N 이 10이면, 1, 11, 21 등은 같은 값을 갖는다.

JDK 1.8의 경우에는 하나의 해시 버킷에 8개의 키-값 쌍이 모이면 LinkedList 를 Tree 로 변경한다. 이때 사용되는 Tree 가 [Red-Black Tree](https://ko.wikipedia.org/wiki/%EB%A0%88%EB%93%9C-%EB%B8%94%EB%9E%99_%ED%8A%B8%EB%A6%AC) 이다. 레드 블랙 트리는 부모 노드보다 작은 값을 가지는 노드는 왼쪽 자식으로, 큰 값을 가지는 노드는 오른쪽 자식으로 배치하여 균형을 맞춰준다.

### Separate chaining

Java HashMap 에서 사용하고 있는 방식이다. 

![](/resource/wiki/datastrcutures-hash/separate-chaining.png)

각 index 에 데이터를 저장하는 Linked List 에 대한 포인터를 가지는 방식이다. 충돌이 발생하면 해당 Linked List 에 값을 추가하면 되고, 값을 추출할 때에는 index 를 구하고 해당 key 에 대한 데이터가 있는지 검색하면 된다.

### Optimizing by Caching

해시 테이블의 get(key)과 put(key)에 간단하게 Caching 을 추가하게 되면, 자주 hit 하는 데이타에 대해서 바로 데이타를 찾게 함으로써 성능을 간단하게 향상 시킬 수 있다.

## Hash Join

위에서 배운 Hash 와 Hash Table Separate chaining 을 이해하면 아래 글을 이해하기 쉽다.

[데이터베이스 HASH JOIN 에 대하여](https://coding-factory.tistory.com/758) 

![](/resource/wiki/datastrcutures-hash/hash-join.png)

1. 둘 중 작은 집합(Build Input)을 읽어 Hash Area 에 해시 테이블을 생성한다.
2. 반대쪽 큰 집합(Probe Input)을 읽어 해시 테이블을 탐색하면서 JOIN 한다.
3. 해시 함수에서 리턴 받은 버킷 주소로 찾아가 해시 체인을 스캔하면서 데이터를 찾는다.

## MySQL vs PostgreSQL

MySQL vs PostgreSQL 선택의 기준에 대한 다양한 블로그 글들을 참고한 결과 MySQL 은 __확장성, 커뮤니티 지원__ 이 가장 이점으로 보였고, PostgreSQL 은 __복잡한 쿼리 처리__ 에 능하다는 것이 이점으로 보였다.

복잡한 쿼리 처리?..

[우아한형제들 - Aurora MySQL vs Aurora PostgreSQL](https://techblog.woowahan.com/6550/) 글을 보니 PostgreSQL 이 복잡한 쿼리 처리에 더 적합하단 이유를 알 수 있었다.

> MySQL 에서는 멀티쓰레드 환경 및 제한된 join 방식 제공으로 복잡한 쿼리나 대량 데이터 처리에서는 불리한 요소로 작용함. 또한 데이터 크기가 커질수록 테이블의 구조 변경이나 인덱스 생성 작업에도 상당한 시간이 소요되는데, 이러한 점들을 개선하기 위해 대량 데이터 처리에 특화돼 있다는 PostgreSQL 로의 이관을 고민하게 되었다고 함.
> 
> 단순 CRUD 시에는 MySQL 성능이 더 좋음. PostgreSQL 은 변경 전 값을 삭제마크 처리 후 변경 후 값을 새행으로 추가하는 방식으로 작업을 진행 PostgreSQL 은 보통 Insert, Select 위주의 서비스에 사용하는 것이 선호되고 있다고 함.
> 
> HASH JOIN 으로 성능 비교시 Aurora MySQL 에서는 22초 정도 소요된 반면 Aurora PostgreSQL 에서는 3초 정도 소요되었다고 함.
> 
> PostgreSQL 은 필요한 부분만 인덱스를 생성하기 때문에 저장공간에 대한 이점이 아주 크고 나아가 데이터 삭제, 추가, 갱신에 따른 인덱스 유지관리 비용도 절약된다고 함.

## Links

- [Wikipedia - Hash table](https://en.wikipedia.org/wiki/Hash_table)
- [HYPERCONNECT - PostgreSQL의 슬로우 쿼리에 대처하기](https://hyperconnect.github.io/2020/08/31/improve-slow-query.html)
- [해쉬 테이블의 이해와 구현 (Hashtable)](https://bcho.tistory.com/1072)