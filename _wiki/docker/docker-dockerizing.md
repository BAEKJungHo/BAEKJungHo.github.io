---
layout  : wiki
title   : Dockerizing
summary : 
date    : 2022-09-27 20:54:32 +0900
updated : 2022-09-27 21:15:24 +0900
tag     : docker devops infra
toc     : true
comment : true
public  : true
parent  : [[/docker]]
latex   : true
---
* TOC
{:toc}

## What Is a Dockerizing

도커라이징이란 도커 컨테이너를 사용하여 애플리케이션을 패키징, 배포 및 실행하는 프로세스이다.

## Dokcerizing in Spring

프로젝트가 Gradle Multi-module 형식으로 되어있을때 아래와 같은 순서로 사용할 수 있다.

- __Root-Module__
  - sub-module-a
    - `Dockerfile`
  - sub-module-b
    - `Dockerfile`
  - docker
    - `docker-compose.yml`

### Dockerfile 

[Docker Hub](https://www.docker.com/products/docker-hub/) 에 등록된 기존 컨테이너 이미지가 아니라면, 애플리케이션을 컨테이너 이미지로 만들기 위해서 Dockerfile 을 작성해야 한다.

```dockerfile
## Base 이미지를 지정 한다.
FROM gradle:jdk11

## build 파일을 workdir 로 copy 한다.
WORKDIR /app
COPY build/libs/auth-server-0.0.1-SNAPSHOT.jar /app/app.jar

## 외부에 공개할 포트번호를 지정한다.
EXPOSE 8082

## 컨테이너의 수행 명령을 지정한다.
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

- EXPOSE 구문으로 명시한 포트는 'docker run -P' 명령을 이용할 때 호스트 운영체제로 오픈된다.

```
## 호스트 운영체제의 8081 번 포트와 컨테이너의 8081 포트가 매핑된다.
## 호스트 운영체제의 8081 포트로 전달된 정보들이 도커를 통해 컨테이너의 8081 포트로 포워딩된다는 의미이다.
docker run -it -p 8081:8081 auth-server
```

### docker-compose.yml

[Docker Compose](https://docs.docker.com/compose/) 는 다중 컨테이너 Docker 애플리케이션을 정의하고 실행하기 위한 도구이다. Compose 에서 YAML 파일을 사용하여 애플리케이션의 서비스를 구성한다.

YAML 파일은 배포할 모든 서비스를 정의한다. 이러한 서비스는 `Dockerfile` 또는 기존 컨테이너 이미지를 기반으로 한다.

```yml
# docker compose -f docker-compose.yml up -d
# docker compose -f docker-compose.yml build --no-cache
version: "3.9"

services:
  redis:
    image: redis:latest
    container_name: expedia-redis
    networks:
      - internal-network
    ports:
      - "6379:6379"
    command: redis-server
  membrer-server:
    container_name: member
    build: ../member-server
    ports:
      - "8081:8081"
    networks:
      - internal-network
  auth-server:
    container_name: auth
    build: ../auth-server
    ports:
      - "8082:8082"
    networks:
      - internal-network
networks:
  internal-network:
    driver: bridge
```

## Assign Static IP to Docker Container and Docker-Compose

- [Assign Static IP to Docker Container and Docker-Compose - Baeldung](https://www.baeldung.com/ops/docker-assign-static-ip-container)
- [Kafka config with docker compose - Asterlsk](https://github.com/asterlsker/kafka/pull/17)
- [How to Assign Static IP Addresses to Docker Compose Containers](https://devtonight.com/articles/how-to-assign-static-ip-addresses-to-docker-compose-containers)
- [Set a static IP for docker-compose containers](https://mklasen.com/set-a-static-ip-for-docker-compose-containers/)

## Command options overview and help

> You can use Docker Compose binary, `docker compose [-f <arg>...] [options] [COMMAND] [ARGS...]`, to build and manage multiple services in Docker containers.

```
Define and run multi-container applications with Docker.

Usage:
  docker compose [-f <arg>...] [--profile <name>...] [options] [COMMAND] [ARGS...]
  docker compose -h|--help

Options:
  -f, --file FILE             Specify an alternate compose file
                              (default: docker-compose.yml)
  -p, --project-name NAME     Specify an alternate project name
                              (default: directory name)
  --profile NAME              Specify a profile to enable
  --verbose                   Show more output
  --log-level LEVEL           DEPRECATED and not working from 2.0 - Set log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
  --no-ansi                   Do not print ANSI control characters
  -v, --version               Print version and exit
  -H, --host HOST             Daemon socket to connect to

  --tls                       Use TLS; implied by --tlsverify
  --tlscacert CA_PATH         Trust certs signed only by this CA
  --tlscert CLIENT_CERT_PATH  Path to TLS certificate file
  --tlskey TLS_KEY_PATH       Path to TLS key file
  --tlsverify                 Use TLS and verify the remote
  --skip-hostname-check       Don't check the daemon's hostname against the
                              name specified in the client certificate
  --project-directory PATH    Specify an alternate working directory
                              (default: the path of the Compose file)
  --compatibility             If set, Compose will attempt to convert deploy
                              keys in v3 files to their non-Swarm equivalent

Commands:
  build              Build or rebuild services
  bundle             Generate a Docker bundle from the Compose file
  config             Validate and view the Compose file
  create             Create services
  down               Stop and remove containers, networks, images, and volumes
  events             Receive real time events from containers
  exec               Execute a command in a running container
  help               Get help on a command
  images             List images
  kill               Kill containers
  logs               View output from containers
  pause              Pause services
  port               Print the public port for a port binding
  ps                 List containers
  pull               Pull service images
  push               Push service images
  restart            Restart services
  rm                 Remove stopped containers
  run                Run a one-off command
  scale              Set number of containers for a service
  start              Start services
  stop               Stop services
  top                Display the running processes
  unpause            Unpause services
  up                 Create and start containers
  version            Show the Docker Compose version information
```

## Links

- [Dockerizing](https://developerexperience.io/practices/dockerizing)
- [Deploy multiple containers using Docker Composer](https://learn.microsoft.com/ko-kr/azure/cognitive-services/containers/docker-compose-recipe)
- [Overview of docker compose CLI](https://docs.docker.com/compose/reference/)