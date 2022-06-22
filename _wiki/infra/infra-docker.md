---
layout  : wiki
title   : Docker Container
summary : 
date    : 2022-06-11 15:54:32 +0900
updated : 2022-06-11 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Docker Container

![](/resource/wiki/infra-docker/snowflake.gif)

애플리케이션이 배포되는 환경을 서버에 직접 설치하여 구성할 경우, [snowflake server](https://bcho.tistory.com/1224) 이슈에 직면한다. 서비스가 점차 확장되면서 기존에 사용하던 서버와 새로 구축한 서버간에 설정의 차이가 발생하고, 관리자의 인적요소에도 영향을 받을 수 있다. 그리하여 기존에는 스크립트를 활용한 자동화 방식부터, kickstart 등을 거쳐 OS 를 가상화 방식까지 다양한 형태로 서버를 관리해왔다.

## 기존 OS 가상화 방식

![](/resource/wiki/infra-docker/hyper.png)

기존의 가상화 기술은 하이퍼바이저를 이용해 여러 개의 운영체제를 하나의 호스트에서 생성해 사용하는 방식이다. 하이퍼바이저는 호스트 컴퓨터에서 다수의 운영체제를 동시에 실행하기 위한 논리적 플랫폼 정도로 이해하면 된다.
중요한 점은, 각 종 시스템 자원을 가상화하고 독립된 공간을 생성하는 작업은 반드시 하이퍼바이저를 거치기 때문에 일반 Host 에 비해 성능의 손실이 발생한다는 것이다.
뿐만 아니라, 가상머신은 GuestOS 를 사용하기 위한 라이브러리, 커널 등을 전부 포함하기에 가상 머신을 배포하기 위한 이미지로 만들었을 때 이미지 크기가 커져 가상머신 이미지를 애플리케이션으로 배포하기는 부담스럽다. (기존의 가상화는 전가상화, 반가상화 등의 방식으로 분류된다.)

우리가 원하는건 특정 환경에 종속되지 않은 상태로 어플리케이션을 띄우는 것이다.

__단순히 어플리케이션만을 띄우고 싶을 뿐인데 OS 까지 띄우는것은 엄청난 낭비이다.__

> "격리된 CPU, 메모리, 디스크, 네트워크를 가진 공간을 만들고 이 공간에서 프로세스를 실행해서 유저에게 서비스" 하려면 어떻게 해야 할까?

- `chroot` 로 특정 자원만 사용하도록 제한
- `cgroup` 을 사용하여 자원의 사용량을 제한
- `namespace` 로 특정 유저만 자원을 볼 수 있도록 제한
- `overlay network` 등 네트워크 가상화 기술 활용
- `union file system` (AUFS, overlay2)로 이식성, 비용절감

컨테이너에 필요한 커널은 호스트의 커널을 공유해 사용하고 컨테이너 안에는 애플리케이션을 구동하는데 필요한라이브러리 및 실행 파일만 존재하기 때문에 컨테이너를 이미지로 만들었을 때 이미지의 용량 또한 가상 머신에 비해 대폭 줄어든다.

무엇보다 컨테이너의 내용을 수정해도 호스트 OS에 영향을 끼치지 않는다. 이에 애플리케이션의 개발과 배포가 편해지며, 여러 애플리케이션의 독립성과 확장성이 높아진다.

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)