---
layout  : wiki
title   : Module aka. Package
summary : 모듈, 패키지
date    : 2022-01-02 20:57:32 +0900
updated : 2022-01-02 21:21:24 +0900
tag     : ddd
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Module

> 모든 사람들이 MODULE 을 사용하지만 그 중에서 MODULE 을 하나의 완전한 자격을 갖춘 모델 요소로 여기는 사람은 거의 없다. MODULE 간에는 결합도가 낮아야 하고 내부 응집도는 높아야 한다. MODULE 로 쪼개지는 것은 코드가 아닌 바로 개념이다. 어떤 사람이 한 번에 생각해낼 수 있는 양에는 한계가 있으며(따라서 결합도는 낮춰야 한다), 일관성이 없는 단편적인 생각은 획일적인 생각을 섞어놓은 것 처럼 이해하기 어렵다(따라서 응집도는 높여야 한다).
>
> MODULE 의 결합도가 낮다는 것은 분석하기가 쉬움을 뜻한다. 높은 수준의 도메인 개념에 따라 모델이 분리되고 그것에 대응되는 코드도 분리될 때까지 모델을 정제하라.
> 
> MODULE 과 MODULE 의 이름은 도메인에 통찰력을 줄 수 있어야 한다.
> 
> 하나의 개념적 객체를 구현하는 코드는 모두 같은 MODULE 에 둬야 한다. 
> 
> 패키지화를 바탕으로 다른 코드로부터 도메인 계층을 분리하라. 그렇게 할 수 없다면 가능한한 도메인 개발자가 자신의 모델과 설계 의사결정을 지원하는 형태로 도메인 객체를 자유로이 패키지화할 수 있게 하라.

The name of the Module should be derived directly from the Ubiquitous Language and should reflect an important concept from the Domain.

## Links

- [What are Modules in Domain Driven Design?](https://www.culttt.com/2014/12/10/modules-domain-driven-design)
- [Modules in DDD](https://dev.to/ielgohary/modules-in-ddd-9b7)

## References

- 도메인 주도 설계 / Eric Evans 저 / 위키북스