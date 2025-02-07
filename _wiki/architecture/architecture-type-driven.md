---
layout  : wiki
title   : Type Driven Architecture
summary : 
date    : 2025-01-29 10:02:32 +0900
updated : 2025-01-29 11:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## TYPE DRIVEN ARCHITECTURE

In a programming language like F#, ___types play a key role___, so let's look at what a functional programmer means by _type_.

___[Type](https://klarciel.net/wiki/ddd/ddd-modeling/#types-and-functions)___ 에는 Primitive Types, Generic, Object Types 등을 생각할 수 있다. 
타입은 ___[계약(contracts)](https://klarciel.net/wiki/test/test-design-by-contract/)___ 이다. 따라서 시스템의 ___안정성___ 을 높이고 타입을 ___재사용___ 할 수 있다는 장점이 있다.

Type 을 모델링(modeling) 할 때 고려해야하는 중요한 점은 해당 타입이 갖는 범위를 ___제한(Constrained)___ 하는 것이다.

```
type CustomerId = 
  | CustomerId of int
  
type UnitQuantity = UnitQuantity of int
type KilogramQuantity = KilogramQuantity of decimal
```

타입의 특징 중 하나는 ___조합(Composition)___ 이 가능하다는 것이다.

```
data Order = 
  CustomerInfo
  AND ShippingAddress
  AND BillingAddress
  AND list of OrderLines
  AND AmountToBill
```

___Type Driven Architecture___ 는 타입을 먼저 정의하고 이를 기반으로 시스템을 구축하는 방식으로서, 타입을 통한 안정성을 확보하고
타입을 재사용함으로서 생산성과 유지보수성을 높이는 것이 핵심이다. Type 이 설계에 가장 큰 영향을 주며, 설계 방향을 리드한다.
타입을 재사용하기 위해서는 조합되는 타입(e.g sub type) 외에 어떠한 의존성도 가지면 안된다.

모든 비지니스 로직 처리는 아래와 같은 간단한 흐름을 가진다.

![](/resource/wiki/architecture-type-driven/basic-process.png)

일반적으로 E-Commerce 의 경우에는 상당히 복잡한 객체를 다뤄야하며 객체간 협력이 핵심이다. 따라서 객체 중심의 모델링을 가져가는 것이 중요하다.
또한 주문, 결제 등을 처리하기 위해서 상당히 복잡한 ___input/output___ 을 요구한다. 이러한 성격의 비지니스에서는 ___Type___ 이 중심이 아닌 ___Object___ 가 중심이되는
___[Object Oriented Programming](https://klarciel.net/wiki/oop/oop-real-oop/)___ 을 해야한다.

반면, 선박, 차량, 스마트홈 등 특정 명령을 내리고 동기화하는 시스템은 input/output 이 Simple 하다.

예를 들어서 Telsa 의 [Mobile App](https://www.tesla.com/ownersmanual/model3/en_us/GUID-F6E2CD5E-F226-4167-AC48-BD021D1FFDAB.html) 을 통해서 차량 제어 명령(e.g Open the front or rear trunk)을 내리는 시나리오를 기반으로 
명령을 처리하기 위한 input 을 정의하면 다음과 같다. input 을 추출하는 과정은 제어 명령을 수행하기 위한 시스템에서 사용할 타입을 정의하기 위함이다.

- [require input] TRUNK (subject type)
- [require input] OPEN/CLOSE (action type)

subject type 은 action type 과 1:N 관계를 갖는다. 만약, 차 문이라고 하면 LOCK/UNLOCK, OPEN/CLOSE 의 action type 을 가질 수 있다.

![](/resource/wiki/architecture-type-driven/vehicle-control-type-driven.png)

시스템에서 정의한 Type 에 따라서 어떤 로직(검증, Vehicle API 호출 등)을 수행해야하는 지 ___결정(decisions)___ 되어야 한다.

