---
layout  : wiki
title   : Idempotency
summary : 
date    : 2023-07-15 15:54:32 +0900
updated : 2023-07-15 20:15:24 +0900
tag     : network idempotency
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Idempotency

[Idempotency Key that resolve consistency issues with retries](https://baekjungho.github.io/wiki/troubleshooting/troubleshooting-idempotency/#idempotent)
에 멱등성이 무엇인지, Stripe 와 Toss 는 어떻게 사용하고 있는지 정리하였다.

__Flow__:

![](/resource/wiki/network-idempotency/idempotency.png)

멱등성이 꼭 필요한 환경을 꼽으라고 하면, 네트워크 이슈가 자주 발생할 수 있는 모바일, 탭 환경일 것이다.
Payment Service, Taxi Call Service 같은 곳에서는 필수라고 생각한다.