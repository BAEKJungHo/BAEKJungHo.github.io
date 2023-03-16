---
layout  : wiki
title   : Reverse Proxy
summary : 
date    : 2022-06-20 15:54:32 +0900
updated : 2022-06-20 20:15:24 +0900
tag     : infra proxy
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Reverse Proxy

![](/resource/wiki/infra-reverse-proxy/reverseproxy.png)

WAS(Web Application Server) 는 애플리케이션 로직을 처리하는데 특화되어있다. WebServer 와 WAS 를 분리하는 이유는 WAS 에서 너무 많은 역할/책임을 담당하게 되면 가장 비싼 애플리케이션 로직이 정적 리소스 때문에 수행이 어려울 수 있다. 

따라서, WAS 는 비지니스 로직만 처리하도록 구성해야 한다. TLS 와 같은 부수적인 기능으로 애플리케이션에 직접적인 영향을 주어서는 안된다. 그럴때 중간에 대신 역할을 수행하는 녀석이 필요한데, 대표적으로 Reverse Proxy 가 있다.

__Reverse Proxy__ 는 클라이언트로부터 요청을 받아서(필요하다면 주위에서 처리한 후) 적절한 웹 서버로 요청을 전송한다. 웹 서버는 요청을 받아서 평소처럼 처리하지만, 응답을 클라이언트로 보내지 않고 Reverse Proxy 로 반환한다. 요청을 받은 Reverse Proxy 는 응답을 클라이언트로 반환한다.

통상의 Proxy Server 는 LAN -> WAN 의 요청을 대리로 수행한다. 가령, 특정 웹 서비스에 접속하고 싶은데 해당 서비스에서 한국 IP 대역을 막아두었다면, 다른 국가를 통해 접속할 때 Proxy 를 활용한다. 반면 Reverse Proxy 는 WAN -> LAN 의 요청을 대리한다. __즉, 클라이언트로부터의 요청이 웹서버로 전달되는 도중의 처리에 끼어들어서 다양한 전후처리를 시행할 수가 있게 된다.__

## Reverse Proxy vs Load Balancer

![](/resource/wiki/infra-reverse-proxy/loadbalancer.png)

- __Reverse Proxy__ 
  - 보안성 향상, 확장성 향상, 웹 가속(압축/SSL 처리로 백엔드 리소스 확보/캐싱)
- __Load Balancer__
  - 부하분산, 서버상태 체크, 세션 관리

> nginx 는 Reverse Proxy, Load Balancer 두 가지 역할을 모두 수행할 수 있다.

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)