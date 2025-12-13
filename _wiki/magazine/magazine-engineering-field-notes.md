---
layout  : wiki
title   : ENGINEERING FIELD NOTES
summary : 
date    : 2025-09-07 10:54:32 +0900
updated : 2025-09-07 11:15:24 +0900
tag     : magazine
toc     : true
comment : true
public  : true
parent  : [[/magazine]]
latex   : true
---
* TOC
{:toc}

## ENGINEERING FIELD NOTES

- 엔지니어에게 가장 중요한 본질은 ***[CRITICAL THINKING](https://klarciel.net/wiki/architecture/architecture-software-fundamental/)*** 이다.
- ***문제의 본질***을 찾는 과정은 매우 중요하며 즐겁다.
- ***문제 정의***를 잘 하는 것이 가장 중요하다.
- ***[ABSTRACTION](https://klarciel.net/wiki/architecture/architecture-abstraction/)*** 를 제대로 이해 하는 과정은 엔지니어로써 한 단계 상승하는 길이 된다.
- 시스템 설계 과정에서 하나의 역할(e.g 차량과의 커넥션을 맺는 서버)에 충실한 서버가 필요하기도 하다.
- ***[Test-Driven Development](https://klarciel.net/wiki/tddknight/)*** 는 Agent 를 활용하여 코드를 작성함에 있어서 문서화와 심리적 안정망으로서 좋은 도구가 된다.
- 기획이 병목이면 개발을 우선 진행하는 것도 방법이다. 때로는 먼저 만들고 공유함으로써 일이 진행되고, 더 많은 일이 들어오기도 한다.
- 화이트보드, Draw.io, Sequence Diagram 을 잘 그리는 능력은 중요하다.
- ***커뮤니케이션***능력은 정말 중요하다.
- ***도메인***에 대한 이해는 매우 중요하다.
- 커뮤니케이션을 최대한 ***도메인 언어***로 소통해야 한다. 같은 개념을 서로 다른 언어로 커뮤니케이션을 하고 있다면, 언어 기준을 세우고 그 도메인 언어를 기반으로 코드에 녹이는 것은 중요하다. 테스트를 작성함에 있어서도 도메인 지식을 실행 가능한 명세로 표현해야 한다.
- 특정 유저 시나리오(e.g QrLoginFlow)를 코드로 녹일때 Usecase 라는 네이밍이 도움이 된다. 
- ***기술 부채***는 특정 시점에 빠르게 일이 진행되도록 하기 위해서 코드에 남겨둔 빚이다. 예를 들어, 기획(context)이 자주 바뀌는 상황이라고 가정하자. 기술 부채를 주기적으로 해결하지 않으면, 혹은 특정 시점에 결정한 코드에 대한 Context 를 문서화 하거나 주석을 달아 놓지 않으면, 멀지 않은 미래에 Legacy Context 가 가득한 코드가 될 것이며, AI 가 잘하는 Code Reading 조차 시키기 힘든 수준이 될 수 있다. 만약, Legacy Code 를 리팩토링하는 사람이 기술 부채를 남긴 사람이 아니라면, 리팩토링하는 사람은 컨텍스트와 코드를 이해하는데 시간을 많이 쏟을 것이다.
- 시스템 설계를 진행할때 사용자에게 제공하는 인터페이스(e.g API Spec)에 신경을 많이 써야 한다. 내부 리팩토링은 쉬워도 외부 리팩토링은 최소한 눈치라도 보인다.
- ***다양한 경험***을 쌓는 것이 유연한 사고를 가진 엔지니어가 되는 길이다.
- 단순 CRUD 기능을 가진 (e.g Admin) 기능을 개발하는 것은 재미없다.
- ***네이밍***은 가장 어려운 일 중 하나이다.
- ***문서화***는 AI 시대에서 더욱 중요한 능력이 되었다.
- PK 는 가급적 ***UUID*** 를 쓰자. Timestamp 기반의 정렬이 필요하면 UUIDv7 을 사용한자.
- ***[Zero Payload](https://klarciel.net/wiki/kafka/kafka-consumer-options-strategy/)*** 는 데이터의 최종 일관성만 보장하면 되는 실시간 동기화 시스템 만듦에 있어서 자주 사용된다. Event 에는 변경이 있다만 알려주고, 클라이언트측은 이벤트를 받고 서버의 API 를 호출해서 자원을 가져가는 방식이다.
- 모니터링하기 쉽도록 로그를 구성해야 한다. 트러블슈팅 용이성을 위해서는 빠른 검색이 필수다.
- ***스펙 기반의 서비스(Spec/Schema Based Service)***는  엄격한 규칙(e.g 해당 서비스를 사용하기 위해서 거쳐아하는 심사 프로세스 등)을 필요로 한다. 또한 일부러 스펙 변경에 대한 확장성을 제한한다.
- 동시 편집 환경에서는 JSON PATCH 등을 통한 ***Index Based Operation*** 의 list 연산이 어렵다. list 연산이 어려운 이유는 0번째 인덱스를 remove/replace 하라는 명령이, 이미 타 서비스나 유저가 0번째 인덱스에 대한 operation 을 진행한 경우 문제가 발생할 수 있다. 이를 위해서는 as-is, to-be value 를 같이 받는(where condition)등의 처리를 하여, 해야하는데, 이는 특정 key 를 받아서 삭제하는 것과 크게 다르지 않다. 따라서 보통 ***Key Based Operation*** 만을 지원하는 것이 편하다.
- 협업에 있어서는 ***[인지 부하(cognitive load)](https://github.com/zakirullin/cognitive-load/blob/main/README.ko.md)*** 를 줄이는 노력을 의식적으로 해야 한다. 팀원을 위한 배려이다.
- 유능하지만 ***주도성***이 부족한 엔지니어는 계속해서 사소한 개선만 반복하며 진짜 성과를 놓치게 된다. 의사결정자에게 ***눈에 띄는***, 명확한 결과물을 전달해야 "일을 한 것"으로 인정받을 수 있다. 자신이 하는 일이 상위 관리자에게 읽히고 평가될 수 있는 형태인지 항상 점검해야 한다.
- 백번 듣는 것보다 한 번 보는게 낫고, 백번 보는 것보다 한 번 만들어보는게 낫다.