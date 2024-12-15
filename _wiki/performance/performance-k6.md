---
layout  : wiki
title   : K6 Performance Testing
summary : 
date    : 2024-12-15 11:54:32 +0900
updated : 2024-12-15 12:15:24 +0900
tag     : performance
toc     : true
comment : true
public  : true
parent  : [[/performance]]
latex   : true
---
* TOC
{:toc}

## K6 Performance Testing

성능 테스트(Performance Testing)는 시스템, 애플리케이션, 또는 소프트웨어가 특정 조건 하에서 얼마나 효과적으로 작동하는지 평가하는 소프트웨어 테스트의 한 유형이다. 주로 응답 속도, 처리량(Throughput), 자원 사용량(Resource Usage), 안정성(Stability) 등과 같은 비기능적 요구사항을 검증하는 데 사용된다.

__성능 테스트의 주요 목적__:
- 응답 시간(Response Time): 사용자가 요청을 보낸 후 응답을 받기까지 걸리는 시간을 측정
- 처리량(Throughput): 단위 시간당 처리할 수 있는 작업의 수를 측정
- 자원 사용량(Resource Usage): CPU, 메모리, 디스크, 네트워크 등의 시스템 자원이 얼마나 사용되는지 확인
- 안정성(Stability): 일정 시간 동안 부하가 가해지는 상황에서도 애플리케이션이 안정적으로 작동하는지 평가

__Test Types__:

![](/resource/wiki/performance-k6/testing-types.png)

- ___[스모크 테스트(Smoke tests)](https://grafana.com/docs/k6/latest/testing-guides/test-types/smoke-testing/)___ 는 스크립트가 작동하는지, 시스템이 최소한의 부하에서 적절하게 작동하는지 검증합니다.
- ___[평균 부하 테스트(Average-load test)](https://grafana.com/docs/k6/latest/testing-guides/test-types/load-testing/)___ 는 예상되는 정상 조건에서 시스템의 성능을 평가합니다.
- ___[스트레스 테스트(Stress tests)](https://grafana.com/docs/k6/latest/testing-guides/test-types/stress-testing/)___ 는 부하가 예상 평균을 초과할 때 시스템이 한계에서 어떻게 성능을 발휘하는지 평가합니다.
- ___[침투 테스트(Soak tests)](https://grafana.com/docs/k6/latest/testing-guides/test-types/soak-testing/)___ 는 장기간에 걸쳐 시스템의 안정성과 성능을 평가합니다.
- ___[스파이크 테스트(Spike tests)](https://grafana.com/docs/k6/latest/testing-guides/test-types/spike-testing/)___ 는 활동이 갑작스럽고 짧거나 엄청나게 증가하는 경우 시스템의 동작과 생존성을 검증합니다.
- ___[중단점 테스트(Breakpoint tests)](https://grafana.com/docs/k6/latest/testing-guides/test-types/breakpoint-testing/)___ 는 부하를 점진적으로 증가시켜 시스템의 용량 한계를 파악합니다.

__Test Type Cheat Sheet__:

![](/resource/wiki/performance-k6/test-type-cheat-sheet.png)

__Metrics__:
- [K6 Metrics](https://grafana.com/docs/k6/latest/using-k6/metrics/)

## Links

- [부하테스터 도구 k6 퀵 스타트](https://www.sktenterprise.com/bizInsight/blogDetail/dev/2515)
- [23년 2월 Tech 세미나 - 성능 테스트와 K6 도구 소개](https://www.youtube.com/watch?v=MqdQc4vd_ws&list=LL&index=2)
- [성능 Test 와 K6 도구 소개](https://github.com/schooldevops/k6-tutorials/blob/main/UsingK6/99_K6_Seminar.md)