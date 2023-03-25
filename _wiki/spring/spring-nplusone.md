---
layout  : wiki
title   : N+1 Query Problem with JPA
summary : 
date    : 2023-03-19 15:05:32 +0900
updated : 2023-03-19 15:15:24 +0900
tag     : spring jpa
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## N+1 Query Problem

N+1 이란 하위 엔티티들을 조회하기 위해서 상위 엔티티의 Row 개수 만큼의 추가 쿼리가 발생하는 것을 의미한다.

예를 들어, 부모 테이블의 Row 가 1개이고 자식 테이블의 Row 가 10개인 경우 N+1 이 발생한다고 하면 몇개의 쿼리가 발생될까?

정답은 2개이다. 상위 엔티티 전체를 가져오는 쿼리 1개와, 상위 엔티티의 Row 가 1개이므로 총 2개

사용할 예제는 __Team:Member = 1:N__ 이다.

### Not Solution Applied

__Team:__

```kotlin
@Entity
@Table(name = "tbl_team")
class Team(
    @Id
    @Column(name = "team_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "name")
    val name: String,

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "team", cascade = [CascadeType.ALL], orphanRemoval = true)
    val members: MutableList<Member> = mutableListOf()
) {
    fun setMembers(vararg members: Member) {
        members.forEach {
            this.members.add(it)
            it.setTeam(this)
        }
    }
}
```

__Member:__

```kotlin
@Entity
@Table(name = "tbl_member")
class Member(
    @Id
    @Column(name = "member_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "phone")
    val phone: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private var team: Team
) {
    fun setTeam(team: Team) {
        this.team = team
    }

    fun getTeam(): Team {
        return this.team
    }
}
```

team 1개당 5개의 member 를 가지고 있고, team 의 총 row 수는 3개라고 가정한다. member 는 총 15개

그 후 repository 로 findAll 로 조회하면 아래와 같이 쿼리가 발생한다.

```kotlin
fun findAll() {
    val teams = teamRepository.findAll()
    for (team in teams) {
        team.members.forEach { println("${it.phone} // $it") }
    }
}
```

__Output - findAll():__

```
Hibernate: 
    select
        team0_.team_id as team_id1_1_,
        team0_.name as name2_1_ 
    from
        tbl_team team0_
Hibernate: 
    select
        members0_.team_id as team_id3_0_0_,
        members0_.member_id as member_i1_0_0_,
        members0_.member_id as member_i1_0_1_,
        members0_.phone as phone2_0_1_,
        members0_.team_id as team_id3_0_1_ 
    from
        tbl_member members0_ 
    where
        members0_.team_id=?
1 // com.example.demo.entity.Member@7ddea2bd
2 // com.example.demo.entity.Member@705b6e05
3 // com.example.demo.entity.Member@207a1be1
4 // com.example.demo.entity.Member@1a5fbe84
5 // com.example.demo.entity.Member@790c85d4
Hibernate: 
    select
        members0_.team_id as team_id3_0_0_,
        members0_.member_id as member_i1_0_0_,
        members0_.member_id as member_i1_0_1_,
        members0_.phone as phone2_0_1_,
        members0_.team_id as team_id3_0_1_ 
    from
        tbl_member members0_ 
    where
        members0_.team_id=?
1 // com.example.demo.entity.Member@45156a44
2 // com.example.demo.entity.Member@582a6517
3 // com.example.demo.entity.Member@6d2e88f3
4 // com.example.demo.entity.Member@54777a0
5 // com.example.demo.entity.Member@6bee6a06
Hibernate: 
    select
        members0_.team_id as team_id3_0_0_,
        members0_.member_id as member_i1_0_0_,
        members0_.member_id as member_i1_0_1_,
        members0_.phone as phone2_0_1_,
        members0_.team_id as team_id3_0_1_ 
    from
        tbl_member members0_ 
    where
        members0_.team_id=?
1 // com.example.demo.entity.Member@47535fbb
2 // com.example.demo.entity.Member@5ff5b30d
3 // com.example.demo.entity.Member@28aaa72
4 // com.example.demo.entity.Member@45b06ad0
5 // com.example.demo.entity.Member@3dd20097
```

상위 엔티티의 전체 조회 쿼리 1개와, 상위 엔티티의 Row 개수(3개) 만큼의 추가 쿼리가 발생한다.

### Fetch Join

아래 처럼 fetch join 을 걸어줄 것이다. fetch join 은 연관된 엔티티를 미리 조회한다는 전략이다.

```kotlin
interface TeamRepository: JpaRepository<Team, Long> {

    @Query("select t from Team t join fetch t.members")
    fun findAllJoinFetch(): List<Team>
}
```

__Output - Fetch Join:__

