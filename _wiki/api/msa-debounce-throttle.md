---
layout  : wiki
title   : Technique for Enhancing System Stability, User Experiences
summary : Debouncing, Throttling, RateLimit
date    : 2023-02-07 17:54:32 +0900
updated : 2023-02-07 20:15:24 +0900
tag     : api debouncing throttling ratelimit
toc     : true
comment : true
public  : true
parent  : [[/api]]
latex   : true
---
* TOC
{:toc}

## Debouncing

___[Debouncing](https://web.archive.org/web/20220117092326/http://demo.nimius.net/debounce_throttle/)___ 은 여러 ___요청을 하나의 그룹(grouping)으로 묶어서 처리___ 하는 것을 의미한다. 보통 연이어 요청이 오는 경우 마지막 요청(또는 제일 처음)만 허용한다.

## Throttling

___[Throttling](https://www.inngest.com/blog/rate-limit-debouncing-throttling-explained)___ 은 특정 요청이 처리되고 난후 일정시간(ms, s)이 지나기전에는 다시 호출되지 않도록 하는 것을 의미한다.
___일정 시간 동안 API 호출 횟수를 제한___ 하는 기술이다. 예를 들어, 1초에 최대 1번만 함수를 실행하도록 제한할 수 있다.

## RateLimit

Throttling 과 유사한 ___[RateLimit](https://baekjungho.github.io/wiki/api/api-too-many-requests/)___ 이란 기술도 있다. RateLimit 은 API 서비스에서 사용자별로 분당 최대 요청 수를 제한할 때 사용한다. 전체적인 요청 빈도를 제한할 때 사용한다.