---
layout  : wiki
title   : Vehicle Controls
summary : 
date    : 2024-03-05 20:54:32 +0900
updated : 2024-03-05 21:15:24 +0900
tag     : realworld mobility tesla kotlin
toc     : true
comment : true
public  : true
parent  : [[/realworld]]
latex   : true
---
* TOC
{:toc}

## Vehicle Controls

[Vehicle Controls App](https://www.tesla.com/support/videos/watch/vehicle-controls-tesla-app) 이란 차량 바디, 공조 등의 제어 명령을 수행하는 App 을 의미한다.

TESLA 에서 친절하게 [Vehicle Command API](https://developer.tesla.com/docs/fleet-api#vehicle-commands) 를 제공하고 있다.
2023-10-09 일에 Tesla [Vehicle Command SDK](https://github.com/teslamotors/vehicle-command/tree/main) 가 지원됨에 따라 HTTP Vehicle Command API 는 deprecated warning 이 되었다.

Tesla Vehicle Command SDK provides end-to-end authentication for sending commands to vehicles. This is the recommended way of sending commands to vehicles.
