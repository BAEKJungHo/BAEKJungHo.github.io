---
layout  : wiki
title   : Port Forwarding
summary : Network address translation
date    : 2023-11-25 15:54:32 +0900
updated : 2023-11-25 20:15:24 +0900
tag     : network linux
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Port Forwarding

[Port Forwarding](http://www.ktword.co.kr/test/view/view.php?m_temp1=686&id=816) 은 요청을 적절한 경로로 라우팅하도록 구성하는 것을 의미한다.
구체적으로 말하면, 어떤 포트를 통해 흘러가는 데이터를 다른 포트로 전달시키는 기능을 의미한다.

![](/resource/wiki/network-port-forwarding/port-forwarding.png)

[NAT(Network address translation)](https://en.wikipedia.org/wiki/Network_address_translation)는 패킷이 트래픽 라우팅 장치를 통해 전송되는 동안 패킷의 IP 헤더 에 있는 네트워크 주소 정보를 수정하여 IP 주소 공간을 다른 IP 주소 공간으로 매핑하는 방법이다.
NAT 을 사용하면 서비스 포트 번호 별로 내부의 사설 IP 로 지정된 호스트로 전달할 수 있다.

__Port Forwarding via NAT Routers__:
![](/resource/wiki/network-port-forwarding/nat-router.png)
