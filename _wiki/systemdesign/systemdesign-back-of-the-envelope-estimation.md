---
layout  : wiki
title   : Back-of-the-Envelope Estimation in System Design
summary : Understanding QPS, RPS, and Throughput for Effective System Design Interviews
date    : 2024-12-10 15:02:32 +0900
updated : 2024-12-10 18:12:24 +0900
tag     : systemdesign qps rps throughput
toc     : true
comment : true
public  : true
parent  : [[/systemdesign]]
latex   : true
---
* TOC
{:toc}

## Back of the envelope estimation

System Design Interview 를 진행할 때, Candidate 는 Interviewer 와 대화를 하면서 Functional Requirements 와 Non-Functional Requirements 를 정리해야 한다.

그리고 해당 시스템의 핵심 기능에 대한 ___[QPS(Query Per Second)](https://en.wikipedia.org/wiki/Queries_per_second)___ 를 ___대략적으로 추정___ 해야 한다. 이때 사용 되는 방식이 ___봉투 뒷면 계산(Back of the envelope estimation)___ 이라는 방식이다.

A ___[back-of-the-envelope calculation](https://en.wikipedia.org/wiki/Back-of-the-envelope_calculation)___ is a quick and informal mathematical computation.

- Seconds in a day 는 86,400 이다. 하지만 편의상 90,000 or 100,000 등으로 하기도 한다.
- 하루에 유저가 몇번 방문 or API 를 호출하는지에 대한 숫자를 대략적으로 추정한다.
- DAU 를 대략 추정한다.

예를 들어, DAU(Daily Active User) 가 1억이고, 유저 한명 당 평균 하루에 search API 를 5번 호출한다고 가정하면 QPS 계산식은 아래와 같다.

- ___Search QPS = 100M x 5 / Seconds in day___

___처리량(Throughput, RPS)___ 를 구하는 공식도 비슷하다.
 
- **Throughput : 1일 평균 RPS ~ 1일 최대 RPS**
  - 1일 총 접속 수 = 1일 사용자 수(DAU) x 1명당 1일 평균 접속 수
  - 1일 평균 RPS = 1일 총 접속 수 / 86,400 (초/일)
  - 1일 평균 RPS x 피크 시간대의 집중률(최대 트래픽 / 평소 트래픽) = 1일 최대 RPS
    - **1일 평균 RPS** = 500 RPS * 10 = 1일 최대 RPS = 5000