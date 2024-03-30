---
layout  : wiki
title   : Secure Shell
summary : Tunneling Protocol
date    : 2024-03-30 11:54:32 +0900
updated : 2024-03-30 12:15:24 +0900
tag     : linux network security ssh crypto tunneling
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
패킷내의 데이터를 캡슐화 시켜서 전송한다. 터널링을 보안 채널이라고도 부른다.

__[A Visual Guide to SSH Tunnels: Local and Remote Port Forwarding](https://iximiuz.com/en/posts/ssh-tunnels/)__:

![](/resource/wiki/linux-ssh/ssh-tunneling.png)

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
- [Port Forwarding](https://baekjungho.github.io/wiki/network/network-port-forwarding/)

### Protocol

__Stack__:

![](/resource/wiki/linux-ssh/protocol-stack.png)

__Packets__:

![](/resource/wiki/linux-ssh/protocol-packet.png)

- length: type ~ CRC 까지의 길이
- padding: 보안공격이 쉽지 않도록 1~8 바이트 추가
- type: SSH 프로토콜 패킷 유형
- 데이터: 운반되는 실제 데이터
- CRC: 오류검출

### SSH Key Managements

The [ssh-keygen](https://en.wikipedia.org/wiki/Ssh-keygen) utility produces the public and private keys, always in pairs.

처음 접속을 시도하는 클라이언트는 서버의 [공개키](https://baekjungho.github.io/wiki/crypto/crypto-asymmetric-cryptography/) 를 받아서, __~/.ssh/known_hosts (클라이언트가 관리하는 호스트 키 DB)__ 에 저장한다.
즉, __known_hosts__ 는 클라이언트가 서버로 접속하기 위한, 대상 서버의 public key 들이 저장된다.
그리고 __~/.ssh__ 하위에 __authorized_keys__ 도 있는데, 다른 컴퓨터가 client 로서 나의 서버로 접속하 위해서 접속 요청 대상 client 의 public key 들이 저장된다.

__클라이언트 자신의 공개키 생성 및 등록 절차__:
- ssh-keygen 명령어를 이용하여, 자신의 __공개키(~/.ssh/id_ras.pub)__ 및 __개인키(~/.ssh/id_rsa)__ 를 생성
- 접속할 서버의 authorized_keys 파일에, 생성한 자신의 공개키를 등록해야 함

__Scenarios__:
1. 클라이언트에서  ssh-keygen 명령어를 통해 private, public 키를 생성
2. 타겟서버에 public key 를 복사
3. private key 는 클라이언트만 가지고 있어야함 (공유 X)
4. 공유된 public key 로 메세지를 암호화 하고, 그 암호화된 메세지는 그 쌍이 되는 private key 로만 해석
5. 클라이언트에서 타겟서버로 public key 를 공유한다. __ssh-copy-id -i 공개키경로 사용자@타겟서버ip__
  - ssh-copy-id -f -i id_rsa.pub username@host
6. 클라이언트에서 타겟서버로 ssh 접속 __ssh 사용자@타겟서버ip__
7. 클라이언트에서 타겟서버 최초 접속시 RSA key fingerprint 로 접속여부를 확인하는 차원으로 (yes/no)를 물어본다.
8. yes 를 하는 경우 ~/.ssh/known_hosts 파일에 해단 RSA key 정보가 등록되고, 다음 접속 부터는 물어보지 않는다.
9. no 를 하는 경우에는 접속이 불가능하다. 

### ssh-agent

ssh-agent 에 private Key 를 등록해서 SSH 터널링시 자동 접속 할 수 있다. ssh-agent 는 exec ssh-agent /bin/bash 로 실행해야 한다.

```
exec ssh-agent /bin/bash
ssh-add ~/.ssh/id_dsa
```

키 등록이 안되면 파일 권한이 600 인지 확인

```
chmod 600 ~/.ssh/id_rsa*
```

__ssh-agent forwarding__:
- local PC 에 원격 서버의 private key 를 두고, 이를 bastion 서버에 그대로 포워딩해주고, bastion 서버에서 해당 private ke y로 원격 서버에 접속 가능하게 한다.
- 이렇게 하면 공용 bastion 서버에 private key 를 두지 않기 때문에 좀 더 안전해진다.

__~/.ssh/config__:
- [ssh config 로 ssh 접속 간편하게 하기](https://edykim.com/ko/post/simplifying-ssh-with-ssh-config/)

## Links

- [Linux / Unix: Test Internet Connection Speed From SSH Command](https://www.cyberciti.biz/faq/linux-unix-test-internet-connection-download-upload-speed/)
- [Connection to github with ssh](https://docs.github.com/ko/authentication/connecting-to-github-with-ssh)
- [AWS Amazon Linux](https://kwonnam.pe.kr/wiki/aws/amazon_linux?s[]=ssh)
- [Linux SSH](https://kwonnam.pe.kr/wiki/linux/ssh?s[]=ssh)
- [What is the harm if I publish an encrypted RSA private key publicly?](https://crypto.stackexchange.com/questions/2706/what-is-the-harm-if-i-publish-an-encrypted-rsa-private-key-publicly)
- [Amazon EC2 키 페어 및 Amazon EC2 인스턴스](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/ec2-key-pairs.html)

## References

- [KT world](http://www.ktword.co.kr/test/view/view.php?no=2524)