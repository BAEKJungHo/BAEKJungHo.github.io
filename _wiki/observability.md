---
layout  : category
title   : Observability
summary : 
date    : 2024-01-01 18:28:40 +0900
updated : 2024-01-01 20:55:09 +0900
tag     : observability
toc     : true
public  : true
parent  : [[/index]]
latex   : false
---

## Meanings

Observability pillars include logs, metrics, and traces. Modern observability also includes metadata, user behavior, topology and network mapping, and code-level details.

__Why important ?__
- 관찰 가능성은 분산 환경에서 발생하는 다양한 상황에 대해서 이해할 수 있다. 
- 관찰 가능성을 통해 Slow Query, Incidents, Optimizing 를 위해 무엇을 해야하는지 이해할 수 있다.

## Telemetry

__[Telemetry types](https://newrelic.com/platform/telemetry-data-101)__:

![](/resource/wiki/observability/telemetry-types.png)

* OpenTelemetry; [https://opentelemetry.lightstep.com/](https://opentelemetry.lightstep.com)
* Metrics, logging and tracing: [https://peter.bourgon.org/blog/2017/02/21/metrics-tracing-and-logging.html](https://peter.bourgon.org/blog/2017/02/21/metrics-tracing-and-logging.html)
* Which trace to collect:
    * [https://news.ycombinator.com/item?id=15326272](https://news.ycombinator.com/item?id=15326272)
    * Tail-based sampling: [https://github.com/jaegertracing/jaeger/issues/425](https://github.com/jaegertracing/jaeger/issues/425)

## Real world

__Netflix__:
* Application monitoring: [https://netflixtechblog.com/telltale-netflix-application-monitoring-simplified-5c08bfa780ba](https://netflixtechblog.com/telltale-netflix-application-monitoring-simplified-5c08bfa780ba)
* Distributed tracing: [https://netflixtechblog.com/building-netflixs-distributed-tracing-infrastructure-bb856c319304](https://netflixtechblog.com/building-netflixs-distributed-tracing-infrastructure-bb856c319304)
* Edgar solving mysterious: [https://netflixtechblog.com/edgar-solving-mysteries-faster-with-observability-e1a76302c71f](https://netflixtechblog.com/edgar-solving-mysteries-faster-with-observability-e1a76302c71f)
* Self-serve dashboard: [https://netflixtechblog.com/lumen-custom-self-service-dashboarding-for-netflix-8c56b541548c](https://netflixtechblog.com/lumen-custom-self-service-dashboarding-for-netflix-8c56b541548c)
* Build observability tools: [https://netflixtechblog.com/lessons-from-building-observability-tools-at-netflix-7cfafed6ab17](https://netflixtechblog.com/lessons-from-building-observability-tools-at-netflix-7cfafed6ab17)
* Netflix On instance trace: [https://netflixtechblog.com/introducing-bolt-on-instance-diagnostic-and-remediation-platform-176651b55505](https://netflixtechblog.com/introducing-bolt-on-instance-diagnostic-and-remediation-platform-176651b55505)
* Netflix system intuition: [https://netflixtechblog.com/flux-a-new-approach-to-system-intuition-cf428b7316ec](https://netflixtechblog.com/flux-a-new-approach-to-system-intuition-cf428b7316ec)
* Time series data at Netflix: [https://netflixtechblog.com/scaling-time-series-data-storage-part-i-ec2b6d44ba39](https://netflixtechblog.com/scaling-time-series-data-storage-part-i-ec2b6d44ba39)

__Case study: Netflix's ElasticSearch -> Cassandra (SSD->EBS)__:
* [Building Netflix’s Distributed Tracing Infrastructure](https://netflixtechblog.com/building-netflixs-distributed-tracing-infrastructure-bb856c319304)
* [Lessons from Building Observability Tools at Netflix](https://netflixtechblog.com/lessons-from-building-observability-tools-at-netflix-7cfafed6ab17)

__Coinbase__:
* [Logs, metrics, and the evolution of observability at Coinbase](https://www.coinbase.com/blog/logs-metrics-and-the-evolution-of-observability-at-coinbase)

## AppDynamics vs Dynatrace

* [AppDynamics, Dynatrace, OpenTelemetry](https://donggeitnote.com/2021/10/30/observability/)
* [Is Standard Java Logging Dead? Log4j vs. Log4j2 vs. Logback vs. java.util.logging](https://www.overops.com/blog/appdynamics-vs-dynatrace-battle-of-the-enterprise-monitoring-giants/)

## Application Performance Monitoring

- [What is APM? Application performance monitoring in a cloud-native world](https://www.dynatrace.com/news/blog/what-is-apm-2/)
- [Datadog - APM Terms and Concepts](https://docs.datadoghq.com/ko/tracing/glossary/)

## SLO

* [What are SLOs? How service-level objectives work with SLIs to deliver on SLAs](https://www.dynatrace.com/news/blog/what-are-slos/)

## ELK

* [Building a High-Throughput Metrics System Using Open Source Software](https://www.twosigma.com/articles/building-a-high-throughput-metrics-system-using-open-source-software/)

## Uber M3

* [Uber M3](https://eng.uber.com/m3/)

## Datadog

* [Datadog: a Real-Time Metrics Database for One Quadrillion Points/Day](https://www.infoq.com/presentations/datadog-metrics-db/)
* [Datadog + OpenTracing: Embracing the open standard for APM](https://www.datadoghq.com/blog/opentracing-datadog-cncf/)

## Aggregation

* [Building a reliable and scalable metrics aggregation and monitoring system by Vishnu Gajendran](https://www.youtube.com/watch?v=UEJ6xq4frEw)

## ZIPKIN

* [ZIPKIN Architecture](https://zipkin.io/pages/architecture.html)

## Articles
