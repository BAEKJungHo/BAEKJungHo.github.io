---
layout  : wiki
title   : Google Firebase Network Latency Increased Error
summary : 
date    : 2023-09-22 15:05:32 +0900
updated : 2023-09-22 15:15:24 +0900
tag     : troubleshooting
toc     : true
comment : true
public  : true
parent  : [[/troubleshooting]]
latex   : true
---
* TOC
{:toc}

## Google Firebase Network Latency Increased Error

2023-09-21 Google Firebase 에 큰 장애가 발생했다. FE(Google FrontEnd) 와 Firestore API 간의 통신에 문제가 있어서 클라이언트 요청 전달 과정에서 트래픽이 원활하지 못해 지연이 발생한 이슈이다.

Firebase 를 real-time synchronization 으로 사용하고 있었다. 하나의 동기화를 위해 길게는 40초 이상이 소요되기도 해서 상당히 심각한 장애였다.

트래픽이 많지 않아서 그나마 다행이었지만, 만약 토스증권 같은 서비스가 오직 Firebase 에 의존한다고하면 엄청난 손실로 이뤄졌을 것이다.

Region 을 늘리는 것이 완벽한 해결책은 아니다. Global 장애(여러 Region 에 걸쳐서 발생)일 수도 있다.

이 장애 경험을 통해서, 아무리 구글 제품이라도 완전히 의존하면 안된다는 것을 배웠다.