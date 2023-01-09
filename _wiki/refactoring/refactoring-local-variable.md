---
layout  : wiki
title   : Inlining Local Variable
summary : 지역 변수 인라이닝 기준
date    : 2023-01-06 17:54:32 +0900
updated : 2023-01-06 20:15:24 +0900
tag     : refactoring
toc     : true
comment : true
public  : true
parent  : [[/refactoring]]
latex   : true
---
* TOC
{:toc}

## Inlining Local Variable

지역 변수를 함수 파라미터 안으로 인라이닝 하는 기준은 __지역 변수가 갖고 있는 정보가 충분한지__ 이다.

- __Before__

```java
public static int sufferScoreFor(List<Journey> route) {
    Location start = getDepartsFrom(route);
    List<Journey> longestJourneys = longestJourneysIn(route, 3);
    return sufferScore(longestJourneys, start);
}
```

- __After__

```java
public static int sufferScoreFor(List<Journey> route) {
    List<Journey> longestJourneys = longestJourneysIn(route, 3);
    return sufferScore(longestJourneys, getDepartsFrom(route));
}
```

start 라는 지역 변수는 그렇게 많은 정보를 알려 주지 못하기 때문에 1줄 이라도 더 줄이는 것이 좋다.

## References

- 자바에서 코틀린으로: 코틀린으로 리팩터링하기 / 냇프라이스 와 덩컨맥그레거 저 / O'REILLY