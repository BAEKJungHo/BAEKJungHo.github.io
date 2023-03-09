---
layout  : wiki
title   : Demilitarized Zone
summary : DMZ
date    : 2023-03-07 15:54:32 +0900
updated : 2023-03-07 20:15:24 +0900
tag     : network
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Demilitarized Zone

DMZs function as a buffer zone between the public internet and the private network. The DMZ subnet is deployed between two firewalls. All inbound network packets are then screened using a firewall or other security appliance before they arrive at the servers hosted in the DMZ.

DMZ 는 방화벽 사이에 위치해있으며, 신뢰할 수 없는 외부로부터 내부 망에 위치한 자원들을 보호하기 위해서 탄생했다. 일반적으로 DMZ 에 DNS(도메인 이름 시스템), FTP(파일 전송 프로토콜), 메일, 프록시 및 웹 서버뿐만 아니라 외부 연결 서비스 및 리소스를 저장한다.

__전자금융감독규정__
- 제17조: 공개용 웹서버와 내부단 통신망과의 분리
- 제15조: 내부 업무용 시스템은 인터넷 등 외부 통신망과 분리/차단

이러한 요건 때문에 금융권에서는 DMZ 를 배치한다. 클라이언트가 증권사 내부에 직접 접속하지 말아야하고 DMZ 라는 분리된 네트워크 구간의 웹서버를 경유하도록 권장하고 있다. 따라서, 증권사에서 실시간 시세 정보같은 RealTime Server 는 DMZ 에 배치하여 공개용 웹서버 역할을 하도록 한다.

## Links

- [DMZ in networking](https://www.techtarget.com/searchsecurity/definition/DMZ)