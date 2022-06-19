---
layout  : wiki
title   : VPC and Subnet
summary : 
date    : 2022-06-09 18:54:32 +0900
updated : 2022-06-09 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## VPC

VPC 는 하나의 서비스를 위한 네트워크를 다루는 단위이다. VPC 에서는 서브넷과 라우팅 테이블, 인터넷 게이트웨이 등을 설정할 수 있다.

## 서브넷

서브넷은 VPC 에 설정한 네트워크 대역을 더 세부적으로 나눈 네트워크이다. 라우팅 테이블은 서브넷이 다른 서브넷 혹은 외부망과 통신하기 위한 정보를 가지고 있다. 인터넷 게이트웨이는 외부망과의 연결을 담당하고 있다.

![](/resource/wiki/vpc-subnet/subnet.png)

- VPC 는 n 개의 Subnet 을 가질 수 있으며, Subnet 은 VPC 의 CIDR(Classless Inter-Domain Routing) 내에서 구성 할 수 있다.
- AWS 의 AZ(Availability Zone)란, 물리적으로 나뉜 IDC 이다. Subnet 구성 시, AZ 를 함께 설정하는데, [재해 및 재난 대비 개인정보처리시스템의 물리적 안전조치](https://www.law.go.kr/%ED%96%89%EC%A0%95%EA%B7%9C%EC%B9%99/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EC%9D%98%EC%95%88%EC%A0%84%EC%84%B1%ED%99%95%EB%B3%B4%EC%A1%B0%EC%B9%98%EA%B8%B0%EC%A4%80/(2019-47,20190607)/%EC%A0%9C12%EC%A1%B0)를 고려해 Subnet 의 AZ 를 다르게 구성한다. 하나의 VPC 내에 구성된 Subnet 들은 물리적으로 다른 IDC 에 구성되더라도 사설망을 통해 통신이 가능하다. 다른 AZ 간의 통신시 비용이 발생하기는 하나, 무시할만한 수준이다.

## Links

- [CIDR](https://cidr.xyz/)
- [IP Address Guide CIDR](https://www.ipaddressguide.com/cidr)
- [서브넷 마스크](https://www.youtube.com/watch?v=o-NRjtQsJx4)
- [NextStep 인프라 공방](https://edu.nextstep.camp/)