---
layout  : wiki
title   : STREAM
summary : 
date    : 2025-05-27 08:02:32 +0900
updated : 2025-05-27 08:12:24 +0900
tag     : architecture stream
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## STREAM

일반적으로 ___[stream](https://en.wikipedia.org/wiki/Stream_(computing))___ 은 시간 흐름에 따라 점진적으로 생산된 데이터를 일컫는다.
사용자는 데이터를 어제도 물론 오늘도 생산하며 서비스가 존재하는 한 계속해서 생산된다. 따라서 데이터셋은 어떤 의미로든 절대 "완료" 되지 않는다. 따라서 ___스트림 처리(stream process)___ 라고 하면 무한 데이터 처리를 의미한다.
스트림 처리는 매 초(분)이 끝나는 시점에 해당 분량의 데이터를 처리하거나(e.g 광고 클릭 이벤트 집계 시스템), 고정된 시간 조각이라는 개념을 버리고 이벤트가 발생할 때마다 처리할 수 있다.

광고 클릭 이벤트 집계 시스템을 구축하는 경우에는 각 분산된 서버에 존재하는 로그 파일을 가지고 집계를 하기도 한다. 즉, 입출력 파일이 작업 대상이고 입력이 파일(바이트 연속)일 때 대개 첫 번째 단계로 파일을 분석해 레코드의 연속으로 바꾸는 처리를 한다.
레코드는 보통 스트림 처리에서 ___[EVENT](https://klarciel.net/wiki/architecture/architecture-event/)___ 라고도 한다.

스트림 시스템에서는 대개 토픽(topic), 주제(subject) 이나 스트림(stream) 으로 관련 이벤트를 묶고, 이벤트를 consumer 에게 알려주는 방법으로 ___Messaging System___ 을 사용한다.

___[Publish/Subscribe System](https://klarciel.net/wiki/architecture/architecture-pub-sub/)___ 을 구별하는데 도움이 되는 질문은 아래 2가지 이다.
- __생산자가 소비자가 메시지를 처리하는 속도보다 빠르게 메시지를 전송하면 어떻게 될까?__
  - a. 메시지를 버리기
  - b. 큐에 버퍼링(backpressure, flow control, Unix Pipe 와 TCP 는 이 방식을 사용)
    - 작은 고정 크기 버퍼를 두고 버퍼가 가득 차면 수신자가 버퍼에서 데이터를 가져갈 때까지 전송자를 막음
  - c. 생산자가 메시지를 더 보내지 못하게 막음
  - 메시지가 큐에 버퍼링 될 때 큐 크기가 증가함에 따라 어떤 현상이 발생하는지 이해하는 것이 중요함
    - 큐 크기가 메모리 크기보다 더 커지면 시스템이 중단 되는가?
    - 메시지를 디스크에 쓰는가?
    - 디스크에 쓴다면 디스크 접근이 메시징 시스템의 성능에 어떤 영향을 주는가?
- __노드가 죽거나 일시적으로 오프라인 된다면 어떻게 될까? 메시지가 유실이 될까?__
  - 메시지 유실을 허용할 것인지 ? (허용하지 않는다면 Persistency 가 필요함)
  - 메시지 유실 허용 여부는 시스템에 따라 다름

모든 데이터 처리 시스템에는 두 가지 시간 영역이 있다.

- 이벤트 시간(event time): 이벤트가 실제 발생한 시간
- 처리 시간(processing time): 이벤트가 처리 시스템에서 관측된 시간

따라서 보통 데이터 팀에서는 Client, Server 들이 이벤트를 발신하고 수신한 시각 등을 요구하기도 한다.

### Various Contexts

- [Stream in HTTP2](https://klarciel.net/wiki/network/network-binary-based-protocol/)

## References

- Designing Data-Intensive Application / Martin Kleppmann
- System Design Interview Volume 2 / Alex Xu, Sahn Lam
- Streaming Systems / Tyler Akidau
