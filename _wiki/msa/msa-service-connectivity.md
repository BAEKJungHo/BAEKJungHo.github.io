---
layout  : wiki
title   : Service Connectivity
summary : 
date    : 2023-05-29 15:02:32 +0900
updated : 2023-05-29 15:12:24 +0900
tag     : architecture cloudnative msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Service Connectivity

__연결성을 만드는 방법 (클라우드 네이티브 애플리케이션 들을 연결):__
- 동기 or 비동기 통신 패턴을 사용하여
- RPC 패턴
- Pub Sub 패턴

__온라인 쇼핑몰 애플리케이션의 예:__
- 상품목록이나 주문과 같이 __외부__ 에 제공되는 서비스의 경우 REST 나 GraphQL 을 사용
- 주문과 결제 서비스간 통신과 같은 __내부__ 서비스간 통신에는 카프카 브로커를 이용한 비동기 메시지 패턴 사용
- 대부분의 마이크로서비스간 통신은 gRPC 사용

__세분화된 서비스가 많다면 = 연결해야하는 마이크로서비스가 많다 = 복잡도 증가:__
- 서비스를 어느 정도 단위로 세분화 할 것인지 파악해야 함
- 서비스를 기능/도구 단위가 아닌 __비지니스 기능__ 단위로 정의
- 애플리케이션이 동작하는 데 꼭 필요하지 않은 기능은 __사이드카(sidecar)__ 와 같은 다른 계층에서 구현해야함
  - 비지니스 로직과 관련되지 않은 __인프라스트럭처(infrastructure)__ 나 __네트워크(network)__ 같은 정보는 연결성 구현 시 사용하거나 노출해서는 안됨.

## References

- Design Patterns for Cloud Native Applications / Kasun Indrasiri, Sriskandarajah Suhothayan Author / O'REILLY