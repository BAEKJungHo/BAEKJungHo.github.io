---
layout  : wiki
title   : SOCKET, PROTOCOL
summary : Architecting for Safety-Critical Remote Control Commands
date    : 2025-12-08 15:54:32 +0900
updated : 2025-12-08 20:15:24 +0900
tag     : network tcp sdv architecture
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

# SOCKET

***[SOCKET](https://en.wikipedia.org/wiki/Network_socket)*** 을 정의할 수 있는 말은 너무 많다. 소켓 자체로는 다양한 Layer 에서 의미를 가지고 있는데,
Network, OS 수준으로 소켓이라는 것을 정의하면 다음과 같다. 소켓은 특정 통신 프로토콜(TCP 또는 UDP)을 사용하여, 네트워크 상의 고유한 주소({IP:Port})와 결합된, 프로세스가 접근 가능한 커널 내부의 데이터 구조체(File Descriptor 로 핸들링됨)이다.

위 정의를 두 파트로 분류해서 이해하기 쉽게 다시 설명하면 다음과 같다.

__Part1__:
**소켓은 네트워크 통신을 위해서 이름 및 주소를 지정할 수 있는 통신 출입구이다.** 양 끝점(서버와 클라이언트)에 소켓이 만들어져 있더라도 데이터를 전송할 수 없다.
데이터를 전송하기 위해서는 **파이프**를 만들어서 소켓을 연결해야 한다. 먼저 서버측에서 소켓을만들고, 소켓에 클라이언트가 파이프를 연결하기를 기다린다. 그리고 데이터는 파이프를 통해 전송된다.

__Part2__:
소켓은 프로세스가 네트워크 통신을 수행할 수 있도록 커널이 제공하는 FD(File Descriptor)기반의 커널 내부 데이터 구조체이며, 즉, **커널의 네트워크 통신 엔드포인트** 를 의미한다.

> A ***[file descriptor (FD)](https://en.wikipedia.org/wiki/File_descriptor)*** is an abstract identifier (typically a non-negative integer) used by a process in Unix-like operating systems to access a file or other input/output (I/O) resource like a pipe or network socket. This concept is central to the Unix philosophy of "everything is a file

자 이제, 소켓에 대한 정의가 머릿속에서 어느정도 그려졌을 것이다. 이제 이해하기 쉽게 소켓을 다시 정의하면 다음과 같다.

<mark><em><strong>소켓은 커널 자원이며 데이터를 주고받는 통로(Endpoint)를 추상화한 개념이다.</strong></em></mark>

이제 소켓이 어떻게 만들어지는지 살펴보자.

socket() 시스템 콜은 네트워크 통신을 위한 **소켓(end-point)** 이라는 통신 종단점을 생성하는 함수로, **domain (주소 체계), type (서비스 유형), protocol (프로토콜)** 세 가지 인자를 받아 네트워크 통신에 필요한 소켓을 만들고 성공 시 **소켓 디스크립터(file descriptor)** 라는 정수 값을 반환하며, 이를 통해 bind(), connect(), listen(), accept() 등 다른 소켓 함수들을 사용해 통신을 시작할 수 있다.

|Type	|결합 프로토콜|	CS 특징| 	실무 사용                               |
|------------|--------------|--------------|--------------------------------------|
|SOCK_STREAM|TCP	|신뢰성(재전송, 순서 보장), 스트림 방식| 	HTTP, WebSocket, gRPC, 파일 전송, DB 연결 |
|SOCK_DGRAM|UDP	|비신뢰성, 데이터그램 방식, 빠름|	DNS, 실시간 통신(VoIP, Game)|
|SOCK_RAW|	IP (Raw)	|L4 헤더까지 직접 조작|	네트워크 진단 도구, 방화벽, 커스텀 프로토콜|

SOCK_STREAM 소켓이 생성될 때, 커널은 해당 소켓의 Receive Buffer 와 Send Buffer 메모리 공간을 할당한다. 이 버퍼 크기(TCP Window Size)가 네트워크 튜닝의 핵심이다. 애플리케이션 처리 속도가 느려 이 버퍼가 가득 차면, 통신은 멈춘다(Flow Control)

리눅스/유닉스에서는 소켓도 파일의 일종으로 취급된다.
- 커널은 소켓 생성 시 **struct socket**이라는 소켓 제어 구조체를 커널 메모리에 할당한다.
- 이 구조체를 가리키는 포인터를 **프로세스의 파일 디스크립터 테이블(File Descriptor Table)** 에 등록하고, 그 인덱스(정수)를 사용자에게 반환한다.
- 이후 애플리케이션은 FD를 사용하여 read(), write(), close() 등의 일반 파일 I/O 함수를 소켓 통신에 그대로 적용할 수 있게 된다. 이것이 소켓 추상화의 핵심이다.

이 FD를 매개로 다른 소켓 함수들이 호출되며 통신이 시작된다.
- bind(fd, ...): FD가 가리키는 소켓에 로컬 주소와 포트를 할당한다.
- connect(fd, ...): FD가 가리키는 소켓을 통해 원격 서버로 연결을 시도한다.
- listen(fd, ...): FD가 가리키는 소켓을 연결 대기 상태(LISTEN)로 전환한다.
- accept(fd, ...): FD가 가리키는 LISTEN 소켓으로 들어온 연결을 수락하고, 새로운 소켓 FD를 생성하여 반환한다.

대규모 동시 접속자 처리를 위해 엔지니어는 이 FD 들을 효율적으로 관리해야 한다. Blocking I/O 에서는 FD 하나당 스레드 하나가 필요했지만, epoll 같은 ***[I/O Multiplexing](https://klarciel.net/wiki/reactive/reactive-eventloop/#multiplexing)*** 모델에서는 하나의 스레드가 수만 개의 FD를 감시할 수 있다. socket()이 반환하는 이 정수 값 FD는 ***[Event Loop](https://klarciel.net/wiki/reactive/reactive-eventloop/)*** 기반 비동기 서버의 핵심 입력 값이다.

소켓의 이미지는 이쯤하고, **TCP/IP 프로토콜**에 대해 본격적으로 들어가보자. Software Engineer 라 하면 다양한 종류의 **통신 프로토콜**을 다룰 수 있어야한다.

# PROTOCOL

세상에는 수많은 종류의 컴퓨터와 운영체제가 있다. 이들은 서로 데이터를 처리하는 방식이다 다르다.
이러한 이기종 장비간 통신을 하기 위해서는 **표준 규격**이 있어야 한다. 이러한 표준 규격 역할을 하는 것이 TCP/IP 프로토콜이며 하드웨어의 차이를 TCP/IP가 중간에 추상화되어 가려준다.

TCP/IP 의 각 책임과 역할은 다음과 같다. ***[IP(Internet Protocol)](https://en.wikipedia.org/wiki/Internet_Protocol)*** 는 목적지까지 가는 **경로(목적지)를 책임**지며, ***[TCP(Transmission Control Protocol)](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)*** 는 네트워크에 잠시 문제가 있더라도 **데이터를 책임**지고 전달한다.

## Transmission Control Protocol

보이지 않는 병목을 찾아내고, 시스템이 처한 환경(유선/무선)에 맞춰 성능을 튜닝하기 위해서 TCP 의 특징을 잘 이해해야 한다.

TCP 의 특징은 다음과 같다.

첫 번째 특징은 ***순서 보장(Ordered Data Transfer)과 재전송(Retransmit)*** 이다.

TCP 는 IP가 패킷을 뒤죽박죽으로 배달해도, 수신 측에서 **시퀀스 번호(Sequence Number)** 를 이용해 원래 순서대로 재조립(정렬)한다.
이 "순서 보장" 기능은 TCP 의 가장 큰 장점이자, 현대 웹/앱 성능의 가장 큰 걸림돌이다.

예를 들어, 패킷 1, 2, 3을 보냈는데 2번이 유실되었다고 가정하자. 3번이 먼저 도착했더라도, TCP 스택은 2번이 재전송되어 도착할 때까지 3번을 애플리케이션에 올려주지 않고 커널 버퍼에 가둬둔다. 즉, 패킷을 보냈는데 ACK가 오지 않으면, 
손실로 간주하고 ***[재전송(Retransmit)](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)*** 을 처리한다. 
그리고 재전송 타임아웃 동안 나머지 패킷도 앞으로 못나간다는 단점이 있다. 
이 현상을 ***[HOL(Head-of-Line) Blocking](https://en.wikipedia.org/wiki/Head-of-line_blocking)*** 이라고 한다.

패킷 유실 상황을 살펴보자. 차량이 터널을 지나거나 기지국이 변경(Handover)될 때 일시적으로 패킷이 유실된다. 핸드오버 순간에는 다음 현상들이 필연적으로 발생한다.

- RTT 증가(50ms → 300ms)
- 패킷 Drop
- 패킷 재전송(TCP RTO)
- Throughput 감소
- gRPC/WebSocket 끊김
- MQTT Keepalive Timeout
- 실시간 영상·원격 제어 프레임 드랍

핸드오버(Handover) 상황에서 사용자가 답답함을 느껴 "창문 열기" 명령을 여러 번 클릭(RetryStorming)하면 다음과 같은 현상이 발생한다.

1. 사용자가 반응이 없자 '열기' 버튼을 5번 누른다.
2. 애플리케이션은 5번의 send()를 호출한다.
3. 네트워크가 막혀 있으므로, 이 5개의 명령 패킷은 차량으로 날아가지 못하고 **서버 측 커널의 TCP Send Buffer (또는 gRPC/WS의 내부 큐)** 에 차곡차곡 쌓인다.
4. [핸드오버 완료] 네트워크가 뚫리는 순간, 쌓여있던 5개의 패킷이 한꺼번에(Burst) 차량으로 쇄도한다.

따라서, 엔지니어가 아무런 대비를 하지 않으면 물리적인 사고나 하드웨어 고장으로 이어질 수 있다.

이러한 ***차량 원격 제어*** 기능을 안정적으로 제공하기위해서는 Cloud 와 SDV OS 모두 적절한 설계를 해야 한다.
핵심은 <mark><em><strong>Debounce & Idempotency</strong></em></mark> 설계이다.

- 클라이언트(앱/서버) 측: ***[Debounce](https://klarciel.net/wiki/api/api-debounce-flag/)*** 를 적용하여 짧은 시간 내의 중복 클릭은 1번의 요청만 전송하도록 막아야 한다.
- 차량(수신) 측: 짧은 시간(예: 500ms) 내에 동일한 명령이 연속 수신되면 무시하는 Rate Limiting 로직이 필수이다.
- (SDV OS) 프로토콜 설계: 명령은 절대 "Toggle"이나 "Action"이 아닌 **"Target State(목표 상태)"**로 정의해야 한다.

SDV OS 에서는 현재 상태(Context)를 고려하여 명령을 처리하도록 해야 하는데 이때 사용되는 패턴이 ***[Desired/Actual State Pattern](https://klarciel.net/wiki/designpattern/designpattern-desired-actual/)*** 이다.
해당 패턴은 선언형 방식(Declarative)이며 **"최종적으로 ~한 상태가 되어라"** 라고 정의한다. 이것이 바로 Desired State 이다. 차량 에이전트는 주기적으로 Desired 와 Actual 을 비교하여 명령을 처리한다.

Cloud 를 통해서 ***차량 원격 제어(remote control)*** 를 한다고 가정해보자. Cloud 에서 0.1초 간격으로 조향(Steering) 데이터를 보낸다.
TCP를 썼다면, 앞선 0.1초의 데이터 패킷이 유실되었을 때, 뒤이어 도착한 0.2초, 0.3초의 최신 데이터들은 커널 버퍼에 갇혀버린다(Head-of-Line Blocking)
차는 0.5초 동안 아무런 반응을 안 하다가, 재전송이 완료된 순간 0.5초 치의 조향 명령을 한꺼번에 수행하며 급커브를 돌며 사고가 난다.
따라서, 차량 원격 제어에서는 생명/안전과 관련된(safety-critical) 한 제어는 해서는 안된다.

자율 주행 차량은 외부 통신망(LTE/5G) 단절 시에도 안전한 주행을 보장해야 하며, 밀리초(ms) 단위의 실시간 제어가 필요하다. 이를 위해 차량 내부에는 외부망과 독립된 **고신뢰성 네트워크(In-Vehicle Network)** 가 구축되어 있다. 제어 명령의 즉각적인 전달(Low Latency)을 위해 CAN 과 FlexRay 를 사용하고, 센서 데이터의 대용량 전송(High Bandwidth)을 위해 Automotive Ethernet 을 복합적으로 사용하여 통신한다.
TCP 의 신뢰성은 송신자가 데이터 손실을 감지하고 재전송함으로써 확보된다. TCP 는 데이터 손실을 식별하기 위해 ***재전송 시간 초과(Retransmission timeout, RTO)*** 와 ***중복 누적 확인 응답(DupAcks)*** 이라는 두 가지 기술을 사용한다.

RTO는 **"일정 시간 동안 답이 없으면 죽은 것으로 간주한다"** 는 단순한 원칙이다. 하지만 "얼마나 기다릴 것인가"를 결정하는 것은 네트워크 엔지니어링의 난제 중 하나다.
단순히 "1초 기다린다"라고 설정할 수 없다. 옆자리 동료에게 보내는 핑(Ping)은 1ms지만, 지구 반대편 서버는 200ms가 걸리기 때문이다. 심지어 모바일 네트워크에서는 이 시간이 춤을 춘다(Jitter).
따라서 TCP는 **RTT(Round Trip Time)**를 실시간으로 샘플링하여 평균값인 **SRTT(Smoothed RTT)**를 계산하고, 여기에 편차(RTTVAR)를 더해 RTO를 동적으로 설정한다. (Jacobson's Algorithm)
- **너무 짧으면:** 패킷이 아직 가는 중인데 유실로 착각하고 재전송한다. 이를 **Spurious Retransmission(가짜 재전송)** 이라 하며, 대역폭을 낭비하고 혼잡을 가중시킨다.
- **너무 길면:** 패킷 하나가 유실되었을 때, 이를 복구하는 데 1초, 2초가 걸린다. 사용자 경험(Latency)은 나락으로 떨어진다.

이러한 RTO 를 보완하기 위한 것이 DupAcks(Duplicate Acks) 이다.
수신자가 보내는 ACK는 **Cumulative(누적) ACK**다. "나 N번까지 완벽하게 받았어"라는 뜻이다.

상황을 가정해보자. 송신자가 패킷 1, 2, 3, 4, 5를 보냈다.
1.  **패킷 1 도착:** 수신자는 `ACK 2` (1번 다음인 2번 내놔)를 보낸다.
2.  **패킷 2 유실:** (수신자 모름)
3.  **패킷 3 도착:** 수신자는 3번을 받았지만, 2번이 없으므로 여전히 `ACK 2`를 보낸다. **(첫 번째 중복 ACK)**
4.  **패킷 4 도착:** 수신자는 여전히 2번을 기다리므로 `ACK 2`를 보낸다. **(두 번째 중복 ACK)**
5.  **패킷 5 도착:** 수신자는 또 `ACK 2`를 보낸다. **(세 번째 중복 ACK)**

송신자는 RTO 타이머가 터지기 전이라도, **"똑같은 ACK가 3번 연속(3 DupAcks) 들어오면"** 즉시 해당 패킷(위 예시에서는 2번)을 재전송한다.
이를 **Fast Retransmit**이라 한다.

이러한 기본 DupAck 방식에도 치명적인 약점이 있다.
만약 패킷 2번과 4번이 **동시에 유실**되었다면?
* 수신자는 계속 `ACK 2`만 보낸다. 송신자는 2번을 재전송한다.
* 2번이 도착하면 그제야 수신자는 `ACK 4`를 보낸다. 송신자는 이제야 4번을 재전송한다.
* 한 번의 RTT 낭비가 또 발생한다.

이 문제를 해결하기 위해 현대의 TCP 는 **SACK 옵션**을 사용한다.
"나 2번은 못 받았는데, **[3번, 5번]은 확실히 받았어**"라고 ACK 헤더의 옵션 필드에 명시해 주는 것이다. 이렇게 하면 송신자는 2번과 4번만 콕 집어서 재전송할 수 있다.

다음 특징은 ***흐름 제어(Flow Control)*** 이다.

흐름 제어는 송신자가 데이터를 너무 빨리 보내서 **수신자의 버퍼(Receive Buffer)** 가 넘치는 것을 막는 기능이다. 수신자는 "나 지금 윈도우 사이즈(Window Size)가 이만큼 남았어"라고 ACK 패킷에 담아 지속적으로 알려준다.

다음 예시를 보자.

서버 모니터링 중 네트워크 트래픽은 낮은데 서비스가 멈추는 기이한 현상을 마주할 때가 있다.
* **시나리오:** 수신 측 애플리케이션(예: WAS)이 GC(Garbage Collection)나 로직 지연으로 바빠서 커널의 수신 버퍼(Recv-Q)를 비우지 못한다. (JVM 기반 서비스(Spring, Kotlin 등)는 Stop-the-world GC가 뜨면 수 ms~수초 동안 애플리케이션 스레드가 멈춰 Recv-Q를 비우지 못한다.)
  - Recv-Q 커널 수신 버퍼는 애플리케이션이 read() 호출로 데이터를 가져가기 전까지 쌓이는 곳이다.
* **결과:** 수신 측 커널은 송신 측에게 **"Window Size = 0"("나 지금 못 받으니 보내지마. 기다려.")** 을 보낸다. 송신 측은 전송을 즉시 중단하고 대기(Blocking)한다.
* **진단:** 이는 네트워크 문제가 아니라 **애플리케이션 처리 성능 문제**다. `netstat`이나 `ss` 명령어로 **Recv-Q**가 쌓여있는지 확인해야 한다. 네트워크 탓을 하기 전에 내 코드가 데이터를 제때 가져가는지부터 의심하라.

다음 특징은 ***혼잡 제어(Congestion Control)*** 이다.

흐름 제어가 '수신자'를 보호한다면, 혼잡 제어는 **'네트워크망 전체'** 를 보호한다. 중간 라우터나 회선이 꽉 차서 패킷 유실이 발생하면, TCP 는 전송 속도를 급격히 줄인다.

리눅스 커널의 기본 혼잡 제어 알고리즘은 **CUBIC**이다. CUBIC은 **"패킷 유실 = 혼잡"**으로 간주한다.
* **문제:** 무선 네트워크(LTE/5G) 환경에서는 혼잡하지 않아도 전파 간섭으로 패킷이 종종 유실된다. CUBIC은 이를 혼잡으로 오판하고 전송 속도를 뚝 떨어뜨린다. 속도가 널뛰기하는 주원인이다.
* **해결책 (BBR):** 구글이 만든 **TCP BBR(Bottleneck Bandwidth and RTT)** 알고리즘은 패킷 유실이 아니라 **'대역폭과 RTT'**를 측정해서 속도를 조절한다.

## gRPC Bi-directional Streaming

* **기반:** [HTTP/2](https://klarciel.net/wiki/network/network-binary-based-protocol/)
  * gRPC는 HTTP/2의 **Binary Framing Layer** 위에서 동작한다.
  * **Stream ID:** 모든 프레임에는 `Stream ID`가 있다. "이 조각은 1번 요청 거야", "이 조각은 5번 요청 거야"를 식별한다.
  * **Multiplexing (멀티플렉싱):** 이것이 핵심이다. 하나의 TCP 연결 위에서 여러 개의 스트림(RPC 호출)이 동시에, 뒤섞여서 날아간다.
    * 거대 데이터 전송(Stream 1) 중에 핑 패킷(Stream 2)이 끼어들어 먼저 도착할 수 있다. **애플리케이션 레벨의 HoL Blocking 이 해결된다.** L7(HTTP/2) 차원에서 해결되는거지 L4(TCP)에서의 HoL 은 존재한다.
  * **HPACK (Header Compression):** 헤더를 허프만 코딩과 정적/동적 테이블로 압축한다. 중복된 헤더(User-Agent 등)는 1바이트로 줄어든다. WebSocket의 핸드쉐이크 오버헤드나, 매번 JSON에 실어 보내는 메타데이터 오버헤드와 비교하면 압도적으로 효율적이다.
  * HTTP/2는 TCP와 별개로 **스트림 별 흐름 제어**를 지원한다. (`WINDOW_UPDATE` 프레임).
  * **시나리오:** 클라이언트가 "영상 다운로드 스트림"과 "채팅 스트림"을 동시에 열었다. 영상 처리가 늦어지면 영상 스트림에만 "잠깐 멈춰(Window Size=0)"를 보낸다. 채팅 스트림은 계속 원활하게 흐른다.
  * **실무:** 대규모 마이크로서비스 간 통신에서 한 서비스의 지연이 전체 시스템의 먹통으로 번지는 것을 방지하는 **Backpressure**가 프레임워크 레벨에서 지원된다.
* **철학:** "원격 함수 호출(RPC)을 로컬 함수처럼 쓰되, 고성능과 표준 규격을 강제하자."
* **구조:** 하나의 TCP 연결 안에서 수많은 가상 채널(Stream)을 생성하고, 바이너리 프레임 단위로 쪼개서 전송한다. 스트림 기반(Stream-oriented)이다.
* **장점:**
    * **Strict Contract (Protobuf):** `.proto` 파일이 곧 문서이자 코드다. 타입 에러가 컴파일 타임에 잡힌다.
    * **Performance:** Protobuf 의 직렬화 속도는 JSON 보다 월등히 빠르고 패킷 크기가 작다. (CPU 및 대역폭 절약).
    * **Multiplexing:** 연결 하나로 수십 개의 병렬 작업을 처리해도 서로 간섭하지 않는다.
    * **Rich Features:** Deadlines(타임아웃 전파), Cancellation, Metadata(헤더) 처리 등이 표준화되어 있다.
* **단점:**
    * **Browser Support:** 브라우저는 HTTP/2 프레임 제어권을 JS에 주지 않는다. 따라서 `gRPC-Web` 프록시(Envoy 등)가 필요하며, 이 경우 일부 스트리밍 기능에 제약이 생긴다.
    * **Learning Curve:** Protobuf 문법과 비동기 스트림 처리에 대한 이해가 필요하다.
    * **Debugging:** 바이너리 데이터라 와이어샤크(Wireshark) 없이는 눈으로 읽을 수 없다.

gRPC 에서 .proto 파일은 단순한 코드가 아니라 **"API 명세서이자 계약서(Contract)"** 이다.
보통 서버가 관리하되, 협의는 클라이언트와 함께 진행한다. .proto 파일 관리는 .proto 파일들만 모아둔 별도의 Git Repository 를 운영하는 방식을 추천한다.

편하게 관리하려면 자동화를 해야 한다.

.proto 파일 자체를 공유하는 것보다, "컴파일된 라이브러리(Stub/SDK)"를 공유하는 것이 정석이다. 클라이언트 개발자가 로컬에 protoc 컴파일러를 설치하고 버전을 맞추는 고통을 없애줘야 하기 때문이다.

**이상적인 파이프라인 흐름**
- Commit: 서버 개발자가 company-proto 리포지토리에 user.proto 변경 사항을 Merge 함
- CI Trigger: Github Actions나 Jenkins가 감지
- Code Gen (Artifact Build): CI 서버가 각 언어별로 컴파일 수행
  - Java/Kotlin (Server/Android) -> .jar 빌드
  - Swift (iOS) -> CocoaPods 또는 Swift Package 빌드
  - TypeScript (Web) -> NPM Package 빌드
  - Python/Go -> 해당 패키지 빌드
- Publish: 빌드된 패키지를 사내 저장소(Nexus, Artifactory, NPM Private Registry)에 v1.2.0 버전으로 업로드
- Consume:
  - Android 팀: build.gradle에서 implementation 'com.company.proto:user-service:1.2.0'으로 버전만 올림
  - iOS 팀: Podfile에서 버전 업데이트.

클라이언트 팀은 .proto 파일이 어떻게 생겼는지 몰라도 된다. 그냥 함수(메소드)가 업데이트된 라이브러리를 받아다 쓰면 된다.

## WebSocket

WebSocket 은 하나의 TCP 연결 위에서 양방향 메시지를 주고받는 단일 스트림 프로토콜이다.

* **기반:** HTTP/1.1 Upgrade 메커니즘
* **철학:** "웹 브라우저에서도 TCP 소켓처럼 자유롭게 Raw 데이터를 쏘게 해주자."
* **구조:** 핸드오프가 끝나면 HTTP 규칙은 사라지고, TCP 위에 아주 얇은 자체 프레임(2~14 byte 헤더)만 씌워서 데이터를 주고받는다. 메시지 기반(Message-oriented)이다.

WebSocket 의 프레임은 단순하다.

`[FIN bit] [Opcode] [Mask bit] [Payload Length] [Masking Key] [Payload Data]`

* **Opcode:** 텍스트인지, 바이너리인지, Ping/Pong 인지 구분한다.
* **Masking:** 브라우저에서 서버로 보낼 때 중간 캐시 서버가 데이터를 오해하지 않도록 XOR 연산으로 데이터를 뒤섞는다(보안보다는 인프라 호환성 목적).
* **CS Level 이슈: Head-of-Line (HoL) Blocking (App Level)**
    * WebSocket 은 기본적으로 하나의 TCP 연결을 점유하는 **단일 채널**이다.
    * 만약 100MB 짜리 큰 파일을 보내고 있다면, 그 뒤에 대기 중인 "채팅 메시지(1KB)"는 앞선 파일 전송이 끝날 때까지 대기해야 한다.
    * 개발자가 애플리케이션 레벨에서 직접 채널을 나누는 로직을 짜지 않는 한, **직렬 처리(Serial Processing)** 가 강제된다.

차량 원격 제어 실무에서는 다음과 같은 사항을 고려해야 한다.

### Heartbeat & Keep-Alive

첫 번째는 Heartbeat & Keep-Alive 이다.

- TCP keepalive 가 2시간이더라도 세션을 지속적으로 유지하기 위해서 ping/pong 을 (e.g N초 간격) 주기적으로 보내야 한다.
- 서버도 차량으로부터 Ping 이 N회 이상 안 오면, 소켓을 강제로 끊고(Force Close) 리소스를 정리해야 한다. 그래야 차량이 재접속을 시도할 때 좀비 소켓과 충돌하지 않는다.

### Stateful Server Architecture

두 번째는 스케일아웃과 메시지 라우팅 (Stateful Server Architecture)을 고려해야 한다.

WebSocket 은 Stateful(상태 유지) 연결이다. HTTP 처럼 아무 서버나 요청을 받아도 되는 것이 아니다.

**문제**:
- 차량 A는 Server-1에 연결되어 있다.
- 관리자가 Server-2로 "차량 A 문 열어" API를 호출
- Server-2는 차량 A와 연결되어 있지 않으므로 명령을 보낼 수 없다.

**실무 대응(Presence + Direct Routing): 정확히 해당 차량이 연결된 서버로만 메시지를 배달**:
- 1단계: 연결 시 위치 등록 (Presence)
  - Car-A가 Server-1에 WebSocket 연결 성공
  - Server-1은 Redis(Key-Value)에 등록:
    - SET vehicle:Car-A "Server-1" (TTL 설정 필수)
- 2단계: 명령 전송 (Direct Routing)
  - 클라이언트가 API 서버(Server-2) 호출
  - 클라이언트가Server-2는 Redis 에서 Car-A의 위치를 조회 (Presence Check)
    - GET vehicle:Car-A -> 결과: "Server-1"
  - Server-2는 모든 서버가 듣는 채널이 아니라, Server-1만 듣고 있는 전용 채널에 Publish
    - PUBLISH server-1-channel { "target": "Car-A", "cmd": "Open" }
  - Server-1만 메시지를 수신하여 처리

구현 매커니즘을 조금 더 자세히 보면 다음과 같다.

#### Redis Presence + Pub/Sub

**Presence (위치 등록)**:
- 접속 시: WebSocket 서버는 클라이언트 연결(onOpen) 시 Redis에 자신의 ID를 등록
- Key 설계: sess:{userId} -> Value: server-01 (서버의 고유 ID)
- TTL 설정: 좀비 세션을 방지하기 위해 반드시 **TTL(Time To Live)** 을 설정하고, 하트비트(Ping)마다 갱신(Expire 연장)
    - SET sess:user_1234 "server-01" EX 60

**Direct Routing (배달)**:
- API 서버가 user_1234에게 메시지를 보내려 함
- Lookup: Redis 에서 GET sess:user_1234 -> 결과: "server-01"
- Publish: server-01만 구독하고 있는 전용 채널에 메시지를 발송
  - PUBLISH ch:server-01 '{ "target": "user_1234", "payload": ... }'

**Delivery (전송)**:
- server-01은 자신의 채널(ch:server-01)로 들어온 메시지를 소비
- 로컬 메모리(Map)에서 user_1234의 소켓 객체를 찾아 send()

단, 주식 시세(Ticker) 같은 브로드캐스팅 데이터는 이 방식을 쓰지 않고, 그냥 글로벌 채널에 뿌리는 것이 효율적이다.

#### Redis Presence + Kafka

**Presence**:
- Redis(Key-Value)를 그대로 사용 (위치 조회용)

**Routing (Queueing)**:
- 각 WebSocket 서버는 시작 시 자신의 **고유 ID로 된 Queue(Topic)** 를 생성하고 구독 (예: q.ws-server-01)
  - 서버별로 토픽을 만드는 것은 안티 패턴일 수 있으므로, 서버 ID를 Partition Key 로 사용하여 특정 파티션에 할당하는 방식을 사용할 수 있음
- API 서버는 Exchange(RabbitMQ)나 Partitioning(Kafka)을 통해 해당 서버의 큐로 메시지를 넣음

**Delivery & ACK**:
- WebSocket 서버는 큐에서 메시지를 꺼내 클라이언트에게 전송
- 중요: 클라이언트로부터 앱 레벨 ACK를 받은 후에야 큐에 Commit/Ack 를 날림
- 만약 WS 서버가 죽으면? 큐에 메시지가 남아있으므로, 다른 서버가 이어받거나(Rebalancing) 재시작 후 처리할 수 있음

#### NATS

NATS 는 초고성능을 위한 모델이다. NATS는 구독 비용이 매우 저렴하여, 서버당 수만 개의 주제를 구독해도 성능 저하가 거의 없다.

**NATS (Subject-Based Routing)**:
- NATS는 "서버 ID"를 알 필요 없이 "유저 ID" 자체를 주소로 사용
- 구독: WS 서버는 클라이언트 A가 접속하면 NATS 에 u.client-A라는 주제(Subject)를 구독
- 발행: API 서버는 Presence 조회 없이 그냥 u.client-A로 메시지를 발행

원리: NATS 클러스터가 알아서 해당 주제를 구독 중인 서버로 메시지를 라우팅해준다. Presence 조회 단계가 사라져 레이턴시가 획기적으로 줄어든다.

예를 들어, Remote Control Server > Routing Server > Vehicle 과 같은 흐름으로 제어 명령이 이뤄지는 경우에서의 제어 명령 시나리오를 보자.

**상황**:
- Car-1234는 Routing-Server-B에 WebSocket 으로 연결되어 있다.
- Routing-Server-B는 NATS에 forward.car-1234 주제를 구독 중이다.
- 로드밸런서(L4)는 원격 제어 서버의 API 요청을 Routing-Server-A로 보낸다.

**Step 1. API 수신 및 로컬 조회 (The Ingress)**
- Remote Server: POST /api/v1/vehicle/car-1234/window/open 호출
- Routing-Server-A: 요청 수신
  - Local Check: 가장 먼저 자신의 메모리(Map)를 확인
  - "Car-1234가 나한테 붙어있나?" -> No. (다른 서버에 있음)

**Step 2. NATS 를 통한 포워딩 (The Hop)**
- Routing-Server-A 는 이 요청을 **NATS Request(동기 요청)** 를 통해 해당 차량을 보유한 서버가 받을 수 있게 던진다.
  - Subject: forward.car-1234 (이 주제는 실제 연결을 가진 서버만 구독 중임)
  - Action: natsConnection.request("forward.car-1234", payload, timeout=3s)
- Server-A는 여기서 Blocking(대기) 상태가 된다.

**Step 3. 실제 수행 및 응답 (The Execution)**
- NATS: forward.car-1234를 구독하고 있는 **Routing-Server-B**에게 메시지를 배달
- Routing-Server-B:
  - 메시지 수신 후 자신의 로컬 WebSocket 세션에서 Car-1234를 찾음
  - WebSocket Send: 차량에게 명령 전송
  - Ack/Response: 차량으로부터 응답(OK)을 받거나, 전송 성공 확인
  - NATS Reply: NATS를 통해 Server-A에게 결과를 반환

**Step 4. API 응답 반환 (The Return)**
- Routing-Server-A: NATS request() 함수가 Server-B의 응답 값과 함께 리턴됨
- Remote Control Server: Server-A 로부터 200 OK 응답을 받음


이 매커니즘에서는 **구독 전략 (Topic Naming)** 이 중요하다. Routing Server 가 WebSocket 연결이 맺어질 때와 끊어질 때, NATS 구독을 동적으로 관리해야 한다.

- On Connect: nats.subscribe("forward.vehicle.{vehicleId}")
- On Disconnect: nats.unsubscribe("forward.vehicle.{vehicleId}")

또한 **로컬 최적화 (Short-circuiting)** 도 필요하다. 운 좋게 API 요청이 Routing-Server-B(연결 보유 서버)로 바로 들어올 수도 있다. 이때는 굳이 NATS 를 타지 않고 바로 WebSocket 으로 쏘는 분기 처리가 필수다. 불필요한 직렬화/역직렬화 비용과 NATS RTT 를 아껴야 한다.

```java
// Routing Server Logic
public Response handleRequest(String vehicleId, Command cmd) {
    // 1. 로컬에 있는지 확인 (Fast Path)
    WebSocketSession session = localSessionMap.get(vehicleId);
    if (session != null) {
        return sendViaWebSocket(session, cmd);
    }

    // 2. 없으면 NATS로 포워딩 (Slow Path)
    try {
        // 타임아웃 필수! (차량이 아예 접속 안 했을 수도 있음)
        Message reply = nats.request("forward.vehicle." + vehicleId, cmd.bytes, 3000); 
        return parse(reply);
    } catch (TimeoutException e) {
        return Response.error("Vehicle Not Connected");
    }
}
```

**타임아웃(timeout)** 관리도 매우 중요하다.

NATS request()는 영원히 기다리지 않는다. 만약 Car-1234가 어느 서버에도 연결되어 있지 않다면 어떻게 될까?
- NATS 에는 forward.car-1234를 구독한 서버가 아무도 없다.
- NATS 는 "No Responders" 에러를 즉시 리턴하거나(설정에 따라), Server-A에서 타임아웃이 발생한다.
- Server-A는 이를 잡아내어 API 클라이언트에게 404 Not Found (Vehicle Offline)를 리턴해야 한다.

NATS 를 사용한 방식의 단점은 다음과 같다.
- 1 Hop(Server A -> Server B) 만큼의 네트워크 지연이 추가된다. (하지만 같은 VPC 내라면 1ms 미만이므로 무시할 만하다.).
- 구현 복잡도: Routing Server 가 API 서버이자 NATS 클라이언트 역할을 동시에 해야 하므로 코드 복잡도가 올라간다.

### ACK & Queue

세 번째는 신뢰성을 확보하기 위한 ACK & Queue 를 고려해야 한다.

WebSocket 은 TCP 기반이므로 패킷 전달은 보장하지만, **"앱이 명령을 처리했는지"** 는 보장하지 않는다.

**문제**: 
- 서버가 send()를 호출하고 성공 리턴을 받았다. 하지만 그 순간 차량이 터널에 진입하여 recv()를 못 했을 수 있다. (TCP 버퍼에만 쌓임)

**실무 대응(Application Level ACK (Request-Response 패턴 구현))**:
- WebSocket 은 비동기 메시지 스트림이므로, 직접 요청 ID(Request ID)를 관리해야 한다.
  - 프로토콜 예시:
    - Server: { "msg_id": "req_123", "cmd": "open_window" }
    - Vehicle: (명령 수행 후) { "reply_to": "req_123", "status": "ok" }
  - Timeout & Retry: 서버는 메시지를 보낸 후 3초(예시) 내에 ACK 가 안 오면 실패 처리하거나, 재전송 큐에 넣어야 한다.

### Authentication & mTLS 

차량 제어는 탈취당하면 물리적 사고로 이어진다. 단순한 토큰 방식보다 강력한 보안이 필요하다.

- mTLS (Mutual TLS): 서버만 인증서를 가지는 것이 아니라, 차량(Client)도 고유한 인증서를 가지고 서로를 인증해야 한다. 제조 단계에서 차량의 보안 영역(HSM/TrustZone)에 인증서를 굽는다.
- Token Refresh: WebSocket 연결 시 헤더에 Authorization: Bearer `<Token>` 을 실어 보낸다. 하지만 연결이 며칠씩 유지될 수 있으므로, 연결 중간에 토큰이 만료될 수 있다.
  - WebSocket 메시지로 { "type": "auth_update", "token": "new_token" }을 보내 갱신하거나,
  - 만료 시 강제로 연결을 끊고 재접속(Re-handshake)하게 유도해야 한다.

### JSON vs Binary

WebSocket은 Text(JSON)와 Binary를 모두 지원한다.

만약, 패킷 크기를 1/3 수준으로 줄이려면 **Protobuf(바이너리)** 를 WebSocket의 Binary Frame에 실어 보내면 된다.
WebSocket 에서도 Protobuf 를 사용할 수 있다.

```protobuf
// wrapper.proto
syntax = "proto3";

import "telemetry.proto";
import "control.proto";

message WebSocketPacket {
  // OneOf: 이 중 딱 하나만 데이터가 들어있음 (Union 타입)
  // 추가 이벤트 타입을 확장하기 쉬움
  oneof payload {
    Telemetry telemetry = 1;
    ControlCommand command = 2;
    Heartbeat ping = 3;
  }
}
```

__송신__:

```java
// Android (Java/Kotlin)
Telemetry telemetry = Telemetry.newBuilder()
    .setSpeed(100)
    .setBatteryLevel(85)
    .build();

// Wrapper에 포장
WebSocketPacket packet = WebSocketPacket.newBuilder()
    .setTelemetry(telemetry)
    .build();

// 직렬화 (Object -> byte[])
byte[] binaryData = packet.toByteArray();

// WebSocket 전송 (Binary Frame) - Binary WebSocket frame
webSocket.send(ByteString.of(binaryData));
```

__수신__:

```kotlin
// Server (Java)
@OnMessage
public void onMessage(Session session, byte[] message) {
    try {
        // 역직렬화 (byte[] -> Object)
        WebSocketPacket packet = WebSocketPacket.parseFrom(message);

        // 메시지 타입에 따른 분기 처리 (Switching)
        // 타입이 확실해서 Backpressure 처리 가능
        if (packet.hasTelemetry()) {
            handleTelemetry(packet.getTelemetry());
        } else if (packet.hasCommand()) {
            handleCommand(packet.getCommand());
        }
    } catch (InvalidProtocolBufferException e) {
        // 약속되지 않은 이상한 데이터가 옴 -> 해킹 의심 or 버전 불일치, 잘못된 byte stream, protobuf schema mismatch 등
        session.close();  // 세션을 즉시 종료
    }
}
```

## Links

- [HTTP 1.1 - keep-alive, pipelining, multiple connections](https://klarciel.net/wiki/network/network-tcp-performance/)
- [Connection Pool, HikariCP, TCP 3-way Handshake](https://klarciel.net/wiki/spring/spring-jdbc/)
- [Polling, Long-Polling, WebSockets, Server-Sent Events](https://klarciel.net/wiki/network/network-polling/)
- [TCP Health Check](https://klarciel.net/wiki/network/network-tcp/)

## References

- 성공과 실패를 결정하는 1% 의 네트워크 원리 / Tsutomu Tone 저 / 성안당