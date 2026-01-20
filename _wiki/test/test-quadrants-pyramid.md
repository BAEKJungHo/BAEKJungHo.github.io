---
layout  : wiki
title   : Agile Testing Matrix; Test Quadrants, Test Pyramid
summary : Specification by Example
date    : 2026-01-19 11:54:32 +0900
updated : 2026-01-19 12:15:24 +0900
tag     : test agile tdd bdd ddd
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Agile Testing

***[애자일 테스팅(Agile Testing)](https://en.wikipedia.org/wiki/Agile_testing)*** 이란 ***개발이 끝난 후 검증하는 단계가 아니라, 제품을 만들어가는 전 과정에서 지속적으로 품질을 형성하는 활동*** 이다.

### Specification by Example

애자일 테스팅에서 ***[SBE(Specification by Example)](https://en.wikipedia.org/wiki/Specification_by_example)*** 은 "대규모·복잡한 도메인" 에서 효과적인 테스팅 방법이다.
SBE 는 추상적인 진술 대신 현실적인 예제를 사용하는 것이 특징이며, 이는 ***[BDD(Behavior-Driven Development)](https://en.wikipedia.org/wiki/Behavior-driven_development)*** 과 같은 애자일 소프트웨어 개발 방법의 맥락에서 적용된다.

SBE, BDD 를 사용하여 테스트 케이스를 작성하는 경우 최대한 ***Ubiquitous Language*** 를 사용하려고 한다. 이렇게 작성된 명세는 E2E Test 를 구축할때도 도움이 된다.

__Example__:

```
Given 차량이 시속 60km 이상으로 주행 중이고
And 이벤트 유형이 '급가속'이며
And 이벤트 중요도가 HIGH 이고
And 사용자가 안전 알림 수신을 허용한 상태라면

When 이벤트가 발생하면

Then 3초 이내에 모바일 푸시 알림을 전송한다
```

__BDD__:

```
Scenario: Send high priority safety alert during driving
  Given the vehicle is driving at 60 km/h
  And the event type is "rapid_acceleration"
  And the priority is HIGH
  And the user allows safety notifications
  When the event occurs
  Then a push notification is sent within 3 seconds
```

이러한 SBE 스타일의 TC(Test Case)를 작성했을 때의 이점은 **조직간 커뮤니케이션 비용** 이 감소한다. PM, 기획자, QE 등과 소통하기가 편한다.

사실 Wikipedia 에 있는 SBE 의 원칙을 살펴보면 아래와 같다.

> 예시를 통한 명세 작성의 핵심은 모든 관점에서 필요한 변경 사항에 대한 단일 정보 소스(SSOT)를 만드는 것입니다. 비즈니스 분석가가 각자의 문서를 작성하고, 소프트웨어 개발자가 각자의 문서를 관리하며, 테스터가 별도의 기능 테스트 세트를 관리하는 경우, 이러한 서로 다른 버전의 정보를 지속적으로 조정하고 동기화해야 하므로 소프트웨어 제공 효율성이 크게 저하됩니다. 반복 주기가 짧은 경우 이러한 조정은 종종 매주 또는 격주로 필요합니다. 예시를 통한 명세 작성에서는 다양한 역할의 담당자들이 참여하여 모든 사람의 이해를 담은 단일 정보 소스를 만듭니다.

SBE 가 SSOT 가 되면 참 좋겠지만, 실무에서 이를 프로세스로 정착시키는 것은 생각보다 쉽지 않다.

## Agile Testing Quadrants

![](/resource/wiki/test-quadrants-pyramid/Agile-Testing-Quadrants.png)

테스팅 사분면(Testing Quadrants)은 어떤 테스트부터 시작할 것인지는 중요하지 않다. 우리가 원하는 테스트에 대한 가이를 제공할 뿐이다.
예를 들어, 티켓팅 시스템이 대규모 트래픽을 반드시 처리할 수 있어야 하면 성능 테스트, 부하 테스트를 진행해야 한다.

## [Test Pyramid](https://klarciel.net/wiki/test/test-the-practical-test-pyramid/)

## Links

- [The Practical Test Pyramid - Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Brian Marick‘s Agile Testing Matrix](http://www.exampler.com/old-blog/2003/08/21.1.html#agile-testing-project-1)
- [Using the agile testing quadrants](https://lisacrispin.com/2011/11/08/using-the-agile-testing-quadrants/)


