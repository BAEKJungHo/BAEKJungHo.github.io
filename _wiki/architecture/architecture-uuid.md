---
layout  : wiki
title   : Universally Unique Identifier
summary : 
date    : 2023-10-24 15:02:32 +0900
updated : 2023-10-24 15:12:24 +0900
tag     : architecture cloudnative database uuid jpa
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Universally Unique Identifier

A ___[UUID; Universally Unique Identifier](https://ntietz.com/blog/til-uses-for-the-different-uuid-versions/)___, is a __128-bit identifier__ that is guaranteed to be unique across both time and space. It is often represented as a 36-character hexadecimal string, typically separated by hyphens into groups of __8-4-4-12__ characters, such as "550e8400-e29b-41d4-a716-446655440000."

- v1 - Version 1 UUIDs using a timestamp and monotonic counter.
- v3 - Version 3 UUIDs based on the MD5 hash of some data.
- v4 - Version 4 UUIDs with random data.
- v5 - Version 5 UUIDs based on the SHA1 hash of some data.
- [v7](https://www.ietf.org/archive/id/draft-ietf-uuidrev-rfc4122bis-00.html#name-uuid-version-7) - __UUID 버전 7 (UUIDv7)은 가장 중요한 48비트에 유닉스 타임스탬프를 밀리초 단위로 인코딩하고, 나머지 74비트는 무작위로 생성__
  - Drawbacks
    - ___[UUIDv7](https://uuid7.com/)___ 의 잠재적인 문제점 중 하나는 사용자가 ID 에서 생성 시간을 추출할 수 있다.

### Which version to use?

> ___[Rust UUID Docs](https://docs.rs/uuid/latest/uuid/)___
> 
> If you just want to generate unique identifiers then consider version 4 (v4) UUIDs. If you want to use UUIDs as `database keys` or need to `sort` them then consider version 7 (v7) UUIDs. Other versions should generally be avoided unless there’s an existing need for them.
>
> Some UUID versions supersede others. Prefer version 6 over version 1 and version 5 over version 3.

UUID7 과 UUID4 의 선택 기준은 성능이냐 보안이냐 갈린다. 만약 생성 시간 노출이 보안적으로 리스크가 있는 서비스라면 UUID4 가 좋으며, 판단하기 힘들때는 일단 UUID4 를 사용하는 것을 추천한다.

### UUID with Hibernate

```kotlin
@Entity
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    val id: UUID = UUIDGenerator.random(),
)
```

위 처럼 UUID 를 PK 로 지정하여 사용하는 경우 처음에 user_id 로 조회를 하고 -> 데이터가 없으면 -> insert 를 수행한다.
즉, insert 하기 전에 select 를 먼저하게 된다.

## Links

- [Why UUID7 is better than UUID4 as clustered index in RDBMS](https://www.reddit.com/r/programming/comments/1b24z57/why_uuid7_is_better_than_uuid4_as_clustered_index/)
- [Goodbye integers. Hello UUIDv7!](https://buildkite.com/blog/goodbye-integers-hello-uuids)
- [Use the new v7 UUIDs in Postgres](https://pgxn.org/dist/pg_uuidv7/)

## References

- [RFC4122 - A Universally Unique IDentifier (UUID) URN Namespace](https://datatracker.ietf.org/doc/html/rfc4122)