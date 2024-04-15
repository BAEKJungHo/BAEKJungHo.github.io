---
layout  : wiki
title   : Redis Queue
summary : 
date    : 2024-04-10 13:15:32 +0900
updated : 2024-04-10 13:55:24 +0900
tag     : redis 
toc     : true
comment : true
public  : true
parent  : [[/redis]]
latex   : true
---
* TOC
{:toc}

## Redis Queue

### 우아한테크토크 선착순 이벤트 서버 생존기! 47만 RPM 에서 살아남다?!

[우아한테크토크 선착순 이벤트 서버 생존기! 47만 RPM 에서 살아남다?!](https://www.youtube.com/watch?v=MTSn93rNPPE)

- 처리할 수 있는 만큼만 순서대로 처리
- Queue System
  - 모든 이벤트 대상에게 번호표 지급
  - 번호표를 발급 받은 사용자를 줄을 세움 (대기열)
  - 대기열의 사용자가 몇번째 순서인지 알려줌
  - 서버가 처리할 수 있는 만큼의 사용자를 입장
- 대기열을 위해 Sorted Set 을 사용 (시간복잡도: O(logN))
  - ZADD: 데이터 추가시 부여한 스코어에 따라 정렬 (이벤트 주문을 요청한 순서대로 처리)
  - ZRANK: 현재 순위 조회 
  - ZRANGE: 일정한 수만큼 리스트 조회 (대기열에서 참가열로 이동. 이때 이동시키기 위한 스케줄러가 필요함)
- 고려사항
  - 자료구조마다 시간복잡도가 다르기때문에 주의 (왜냐하면 Redis 는 Single Thread 라 O(N)인 경우 대용량 트래픽에서는 시스템 장애 날 수도 있음)

