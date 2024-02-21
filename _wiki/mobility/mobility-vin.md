---
layout  : wiki
title   : VIN
summary : Vehicle Identification Number
date    : 2024-02-15 15:54:32 +0900
updated : 2024-02-15 20:15:24 +0900
tag     : mobility
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## VIN

VIN(Vehicle Identification Number) 은 차대번호 이라고 불리는 자동차의 고유번호이다. 
VIN 은 국제규격에 따라 16~17자의 영문 알파벳과 숫자의 조합으로 이뤄져 있는데 자동차 제작사와 생산공장 및 생산연도, 차체 및 엔진형식, 생산번호 등 다양한 정보를 포함하고 있다. 자동차 등록증이 출생신고서라고 하면 이러한 VIN 은 주민등록증이라고 할 수 있다.

따라서, VIN 은 개인정보로 분류되기 때문에, 만약 VIN 값을 사용하기 위해서는 DB 에 암호화 하여 저장, [De-Identification](https://baekjungho.github.io/wiki/theory/theory-deidentification/) 을 거쳐서 사용하던지 해야 한다.
VIN 값을 globally unique 로 사용할 수 있는지는 요구사항에 따라 달렸다. 하지만 개인정보에 포함되기 때문에 추천하진 않는다.

## Links

- https://auto.danawa.com/news/?Tab=A&Work=detail&no=5166750