---
layout  : wiki
title   : Quality of Service
summary : 
date    : 2024-09-15 11:54:32 +0900
updated : 2024-09-15 12:15:24 +0900
tag     : kubernetes qos
toc     : true
comment : true
public  : true
parent  : [[/kubernetes]]
latex   : true
---
* TOC
{:toc}
 
## Quality of Service

___[QoS(Quality of Service)](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/#quality-of-service-classes)___ is a mechanism to control the quality and performance of data transmission and processing in the data distribution service.

QoS 를 통해 우선순위를 정하여 전체 네트워크 트래픽을 조정할 수 있다.

QoS classes are used by Kubernetes to decide which Pods to evict from a Node experiencing ___[Node Pressure](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/)___. 