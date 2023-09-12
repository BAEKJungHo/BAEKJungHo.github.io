---
layout  : wiki
title   : Aggregate Massive Data With Bloom Filters
summary : 
date    : 2023-09-10 15:54:32 +0900
updated : 2023-09-10 20:15:24 +0900
tag     : algorithm datastructures
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Probabilistic Data Structure

확률적 자료 구조(Probabilistic Data Structure)란 정확성을 일부 희생하고 메모리 또는 시간 효율성을 개선하기 위해 설계된 자료 구조이다.

대량의 데이터를 처리하고 대용량 데이터베이스나 분산 시스템에서 성능을 향상시키는 데 유용하다. Disk I/O 최적화 하는데도 사용된다고 한다.

## Bloom Filter

블룸 필터(bloom filter) 는 __요소 멤버쉽 검사(element membership check) 알고리즘__ 이다. 
쉽게 말해, 특정 집합안에 요소가 들어있는지 검사하는 알고리즘이다.

특징으로는 완벽한 정확성은 아니지만 __Fast & Memory Efficient__ 이며 대용량 데이터 처리에 유용하다.

또한, 집합에 속한 원소를 속하지 않았다고 말하는 일(__False Negative__)은 절대 없다. 대신 집합에 속하지 않은 원소를 속했다(__False Positive__)고 말할 수는 있다.

You can try [Bloom Filter](https://llimllib.github.io/bloomfilter-tutorial/) Tutorial.

### How it works

N 개의 Hash Function


### Practical Examples by NHN Cloud

__[NHN Cloud MeetUp Bloom Filter](https://meetup.nhncloud.com/posts/192)__ 에 내용이 자세히 나와있다.


### Cuckoo Filter

[Cuckoo filters](https://brilliant.org/wiki/cuckoo-filter/) improve upon the design of the bloom filter by offering deletion.
