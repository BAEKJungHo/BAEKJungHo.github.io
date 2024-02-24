---
layout  : wiki
title   : Prometheus Architecture
summary : 
date    : 2024-02-20 15:02:32 +0900
updated : 2024-02-20 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Prometheus Architecture

__What is Prometheus ?__
- Prometheus is open-source systems monitoring and alerting
- Prometheus fundamentally stores all data as [time series](https://en.wikipedia.org/wiki/Time_series)
- 넓은 오픈 소스 생태계를 기반으로 해서, 많은 시스템을 모니터링할 수 있는 다양한 플러그인을 가지고 있는 것이 가장 큰 장점이다.

__[Architecture](https://prometheus.io/docs/introduction/overview/)__:

![](/resource/wiki/architecture-prometheus/prometheus-architecture.png)

프로메테우스가 메트릭 수집을 위한 대상 시스템(target system) 으로 부터, 메트릭을 수집하는 방식은 pull 방식을 사용한다.
풀링 방식은 프로메테우스가 주기적으로 Exporter 로 부터 메트릭 읽어와서 수집하는 방식이다. 풀링 방식은 auth-scaling 으로 인해 VM 이 증가되 모니터링 대상의 IP 주소를
모르기 때문에 메트릭 수집이 어렵다는 단점이 있다. 그래서 보통 메트릭 시스템은 push 방식을 사용한다. 하지만 이러한 풀링 방식의 단점을 해결하기 위한 것 중 하나가 [Service Discovery](https://baekjungho.github.io/wiki/msa/msa-service-discovery/) 이다.
특정 시스템이 현재 기동중인 서비스들의 목록과 IP 주소를 가지고 있으면 된다. 예를 들어 앞에서 VM 들을 내부 DNS 에 등록해놓고 새로운 VM이 생성될때에도 DNS 에 등록을 하도록 하면, DNS 에서 현재 기동중인 VM 목록을 얻어와서 그 목록의 IP 들로 풀링을 하면 되는 구조이다.

- [Exporter](https://prometheus.io/docs/instrumenting/exporters/) 는 모니터링 에이전트로 target system 으로 부터 메트릭을 수집한다.
- Retrieval 은 서비스 디스커버리로부터 target system 을 검색하고 Exporter 로 부터 metrics 를 pull 한다.

## Links

- [오픈소스 모니터링툴 - Prometheus #1 기본 개념과 구조 - 조대협](https://bcho.tistory.com/1372)
- [Prometheus Monitoring: The Pull Approach](https://network-insight.net/2022/06/29/prometheus-monitoring-the-pull-approach/)