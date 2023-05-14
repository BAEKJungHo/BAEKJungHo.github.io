---
layout  : wiki
title   : Networking Infrastructure Abstraction with Overlay Network
summary : 
date    : 2023-05-10 20:54:32 +0900
updated : 2023-05-10 21:15:24 +0900
tag     : docker infra
toc     : true
comment : true
public  : true
parent  : [[/docker]]
latex   : true
---
* TOC
{:toc}

## Overlay Network

오버레이 네트워크(overlay network)는 물리 네트워크 위에서 가상 네트워크를 구축하는 기법을 의미한다. 오버레이 네트워크를 사용하면 컨테이너간 통신이 가능하게 된다.

[Docker Overlay Networks](https://docs.docker.com/network/overlay/):
- The overlay network driver creates a distributed network among multiple Docker daemon hosts. This network sits on top of (overlays) the host-specific networks, allowing containers connected to it (including swarm service containers) to communicate securely when encryption is enabled.
- An overlay network called ingress

![](/resource/wiki/docker-overlay-network/overlay-network.png)

## Links

- [Overlay Network, VXLAN](https://ssup2.github.io/theory_analysis/Overlay_Network_VXLAN/)