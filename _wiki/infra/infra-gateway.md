---
layout  : wiki
title   : Internet Gateway vs NAT Gateway
summary : 
date    : 2022-06-23 15:54:32 +0900
updated : 2022-06-23 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Gateway

> Gateway 란, 서로 다른 통신망 혹은 프로토콜 간 네트워크 통신을 가능하게 하는 구성요소를 의미한다. 내부망에서 외부망간에 통신을 할 때는 서로 다른 통신망이므로 gateway 가 이를 중계한다.

![](/resource/wiki/infra-gateway/gateway.png)

## Internet Gateway 

Internet Gateway 는 인터넷 망과 연결을 중계하는 구성요소이다. AWS 완전형 서비스로 웹 콘솔을 생성하면 이 gateway 가 어디있는지 우린 신경쓰지 않아도 된다. 요청 받을 대상이 공인 IP 가 있다면 Internet Gateway 를 통해 인터넷망과 연결이 가능해진다.

## NAT Gateway

NAT Gateway 도 완전 관리형 서비스이기는 하나, 중계할 위치를 지정할 수 있다. 우리가 직접 EC2 를 생성하고 NAT 구성을 할 수도 있지만 AWS 에서 이를 쉽게 생성 및 관리하도록 자동화해두었다고 보면된다. 내부망의 서버는 일반적으로 private ip 만 할당한다. 따라서 인터넷망으로 요청을 보내기 위해서는 중계서버를 통해 공인 IP 로 변환하여 요청한다.

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)
- [AWS — Difference between Internet Gateway and NAT Gateway](https://medium.com/awesome-cloud/aws-vpc-difference-between-internet-gateway-and-nat-gateway-c9177e710af6)