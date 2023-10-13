---
layout  : wiki
title   : Half Close
summary :
date    : 2023-10-10 15:54:32 +0900
updated : 2023-10-10 20:15:24 +0900
tag     : network tcp
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
  {:toc}

## Half Close

[Close(완전 종료)](https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=sdug12051205&logNo=221053748674)란 __데이터의 전송 뿐만 아니라 수신하는 것 조차 불가능한 상황__ 을 의미한다.

__Half Close__ 는 송수신 둘 중 하나만 가능한 상황을 의미한다.

__[What is TCP Half Open Connection and TCP half closed connection](https://superuser.com/questions/298919/what-is-tcp-half-open-connection-and-tcp-half-closed-connection)__:

> The History of Half Closed Connection
> -  It allows the FIN ack take the role of or be translated as EOF. So it's basically a feature that allows you to casually create impomptu request/response-style interaction on the application layer, where the FIN signals "end of request".

__[TCP 4 way handshake](https://www.excentis.com/blog/tcp-half-close-a-cool-feature-that-is-now-broken/)__:

> [TCP Half Closed timer, which is triggered by the first FIN](https://docs.paloaltonetworks.com/pan-os/9-1/pan-os-admin/networking/session-settings-and-timeouts/tcp/tcp-half-closed-and-tcp-time-wait-timers)
>
> ![](/resource/wiki/network-half-close/4-way-handshake.png)

TCP 4 way handshake 에서 데이터 전송이 끝난 Client 가 FIN 을 보내고 나면(Client 는 데이터 전송이 불가능한 상태) Server 로 부터 ACK 을 받는다. 그리고 Server 는 FIN 을 보내기 전에 __남아있는(잔여) 데이터__ 를 전송하게 된다.
그리고 FIN 을 Client 로 부터 보내고 Client 로 부터 ACK 을 받게 되면 연결이 종료된다.