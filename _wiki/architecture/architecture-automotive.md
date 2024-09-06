---
layout  : wiki
title   : Automotive Architectures
summary : Domain, Zonal and the Rise of Central
date    : 2024-09-04 18:02:32 +0900
updated : 2024-09-04 20:12:24 +0900
tag     : architecture mobility
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Automotive Architectures

![](/resource/wiki/architecture-automotive/title.png)

지난 10년간 대부분의 차량들은 ECUs 가 내장된 ___[Flat Architecture](https://www.redeweb.com/en/Articles/processor-technologies-that-make-software-defined-vehicles-possible/)___ 를 사용했다.

![](/resource/wiki/architecture-automotive/flat-architecture.png)

F/A 의 단점은 ECU 는 내장된 인증 및 권한 부여 메커니즘이 없는 ___[CAN](https://baekjungho.github.io/wiki/mobility/mobility-can/)___ 프로토콜을 통해 통신하는데, 전선으로 연결되며 전선으로 인한 무게, 부피 때문에 차량의 무게 부피가 증가해서 연비가 떨어질 것이다.

기능적으로 관련된 ECU 들을 모아서 관리하기 위해서 등장한 아키텍처가 ___Domain Architecture___ 이다. 엔진 및 변속기 제어, 기후 제어, ABS 및 주차 지원과 같은 특정 기능을 위한 ECU 를 통합한 방식이다.
하지만 각 ECU 들이 차량 전체에 분산되어있기 때문에 배선을 최적화 하진 못한다.

이 문제를 해결하고자 등장한 것이 ___Zonal Architecture___ 이다. 이 접근 방식은 물리적으로 가까운 ECU 를 단일 구역 컨트롤러 아래에 결합하여 도메인 아키텍처의 단점을 해결한다. 장점은 소프트웨어 복잡성이 증가하는 대가로 배선과 무게가 줄어든다.
케이블은 중앙 서버에서 게이트웨이와 센서까지 외부로 연결된다. 따라서 Vehicle Network 구축이 용이하며, 특정 Zonal 에 대한 확장이 쉽다.

![](/resource/wiki/architecture-automotive/zonal-architecture.png)

SDV 가 Zonal Architecture 를 채택하는 가장 큰 이유 중 하나는 SDV는 애플리케이션 계층을 하드웨어 계층에서 분리하여 여러 가지 중요한 이점을 제공하는 모듈식의 유연한 시스템을 만들 수 있기 때문이다.
즉, Abstraction of Application from Hardware 에 따른 <mark><em><strong>Separation of Software and Hardware</strong></em></mark> 를 위해서 이다.

Hardware Dependency 없이 Software 를 개발하고 원격으로 업데이트하기가 쉬워진다.

## References

- [Automotive Architectures - Domain, Zonal and the Rise of Central](https://www.eetimes.com/automotive-architectures-domain-zonal-and-the-rise-of-central/)
- [Advantages of Zonal Architecture over Domain Architecture](https://grapeup.com/blog/exploring-the-architecture-of-automotive-electronics-domain-vs-zone)