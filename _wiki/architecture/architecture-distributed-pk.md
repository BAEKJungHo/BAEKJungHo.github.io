---
layout  : wiki
title   : Distributed UniquenessKey
summary : 
date    : 2023-03-12 15:02:32 +0900
updated : 2023-03-12 15:12:24 +0900
tag     : architecture msa snowflake
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Distributed Uniqueness Key

분산환경에서 UniqueID 를 어떻게 생성할까? ID Generator 는 필수 불가결(mission-critical) 컴포넌트 이므로 아주 높은 가용성을 제공해야 한다.

요구 사항은 다음과 같다.

1. ID 는 유일해야 한다.
2. ID 는 숫자로만 구성되어야 한다.
3. ID 는 64비트로 표현될 수 있는 값이어야 한다.
4. ID 는 발급 날짜에 따라 정렬 가능해야 한다.
5. 초당 10,000 개의 ID 를 만들 수 있어야 한다.

방안으로는 다음과 같다.

- 다중 마스터 복제(multi-master replication)
- ___[UUID(Universally Unique Identifier)](https://ntietz.com/blog/til-uses-for-the-different-uuid-versions/)___
- 티켓 서버(ticket server)
- 트위터 스노우플레이크(twitter snowflake) 접근법

[MySQL InnoDB Primary Key Choice: GUID/UUID vs Integer Insert Performance](https://kccoder.com/mysql/uuid-vs-int-insert-performance/)

UUID 를 PK 로 사용하면 안된다. 순서 보장이 안되기 때문에 INSERT 성능이 떨어진다. (무슨 말인지 모르겠으면 B+Tree 구조를 배워야 함)

### Multi-Master Replication

다중 마스터 복제는 auto_increment 를 사용하는 것인데 1만큼 증가시키는 것이 아니라 k(현재 사용 중인 데이터베이스 서버의 수)만큼 증가 시킨다.

단점으로는 다음과 같다.
- 여러 데이터 센터에 걸쳐 규모를 늘리기 어렵다.
- ID 의 유일성은 보장되겠지만 그 값이 시간 흐름에 맞추어 커지도록 보장할 수는 없다.
- 서버를 추가하거나 삭제할 때도 잘 동작하도록 만들기 어렵다.

### Universally Unique Identifier

UUID 는 유일하게 식별하기 위한 128비트짜리 수다. 웹 서버마다 별도의 UUID 생성기를 사용해 독립적으로 ID 를 만들어 낸다.

- 장점
    - 단순하며, 서버 사이의 동기화가 필요 없다.
    - 각 서버마다 UUID 생성기를 만들면 되기 때문에 확장이 쉽다.
- 단점
    - 128 비트로 길다.
    - 시간순으로 정렬할 수 없다.
        - 대체안으로 [Ordered UUID](https://baekjungho.github.io/wiki/database/database-surrogatekey/#ordered-uuid) 방식도 있다. (UUID 는 생성될때 중간에 시간 값이 들어간다. 이 시간 값을 앞 쪽으로 빼고, 뒤에 random string 을 붙여서 대체키를 생성하면 성능 최적화를 끌어낼 수 있다.)
    - 숫자 아닌 값이 포함될 수 있다.

### Ticket Server

auto_increment 기능을 갖춘 데이터베이스 서버, 즉 티켓 서버를 중앙에 하나만 배치해두고 각 웹 서버에서 가져다 사용하는 것이다.

- 장점
    - 유일성이 보장되는 오직 숫자로만 구성되는 ID 를 쉽게 만들 수 있다.
    - 구현하기 쉽고, 중소 규모 애플리케이션에 적합하다.
- 단점
    - 티켓 서버가 SPOF(Single-Point-of-Failure, 단일 장애점) 가 된다. 이 서버에 장애가 발생하면 해당 서버를 이용하는 모든 시스템이 영향을 받는다. 이 이슈를 피하기 위해 티켓 서버 여러대를 둔다면 동기화 문제가 발생할 것이다.

### Twitter Snowflake

Divide-and-Conquer 를 먼저 적용해서, 생성해야 하는 ID 구조를 여러 절(section)으로 분할해보자.

![](/resource/wiki/architecture-distributed-pk/snowflake.png)

- Sign: 1 bit 할당
- Timestamp: 41 bit 할당. 기원시각 이후로 몇 millisecond가 경과했는지 나타내는 값
- Datacenter id: 5 bit 할당. 데이터 센터의 아이디. 5비트이므로 32개의 데이터센터 지원 가능.
- Server id: 5 bit 할당. 서버의 아이디. 5비트이므로 32(2의 5승)개의 서버 지원 가능. 데이터센터당 32개 서버 사용
- sequence: 12bit 할당. 각 서버에서는 ID 생성시마다 해당 sequence 1씩 증가. 1 millisecond마다 0으로 초기화

데이터센터 ID 와 서버 ID 는 시스템이 시작할 때 결정되며, 일반적으로 시스템 운영 중에는 바뀌지 않는다.

타임스탬프 41비트로 표현할 수 있는 최댓값은 2의 41 제곱 - 1로 2199023255551 밀리초이다. 약 69년에 해당한다.

타임스탬프 bit 를 -> 10진수로 -> 트위터 기원 시각(epoch) 을 더함 -> 결과로 얻어진 밀리초 값을 UTC 로 변환.

### Sharding & IDs at Instagram

Twitter의 Snowflake 를 참고로 DB 테이블을의 논리적인 shard 를 고려해서 PL/PGSQL(PostgreSQL 에서 지원되는 프로그래밍 언어)로 구현했고, 64비트로 작은 사이즈로 인덱싱 크기를 작게 할 수 있다.

[Sharding & IDs at Instagram](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c)

- 41bit 타임 스탬프
- 13bit 샤드 ID
- 10bit auto-incrementing 시퀀스 정보

### Baidu UID generator

Twitter 의 Snowflake 를 참고로 Java 언어로 구현했고 64비트 길이로 인덱스 사이즈를 줄일 수 있다.

[Baidu - UidGenerator](https://github.com/baidu/uid-generator)

![](/resource/wiki/architecture-distributed-pk/baidu.png)

- 1bits sign
- 28bits delta seconds
- 22bits worker id
- 13bits sequence

### Firebase PushID

모두 120 bit 로 구성되어 있으며, 인덱스 사이즈가 좀 커질 수 있다.

[The 2^120 Ways to Ensure Unique Identifiers](https://firebase.blog/posts/2015/02/the-2120-ways-to-ensure-unique_68)

- 48bit 타임스탬프
- 72bit 랜덤(무작위)

## Clock Synchronization

ID 생성 서버들이 전부 같은 시계를 사용하면 문제가 없지만, 여러 서버가 물리적으로 독립된 여러 장비에서 실행되는 경우 혹은 하나의 서버가 여러 코어에서 실행되는 경우에는 시계 동기화(clock synchronization)가 필요하다.

가장 보편적인 해결 수단으로는 [Network Time Protocol](https://en.wikipedia.org/wiki/Network_Time_Protocol) 이 있다.

## Links

- [7 Famous Approaches to Generate Distributed ID with Comparison Table](https://blog.devgenius.io/7-famous-approaches-to-generate-distributed-id-with-comparison-table-af89afe4601f)
- [DB 테이블의 키인 ID 생성에 대한 방법 고찰 : UUID 의 진화, MySQL 사용자를 위한 방법, 글로벌 기업의 ID 생성 사례](https://www.mimul.com/blog/id-generation-in-mysql/)

## References

- 가상 면접 사례로 배우는 대규모 시스템 설계 기초 / 알렉스 쉬 저 / 인사이트