---
layout  : wiki
title   : Service Mesh Architecture
summary : SideCar Pattern
date    : 2024-02-17 15:54:32 +0900
updated : 2024-02-17 20:15:24 +0900
tag     : kubernetes architecture
toc     : true
comment : true
public  : true
parent  : [[/kubernetes]]
latex   : true
---
* TOC
{:toc}
 
## Service Mesh Architecture

여러 Microservice 들이 있을때, 서비스끼리 직접 통신(call by direct) 하는 것이 아니라, Proxy 를 통해서(__call by proxy__) 하게 된다.
이때 주로 사용되는 proxy 중 하나는 [Envoy Proxy](https://baekjungho.github.io/wiki/infra/infra-envoy-proxy/) 이다. Envoy Proxy 는 고성능 프록시 사이드카이다.

![](/resource/wiki/kubernetes-service-mesh/service-mesh.png)

서비스 메시(Service Mesh) 에서의 호출은 위 그림처럼 ___[SideCar](https://johngrib.github.io/wiki/pattern/sidecar/)___ 형태로 달린 proxy 끼리 이뤄진다. 장점으로는 서비스 트래픽을 네트워크단에서 통제할 수 있다.
그런데 서비스의 수가 많아질 수록 proxy 수도 많아져서 중앙집중화된 컨트롤가 필요한데,
Data Plane 과 Control Plane 으로 구성된다. 

서비스 메시 구현체중 하나가 [Istio](https://istio.io/latest/docs/ops/deployment/architecture/) 이다.

## Links

- [Service Mesh Architecture & Istio를 알아보자 - 호롤리한 하루](https://gruuuuu.github.io/cloud/service-mesh-istio/)