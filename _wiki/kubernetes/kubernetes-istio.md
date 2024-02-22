---
layout  : wiki
title   : Istio Traffic management
summary : 
date    : 2024-02-18 15:54:32 +0900
updated : 2024-02-18 20:15:24 +0900
tag     : kubernetes
toc     : true
comment : true
public  : true
parent  : [[/kubernetes]]
latex   : true
---
* TOC
{:toc}
 
## Istio

__[Istio Architecture](https://istio.io/latest/docs/ops/deployment/architecture/)__

![](/resource/wiki/kubernetes-istio/istio-architecture.png)

__Concepts__:
- Traffic management
- Observability
- Security capabilities

### Traffic management

[Istio Traffic management - 조대협](https://bcho.tistory.com/1367) 여기에 되게 자세히 설명이 되어있다.

- [Traffic Management Best Practices](https://istio.io/latest/docs/ops/best-practices/traffic-management/)

Istio 의 트래픽 관리 컴포넌트는 Gateway, VirtualService, DestinationRule 로 구성된다.

- __Gateway__: Gateway 는 외부로부터 들어오는 트래픽을 받는 최전방 역할을 한다. 호스트명, 포트, 프로토콜을 정의하여 트래픽을 받는다. 이는 웹 서버에서 가상 호스트를 정의하는 것과 유사하다.
- __VirtualService__: VirtualService 는 들어오는 트래픽을 서비스로 라우팅하는 역할을 한다. 클라이언트가 Kubernetes 의 Service 를 호출할 때, VirtualService 는 정의된 라우팅 규칙에 따라 적절한 서비스로 트래픽을 라우팅한다. 이는 Kubernetes 의 Ingress 와 유사한 역할을 한다.
  - rewrite 라는 기능이 있는데, 클라이언트 요청이 Gateway 를 통해 설정 파일에 명시된 exact url or prefix url 로 들어오는 경우 rewrite 에 명시된 url 로 변경하여 백엔드 서비스로 요청을 보낸다.
- __DestinationRule__: VirtualService 가 트래픽을 서비스로 보낼 때, DestinationRule 은 서비스로 트래픽을 보내는 방식을 정의한다. 즉, 서비스 내의 Pod 로 트래픽을 라우팅하는 방법을 지정한다. DestinationRule 은 하나의 서비스에 대해 정의되며, 서비스 내의 Pod 를 버전 또는 다른 기준에 따라 그룹핑하고, 이를 subset 이라고 한다.

요약하자면, Gateway 는 외부 트래픽을 받고, VirtualService 는 트래픽을 서비스로 라우팅하며, DestinationRule 은 서비스로 트래픽을 보내는 방식을 정의한다. Istio 를 사용하여 트래픽 관리를 할 때, 이 세 가지 컴포넌트를 조합하여 원하는 트래픽 관리 정책을 구현할 수 있다.

Traffic Management 설정 관련 예제들은 [networking sample](https://github.com/istio/istio/tree/master/samples/bookinfo/networking) 여기서 볼 수 있다.

## Links

- [Service Mesh Architecture & Istio 를 알아보자 - 호롤리한 하루](https://gruuuuu.github.io/cloud/service-mesh-istio/)