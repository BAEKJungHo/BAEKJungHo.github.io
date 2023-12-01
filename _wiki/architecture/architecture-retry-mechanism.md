---
layout  : wiki
title   : Retry Mechanism
summary : 
date    : 2023-11-28 15:02:32 +0900
updated : 2023-11-28 15:12:24 +0900
tag     : architecture network
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Retry Mechanism

- __Exponential Backoff__
  - 일정 시간 동안 서버로의 재시도 간격을 기하급수적으로 증가시킴으로써 서버에 과도한 부하를 가하지 않는다.
- __Retry Limit__
  - 재시도 횟수에 대한 제한을 두어 무한히 재시도하지 않도록 한다.
- __[Idempotent](https://baekjungho.github.io/wiki/network/network-idempotency/)__
  - 요청이 멱등성을 가져야 한다. 멱등성이란 동일한 요청을 여러 번 수행하더라도 결과가 변하지 않는 특성을 의미한다. 이를 통해 동일한 요청을 여러 번 보내더라도 예상치 못한 부작용이 발생하지 않도록 한다.
  - [Idempotency Key that resolve consistency issues with retries](https://baekjungho.github.io/wiki/troubleshooting/troubleshooting-idempotency/)
- __Handling Timeout__
  - 요청이 지정된 시간 내에 응답을 받지 못한 경우에는 타임아웃을 처리하고 재시도한다. 
- __Logging and Monitoring__
  - 재시도 로그를 기록하고 모니터링하여 장애 조치 및 문제 해결에 도움을 준다.