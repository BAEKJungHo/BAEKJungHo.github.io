---
layout  : wiki
title   : Aggregate
summary : 
date    : 2022-05-01 15:02:32 +0900
updated : 2022-05-01 15:12:24 +0900
tag     : ddd
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## From: 도메인 주도 개발 시작하기

> 개별 객체 수준에서 모델을 바라보면 상위 수준에서 관계를 파악하기 어렵다. 도메인 객체 모델이 복잡해지면 개별 구성요소 위주로 모델을 이해하게 되고 전반적인 구조나 큰 수준에서 도메인 간의 관계를 파악하기 어려워진다.
> 
> 주요 도메인 요소 간의 관계를 파악하기 어렵다는 것은 코드를 변경하고 확장하는 것이 어려워진다는 것을 의미한다. 
> 
> 복잡한 도메인을 이해하고 관리하기 쉬운 단위로 만들려면 상위 수준에서 모델을 조망할 수 있는 방법이 필요한데, 그 방법이 바로 애그리거트다.
> 
> 애그리거트는 관련된 객체를 하나의 군으로 묶어준다.
> 
> 흔히 'A' 가 'B' 를 갖는다로 설계할 수 있는 요구사항이 있다면 A 와 B 를 한 애그리거트로 묶어서 생각하기 쉽다. 하지만, 'A 가 B 를 갖는다' 로 해석할 수 있는 요구사항이 있다고 하더라도 이것이 반드시 A 와 B 가 한 애그리거트에 속한다는 것을 의미하는 것은 아니다.
> 
> 좋은 예가 상품과 리뷰다. Product 가 Review 를 갖는 것으로 생각할 수 있지만, 상품과 리뷰는 함께 생성되거나 변경되지 않고 변경 주체도 다르기 때문에 서로 다른 애그리거트에 속한다.

### Root Aggregate

> 도메인 규칙을 잘 지키려면 애그리거트에 속한 모든 객체가 정상 상태를 가져야 한다. 애그리거트에 속한 모든 객체가 일관된 상태를 유지하려면 애그리거트 전체를 관리할 주체가 필요한데, 이 책임을 지는 것이 바로 애그리거트의 루트 엔티티이다.
> 
> 즉, 루트 애그리거트의 핵심 역할은 애그리거트의 일관성이 깨지지 않도록 하는 것이다.

## From: 도메인 주도 설계

> 모델 내에서 복잡한 연관관계를 맺는 객체를 대상으로 변경의 일관성을 보장하기란 쉽지 않다. 이유는 단지 개별 객체만이 아닌 서로 밀접한 관계에 있는 객체 집합에도 불변식이 적용 돼야 하기 때문이다.
> 
> AGGREGATE 는 우리가 데이터 변경의 단위로 다루는 연관 객체의 묶음을 말한다. AGGREGATE 에는 루트(root)와 경계(boundary)가 있다. 루트는 단 하나만 존재해야 한다. 경계 안의 객체는 서로 참조할 수 있지만, 경계 바깥의 객체는 해당 AGGREGATE 의 구성요소 가운데 루트만 참조할 수 있다. 루트 이외의 ENTITY 는 지역 식별성(local identity)을 지니며, 지역 식별성은 AGGREGATE 내에서만 구분되면 된다. 이는 해당 AGGREGATE 의 경계 밖에 위치한 객체는 루트 ENTITY 컨텍스트 말고는 AGGREGATE 의 내부를 볼 수 없기 때문이다.

### 규칙

- 루트 ENTITY 는 전역 식별성을 지니며 궁극적으로 불변식을 검사할 책임이 있다.
- 각 루트 ENTITY 는 전역 식별성을 지닌다. 경계 안의 ENTITY 는 지역 식별성을 지니며, 이러한 지역 식별성은 해당 AGGREGATE 안에서만 유일하다.
- AGGREGATE 의 경계 밖에서는 루트 ENTITY 를 제외한 AGGREGATE 내부의 구성요소를 참조할 수 없다. 루트 ENTITY 가 내부 ENTITY 에 대한 참조를 다른 객체에 전달 해 줄 수는 있지만 그러한 객체는 전달받은 참조를 일시적으로만 사용할 수 있고, 참조를 계속 보유하고 있을 수는 없다. 루트는 VALUE OBJECT 의 복사본을 다른 객체에 전달해 줄수 있으며, 복사본에서는 어떤 일이 일어나든 문제되지 않는다. 이것은 복사본이 단순한 VALUE 에 불과하며 AGGREGATE 와는 더는 연관관계를 맺지 않을 것이기 때문이다.
- AGGREGATE 안의 객체는 다른 AGGREGATE 의 루트만 참조할 수 있다.
- 삭제 연산은 AGGREGATE 경계 안의 모든 요소를 한 번에 제거해야 한다.
- AGGREGATE 경계 안의 어떤 객체를 변경하더라도 전체 AGGREGATE 의 불변식은 모두 지켜야 한다.

## From: 도메인 주도 설계 철저 입문

> 애그리게이트(aggregate)는 변경의 단위이다. 데이터를 변경하는 단위로 다뤄지는 객체의 모임을 애그리게이트라고 한다.
>
> 애그리게이트에는 루트 객체가 있고, 모든 조작은 이 루트 객체를 통해 이루어진다. 그러므로 애그리게이트 내부의 객체에 대한 조작에는 제약이 따르며, 이로 인해 애그리게이트 내부의 불변 조건이 유지된다.
>
> 애그리게이트는 데이터 변경의 단위가 되므로 트랜잭션이나 락과도 밀접한 관계를 맺는다.
>
> 애그리게이트는 불변 조건을 유지하는 단위로 꾸려지며 객체 조작의 질서를 유지한다.

### Law of Demeter

> Law of Demeter(데메테르 법칙) : 객체를 다루는 조작의 기본 원칙

객체 간의 어떤 질서 없이 메서드를 호출하면 불변 조건을 유지하기 어렵다. 데메테르의 법칙은 객체 간의 메서드 호출에 질서를 부여하기 위한 가이드라인이다.

데메테르 법칙은 어떤 컨텍스트에서 다음 객체의 메서드만을 호출할 수 있게 제한한다.

- 객체 자신
- 인자로 전달받은 객체
- 인스턴스 변수
- 해당 컨텍스트에서 직접 생성한 객체

## From: MartinFowler

> Aggregate is a pattern in Domain-Driven Design. A DDD aggregate is a cluster of domain objects that can be treated as a single unit. An example may be an order and its line-items, these will be separate objects, but it's useful to treat the order (together with its line items) as a single aggregate.
>
> An aggregate will have one of its component objects be the aggregate root. Any references from outside the aggregate should only go to the aggregate root. The root can thus ensure the integrity of the aggregate as a whole.
>
> Aggregates are the basic element of transfer of data storage - you request to load or save whole aggregates. Transactions should not cross aggregate boundaries.
>
> DDD Aggregates are sometimes confused with collection classes (lists, maps, etc). DDD aggregates are domain concepts (order, clinic visit, playlist), while collections are generic. An aggregate will often contain multiple collections, together with simple fields. The term "aggregate" is a common one, and is used in various different contexts (e.g. UML), in which case it does not refer to the same concept as a DDD aggregate.

## Links

- [DDD-Aggregate-MartinFowler](https://martinfowler.com/bliki/DDD_Aggregate.html)

## 참고 문헌

- 도메인 주도 설계 / Eric Evans 저 / 위키북스
- 도메인 주도 개발 시작하기 / 최범균 저 / 한빛미디어
- 도메인 주도 설계 철저 입문 / 나루세 마사노부 저 / 위키북스
