---
layout  : wiki
title   : The Lifecycle of a Network Packet in Linux
summary : eth0, veth
date    : 2025-12-18 15:02:32 +0900
updated : 2025-12-18 18:12:24 +0900
tag     : network docker
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## eth0

eth0 is the traditional name for the first Ethernet network interface (wired) in Linux and Unix-like systems, representing the physical connection for network communication, but modern systems often use more descriptive names like enp0s3 (predictable naming) or enx... (MAC-based) due to changes in kernel device naming. It's a key network interface that gets assigned an IP address to connect to a network, but you might also encounter eth1, wlan0 (for Wi-Fi), or virtual interfaces like eth0:0 for multiple IPs on one physical card.

| 인터페이스     | 용도                   |
| --------- | -------------------- |
| `lo`      | loopback (127.0.0.1) |
| `eth0`    | 외부 네트워크              |
| `wlan0`   | Wi-Fi                |
| `docker0` | Docker 브리지           |
| `veth*`   | 컨테이너 연결              |


리눅스 커널 소스(***[include/linux/netdevice.h](https://github.com/torvalds/linux/blob/master/include/linux/netdevice.h)***)를 들여다보면 모든 네트워크 인터페이스는 struct net_device 라는 거대한 구조체로 정의된다.
This is the central data structure defined in the file. It represents a network interface card (NIC) or a virtual network device within the kernel. It contains fields for configuration, statistics, hardware addresses, and function pointers for driver operations (e.g., how to open, close, start transmission, or set the hardware address).

- Layer 2 추상화: 이 구조체는 MAC 주소(dev_addr), MTU(mtu), 인터페이스 이름(name) 등의 정보를 담고 있다.
- 패킷 흐름: NIC(Network Interface Card)가 전기 신호를 받아 0과 1로 변환하면, 인터페이스 드라이버는 이를 sk_buff (Socket Buffer)라는 커널 내부 자료구조로 감싸서 상위 레이어(IP, TCP)로 올려보낸다. 이때 eth0는 이 데이터가 통과하는 논리적인 파이프라인의 식별자가 된다.

고성능 트래픽을 처리할 때 eth0 뒤에서는 전쟁 같은 일이 벌어진다.

- Packet Arrival: 패킷이 NIC에 도착하면 DMA(Direct Memory Access)를 통해 커널 메모리 영역인 **Ring Buffer (RX Ring)** 에 복사된다.
- Hard IRQ: NIC가 CPU에 인터럽트를 발생시켜 “패킷이 RX Ring에 있다”는 사실만 알림
- SoftIRQ (NAPI): CPU가 하던 일을 멈추고 모든 패킷을 처리하면 너무 느려진다. 따라서 리눅스는 SoftIRQ를 통해 인터럽트 처리를 미루고 한 번에 여러 패킷을 폴링(Polling) 방식으로 가져간다.
  - 커널이 적절한 시점에 SoftIRQ 를 실행
  - 한 번에 여러 패킷을 batch 로 처리
  - 패킷 수가 많으면 인터럽트를 끄고 폴링 모드로 전환

이렇게 하는 이유는 컨텍스트 스위칭을 줄이기 위함이기도 하다. 예를 들어 패킷당 인터럽트 1회를 수행하고 QPS 가 100만이라면 초당 100만 번 CPU 컨텍스트 스위치가 발생한다.

## Docker

![](/resource/wiki/network-eth0/dockereth0.png)

컨테이너가 생성되면, 컨테이너는 독립된 네트워크 네임스페이스를 가지게 되고, 이 네임스페이스 안에 eth0라는 네트워크 인터페이스가 생성된다. 이 eth0는 컨테이너 내부에서 보이는 기본 네트워크 인터페이스이다.
동시에 호스트에는 ***veth(virtual ethernet)*** 인터페이스가 하나 생성된다. 이 veth는 쌍(pair) 으로 만들어지며, 한쪽은 컨테이너 네임스페이스에 들어가 eth0로 보이고 다른 한쪽은 호스트 네임스페이스에 남아 vethxxxx 형태로 보인다.
이 두 인터페이스는 가상의 케이블로 직접 연결된 것처럼 동작한다.

호스트에 생성된 veth 인터페이스는 Docker 가 기본으로 생성하는 리눅스 브리지인 docker0에 연결된다. (veth는 docker0에 포트로 연결)
docker0(docker0는 L2 브리지(가상 스위치))는 여러 컨테이너의 veth 인터페이스를 스위치처럼 묶어주는 역할을 한다.

docker0 브리지는 다시 호스트의 실제 네트워크 인터페이스(예: eth0)를 통해 외부 네트워크와 통신하며,
이 과정에서 NAT(iptables) 를 사용해 컨테이너의 트래픽을 외부로 전달하거나, 외부 요청을 컨테이너로 포워딩한다.

즉, 외부 통신은 호스트의 eth0 + iptables NAT 가 담당한다.

```
[컨테이너 eth0]
        ↕ (veth pair)
[호스트 vethxxxx]
        ↕
     [docker0]
        ↕ (NAT / iptables)
   [호스트 eth0]
        ↕
     [외부 네트워크]
```

정리하면 Docker 컨테이너의 eth0는 veth pair를 통해 호스트의 docker0 브리지에 연결되고, 외부 통신은 호스트의 네트워크 인터페이스와 NAT를 통해 이루어진다.

## The Lifecycle of a Network Packet in Linux

![](/resource/wiki/network-eth0/lifecycle.png)

위 다이어그램을 통해 아래와 같은 질문을 던질 수 있다.

### Why is the CPU 100% but the TPS is bottom?

왜 CPU는 100%인데 TPS는 바닥인 현상이 발생할 수 있을까?
이 현상은 ***High PPS로 인한 SoftIRQ 포화(Saturation)가 User Space CPU Starvation을 유발하여, 시스템 리소스(CPU)는 100%이지만 애플리케이션 처리량(TPS)은 0에 수렴하는 Receive Livelock 현상***이다.

이 현상은 주로 System/SoftIRQ CPU(sy, si)가 100%를 치는 상황이다. 만약 요청이 1KB 미만의 **작은 패킷(Small Packets)** 으로 수십만 개가 쏟아진다면, 리눅스 커널은 패킷의 크기가 아니라 개수만큼 인터럽트를 처리해야하고 CPU는 패킷을 "받아서 까보는 일(SoftIRQ)"에만 전력을 다 쏟고, 정작 애플리케이션(NGINX, SPRING)에 데이터를 넘겨줄 여력이 없게된다.

HTTP/1.1 기준, 요청 1개당 필요한 것들은 아래와 같다.
- TCP 패킷 여러 개
- ACK 패킷
- Connection 관리
- Keep-Alive 타이머
- 재전송 관리

요청 수가 늘수록 아래와 같이 되며, 

```
패킷 수 ↑
→ SoftIRQ 호출 횟수 ↑
→ TCP state 관리 비용 ↑
→ ksoftirqd 폭주
```

결국 CPU 100%가 되며 Load Average 가 상승하고 Socket Buffer에 쌓이지 못하고, accept() / read() 호출 대기하게 되어 Spring thread idle 이 발생한다.
즉, **여기(NIC → SoftIRQ → TCP Stack)에서 CPU를 다 써버려서 여기(Socket Buffer → Nginx → Spring)까지 못 오게 된다.**

> "패킷 수 ↑ → SoftIRQ 호출 횟수 ↑ → TCP state 관리 비용 ↑ → ksoftirqd 폭주"

이를 PPS(Packet Per Second) 임계치 초과라고 한다. 대역폭(Bandwidth)이 1Gbps로 널널해도, 작은 패킷이 수백만 개(High PPS)면 100Mbps만 써도 CPU는 뻗어버린다.

> "Socket Buffer에 쌓이지 못하고"

패킷은 RX Ring Buffer (NIC 레벨)나 Backlog Queue (커널 레벨)에서 이미 Drop 된다. 즉, Socket Buffer(User와 Kernel의 접점)까지 도달조차 못 하는 것이다. netstat -s나 ethtool -S eth0에서 rx_dropped, rx_missed_errors 카운트가 증가하는 것으로 확인할 수 있다.

> "accept() / read() 호출 대기하게 되어 Spring thread idle 이 발생한다."

이를 **Starvation (기아 상태)** 라고 한다. Spring 입장에서는 IO Wait 상태로 보일 수 있으나, 실제로는 커널이 데이터를 퍼올려서 소켓에 넣어줄 여력이 없어 Read Timeout 이 발생하게 된다. 클라이언트 입장에서는 "서버 연결은 되는데(SYN/ACK는 커널이 하니까), 응답이 없다"고 느낀다.

이러한 문제를 해결하기 위한 방법 중 하나는 ***[HTTP/2, gRPC](https://klarciel.net/wiki/network/network-binary-based-protocol/)*** 를 사용하는 것이다.
단 하나의 **TCP 연결(Single Connection)** 로 수많은 요청을 동시에 처리하기 때문에 TCP Stack 이 관리할 상태가 줄어든다.
gRPC (Protobuf)의 경우 데이터를 이진(Binary)으로 압축하고, 중복 헤더는 압축(HPACK)해서 보낸다. 같은 정보를 보내도 패킷 크기가 작아져 SOFTIRQ 와 메모리 카피(DMA) 비용이 획기적으로 줄어든다.