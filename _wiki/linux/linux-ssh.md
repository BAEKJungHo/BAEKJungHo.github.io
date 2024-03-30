---
layout  : wiki
title   : Secure Shell
summary : Tunneling Protocol
date    : 2024-03-30 11:54:32 +0900
updated : 2024-03-30 12:15:24 +0900
tag     : linux network security ssh crypto
toc     : true
comment : true
public  : true
parent  : [[/linux]]
latex   : true
---
* TOC
{:toc}

## Tunneling Protocol

[Tunneling](http://www.ktword.co.kr/test/view/view.php?m_temp1=1708&id=530)은 데이터 스트림을 인터넷 상에서 가상의 파이프를 통해 전달시키는 기술을 의미하며,
패킷내의 터널링할 대상을 캡슐화 시켜서 전송한다. 터널링을 보안 채널이라고도 부른다.

__터널링 기법__:
- 두 노드 또는 두 네트워크 간에 가상의 링크([VPN](http://www.ktword.co.kr/test/view/view.php?m_temp1=342&id=289) 등)를 형성하는 기법
- 하나의 프로토콜이 다른 프로토콜을 감싸는 캡슐화 기능을 통해 운반

## Secure Shell

SSH 는 TCP 상에 보안 채널([터널링](http://www.ktword.co.kr/test/view/view.php?m_temp1=1708&id=530))을 형성하여

### Characteristics

__보안 통신, 포트 포워딩(일종의 터널링) 등의 기능을 제공__:
- 암호화되지 않은 telnet,rlogin, SMTP 등에 대한 패킷 스니핑 등의 보안공격 방지
  - telnet 은 로그인명,암호 등 모든 정보를 평문으로 보내므로 중간자 공격에 취약

__클라이언트/서버 형태__:
- 사용자 클라이언트 및 응용 서버 사이에서 SSH 클라이언트 및 SSH 서버가 존재함
  - SSH 서버: OpenSSH 등
    - [Top 20 OpenSSH Server Best Security Practices](https://www.cyberciti.biz/tips/linux-unix-bsd-openssh-server-best-practices.html)
  - SSH 클라이언트 : PuTTY 등
- 설치된 두 S/W (SSH 클라이언트 및 SSH 서버) 사이에서 TCP 보안 채널이 형성됨
  - 여기서, 서버는 원격 접근하려는 호스트, 클라이언트는 원격 접근하는 사용자

__프로토콜 및 포트 번호__:
  - 전송계층 프로토콜: TCP 만 가능 (TCP 상에 보안 채널 형성됨)
  - 포트 번호: 22 (SSH 서버에 개방되는 포트)

### Features

- Authentication
- [Encryption](http://www.ktword.co.kr/test/view/view.php?m_temp1=4240&id=532)
  - 데이터 전송 전에 암호화하여 전송
- Integrity
  - 데이터 전송 중간에 [Man-in-the-middle (중간자 공격, MITM)](http://www.ktword.co.kr/test/view/view.php?m_temp1=3551&id=1190)에 의한 변경 방지를 위해, [MAC](https://baekjungho.github.io/wiki/auth/auth-hmac/) 코드를 통해 구현
- Compression
  - 데이터를 압축하여 전송

## Links

- [Kt world ssh](http://www.ktword.co.kr/test/view/view.php?no=2524)
- [Linux / Unix: Test Internet Connection Speed From SSH Command](https://www.cyberciti.biz/faq/linux-unix-test-internet-connection-download-upload-speed/)