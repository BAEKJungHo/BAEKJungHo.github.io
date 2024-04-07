---
layout  : wiki
title   : Open Container Initiative
summary : Container Runtime Interface
date    : 2024-04-07 11:54:32 +0900
updated : 2024-04-07 12:15:24 +0900
tag     : kubernetes docker
toc     : true
comment : true
public  : true
parent  : [[/kubernetes]]
latex   : true
---
* TOC
{:toc}
 
## Open Container Initiative

[개방형 컨테이너 이니셔티브(Open Container Initiative)](https://github.com/opencontainers)는 컨테이너에 대한 개방형 산업 표준을 만들려는 명확한 목적을 위한 개방형 거버넌스 구조이다.

[Kubernetes support for Docker via dockershim is now removed](https://kubernetes.io/blog/2020/12/02/dont-panic-kubernetes-and-docker/).

The image that Docker produces isn’t really a Docker-specific image—it’s an OCI(Open Container Initiative) image. Any OCI-compliant image, regardless of the tool you use to build it, will look the same to Kubernetes.

[Open Container Initiative Runtime Specification](https://github.com/opencontainers/runtime-spec/blob/main/spec.md)

## Links

- [흔들리는 도커(Docker)의 위상 - OCI 와 CRI 중심으로 재편되는 컨테이너 생태계](https://www.samsungsds.com/kr/insights/docker.html)