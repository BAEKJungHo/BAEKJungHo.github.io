---
layout  : wiki
title   : TCP Health Check
summary : 네트워크 상태 확인하기
date    : 2022-07-02 15:54:32 +0900
updated : 2022-07-02 20:15:24 +0900
tag     : network
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

# TCP Health Check

## 네트워크 상태 확인

```shell
$ sar -n DEV,TCP,ETCP 5
Linux 5.3.0-1032-aws (ip-192-168-0-207) 	08/13/20 	_x86_64_	(2 CPU)

23:17:08        IFACE   rxpck/s   txpck/s    rxkB/s    txkB/s   rxcmp/s   txcmp/s  rxmcst/s   %ifutil
23:17:13         eth0      0.60      0.20      0.03      0.01      0.00      0.00      0.00      0.00

23:17:08     active/s passive/s    iseg/s    oseg/s
23:17:13         0.00      0.00      0.40      0.00

23:17:08     atmptf/s  estres/s retrans/s isegerr/s   orsts/s
```

- rxkB/s: Total number of kilobytes received per second
- txkB/s: Total number of kilobytes transmitted per second
- active/s: TCP 연결이 CLOSED 상태에서 SYN-SENT 상태로 직접 전환 된 초당 횟수. 즉, 서버에서 다른 외부 장비로 TCP 연결한 횟수
- passive/s: TCP 연결이 초당 LISTEN 상태에서 SYN-RCVD 상태로 직접 전환 한 횟수. 즉, 서버에 새롭게 접근한 클라이언트 수
- retrans/s: 초당 재전송 된 총 세그먼트 수
  - 재전송은 통신 품질을 판단할 수 있는 기준이다. 네트워크 장비 불량이나 설정에 이상이 있는 경우 재전송 현상이 나타나는 경우가 많다. 로컬 네트워크인 경우 재전송 비율은 0.01% 이하로 거의 없어야 하고, 원거리 네트워크에서도 0.5% 이하가 일반적이다. 재전송이 빈번히 발생한다면 네트워크 구간별 응답시간을 조사해야 한다.

## TCP 상태도

![](/resource/wiki/network-tcp/tcp.png)

### TIME_WAIT

![](/resource/wiki/network-tcp/timewait.png)

실제 서비스를 운영하다 보면, 위와 같이 TIME_WAIT 혹은 CLOSE_WAIT 상황을 겪게 되는데, 과연 이 상황은 장애일까?

![](/resource/wiki/network-tcp/timewait2.png)

연결을 해제하는 과정에서, ACK 패킷이 유실되었을 경우를 가정해보자. 그럼 FIN 에 대한 ACK 를 받지 못했기에 LAST-ACK 상태이고, 이 후 Client 에서 연결을 하기 위해 SYN 요청을 보내더라도 RST 를 보내 연결을 끊어버린다. 이에 TIME_WAIT 상태를 두어 이상을 감지하고 한번 더 FIN 패킷을 요청한다. (active closer(먼저 연결을 끊는) 쪽에서 TIME_WAIT 소켓이 생성된다는 것을 알 수 있다.)

따라서, TIME_WAIT 상태 자체는 연결을 해제하는 과정에서 나타나는 자연스러운 현상이다. 다만 TIME_WAIT 소켓이 많아지면, 로컬의 포트 고갈에 따른 애플리케이션 타임아웃(1분)이 발생합니다. 또한 잦은 TCP connection 생성/해제로 인해 서비스의 응답속도가 낮아질 수 있습니다. (TCP 상태도에서 확인할 수 있듯 TCP 는 신뢰성을 보장하기 위해 연결/해제 과정에 많은 비용이 발생합니다.) 따라서 웹 성능을 개선하기 위해 keepalive, connection pool 등을 통해 연결을 재사용한다.

### CLOSE_WAIT

![](/resource/wiki/network-tcp/closewait.png)

passive closer 는 FIN 요청을 받으면 CLOSE_WAIT 으로 바꾸고 응답 ACK 를 전달한다. 그와 동시에 해당 포트에 연결되어 있는 애플리케이션에게 close()를 요청한다. close() 요청을 받은 애플리케이션은 종료 프로세스를 진행하고 FIN 을 클라이언트에 보내 LAST_ACK 상태로 바꾼다.

따라서 병목, 서버 멈춤 현상 등으로 인해 정상적으로 close 하지 못할 경우, CLOSE_WAIT 상태로 대기한다. 커널 옵션으로 타임아웃 조절이 가능한 FIN_WAIT 이나 재사용이 가능한 TIME_WAIT 과 달리, CLOSE_WAIT 는 포트를 잡고 있는 프로세스의 종료 또는 네트워크 재시작 외에는 제거할 방법이 없다. 따라서 평소에 서비스의 부하를 낮은 상태로 유지해야 한다.

## Links

- [Network Layered Architectures](https://baekjungho.github.io/wiki/network/network-layeredarchitectures/)
- [NextStep 인프라 공방](https://edu.nextstep.camp/)