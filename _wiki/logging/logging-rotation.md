---
layout  : wiki
title   : Docker Log Rotation
summary : Logging Driver Mechanism
date    : 2023-10-04 19:54:32 +0900
updated : 2023-10-04 20:15:24 +0900
tag     : logging docker
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

## Log Rotation

[Log Rotation](https://en.wikipedia.org/wiki/Log_rotation) 이란 __log files are compressed, moved (archived)__. 

In Linux log rotation is typically performed using the [logrotate](https://linux.die.net/man/8/logrotate) command. Dated logs may also be compressed. 

로그 파일을 계속 적재하다보면 Linux Server 에 디스크 용량이 가득차는 문제가 발생한다.

## Logging Driver Mechanism

Docker includes multiple logging mechanisms to help you get information from running containers and services. These mechanisms are called [logging drivers](https://docs.docker.com/config/containers/logging/configure/).
As a default, Docker uses the [json-file logging driver](https://docs.docker.com/config/containers/logging/json-file/).

![](/resource/wiki/logging-rotation/docker-logging-driver-tip.png)

__Docker Log Rotation Configurations__:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "production_status",
    "env": "os,customer"
  }
}
```

위 처럼 max-size 와 max-file 을 설정하면 rotation 이 활성화된다. 따라서, Docker Container 의 로그 파일 크기가 지속적으로 증가하는 것을 방지할 수 있다.

더 자세한 내용은 [Docker Manual](https://docs.docker.com/desktop/) 에서 Docker Engine 의 Logging 을 참고하면 된다.
