---
layout  : wiki
title   : Load Balancer
summary : 
date    : 2024-07-28 13:08:32 +0900
updated : 2024-07-28 13:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Load Balancer

__[Load Balancer - Scalable system design patterns](https://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html)__:

![](/resource/wiki/infra-load-balancer/loadbalancing.png)

___[Load Balancer](https://github.com/donnemartin/system-design-primer?tab=readme-ov-file#load-balancer)___ 는 __클라이언트의 요청을 여러 서버에게 적절하게 분산__ 해주는 장치이다. 이때 어떤 알고리즘을 사용하여 분산할지 결정해야 한다.

__Load Balancing Algorithms__:

| Algorithm | Description                                                                        |
|-----------|------------------------------------------------------------------------------------|
| Round Robin	    | 서버에 들어온 요청을 순서대로 돌아가며 각 서버에 균등하게 분배하는 방식이다. 따라서 여러대의 서버가 동일한 스펙을 갖고있을때 사용하기 적합하다.  |
| IP Hash | 클라이언트의 IP 주소를 특정 서버로 매핑하여 요청을 처리하는 방식이다. 사용자의 IP를 해싱(Hashing)해 로드를 분배하기 때문에 사용자가 항상 동일한 서버로 연결되는 것을 보장한다. |
| Least Connection | 최소 연결 방식으로 요청이 들어온 시점에 가장 적은 연결 상태를 보이는 서버에 우선적으로 트래픽을 배분하는 방식이다. 여기서 적은 연결 상태는 가장 접속이 적은 서버가 기준이다. |
| Least Response Time | 서버의 현재 연결 상태와 응답 시간을 모두 고려해여 트래픽을 분배하는 방식이다. |

__[OSI 7-Layer](http://www.escotal.com/osilayer.html)__:

![](/resource/wiki/infra-load-balancer/osi-7layer.png)

Load Balancer 는 L4, L7 이 존재한다. L4 Load Balancer 는 전송 계층 의 정보를 보고 요청을 어떻게 분배할지 결정한다. 이 계층에는 헤더의 소스, 대상 IP 주소 및 포트가 포함되지만 패킷의 내용은 포함되지 않는다.
L4는 _[네트워크 주소 변환(NAT)](https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-NAT-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80)_ 을 수행하여 네트워크 패킷을 업스트림 서버로 전달하고 업스트림 서버에서 전달한다.

L7 Load Balancer 가 속한 계층은 헤더, 메시지 및 쿠키의 내용이 포함된다. 따라서 URL, HTTP 헤더, 쿠키 등 애플리케이션 계층의 정보를 기반으로 요청을 서버로 분산시킨다. 패킷의 내용(payload)까지 검사 가능하다.
L7 은 L4 보다 더 많은 정보를 검사하기 때문에 더 느리다. L7 은 애플리케이션 레벨의 보안 기능 제공(e.g 웹 애플리케이션 방화벽)한다.

A single load balancer is a single point of failure, configuring multiple load balancers further increases complexity.