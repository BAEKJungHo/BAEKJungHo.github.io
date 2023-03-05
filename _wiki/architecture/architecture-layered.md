---
layout  : wiki
title   : Layered Architecture with Sinkhole
summary : 
date    : 2023-03-04 15:02:32 +0900
updated : 2023-03-04 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Layered Architecture with Sinkhole

Layered Architecture 를 사용해본 사람은 알겠지만 특별한 비지니스로직이 많이 없는 CRUD 의 경우에는 각 Layer 에서 별도의 로직 처리 없이
Object Converting 만 하여 요청을 처리하고 응답을 내주곤 한다.

이 경우에 가장 생산성을 잡아 먹는 것은 Converting 코드를 작성하는 일이다.

Software Architecture 101 에서는 이러한 패턴을 __Architecture Sinkhole__ 이라고 부른다.

> __Architecture Sinkhole__
> 
> 아키텍처 싱크홀 안티패턴에 해당하는 시나리오가 전무한 Layered Architecture 는 아마 하나도 없을 것입니다. 그러므로 이 안티패턴으로 처리 중인 요청의 전체 비율을 따져보는 것이 중요합니다. 80 대 20 법칙을 적용해서 전체 요청의 20% 가 싱크홀인 정도라면 그런대로 괜찮은 수준이고, 그러나 분석 결과 80% 가 싱크홀이라면 이 문제 도메인에 Layered Architecture 는 적합한 아키텍처 스타일이 아니라는 증거입니다. 아키텍처 싱크홀 안티패턴을 해결하는 또 다른 방법은 아키텍처의 모든 레이어를 개방하는 것입니다. 그러나 이는 아키텍처상 변경 관리의 어려움이 가중되는 트레이드오프가 있음을 분명하게 인식해야 합니다.

Layered Architecture 는 다음과 같은 흐름으로 구성된다.

__Layers: Presentation > Application > Persistence > Database__

이러한 아키텍처를 적용하기 좋은 경우가 예산과 일정이 빠듯한 경우(개발자, 아키텍트 모두 Layered Architecture 에 익숙하고 복잡하지 않음) 혹은 어떤 아키텍처 스타일이 최선인지 아직 불명확한 경우

Layered Architecture 는 원래 Monolithic 에 가깝기 때문에 분산 아키텍처 스타일에 따른 복잡도가 낮고, 구조가 단순해서 유지보수가 쉽다. 하지만 아키텍처가 점점 커지고 복잡해질 수록 이런 장점들이 상쇄된다. 

대규모 애플리케이션이나 시스템은 모듈러한 아키텍처 스타일이 더 잘 맞는다.

## References

- Software Architecture 101 / 마크 리처드, 닐포드 저 / O'REILLY