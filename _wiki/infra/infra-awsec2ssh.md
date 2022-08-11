---
layout  : wiki
title   : Access to EC2
summary : EC2 에 접속하기 with Bastion Server
date    : 2022-07-14 15:54:32 +0900
updated : 2022-07-14 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}
 
## Key pair

> 퍼블릭 키와 프라이빗 키로 구성되는 비대칭키이다. Amazon EC2 인스턴스에 연결할 때 자격 증명 입증에 사용한다. Amazon EC2는 퍼블릭 키를 인스턴스에 저장하며 프라이빗 키는 사용자가 저장한다. Linux 인스턴스의 경우 프라이빗 키를 사용하여 인스턴스에 안전하게 SSH 로 연결할 수 있다.

서버 생성시 발급받은 key 를 분실할 경우 서버에 접속할 수 없기 때문에 key 를 분실하지 않도록 주의해야 한다. key 는 최초 1회 생성한 후 재사용한다.

## SSH 클라이언트를 사용하여 Linux 인스턴스에 연결

SSH 를 사용하여 Linux 인스턴스에 연결할 때 로그인하려면 퍼블릭 키에 해당하는 프라이빗 키를 지정해야 한다.

- __(퍼블릭 DNS) 인스턴스의 퍼블릭 DNS 이름을 사용하여 연결하는 방법__
  - ssh -i /path/key-pair-name.pem instance-user-name@instance-public-dns-name
- __(IPv6) 또는 인스턴스에 IPv6 주소가 있는 경우, 인스턴스의 IPv6 주소를 사용하여 연결하는 방법__
  - ssh -i /path/key-pair-name.pem instance-user-name@instance-IPv6-address

```idle
# 터미널 접속한 후 생성한 key(private key) 가 위치한 곳으로 이동한다.
# SERVER_IP 는 공인 IP(퍼블릭 IP)
$ chmod 400 [pem파일명]
$ ssh -i [pem파일명] ubuntu@[SERVER_IP]
```

## Bastion Server

> 22 번 포트 접속을 Bastion Server 에 오픈하고, 보안을 집중하도록 할 수 있다.

### Bastion Server 에서 서비스용 서버에 ssh 연결하기

```
## Bastion Server에서 공개키를 생성
## id_rsa.pub 가 public key 이다.
bastion $ ssh-keygen -t rsa
bastion $ cat ~/.ssh/id_rsa.pub

## 접속하려는 서비스용 서버에 public key 를 추가
$ vi ~/.ssh/authorized_keys

## Bastion Server 에서 접속
bastion $ ssh ubuntu@[서비스용 서버 IP]
```

Bastion Server 에서는 개인키로 정보를 암호화해서 서비스용 서버로 접속을 요청하면, 서비스용 서버는 Bastion Server 에서 생성된 공개키를 사용하여 복호화 하게된다.

공개키는 누구나 열어볼 수 있기 때문에 개인키로 암호화하고 공개키로 복호화하는 방식은 보안에 취약한게 아닐까?
 
이러한 방법은 `누가 요청했는지` 에 초첨을 둔 방법이다. 개인키로 암호화한 데이터는 Bastion Server 에서 발급된 공개키를 통해서만 열어볼 수 있기 때문에, 공개키를 사용해 복호화에 성공한다면 이 데이터는 개인키를 가지고 있는 곳에서 보낸게 확실하기 때문에 안전하다. 이러한 기술은 데이터 제공자의 신원이 보장되는 `전자서명` 등의 공인인증체계의 기본이 된다.

## Links

- [ec2 key pairs](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/ec2-key-pairs.html)
- [SSH 클라이언트를 사용하여 Linux 인스턴스에 연결](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html)
- [대칭키 암호화, 비대칭키 암호화](https://universitytomorrow.com/22)
