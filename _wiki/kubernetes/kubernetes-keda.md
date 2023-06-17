---
layout  : wiki
title   : KEDA
summary : Kubernetes Event-driven Autoscaling
date    : 2023-06-10 15:54:32 +0900
updated : 2023-06-10 20:15:24 +0900
tag     : kubernetes infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}
 
## KEDA

일반적으로 auto-scaler 는 Memory 나 CPU 자원 사용량에 따라 인스턴스 수를 늘리곤 한다.

KEDA 는 Event 에 따라서 [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)을 지원한다.

Memory, CPU, Event 등을 기반으로 horizontal autoscaling 을 하기 위한 정보를 __metrics__ 로부터 수집한다.

For per-pod resource metrics (like CPU), the controller fetches the metrics from the resource metrics API for each Pod targeted by the HorizontalPodAutoscaler. The common use for HorizontalPodAutoscaler is to configure it to fetch metrics from aggregated APIs (metrics.k8s.io, custom.metrics.k8s.io, or external.metrics.k8s.io).

__[How KEDA Works](https://keda.sh/docs/2.10/concepts/#how-keda-works)__:

KEDA 는 Kubernetes metrics server 로서의 역할을 한다. queue 의 길이(length), stream lag 등의 __rich event data__ 들을 Horizontal Pod Autoscaler 에 노출(expose)하여 scaling 을 유도하는 형식이다.

__More Articles__ - [Kubernetes Metrics and Monitoring](http://blog.itaysk.com/2019/01/15/Kubernetes-metrics-and-monitoring)
