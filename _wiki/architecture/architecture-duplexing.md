---
layout  : wiki
title   : DUPLEXING
summary : 
date    : 2024-10-30 15:02:32 +0900
updated : 2024-10-30 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## DUPLEXING

___이중화(二重化, Duplexing)___ 란, ___시스템 신뢰성을 올리기 위해 같은 기능을 가진 시스템을 두 개 준비하는 것___ 을 말한다.

Server 와 Client 간 데이터 교환 방식으로 Cloud Database 를 사용하고 있다고 하자. 만약 Firestore Dependency 가 강한 서비스의 경우 Firestore 가 고장나면
어떻게 대처할 것인가 ? Google 이니까 장애가 안난다고 ? 자주는 안나겠지만 나는 실제로 Firestore 장애를 경험해봤다.

___신뢰성(reliability)___ 이 중요한 기능의 경우에 '이중화'는 가장 우선적으로 고려해야할 사항일 수 있다.

예를 들어, Driver 가 Order 발생 알림을 무조건 받아야 하는 서비스가 있다고 가정하자. Order 는 5분내에 수락해야 한다.
이때 Notification System 에서 FCM 만 믿고 사용했다가, 5분이 넘는 지연 등이 발생하게 된다면 Driver 는 해당 Order 를 수락할 기회를 놓치게 된다.
따라서 별도의 Notification Channel 을 이용하거나 Firestore 에 알림 데이터를 동일하게 전송하여 이중화를 구현할 수 있다.