```
Hibernate: 
    select
        team0_.team_id as team_id1_1_0_,
        members1_.member_id as member_i1_0_1_,
        team0_.name as name2_1_0_,
        members1_.phone as phone2_0_1_,
        members1_.team_id as team_id3_0_1_,
        members1_.team_id as team_id3_0_0__,
        members1_.member_id as member_i1_0_0__ 
    from
        tbl_team team0_ 
    inner join
        tbl_member members1_ 
            on team0_.team_id=members1_.team_id
```

Inner Join 을 사용하도록 변경되었다. 쿼리는 1개만 발생한다.

### EntityGraph

이번엔 EntityGraph 를 사용해준다.

```kotlin
interface TeamRepository: JpaRepository<Team, Long> {

    @EntityGraph(attributePaths = ["members"])
    @Query("select t from Team t")
    fun findAllEntityGraph(): List<Team>
}
```

The default value of the type argument of the @EntityGraph annotation is EntityGraphType.FETCH. When we use this, the Spring Data module will apply the FetchType.EAGER strategy on the specified attribute nodes. And for others, the FetchType.LAZY strategy will be applied.

속성으로 지정된 경우 FetchType.EAGER 로 미리 조회하게된다. 속성으로 지정되지 않은 경우에는 FetchType.LAZY 이 적용된다. 컬럼 마다 서로 다른 FetchType 전략을 사용할 수 있다.

__Output - EntityGraph:__

```
Hibernate: 
    select
        distinct team0_.team_id as team_id1_1_0_,
        members1_.member_id as member_i1_0_1_,
        team0_.name as name2_1_0_,
        members1_.phone as phone2_0_1_,
        members1_.team_id as team_id3_0_1_,
        members1_.team_id as team_id3_0_0__,
        members1_.member_id as member_i1_0_0__ 
    from
        tbl_team team0_ 
    left outer join
        tbl_member members1_ 
            on team0_.team_id=members1_.team_id
```

left outer join 을 사용하여 가져온다. 쿼리는 1개만 발생한다.

@NamedEntityGraph 도 @EntityGraph 를 사용한다. 대신 @NamedEntityGraph 를 사용하기 위해서 엔티티에 아래와 같이 설정을 해줘야 한다.

```java
@Entity
@NamedEntityGraph(name = "Item.characteristics",
    attributeNodes = @NamedAttributeNode("characteristics")
)
public class Item {
	//...
}
```

