---
layout  : wiki
title   : Proximity-Based Authentication
summary : Device Pairing
date    : 2025-04-04 15:02:32 +0900
updated : 2025-04-04 18:12:24 +0900
tag     : sdv tesla crypto
toc     : true
comment : true
public  : true
parent  : [[/sdv]]
latex   : true
---
* TOC
{:toc}

## Proximity-Based Authentication

장치 페어링(Device Pairing) 에서는 ___사용자 지원 인증(사람의 도움으로 장치 페어링)___ 을 주로 사용한다.

__장치 페어링의 특징__:
- 사람이 유효성 검사 프로세스의 일부이며, 장치에 근접해야함
- 시간: 이러한 페어링은 e.g 30 초 등의 제한 시간이 존재함

인터넷을 통하지 않는 안전하지 않은 연결 중 가장 일반적인 것은 블루투스, WiFi, NFC(근거리 무선 통신)과 같은 단거리 무선 주파수를 기반으로 하는 프로토콜이다.

___사람은 유효성 검사 프로세스의 일부___ 이므로, 긴 문자열을 입력하거나 비교해야 하는 일은 종종 비실용적이고 사용자 친화적이지 않은 것으로 간주된다. 이러한 이유로 많은 프로토콜에서는 보안 관련 문자열을 4자리 또는 6자리 PIN 으로 줄이려 한다.

Proximity-Based Authentication 에는 QR, IVI Confirm Popup 등이 있다.
