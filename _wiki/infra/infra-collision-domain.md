---
layout  : wiki
title   : Collision Domain
summary : 
date    : 2022-06-08 15:54:32 +0900
updated : 2022-06-08 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Collision Domain

![](/resource/wiki/collision-domain/router.png)

Collision Domain 이란, Half Duplex 로 다중접속환경(Multiple Access)를 구성했을 경우, 데이터를 동시에 전송했을 때 충돌이 일어날 수 있는 영역을 의미한다. 따라서 허브를 통해 MA 를 만들었을 경우, 허브는 1계층 장비이기 때문에 신호 증폭, 즉 Collision Domain 을 확장시킨다.

반면, 스위치를 통해 MA 를 구성할 경우, 스위치는 2계층 장비이기 때문에 신호 증폭도 시키지만 2계층 헤더를 열어 MAC 주소를 확인해 전송해서 Port 별로 Collision Domain 을 나눈다.

따라서, Multiple Access 를 구성할 경우 Switch 를 사용해야 한다.

## Links

- [Switch](https://brainbackdoor.tistory.com/115)
- [NextStep 인프라 공방](https://edu.nextstep.camp/)