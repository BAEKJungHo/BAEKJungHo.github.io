---
layout  : wiki
title   : Replication
summary : 
date    : 2023-03-11 15:28:32 +0900
updated : 2023-03-11 18:15:24 +0900
tag     : database
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Replication

Replication 이란 마스터(master)와 슬레이브(slave)를 정해두면 마스터에 쓴 내용을 슬레이브가 폴링(polling) 해서 동일한 내용으로 자신을 갱신하는 기능이다. 슬레이브는 마스터의 레플리카(replica, 카피)가 되는 것이다. 이렇게 해서 동일한 내용의 서버를 여러 대 마련할 수 가 있다.

Command 는 마스터가 담당하고 Query 만 로드밸런서 or 프록시를 통해서 슬레이브로 향하게 한다. Command 를 슬레이브로 보내면 슬레이브와 마스터간 내용을 동기화할 수 없다.

보통은 읽기 부하가 대부분이기 때문에, 읽기 처리량을 높이려면 슬레이브만 수평으로 확장하면 된다.

마스터는 확장하지 않고, 마스터의 부하는 테이블 분할이나 다른 구현 등으로 해결할 수 있다.

MySQL Replication by default is asynchronous. Asynchronous replication provides lower write latency, since a write is acknowledged locally by a master before being written to slaves. It is great for read scaling as adding more replicas does not impact replication latency.

## Reverse Proxy

Some of them, like ProxySQL or MaxScale, do support query caching. In case you would like to benefit from this feature, it might be better to collocate them with application hosts. Please keep in mind that the local connection over the Unix socket will always have lower latency that the connection to the proxy over TCP.

By having a reverse proxy as the middle-man, the application side does not need to perform health checks for slave consistency, replication lag or master/slave availability as these tasks have been taken care of by reverse proxy. Applications just have to send queries to the load balancer servers, and the queries are then re-routed to the correct backends.

By adding a reverse-proxy into the picture, our architecture should look like this:

![](/resource/wiki/database-replication/replication.png)

[HAProxy](https://www.haproxy.org/)

대용량 데이터를 다루는데 어려운 점은 I/O 에 대한 부하 관리이다. HAProxy is an event-driven, non-blocking engine combining a very fast I/O layer with a priority-based, multi-threaded scheduler. It focuses on optimizing the CPU cache's efficiency by sticking connections to the same CPU as long as possible.

## Links

- [MySQL Chapter 17 Replication](https://dev.mysql.com/doc/refman/8.0/en/replication.html)
- [MySQL Replication for high availability](https://severalnines.com/resources/whitepapers/mysql-replication-high-availability/)
- [A Better MySQL Replication Heartbeat](https://dzone.com/articles/better-mysql-replication)
- [Redis Replication](https://redis.io/docs/management/replication/)

## References

- 대규모 서비스를 지탱하는 기술 / 이토 나오야, 다나카 신지 저 / 제이펍