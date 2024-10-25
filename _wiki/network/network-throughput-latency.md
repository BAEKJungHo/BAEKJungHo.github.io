---
layout  : wiki
title   : Throughput and Latency understood by Delivery Services
summary : 
date    : 2024-10-25 15:54:32 +0900
updated : 2024-10-25 19:15:24 +0900
tag     : network
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## The Delivery Driver Guide to Throughput and Latency

처리량(Throughput)과 지연시간(Latency) 를 이해하기 가장 쉬운 예시는 ___Delivery Services___ 생각해보면 된다.
대한민국의 대표 배달 앱 '배달의 민족'을 생각해보자. 알뜰 배달과, 한집 배달이 있다.

한집배달(단건배달)은 하나의 주문이 들어오면 한건만 배달하는 방식이고, 알뜰배달은 가까운 거리에 있는 여러 배달 주문을 한 번에 배달하는 시스템이다

내가 Pizza 를 주문하고 한집배달을 선택하게 되면 가장 빠르게 음식을 받을 수 있다. 즉, Latency 가 가장 낮다. 반면, 알뜰배달을 선택하면 가까운 거리의 다른 집에도 배달을 가기 때문에 가게 입장에서 Throughput 은 크지만, 고객 입장에서 Latency 는 크다.
