---
layout  : wiki
title   : Network Segmentation
summary : 망 분리
date    : 2022-06-07 15:54:32 +0900
updated : 2022-06-07 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

# Network Segmentation

망분리를 하는 이유는 개인 정보를 다루는 DB 서버 등을 위한 내부망, 사용자가 접근하는 웹 서버를 위한 외부망을 구성한다.

## 통신망

![](/resource/wiki/network-segmentation/subnet.png)

- 노드들과 노드들을 연결하는 링크들로 구성된 하나의 시스템
  - 노드: IP 로 식별할 수 있는 대상
  - 링크: 물리적 회선
- 하나의 Subnet 을 하나의 망이라고 할 수 있음

## AWS 에서의 망

- [Region](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/using-regions-availability-zones.html): 국가/지역
  - ap-northeast-2:	Asia Pacific (Seoul)
- __Availability Zone: 데이터 센터__
  - ap-northeast-2a
  - ap-northeast-2b
- __VPC(Virtual Private Cloud)__
  - 하나의 Region 에 종속
  - 다수의 AZ 설정 가능
  - VPC IP 대역 내에서 망구성

## L2 Switch

AWS 를 생성하면, L2 Switch 가 생성된다.

![](/resource/wiki/network-segmentation/l2.png)

- Multiple Access 를 위한 장비
- 서버에는 Network Interface Card 가 있음
- Network Interface Card 에는 MAC 주소가 있음
  - 3c:22:fb:78:4a:c0
  - 앞 6자리는 제조사, 뒤는 식별자
  - ![](/resource/wiki/network-segmentation/mac.png)
- L2 Switch 통신 방식
  - MAC 테이블에 정보가 있을 때: Forwarding
  - MAC 테이블에 정보가 없을 때: Flooding
    - 응답하는 장비가 있으면 그 포트에 장비가 있다고 인지하고 MAC 테이블에 등록

## Router

- 서로 다른 네트워크간의 통신을 중계
- MAC 테이블에 정보가 있을 때: Forwarding
- MAC 테이블에 정보가 없을 때: Drop
- 라우팅 프로토콜을 활용하여, 어떤 대역으로 패킷을 보내는 것이 최적 경로인지 학습

## 인터넷 통신

![](/resource/wiki/network-segmentation/internet.png)

## Topology

![](/resource/wiki/network-segmentation/topology.png)

## Links

- [Defense in depth](https://en.wikipedia.org/wiki/Defense_in_depth_%28computing%29)
- [NextStep 인프라 공방](https://edu.nextstep.camp/)