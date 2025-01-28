---
layout  : wiki
title   : DECOUPLING
summary : 
date    : 2025-01-27 16:01:32 +0900
updated : 2025-01-27 16:05:24 +0900
tag     : cleancode architecture test refactoring systemdesign
toc     : true
comment : true
public  : true
parent  : [[/cleancode]]
latex   : true
---
* TOC
{:toc}

## DECOUPLING

대규모 리팩토링(시스템, 모듈, 코드 구조, 클래스 간 관계 등의 리팩토링)의 목적은 ___DECOUPLING___ 이다. 
소규모 리팩터링은 가독성 개선이 목적이다.

> 높은 응집도와 낮은 결합도는 클래스 간의 세분화된 관계, 설계를 이끌어낼 뿐만 아니라, 세분화된 시스템, 아키텍처, 모듈의 설계를 이끌어내는 일반적인 설계 사상이다.
> 코딩 규칙에 비해 더 높은 수준에서 코드의 가독성과 유지 보수성을 향상시킬 수 있다.

__결합(Coupling)__ 은 두 개 이상의 구성요소가 서로 얼마나 의존하고 있는지를 나타낸다. 높은 결합도를 가진 시스템에서는 한 구성요소의 변경이 다른 구성요소에 직접적인 영향을 미치며, 이는 시스템의 유지보수성과 확장성을 저하시킨다.

반면, ___[loosely coupled system](https://en.wikipedia.org/wiki/Loose_coupling)___ 은 구성요소 간의 의존성을 줄여, 하나의 변경이 다른 곳에 영향을 미치는 범위를 최소화한다. 이러한 설계 철학은 높은 응집도(High Cohesion)와 함께 작동하며, 결과적으로 모듈화된 설계와 더 나은 유지보수성을 제공한다.

시스템 설계 관점에서의 디커플링은 아래와 같은 이점이 있다.

- 변화에 대한 민첩성: 특정 서비스나 모듈을 변경할 때 다른 서비스에 영향을 주지 않음
- 확장성: 시스템에 새로운 기능을 추가할 때 기존의 구조를 변경할 필요를 최소화
- 테스트 용이성: 독립적인 모듈은 단위 테스트 및 통합 테스트를 더 쉽게 작성할 수 있음

시스템 디자인 측면에서의 디커플링을 하기 위해 자주 사용되는 방법은 ___[Publish/Subscribe Architecture](https://klarciel.net/wiki/architecture/architecture-pub-sub/)___ 를 사용하는 것이다.

코드 레벨에서의 디커플링을 할 때 아래 관점에서 판단할 수 있다.

- 특정 기능이 일부 수정되었을 때 그 영향이 모든 코드에 가는 경우, 결합도를 낮출 필요가 있다.
- 모듈과 클래스 사이의 관계, 의존성 그래프의 복잡성에 따라 판단한다.

구현의 복잡성을 숨겨서 복잡성을 제어하고, 구현이 아닌 역할에 의존하도록 하기 위해(___[Interface Design Ideas](https://klarciel.net/wiki/designpattern/designpattern-interface-design-thought/)___) ___[Encapsulation](https://klarciel.net/wiki/oop/oop-encapsulation/)___ 과 ___[Abstraction](https://klarciel.net/wiki/architecture/architecture-abstraction/)___
를 활용할 수 있다. 또한 ___[Law of Demeter](https://klarciel.net/wiki/oop/oop-law-of-demeter/)___ 와 ___[Single Responsibility Principle](https://klarciel.net/wiki/oop/oop-solid/)___ 과 같은 코드 설계 원칙을 적용할 수 있다.

Factory Pattern 과 같은 ___[Design Pattern](https://klarciel.net/wiki/designpattern/)___ 을 적용함으로써 클라이언트가 구현의 세부사항을 알지 못하게하고, 테스트 관점에서는 ___[Mock](https://klarciel.net/wiki/test/test-testdoubles/)___ 을 사용하여 독립적인 단위 테스트 작성을 쉽게 한다.

코드 구조의 관점에서의 디커플링은 ___[Modularization](https://klarciel.net/wiki/linux/linux-unix-philosophy/)___, ___[Stratified Design](https://klarciel.net/wiki/architecture/architecture-stratified-design/)___ 을 사용하여,
기능을 독립적이고 상호 교환 가능한 모듈로 분리하며, 재사용성을 높이고, 변경 가능성을 제한할 수 있다. 

___모듈화(Modular)의 본질은 분할을 통한 제어이다.___

## References

- 设计模式之美 / 王争