자세한 내용은 [Spring Data JPA and Named Entity Graphs](https://www.baeldung.com/spring-data-jpa-named-entity-graphs) 참고

jojoldu 님 블로그를 보면 엔티티에 @NamedEntityGraph 관련 설정 코드를 추가하는 것은 __Entity 책임이 아니라, 각 Service/Repository 가 담당해야할 책임__ 이라고 생각한다고 말한다. 

나 또한 동의. 

__기본 전략을 FetchType.LAZY 로 가져가고 (EAGER 는 N+1 발생 가능성이 높음), 각 서비스나 레포지토리에서 유동적으로 Fetch 전략을 가져가는 것이 좋다고 생각함.__

## Cartesian product

위 예제에서 FetchJoin 와 EntityGraph 를 사용하여 N+1 문제를 해결하였지만 변수 teams 를 디버깅 해보면 총 15개의 team 이 들어있다. 
즉, 중복된 team 이 존재한 상태이다.

![](/resource/wiki/spring-nplusone/catesian.png)

그 이유는 Cartesian product(카테시안 곱) 때문이다. 카테시안 곱은 두 개 이상의 기준 테이블에 대해 연결 가능한 행을 모두 결합하는 조인 방식이다. (team row 3개 x member 5개 = 15개)

Cartesian product 문제를 해결하기 위해서는 `distinct` 키워드를 추가하면 된다.

```kotlin
interface TeamRepository: JpaRepository<Team, Long> {

    @Query("select distinct t from Team t join fetch t.members")
    fun findAllJoinFetch(): List<Team>

    @EntityGraph(attributePaths = ["members"])
    @Query("select distinct t from Team t")
    fun findAllEntityGraph(): List<Team>
}
```

그러면 이제 team 의 row 개수인 3개만 변수에 할당되게 된다.

## MultipleBagFetchException

2개 이상의 OneToMany 하위 엔티티에 Fetch Join 을 사용하게 되면 MultipleBagFetchException 문제가 발생한다.

이번엔 하위 엔티티로 Sponsor 를 추가한다.

__Sponsor:__

```kotlin
@Entity
@Table(name = "tbl_sponsor")
class Sponsor(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private var team: Team
) {
    fun setTeam(team: Team) {
        this.team = team
    }

    fun getTeam(): Team {
        return this.team
    }
}
```

Team 엔티티에는 아래와 같이 @OneToMany 가 2개 존재하는 상태

```kotlin
@OneToMany(fetch = FetchType.LAZY, mappedBy = "team", cascade = [CascadeType.ALL], orphanRemoval = true)
val members: MutableList<Member> = mutableListOf()

@OneToMany(fetch = FetchType.LAZY, mappedBy = "team", cascade = [CascadeType.ALL], orphanRemoval = true)
val sponsors: MutableList<Sponsor> = mutableListOf()
```

그리고 sponsor 도 member 처럼 5개씩 등록해준다. (team 은 3개이며, 각 팀마다 member 와 sponsor 가 5개 씩 존재하는 상태)

N+1 문제를 발생시키면 7개의 쿼리가 발생된다.

__Fetch Join 과 EntityGraph 는 member 에만 걸려있는 상태:__

```kotlin
interface TeamRepository: JpaRepository<Team, Long> {

    @Query("select distinct t from Team t join fetch t.members")
    fun findAllJoinFetch(): List<Team>

    @EntityGraph(attributePaths = ["members"])
    @Query("select distinct t from Team t")
    fun findAllEntityGraph(): List<Team>
}
```

Fetch Join or EntityGraph 를 사용하여 데이터를 조회하면 쿼리는 총 4번 발생된다. (sponsor 는 N+1 이 계속 발생되는 상태)

sponsor 의 N+1 문제를 해결하기 위해서 join fetch 를 두 번 사용하도록 변경해보자.

```kotlin
@Query("select distinct t from Team t join fetch t.members join fetch t.sponsors")
fun findAllJoinFetch(): List<Team>
```

그러면 Compile Time 에 아래와 같이 __cannot simultaneously fetch multiple bags__ 에러가 발생한다.

```
Caused by: java.lang.IllegalArgumentException: Validation failed for query for method public abstract java.util.List com.example.demo.repository.TeamRepository.findAllJoinFetch()!
Caused by: java.lang.IllegalArgumentException: org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags
Caused by: org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags: [com.example.demo.entity.Team.members, com.example.demo.entity.Team.sponsors]
```

JPA 에서 xxxToOne 은 FetchJoin 이 몇개든 가능하지만, xxxToMany 는 1개만 가능하다고 한다.

### Global Config: Batch Fetch Size

위 문제를 해결하기 위해 hibernate 의 __default_batch_fetch_size__ 옵션을 사용하면 된다. batch size 옵션을 주면 `id = ?` 가 아니라 `id in (1, 2, 3)` 처럼 in 절을 사용하도록 변경된다.

```sql
-- default_batch_fetch_size 에 지정된 수만큼 in 절에 부모 Key 를 사용
select * from sponsor where team_id in (1, 2, 3)
```

만약 N+1 에서 총 10001 번의 쿼리가 수행되던것을 batch_size 를 1000으로 주고나면 총 11 번의 쿼리가 수행된다.

__application.yml:__

```yml
spring:
  jpa:
    properties:
      hibernate.default_batch_fetch_size: 1000
```

member 에만 fetch join 을 걸어두고, batch size 옵션을 주고나면 쿼리가 2번으로 줄어든다.

__Output:__

```
// Fetch Join
Hibernate: 
    select
        distinct team0_.team_id as team_id1_2_0_,
        members1_.member_id as member_i1_0_1_,
        team0_.name as name2_2_0_,
        members1_.phone as phone2_0_1_,
        members1_.team_id as team_id3_0_1_,
        members1_.team_id as team_id3_0_0__,
        members1_.member_id as member_i1_0_0__ 
    from
        tbl_team team0_ 
    inner join
        tbl_member members1_ 
            on team0_.team_id=members1_.team_id

// Batch Size
Hibernate: 
    select
        sponsors0_.team_id as team_id3_1_1_,
        sponsors0_.id as id1_1_1_,
        sponsors0_.id as id1_1_0_,
        sponsors0_.name as name2_1_0_,
        sponsors0_.team_id as team_id3_1_0_ 
    from
        tbl_sponsor sponsors0_ 
    where
        sponsors0_.team_id in (
            ?, ?, ?
        )
```

## Optimization

따라서 조회 전략을 기본적으로 아래와 같이 가져가는 것이 좋다.

1. hibernate.default_batch_fetch_size 를 Global 하게 적용하여 equal 대신 in 쿼리를 사용하도록 한다. (yml)
2. @xxxToOne 에 대해서는 Fetch Join 을 적용한다.
3. @xxxToMany 에 대해서는 데이터가 많은 쪽에 Fetch Join 을 사용한다. 

## Links

- [N+1 query problem with JPA and Hibernate](https://vladmihalcea.com/n-plus-1-query-problem/)
- [jojoldu - JPA N+1 문제 및 해결방안](https://jojoldu.tistory.com/165)
- [jojoldu - MultipleBagFetchException 발생시 해결 방법](https://jojoldu.tistory.com/457)