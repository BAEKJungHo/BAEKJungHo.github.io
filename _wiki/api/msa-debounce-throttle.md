---
layout  : wiki
title   : Debounce; Throttle
summary : 
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

- 연속된 이벤트 중 "마지막" 또는 "첫번째" 이벤트만 처리하고자 할 때 사용
- 대표적 사례: 검색창의 자동완성

```
// 사용자가 타이핑을 멈추고 500ms가 지난 후에만 API 호출
const debouncedSearch = debounce((searchTerm) => {
  searchAPI(searchTerm);
}, 500);
```

Debounce 의 본질은 __최종 상태__ 가 중요할 때 사용하는 것이다.

## Throttling

___[Throttling](https://www.inngest.com/blog/rate-limit-debouncing-throttling-explained)___ 은 일정 시간 간격으로 __이벤트를 "주기적으로" 실행__ 하고자 할 때 사용한다.

- 대표적 사례: 무한 스크롤의 스크롤 이벤트 처리

```
// 최대 100ms 간격으로만 스크롤 이벤트 처리
const throttledScroll = throttle(() => {
  checkScrollPosition();
}, 100);
```

연속적인 이벤트 중에서 일정 주기로 샘플링하여 처리하고 싶을 때 적합하다.

Throttle 의 본질은 __주기적인 실행__ 이 중요할 때 사용하는 것이다.

"마지막 상태가 중요한가" vs "주기적 실행이 중요한가" 를 기준으로 Debounce 와 Throttle 을 고르면 된다.

## RateLimit

Throttling 과 유사한 ___[RateLimit](https://baekjungho.github.io/wiki/api/api-too-many-requests/)___ 이란 기술도 있다. RateLimit 은 API 서비스에서 사용자별로 분당 최대 요청 수를 제한할 때 사용한다. 전체적인 요청 빈도를 제한할 때 사용한다.