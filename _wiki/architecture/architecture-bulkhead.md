---
layout  : wiki
title   : Bulkhead
summary : How LINE OpenChatServer handles extreme traffic spikes
date    : 2023-04-22 15:02:32 +0900
updated : 2023-04-22 15:12:24 +0900
tag     : architecture msa
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## BulkHead

[Microsoft Bulkhead Pattern](https://learn.microsoft.com/ko-kr/azure/architecture/patterns/bulkhead) 에서 Bulkhead 패턴은 실패에 관대한 패턴이라고 설명하고 있다.
핵심은 __하나가 고장 나더라도 나머지는 정상적으로 작동하도록 애플리케이션의 요소를 여러 풀에 격리__ 하는 것이다.

[Circuit Breaker with Fallback Improving Resiliency](https://baekjungho.github.io/wiki/architecture/architecture-circuit-breaker/) - Circuit Breaker 패턴과 같이 사용된다.

> [How LINE OpenChatServer handles extreme traffic spikes](https://engineering.linecorp.com/ko/blog/how-line-openchat-server-handles-extreme-traffic-spikes)
> 
> <script defer class="speakerdeck-embed" data-id="882f1802107e46f686b6a927eea0ec19" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>
>
> 핫 챗 때문에 스토리지의 한 샤드의 처리 속도가 느려지거나 사용 불능이 되더라도 다른 샤드로 가는 요청은 영향받지 않고 처리되도록 서킷 브레이커와 벌크헤드(bulkhead)를 도입했습니다.
>
> 서킷 브레이커는 스토리지의 샤드별로 응답 타임아웃과 같은 에러가 많이 발생하면 요청들을 빠르게 실패로 처리합니다. 벌크헤드는 하나의 샤드로 몰린 요청들이 스레드 풀을 독점하지 않도록 막아줍니다. 이를 통해 한 샤드에 요청이 몰릴 때 다른 샤드에 영향을 주지 않도록 부하를 격리할 수 있습니다.

추가로, LINE Tech Blog 글을 읽으면 다음과 같이 설명이 되어있다.

> 오픈챗 서버에서는 데이터를 저장하기 위해 MySQL 과 Redis, HBASE, Kafka 등 다양한 스토리지를 사용하고 있으며, 챗 ID를 기반으로 샤딩(sharding)해서 데이터를 저장합니다.

하나의 오픈채팅(오픈챗)은 하나의 챗 ID 를 갖기 때문에, 챗 ID를 기반으로 샤딩하는 구조에서는 하나의 핫 챗 안에서 발생하는 데이터를 더 이상 분산시킬 수 없다고 하며 이로 인해 하나의 챗에 트래픽이 몰리게 될 경우
스토리지에 많은 부하가 간다고 한다. (e.g 인기 스트리머가 특정 오픈채팅에 참여한 경우 팬들 유입으로 인해 트래픽이 많아지는 현상)

이렇게 트래픽이 몰리는 챗을 `Hot`Chat 이라고 부르는 것 같다. 더 자세한 내용은 LINE Tech Blog 글을 참고하면 된다.
