---
layout  : wiki
title   : Test Patterns for Standard Fixtures Reuse
summary : Object Mother, Test Data Builder, Fixture Monkey, EasyRandom
date    : 2024-07-19 20:28:32 +0900
updated : 2024-07-19 21:15:24 +0900
tag     : test spring fixturemonkey designpattern
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Test Patterns for Standard Fixtures Reuse

___[AAA(Arrange, Act, Assert)](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)___ 패턴을 사용할때 일반적으로 Arrange 단계가 가장 크다.

Arrange 단계에서 __standard fixtures__ 를 반환하는 __factory__ 를 갖는 것이 재사용성 측면에서 좋다. 이때 도움되는 두 가지 패턴으로는 _[Object Mother](https://wiki.c2.com/?ObjectMother)_ 과, _[Test Data Builder](https://wiki.c2.com/?TestDataBuilder)_ 패턴이 있다.
또한 관련 라이브러리로는 라이브러리로는 ___[Fixture Monkey](https://github.com/naver/fixture-monkey)___ 와 _[EasyRandom](https://github.com/j-easy/easy-random)_ 이 대표적이다.

_[Fixture Money 의 탄생 배경](https://deview.kr/data/deview/session/attach/11_%ED%85%8C%EC%8A%A4%ED%8A%B8%20%EA%B0%9D%EC%B2%B4%EB%8A%94%20%EC%97%A3%EC%A7%80%20%EC%BC%80%EC%9D%B4%EC%8A%A4%EA%B9%8C%EC%A7%80%20%EC%B0%BE%EC%95%84%EC%A3%BC%EB%8A%94%20Fixture%20Monkey%EC%97%90%EA%B2%8C%20%EB%A7%A1%EA%B8%B0%EC%84%B8%EC%9A%94.pdf)_ 중 하나는 E-Commerce Domain 의 문제점을 해결하기 위함도 있다고 한다.

__E-Commerce Domain Problems__:
- 객체가 가지고 있는 데이터 항목이 많아 객체 생성 비용이 크다.
- 타 서비스와 연동이 많다.
- 데이터간 정합성이 중요하다.

__Fixture Monkey Examples__:

```java
@Value
public static class DeliveryAddress {
    String baseAddress;
    
    @Nullable
    String zipCode;
    
    boolean road;
    
    String telNo1;
    
    @Nullable
    String telNo2;
}
```

```java
// given
FixtureMonkey sut = FixtureMonkey.create();

// when
DeliveryAddress deliveryAddress = sut.giveMeBuilder(DeliveryAddress.class)
        .set("road", true)
        .sample();

// then
thenNoException()
    .isThrownBy(() -> DeliveryAddressValidator.validateRoadAddress(deliveryAddress));
```

## References

- [Object Mother / Martinfowler](https://martinfowler.com/bliki/ObjectMother.html)
- [GoogleTest Advanced](https://google.github.io/googletest/advanced.html)