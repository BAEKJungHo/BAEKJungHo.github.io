---
layout  : wiki
title   : Fault Tolerance
summary : 
date    : 2022-06-02 17:54:32 +0900
updated : 2022-06-02 20:15:24 +0900
tag     : msa distributed resilience4j
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Fault Tolerance

> 아마존 부사장인 버너 보겔스(Werner Vogels)는 소프트웨어는 모두 실패한다라고 말한바 있다. 실패에 빠르게 대응할 수 있도록 설계해야 한다는 말이다. 이를 내결함성(fault tolerance)이라고 한다.

___[Fault Tolerance](https://en.wikipedia.org/wiki/Fault_tolerance)___ 는 시스템을 구성하는 부품의 일부에서 결함(fault) 또는 고장(failure)이 발생하여도 정상적 혹은 부분적으로 기능을 수행할 수 있는 시스템을 의미한다.

- __과거 아키텍처 성격__
  - 무결함 or 실패 무결성을 추구
- __현재 아키텍처 성격__
  - 실패하지 않는 시스템이 아니라, 실패에 빠르게 대응할 수 있는 시스템을 만드는 것이 효율적
  - 시스템은 항상 실패하지 않을 수 없기 때문 
- __이를 위한 대비책__
  - 다양한 실패에 대비한 테스트 환경
  - 실시간 모니터링 체계 갖추기
    - `서킷 브레이커(circuit breaker)`
      - 서킷 브레이커 패턴은 회로 차단기처럼 각 서비스를 모니터링 하고 있다가 한 서비스가 다운되거나 실패하면 이를 호출하는 서비스의 연계를 차단하고 적절하게 대응하는 것을 의미
    - `카오스 몽키(chaos monkey)`
      - 넷플릭스에서는 카오스 몽키라는, 장애를 일부러 발생시키는 도구를 만들어 이러한 탄력적인 아키텍처가 제대로 동작하는지를 검증하기도 함

__다양한 기업 사례__:

- [오픈마켓 여행 플랫폼의 실전 API 연동 노하우 - GMarket](https://ebay-korea.tistory.com/115)
- [우리는 어떻게 해외주식 서비스 안정화를 이뤘는가](https://toss.tech/article/overseas-securities-server)

G-Market 과 Toss 모두 Fault Tolerance 를 구축하기 위해서 ___[Resilience4j is a fault tolerance library for Java](https://resilience4j.readme.io/)___ 를 사용하고 있다.

## References

- 도메인 주도 설계로 시작하는 마이크로서비스 개발 / 한정헌, 유해식, 최은정, 이주영 저 / 위키북스