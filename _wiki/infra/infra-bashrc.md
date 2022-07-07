---
layout  : wiki
title   : bashrc, profile, hosts
summary : 
date    : 2022-06-22 15:54:32 +0900
updated : 2022-06-22 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## bashrc, profile, hosts

> /etc/hosts 와 bashrc(or bash_aliases) 그리고 profile 은 각각 사용 목적이 다르다.

- __/etc/hosts__
  - dns 주소에 대한 static 정책을 추가하기 위함
- __bashrc__
  - bash 쉘로 interactive 하게 운영하기 위해서 사용하는 설정
  - alias 등의 설정을 넣어두는 편
- __profile__
  - profile 은 로그인 쉘을 위한 설정이다보니 환경변수 등의 설정을 넣어둔다.

따라서 1.1.1.1 등의 ip 를 public 등의 도메인 네임으로 매핑하려면 hosts 파일을 사용하고, ssh ubuntu@ip 등의 명령어에 별칭을 두려면 bashrc 혹은 bash_aliases 를 활용하면 된다.

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)
- [What is the purpose of .bashrc and how does it work?](https://unix.stackexchange.com/questions/129143/what-is-the-purpose-of-bashrc-and-how-does-it-work)