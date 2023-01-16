---
layout  : wiki
title   : Claim Domain
summary : 
date    : 2023-01-13 22:57:32 +0900
updated : 2023-01-13 23:21:24 +0900
tag     : ddd
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Claim Domain
 
E-commerce 에서 클레임(Claim)이란 __주문에 대한 변경__ 을 의미한다. 
- 최초의 주문 - 취소/교환/반품된 이후의 주문 + 추가 발생비용(반품 배송비 등) = `환불(refund)`

클레임은 환불(refund)을 위한 __돈 계산__ 을 잘 해줘야 한다. 클레임은 __스냅샷(snapshot)__ 을 기준으로 한다.
- 주문 = 계약
- 주문 시점의 금액을 기준으로 계산한다.

클레임은 커머스(commerce)의 꽃이다. 예를 들어 새로운 기획이 생겨도 클레임에 확장성이 없다면 기능 확장을 억제할 수 있다.
- 커머스의 모든 도메인의 정점에 있다.
- 기능 확장의 억제기

따라서, 클레임을 확장성 있게 리팩토링 하는 것이 중요하다.

## Features

클레임은 복잡하다.
- 다양한 도메인 지식을 알아야하고 많은 도메인의 Dependency 를 가지고 있다.
- 몇일 ~ 몇주까지의 프로세스를 가지기도 한다.

![](/resource/wiki/ddd-claim/process.png)

주문 상태별로 클레임의 종류가 다르다.
- __입금 전__: 주문 전체 취소
- __배송 전__: 옵션 취소 + 취소 교환(특정 물품에 대한 재고가 부족할 때의 대안)
- __배송 후__: 반품 + 반품 교환

귀책에 따른 분쟁과 조정도 고려해야 한다.
- 구매자가 잘못한 경우에는 교환 배송비 계산, 반품 배송비 계산을 하지 않는다.

위 그림과 같이 도메인별로 `ClaimAmounts` 를 구현하여 사용한다.

## Links

- [더 나은 내일을 위한 리팩터링 - NHN FORWARD](https://www.youtube.com/watch?v=vwgNI9w_bsQ)