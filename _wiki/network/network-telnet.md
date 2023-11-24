---
layout  : wiki
title   : Telnet
summary : 
date    : 2023-11-14 15:54:32 +0900
updated : 2023-11-14 20:15:24 +0900
tag     : network
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Telnet

telnet 은 특정 포트로 연결을 시도하고, 연결이 성공하면 키보드를 통해 텍스트 명령을 보낼 수 있다. 이는 특정 포트의 서비스가 제대로 동작하고 응답하는지를 확인하는 데 사용될 수 있다.

- __ping test__
  - 해당 IP 로 패킷을 보내고 응답을 받는지 확인
    - `ping {ip}`
    - __Speed__
        - 초고속 인터넷망: 0~10ms

- __telnet test__
  - `telnet {domain} {port}`
      - e.g telnet www.google.com 80