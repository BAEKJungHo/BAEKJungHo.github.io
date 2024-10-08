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

## Dockerizing

도커라이징이란 도커 컨테이너를 사용하여 애플리케이션을 패키징, 배포 및 실행하는 프로세스이다.

### With Spring

프로젝트가 Gradle Multi-module 형식으로 되어있을때 아래와 같은 순서로 사용할 수 있다.

- __Root-Module__
  - sub-module-a
    - `Dockerfile`
  - sub-module-b
    - `Dockerfile`
  - docker
    - `docker-compose.yml`

### Dockerfile 

___[Docker Hub](https://www.docker.com/products/docker-hub/)___ 에 등록된 기존 컨테이너 이미지가 아니라면, 애플리케이션을 컨테이너 이미지로 만들기 위해서 Dockerfile 을 작성해야 한다.

Docker 의 Container Image 를 packing 하기 위해서, Docker 는 Base Image 와 Dockerfile 이라는 두가지 컨셉을 이용한다.
Base Image 는 기본적인 인스톨 이미지, Dockerfile 은 기본적인 인스톨 이미지와 그 위에 추가로 설치되는 스크립트를 정의한다.

__Dockerfile__:

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

__Dockerfile for Spring Boot Application Dockerizing__:

```dockerfile
FROM openjdk:20-jdk-slim
ARG JAR_FILE=api/build/libs/api-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

Spring Boot Application Root 폴터 하위에 위와 같은 dockerfile 을 만들고 아래와 빌드 후 같이 실행 시키면 된다.

```
## build
docker build -t 계정명/프로젝트명

## execute
docker run -p 8080:8080 계정명/프로젝트명
```

만약 Docker Hub 에서 private repository 를 생성한 경우 아래 명령어를 사용해 push 할 수 있다.

```
## login
docker login

## 이미지 확인
docker images

## new tag = 기존 이미지에 새 태그 지정
docker tag 계정명/gathering-server:latest baekjungho/haru:latest

## push
docker push 도커허브닉네임/haru:latest
```

### Docker Compose

___[Docker Compose](https://docs.docker.com/compose/)___ 는 다중 컨테이너 Docker 애플리케이션을 정의하고 실행하기 위한 도구이다. Compose 에서 YAML 파일을 사용하여 애플리케이션의 서비스를 구성한다.

YAML 파일은 배포할 모든 서비스를 정의한다. 이러한 서비스는 `Dockerfile` 또는 기존 컨테이너 이미지를 기반으로 한다.

- [Compose specification](https://docs.docker.com/compose/compose-file/)

```yml
# docker compose -f docker-compose.yml up -d --build
# docker compose -f docker-compose.yml build --no-cache
# redis-cli: docker exec -it {containerId} redis-cli
# keys *
# get key {keyName}
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
  db:
    image: mysql:8.0
    container_name: mysql
    restart: always
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 1234
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
    networks:
      - internal-network
  membrer-server:
    container_name: expedia-member
    build: ../member-server
    ports:
      - "8081:8081"
    links:
      - auth-server
    networks:
      - internal-network
  auth-server:
    container_name: expedia-auth
    build: ../auth-server
    ports:
      - "8082:8082"
    links:
      - redis
    depends_on:
      - redis
    networks:
      - internal-network
networks:
  internal-network:
    driver: bridge
```

- __links__: links 항목을 사용하지 않더라도 한 네트워크 안에 있는 서비스끼리 통신을 할 수 있음
- __depends_on__: depends_on 에 명시된 컨테이너가 실행되어야, 해당 컨테이너도 실행할 수 있음
- __ports__: 외부에 공개하는 포트번호(호스트 머신의 포트번호:컨테이너의 포트번호)

내 로컬환경에서 컨테이너에 접근할 때는 `localhost:포트번호` 로 가능하다. 컨테이너끼리 통신하기 위해서는 yaml 파일에서 host 에 `컨테이너명`으로 적어서 사용해야 한다.

```yaml
# Member-server application.yml
auth-server:
  endpoint: http://expedia-auth:8082
```

## Networking in Compose

- [Networking in Compose](https://docs.docker.com/compose/networking/)

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

## Kubernetes vs Docker: Differences Explained

[Kubernetes vs Docker: Differences Explained](https://dzone.com/articles/kubernetes-vs-docker-differences-explained):
- The scope of Compose is limited to one host, while that of Kubernetes is for a cluster of hosts.

## Links

- [Dockerizing](https://developerexperience.io/practices/dockerizing)
- [Deploy multiple containers using Docker Composer](https://learn.microsoft.com/ko-kr/azure/cognitive-services/containers/docker-compose-recipe)
- [Overview of docker compose CLI](https://docs.docker.com/compose/reference/)
- [Docker 소개 - 조대협](https://bcho.tistory.com/805)