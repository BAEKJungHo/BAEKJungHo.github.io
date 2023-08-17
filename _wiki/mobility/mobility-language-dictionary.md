---
layout  : wiki
title   : Mobility Language Dictionary
summary : 
date    : 2023-08-13 15:54:32 +0900
updated : 2023-08-13 20:15:24 +0900
tag     : mobility term
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## Mobility Language Dictionary

### Operational Design Domain

- Operational Design Domain (ODD) 운행설계 영역이란, 자율주행 시스템이 정상적으로 작동하기 위해 필요한 주행 환경 조건을 의미한다.

### Disengagement

- Disengagement(해제) 는 Safety Driver 가 차량을 통제해야하는 상황을 의미한다.
- Disengagement 상황에는 '어린이 보호 구역', '공사 구간', '터널' 등이 있다.

### Take Over

- Disengagement 상황에서 제어권을 가져오는 행위를 Take Over 라고 한다.
- 자율주행이 가능한 구간이 끝나는 등 자율주행 모드 해제가 예상될 경우 운전자에게 운전 제어권 전환을 요청(TOR; Take-Over Rquest)하게 된다. 따라서 레벨 3에서 운전자는 시스템이 요청하는 경우 수동운전을 시작할 수 있도록 ‘준비된 사용자(Fallback-Ready User)’가 되어야 한다. 