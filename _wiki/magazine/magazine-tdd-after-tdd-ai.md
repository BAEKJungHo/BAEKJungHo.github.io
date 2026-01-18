---
layout  : wiki
title   : TDD After TDD; How Developers Think in the Age of AI
summary : 
date    : 2026-01-18 18:54:32 +0900
updated : 2026-01-18 19:15:24 +0900
tag     : magazine software tdd ai tradeoff
toc     : true
comment : true
public  : true
parent  : [[/magazine]]
latex   : true
---
* TOC
{:toc}

## TDD After TDD; How Developers Think in the Age of AI

Claude Code, Gemini, ChatGPT 등 AI 를 활용한 Vibe Coding 이전 시절에는 ***[TDD](https://klarciel.net/wiki/tdd/)*** 를 활용하여 손으로 직접 코드를 구현하는 과정에서 얻는 인사이트가 있었다.
예를 들면, RED 과정에서 Deserialize 함수를 구현하기도 전에 테스트 코드에서 먼저 호출해 봄으로써 이 함수의 입력과 출력, 책임을 먼저 고민할 수 있었다.
이 과정은 단순히 코딩이 아니라 올바른 함수를 구현/설계 하기 위한 **사고 훈련** 이었다.
지금 AI를 활용하는 개발 환경에서는 로우레벨 시행착오를 줄이기 때문에 **“손으로 부딪히며 얻던 영감(비효율 속 인사이트)”** 가 자연스레 줄어든 것 같다.
과거(AI 를 적극 활용하기 전)에는 구현 과정에서 얻는 함수, 클래스 등에 대한 사고를 하기 위한 시간이 많았다면, 이제는 사고 단위 레이어가 올라간 것 같다.
예를 들면, 맥락, 유즈케이스, 상태 전이, 실패 시나리오, 도메인 경계, 변경 비용 등에 대한 고민을 더 해야하는 시기인 것 같다.

Sequence Diagram, Test Case, ERD 등 구현에 들어가기 위한 Spec 문서를 작성하고 구현은 AI 에게 맡기되, 구현된 클래스, 함수가 우리 프로젝트의 전체 아키텍처 맥락에 맞는지
검증하는 역할은 여전히 엔지니어 몫이다. 즉, **설계의 주도권은 엔지니어가 가져야하며, 구현은 AI 가, 그리고 최종 검증은 엔지니어가 해야 한다.**
AI 를 사용하여 구현을 하는 경우 가장 주의해야할 것은 AI가 작성한 코드가 어떻게 작동하는지 모른 채 사용하는 것이다.

앞으로 모든 엔지니어들은 시스템의 복잡도, 확장성, 보안, 트레이드오프 등 전체 시스템 설계 관점에서 생각하게끔 성장해야하는 것 같다. 큰 그림에서 맥락을 이해하고 트레이드오프를 고려하는 
과거의 시니어 엔지니어들이 요구 받던 능력들을 이제는 주니어, 미들급 엔지니어들이 할 수 있어야하지 않을까 싶다. 

이제는 AI 로 인해 엔지니어들이 구현자에서 조율자로서의 역할을 해야하기 때문에 데이터의 흐름, 시스템의 생존, 그리고 팀의 문화를 조율하며 느끼는 더 넓고 거대한 낭만을 찾으러 나가야하는 시점인 것 같다.

아직, ***[TRADE OFF](https://klarciel.net/wiki/magazine/magazine-tradeoff/)*** 에 대한 낭만은 여전히 존재하기 때문에 배우는 과정이 즐겁다.


