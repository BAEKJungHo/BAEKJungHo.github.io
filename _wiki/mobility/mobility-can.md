---
layout  : wiki
title   : CAN
summary : Controller Area Network
date    : 2024-02-08 15:54:32 +0900
updated : 2024-02-08 20:15:24 +0900
tag     : mobility can
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## Controller Area Network

차량 내 ECU(Electronic control unit) 들은 CAN(Controller Area Network) 프로토콜을 사용하여 통신한다.

조향장치(MDPS), 제동장치(MEB), 카메라, 레이더, V2X(Vehicle To EveryThing) 등끼리 통신하기 위해서 전선 으로 연결된다고하면 거미줄 처럼 복잡해질 것이고, 관리가 힘들다. 또한 전선으로 인한 무게, 부피 때문에 차량의 무게 부피가 증가해서 연비가 떨어질 것이다.

실제로는 위 와같은 제어기 하나하나에 [MCU(Micro Controller Unit, 제어기를 조작, 제어하기 위해 부착되는 CPU)](https://semiconductor.samsung.com/kr/support/tools-resources/dictionary/semiconductor-glossary-mcu/)

> MCU((Micro Controller Unit)
>
> - 기기 등의 조작이나 특정 시스템을 제어하는 역할을 수행하는 집적회로(IC).
> - 특정 기계장치나 전자장치의 제어를 위해 하나의 칩에 CPU 와 관련 모듈을 집적시킨 시스템 반도체로, 작은 컴퓨터 역할을 하고 있어 원 칩(One Chip) 컴퓨터 또는 마이컴이라 불리기도 한다.
> - MCU 는 전자제품의 두뇌역할을 하는 핵심 칩으로, 단순 기능부터 특수한 기능에 이르기까지 제품의 다양한 특성을 컨트롤하는 역할을 한다.

## Bus Topology

MCU 를 만들 때, 그 여분의 핀이 얼마나 필요한지 등의 문제가 존재한다. 이러한 문제를 해결하기 위해서 __CAN 통신은 버스형 토폴로지__ 로 구성되어있다.

가운데 공통으로 두고 다 같이 쓰는 선을 __버스__ 라고 부른다. 제어기를 1:1로 연결하는게 아니라, 통신하고 싶은 제어기들을 버스에 연결하는 것이다. 따라서 확장성에 용이하고, 전선을 아낄 수 있다.
모든 메시지는 __브로드캐스트 방식(네트워크에 연결된 모두에게)__ 으로 송신한다. 즉, 특정 제어기가 전송한 메세지는 버스에 연결된 모든 제어기들에게 송신한다.

단점으로는, 1번 제어기가 고장나서 비정상적인 신호를 전송하면, 다른 제어기들이 정상임에도 1번 제어기로 부터 비정상적인 신호를 수신하게 될 것이다.
이러한 단점을 커버하기 위해서 __Bus off__ 라는 기능이 있는데, 자체적으로 장애를 감지하여 Bus off 상태로 만들어, 네트워크에 참여하지 못하게 만드는 것이다.


