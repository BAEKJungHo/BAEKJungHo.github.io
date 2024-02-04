---
layout  : wiki
title   : Envoy Proxy
summary : 
date    : 2024-02-02 15:54:32 +0900
updated : 2024-02-02 20:15:24 +0900
tag     : infra kubernetes
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Envoy Proxy

> 기존의 대표적인 프록시 솔루션으로는 nginx, haproxy, apache 서버등이 있는데, 이러한 프록시들은 보통 TCP/IP 레이어에서 L4 로 작동을 하였다. 그러나 마이크로 서비스에서는 조금더 복잡한 라우팅 요건이 필요한데 예를 들어서 HTTP URL에 따른 라우팅에서 부터, HTTP Header를 이용한 라우팅등 다양한 요건이 필요해지면서 L4보다는 애플리케이션 레이어인 L7 기능이 필요해지게 되었다.
>
> 출처: https://bcho.tistory.com/1253 [조대협의 블로그:티스토리]

### [What is Envoy](https://www.envoyproxy.io/docs/envoy/latest/intro/what_is_envoy)

다음 목적을 가지고 태어난 프로젝트이다.

> The network should be transparent to applications. When network and application problems do occur it should be easy to determine the source of the problem.

Envoy is an __L7__ proxy. 따라서 L4 Proxy 보다 성능 감소가 다소 존재하지만 가능한 최고 성능을 목표로 한다.
L7 은 Http Level Proxy 라서 요청을 파싱하고 헤더 정보를 분석하기 때문에 L4 랑 성능차이가 존재한다.

### Features

__Out of process architecture__:
- Envoy 는 모든 애플리케이션 언어에서 작동한다. 단일 Envoy 배포는 Java, C++, Go, PHP, Python 등 간에 메시를 형성할 수 있다.

__L3/L4 filter architecture__:
- Envoy 의 핵심은 L3/L4 네트워크 프록시이다. 
- 플러그형 [Network (L3/L4) filters](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/listeners/listener_filters#network-l3-l4-filters) 체인 매커니즘을 사용하여 다양한 TCP/UDP 프록시 작업을 수행할 수 있다.

__HTTP L7 filter architecture__:
- 버퍼링, 속도제한, 라우팅/전달 등과 같은 다양한 작업을 수행할 수 있다.

__First class HTTP/2 support, +HTTP/3__:
- HTTP/2 , gRPC 지원
- HTTP/3 support (currently in alpha) As of 1.19.0, Envoy now supports HTTP/3 upstream and downstream, and translating between any combination of HTTP/1.1, HTTP/2 and HTTP/3 in either direction.

__Health checking__:
- Envoy includes a health checking subsystem which can optionally perform active health checking of upstream service clusters.

__Advanced load balancing__:
- 자동 재시도, [Circuit breaking](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking), 외부 속도 제한 서비스를 통한 글로벌 속도제한, [Outlier detection](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier) 등의 기능을 제공한다.

### Terminology

- __Downstream__: Envoy 에게 request 를 보내고 response 를 받는 host
- __Upstream__: Envoy 로부터 request 를 받고 response 를 보내주는 host
- __Listener__: Downstream 호스트의 요청을 받는 부분 (e.g TCP Listener, HTTP Listener 등)
- __Cluster__: Upstream 호스트의 그룹. 실제로 라우팅이 될 대상 서버(서비스)를 지정.

Listener 를 통해서 메시지를 받고, Filter 를 이용하여 받은 메시지를 처리한 후에, 라우팅 규칙에 따라서 적절한 Cluster 로 라우팅을 해서 적절한 서비스로 메시지를 보내는 형식이다.

## Links

- [MSA 를 위한 L7 Proxy - EnvoyProxy - 조대협](https://bcho.tistory.com/1253)
- [envoy proxy 란 ? (basic)](https://gruuuuu.github.io/cloud/envoy-proxy/)