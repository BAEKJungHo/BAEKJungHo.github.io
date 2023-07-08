---
layout  : wiki
title   : How Discord Stores Trillions of Messages
summary : Discord 팀이 조 단위 메세지를 DB에 저장하는 방법
date    : 2023-07-07 15:02:32 +0900
updated : 2023-07-07 15:12:24 +0900
tag     : architecture snowflake database cassandra msa
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## How Discord Stores Billions of Messages

[How Discord Stores Billions of Messages](https://discord.com/blog/how-discord-stores-billions-of-messages) 글을 살펴보면 다음과 같은 내용이 있다.

2015년 11월경 Discord 팀은 __1억개__ 의 저장된 메시지에 도달하게 되었으며, 그 시점 부터 문제가 발생하게 되었다고 한다.

메시지는 channel_id 및 created_at 에 단일 복합 인덱스가 있는 MongoDB 컬렉션에 저장되었는데, 데이터와 인덱스가 더 이상 RAM 에 들어가지 못하고 대기 시간을 예측할 수 없게 되었다고 한다.

모든 쿼리가 채널에서 작동하기 때문에 channel_id 가 파티션 키가 되었지만 created_at 은 두 메시지의 생성 시간이 같을 수 있기 때문에 훌륭한 클러스터링 키가 되지 못했다고 한다.

... 생략 ...

그래서 올바른 데이터베이스를 선택하기 위한 여러 과정을 거치고 Cassandra 를 선택했다고 한다.

Cassandra

