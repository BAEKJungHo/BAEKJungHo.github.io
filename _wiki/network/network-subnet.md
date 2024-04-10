---
layout  : wiki
title   : Enhanced IP Addressing System
summary : Classless based IP Addressing System with Subnetting
date    : 2024-04-09 15:54:32 +0900
updated : 2024-04-09 20:15:24 +0900
tag     : network subnet
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## About IP

127.0.0.1 과 같은 형식이 IPv4 형식이다. 10진수로 표현된다.

__IP Area__
- 네트워크 영역: 내부적으로 자유롭게 통신이 가능한 영역(호스트들을 모은 네트워크를 지칭하는 주소)
- 호스트 영역: 한 네트워크 내에서 서로를 구분하는 주소, 호스트를 개별적으로 관리

### Classification based IP Addressing System

__[What are the classes of IPv4 Addresses..](https://www.adroitacademy.com/blog/What-are-the-classes-of-IPv4-Addresses)__

![](/resource/wiki/network-subnet/classes-of-ipv4-address.png)

예를 들어 __Classification based__ 에서 기본 마스크는 아래와 같다.

- Class A - 255.0.0.0
- Class B – 255.255.0.0
- Class C - 255.255.255.0

여기서 나의 IPv4 주소와 Mask 를 연산하여 Network 영역과 Host 영역을 구할 수 있다. Class A 를 기준으로 0으로 표기된 부분이 Host 영역이다.
예를들어, Class A 를 기준으로 192.168.12.17 에서 Network 영역은 192이며, Host 영역은 168.12.17 이다. Class C 를 기준으로는 17 이다.

클래스 A 네트워크는 수백만 개의 장치를 연결할 수 있다.

## Subnet - Classless based IP Addressing System

IP 주소가 구성되는 방식을 통해 인터넷 라우터는 데이터를 라우팅할 올바른 네트워크를 비교적 간단하게 찾을 수 있다. 그러나 클래스 A 네트워크(예를 들어)에는 수백만 개의 연결된 장치가 있을 수 있으며 데이터가 올바른 장치를 찾는 데 시간이 걸릴 수 있다. 이것이 서브넷이 유용한 이유이다. 서브넷은 IP 주소를 장치 범위 내에서 사용하도록 좁혀준다.

따라서, Classification based IP Addressing System 는 라우팅하여 네트워크를 빨리 찾기에 부적절하므로, 요즘 현대에는 __Classless based IP Addressing System__ 을 사용한다. 즉, __효율적으로 라우팅 하기 위해서 Subnetmask 를 통해 라우팅의 범위를 좁혀준다__ 라고 생각하면 된다.

![](/resource/wiki/vpc-subnet/subnet.png)

- [CIDR to IPv4 Conversion](https://www.ipaddressguide.com/cidr)
- [AN INTERACTIVE IP ADDRESS AND CIDR RANGE VISUALIZER](https://cidr.xyz/)

서브넷 마스크는 IP 주소와 비슷하지만, 네트워크 내에서 내부적으로만 사용된다. 라우터는 서브넷 마스크를 사용하여 데이터 패킷을 올바른 위치로 라우팅한다.

## Links

- [서브넷마스크를 이용해 네트워크 영역과 호스트 영역의 범위 구하기](https://devoong2.tistory.com/entry/%EC%84%9C%EB%B8%8C%EB%84%B7%EB%A7%88%EC%8A%A4%ED%81%ACsubnet-mask%EC%99%80-%EC%84%9C%EB%B8%8C%EB%84%B7%ED%8C%85subnetting%EC%9D%B4%EB%9E%80)
- [What is subnet ?](https://www.cloudflare.com/ko-kr/learning/network-layer/what-is-a-subnet/)