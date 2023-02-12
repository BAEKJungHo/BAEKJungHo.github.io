---
layout  : wiki
title   : Debounce and Throttle
summary : 
date    : 2023-02-07 17:54:32 +0900
updated : 2023-02-07 20:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Debounce

Debouncing will bunch a series of sequential calls to a function into a single call to that function. It ensures that one notification is made for an event that fires multiple times.

- Debounce 는 사용자의 모든 입력이 끝날때 API 를 호출하는 것

## Throttle

Throttling will delay executing a function. It will reduce the notifications of an event that fires multiple times.

- Throttle 은 특정 time 마다 API 를 호출하는 것

## Links

- [Debounce, Throttle](https://web.archive.org/web/20220117092326/http://demo.nimius.net/debounce_throttle/)