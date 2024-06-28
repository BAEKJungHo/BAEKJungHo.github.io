---
layout  : wiki
title   : Debouncing, Throttling
summary : 
date    : 2023-02-07 17:54:32 +0900
updated : 2023-02-07 20:15:24 +0900
tag     : api
toc     : true
comment : true
public  : true
parent  : [[/api]]
latex   : true
---
* TOC
{:toc}

## Debouncing

Debouncing 은 여러 요청을 하나의 그룹으로 묶어서 처리하는 것을 의미한다. 보통 연이어 요청이 오는 경우 마지막 요청(또는 제일 처음)만 허용한다.

## Throttling

Throttling 은 특정 요청이 처리되고 난후 일정시간(ms, s)이 지나기전에는 다시 호출되지 않도록 하는 것을 의미한다.

## Links

- [Debounce, Throttle](https://web.archive.org/web/20220117092326/http://demo.nimius.net/debounce_throttle/)