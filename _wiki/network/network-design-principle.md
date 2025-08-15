---
layout  : wiki
title   : Network Design Principle
summary : 
date    : 2025-08-12 15:02:32 +0900
updated : 2025-08-12 18:12:24 +0900
tag     : network
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Network

네트워크 통신은 서로 다른 디바이스가 데이터를 주고받는 과정이다. 디지털 세계에서는 데이터를 작은 조각(packet)으로 나눠 보낸다.

***[패킷(packet)](https://en.wikipedia.org/wiki/Network_packet)***은 제어 정보(control information)와 페이로드(payload, user data)로 구성되며
***캡슐화된 전달 단위***이다. 실제 전송 시에는 `[L2 헤더 | L3 헤더 | L4 헤더 | 페이로드 | L2 트레일러]`로 연속 배열되어 전선 위를 흐른다. 이 과정을 ***캡슐화(encapsulation)***라 한다.

***[패킷 교환(Packet Switching)](https://en.wikipedia.org/wiki/Packet_switching)***은 데이터를 작은 조각(packet) 나누고 각 패킷에 주소(헤더 정보)를 붙여 독립적으로 전송한다.

