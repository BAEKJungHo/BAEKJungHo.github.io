---
layout  : wiki
title   : BoundedContext
summary : 
date    : 2022-12-04 15:02:32 +0900
updated : 2022-12-04 15:12:24 +0900
tag     : ddd
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Domain Model and Context

처음에 도메인 모델을 만들 때 단일 도메인을 만들어 도메인 모델을 완벽하게 표현하려는 시도는 올바르지 않다. 한 도메인은 여러 하위 도메인으로 구분된다. 따라서 하위 도메인마다 같은 용어라도 의미가 다르고 같은 대상이더라도 지칭하는 용어가 다르기 때문에 한 개의 모델로 여러 하위 도메인을 모두 표현하려고 시도하면 적합하지 않은 모델이 만들어질 가능성이 높다.

> 대규모 시스템의 도메인 모델을 완전하게 단일화 한다는 것은 타당하지 않거나 비용 대비 효과적이지 않다.

![](/resource/wiki/ddd-bounded-context/context.png)

위 그림 처럼 논리적으로는 같은 존재처럼 보이지만 하위 도메인 마다 다른 용어를 사용하고 있다. 올바른 도메인 모델을 개발하려면 하위 도메인마다 모델을 만들어야 하고 __각 모델은 명시적으로 구분되는 경계(Boundary)를 가져서 섞이지 않도록__ 해야 한다.

> 모델이 적용되는 컨텍스트를 명시적으로 정의하라. 컨텍스트의 경계를 팀 조직, 애플리케이션의 특정 부분에서의 사용법, 코드 기반이나 데이터베이스 스키마와 같은 물리적인 형태의 관점에서 명시적으로 설정하라. 이 경계 내에서는 모델을 엄격하게 일관된 상태로 유지하고 경계 바깥의 이슈 때문에 초점이 흐려지거나 혼란스러워져서는 안 된다.

모델은 특정한 __문맥(Context)__ 하에서 완전한 의미를 갖는다. 즉, __모델은 컨텍스트에 적용된다.__ 이렇게 구분되는 경계를 Bounded Context 라고 부른다. 컨텍스트가 다르면 모델의 규칙도 다르게 적용될 가능성이 높다. 

## BoundedContext

Bounded Context is a central pattern in Domain-Driven Design. Bound Context determines the boundaries of the model.
Bound Context 는 논리적으로 한개의 모델을 갖는다. Bound Context 는 용어를 기준으로 구분한다.

![](/resource/wiki/ddd-bounded-context/boundedcontext.png)

### Team

Bound Context 는 조직의 구조에 따라 결정되며 Bound Context 는 각자 구현하는 하위 도메인에 맞는 모델을 갖는다.

![](/resource/wiki/ddd-bounded-context/context-team.png)

두 팀이 같은 Context 안에 있지 않다면 어느 정도의 변화가 생기기 전까지는 코드를 공유하려 해서는 안된다.

이러한 BoundedContext 를 정의해서 얻을 수 있는 장점은 __명확함__ 이다. 두 팀은 자신들이 하나의 모델과 일관성을 유지해야 한다는 점을 알고 있다. 또한 BoundedContext 밖의 팀이 얻게되는 장점은 __자유로움__ 이다.

## Links

- [BoundedContext - MartinFowler](https://martinfowler.com/bliki/BoundedContext.html)
- [BoundedContext - CQRS journey](https://github.com/dhslrl321/cqrs-journey-guide-korean/blob/master/part01-journey/journey02/02.%20Contoso%20%EC%97%90%EC%84%9C%20%EC%82%AC%EC%9A%A9%EB%90%98%EB%8A%94%20Bounded%20Context.md)

## References

- 도메인 주도 설계 / Eric Evans 저 / 위키북스
- 도메인 주도 개발 시작하기 / 최범균 저 / 한빛미디어
- 도메인 주도 설계 철저 입문 / 나루세 마사노부 저 / 위키북스
