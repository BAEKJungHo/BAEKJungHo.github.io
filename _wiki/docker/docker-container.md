---
layout  : wiki
title   : Docker Container
summary : 도커 컨테이너 이해하기
date    : 2022-09-21 20:54:32 +0900
updated : 2022-09-21 21:15:24 +0900
tag     : docker devops infra
toc     : true
comment : true
public  : true
parent  : [[/docker]]
latex   : true
---
* TOC
{:toc}

## Container 를 학습해야 하는 이유

애플리케이션이 배포되는 환경을 서버에 직접 설치하여 구성할 경우, [snowflake server](https://bcho.tistory.com/1224) 이슈에 직면합니다. 서비스가 점차 확장되면서 기존에 사용하던 서버와 새로 구축한 서버간에 설정의 차이가 발생하고, 관리자의 인적요소에도 영향을 받을 수 있습니다. 그리하여 기존에는 스크립트를 활용한 자동화 방식부터, kickstart 등을 거쳐 OS를 가상화 방식까지 다양한 형태로 서버를 관리해왔습니다.

## 기존의 OS 가상화 방식

기존의 가상화 기술은 하이퍼바이저를 이용해 여러 개의 운영체제를 하나의 호스트에서 생성해 사용하는 방식입니다. 하이퍼바이저는 호스트 컴퓨터에서 다수의 운영체제를 동시에 실행하기 위한 논리적 플랫폼 정도로 이해해도 충분하다고 생각합니다.
__중요한 점은, 각 종 시스템 자원을 가상화하고 독립된 공간을 생성하는 작업은 반드시 하이퍼바이저를 거치기 때문에 일반 Host 에 비해 성능의 손실이 발생한다는 것입니다.__
뿐만 아니라, 가상머신은 GuestOS를 사용하기 위한 라이브러리, 커널 등을 전부 포함하기에 가상 머신을 배포하기 위한 이미지로 만들었을 때 __이미지 크기가 커져__ 가상머신 이미지를 애플리케이션으로 배포하기는 부담스럽습니다. (기존의 가상화는 [전가상화, 반가상화](https://m.blog.naver.com/complusblog/220990379931) 등의 방식으로 분류됩니다.)

우리가 원하는건 특정 환경에 종속되지 않은 상태로 어플리케이션을 띄우는 것입니다.
단순히 __어플리케이션만을 띄우고 싶을 뿐인데 OS 까지 띄우는것은 엄청난 낭비__ 입니다.

> "격리된 CPU, 메모리, 디스크, 네트워크를 가진 공간을 만들고 이 공간에서 프로세스를 실행해서 유저에게 서비스" 하려면 어떻게 해야 할까?

- chroot 로 특정 자원만 사용하도록 제한
- cgroup 을 사용하여 자원의 사용량을 제한
- namespace 로 특정 유저만 자원을 볼 수 있도록 제한
- overlay network 등 네트워크 가상화 기술 활용
- union file system (AUFS, overlay2)로 이식성, 비용절감

컨테이너에 필요한 커널은 호스트의 커널을 공유해 사용하고 컨테이너 안에는 애플리케이션을 구동하는데 필요한 라이브러리 및 실행 파일만 존재하기 때문에 컨테이너를 이미지로 만들었을 때 이미지의 용량 또한 가상 머신에 비해 대폭 줄어듭니다.
무엇보다 컨테이너의 내용을 수정해도 호스트 OS에 영향을 끼치지 않습니다.
__이에 애플리케이션의 개발과 배포가 편해지며, 여러 애플리케이션의 독립성과 확장성이 높아집니다.__

## Docker Daemon

![](/resource/wiki/docker-container/docker-daemon.png)

사용자가 명령어를 입력하면 __docker.sock__ 을 통해 도커 데몬의 API 를 호출합니다. 도커 데몬에서 발생하는 이벤트는 `docker events` 를 통해 확인할 수 있습니다.

```shell
## docker 명령어가 dockerd 라는 도커 데몬과 docker.sock 을 참조하고 있음을 확인할 수 있습니다.
$ sudo lsof -c docker
dockerd     880 root  txt       REG              202,1 102066512      55737 /usr/bin/dockerd
dockerd     880 root    6u     unix 0xffff953085804400       0t0      18324 /var/run/docker.sock type=STREAM
```

추가적으로, `docker stats` 와 `docker system df` 명령어를 통해 도커가 현재 Host 의 자원을 얼마나 사용하고 있는지 확인할 수 있습니다.

도커 데몬은 크게, 컨테이너 이미지 빌드, 관리, 공유, 실행 및 컨테이너 인스턴스 관리 등의 기능을 하며, 모든 컨테이너를 자식 프로세스로 소유합니다.

> [흔들리는 도커(Docker)의 위상: OCI 와 CRI 중심으로 재편되는 컨테이너 생태계](https://www.samsungsds.com/kr/insights/docker.html)

## 컨테이너는 서로 다른 파일 시스템을 가질 수 있음

컨테이너는 이미지에 따라서 실행되는 환경(파일 시스템)이 달라집니다.

![](/resource/wiki/docker-container/filesystem.png)

컨테이너가 서로 다른 파일 시스템을 가질 수 있는 이유는 __chroot__ 를 활용하여 이미지(파일의 집합)를 루트 파일 시스템으로 강제로 인식시켜 프로세스를 실행하기 때문입니다.

## Docker Image

> 이미지는 파일들의 집합이고, 컨테이너는 이 파일들의 집합 위에서 실행된 특별한 프로세스

프로세스의 데이터가 변경되더라도 원본 프로그램 이미지를 변경할 수 없듯, 컨테이너의 데이터가 변경되더라도 컨테이너 이미지의 내용을 변경할 수 없다는 걸 기억합니다.

도커의 이미지는 `[저장소 이름]/[이미지 이름]:[태그]` 의 형태로 구성됩니다. Official 이미지는 `[저장소 이름]` 을 붙여주지 않아도 됩니다.

## Docker Network

a. __veth interface__
- 랜카드에 연결된 실제 네트워크 인터페이스가 아닌, 가상으로 생성한 네트워크 인터페이스입니다.
일반적인 네트워크 인터페이스와는 달리 패킷을 전달받으면, 자신에게 연결된 다른 네트워크 인터페이스로 패킷을 보내주기 때문에 항상 쌍(pair)으로 생성해야 합니다.

__b. NET namespace__
- 리눅스 격리 기술인 namespace 중 네트워크와 관련된 부분을 말합니다.
네트워크 인터페이스를 각각 다른 namespace 에 할당함으로써 서로가 서로를 모르게끔 설정할 수 있습니다.

### 도커 네트워크 구조

![](/resource/wiki/docker-container/docker-network.png)

도커는 위에서 언급한 veth interface 와 NET namespace 를 사용해 네트워크를 구성합니다.
참고로 mac이나 window 는 veth interface가 VM 안에 감쳐져 있어 확인하기 어렵습니다.

1. 컨테이너는 namespace 로 격리되고, 통신을 위한 네트워크 인터페이스(eth0)를 할당받습니다.
2. host 의 veth interface 가 생성되고 컨테이너 내의 eth0과 연결됩니다.
3. host 의 veth interface 는 docker0이라는 다른 veth interface 와 연결됩니다.
- docker0은 도커 실행 시 자동으로 생성되는 가상의 브릿지입니다. 모든 컨테이너는 이 브릿지를 통해 서로 통신이 가능합니다. [Switch 의 동작방식](https://brainbackdoor.tistory.com/115)을 확인하시면 보다 풍부히 이해하실 수 있습니다.

```shell
## 도커를 생성하면 3가지 형태의 network가 생김을 확인할 수 있습니다.
$ sudo docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
6b6ce553a425        bridge              bridge              local
81a18bc9cc40        host                host                local
576b0223f9cf        none                null                local

## bridge 네트워크를 확인해보면 172.17.0.0/16 대역을 할당했음을 확인할 수 있습니다.
$ docker network inspect bridge
[
    {
        "Name": "bridge",
        "Id": "6b6ce553a425c9392c5a65b8dcd2a57e1665289354b97f430758b745b1dc86a7",
        ...
                    "Subnet": "172.17.0.0/16",
                    "Gateway": "172.17.0.1"

## 그리고 172.17.0.0/16 대역은 docker0로 매핑되어 있습니다.
$ ip route
default via 192.168.0.193 dev eth0 proto dhcp src 192.168.0.207 metric 100
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1

## docker0는 veth interface 와 매핑된 브릿지임을 확인할 수 있습니다.
$ brctl show docker0
bridge name	bridge id		STP enabled	interfaces
docker0		8000.024238d4b0f5	no		vethc8e309f

$ ip link ls
3: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP mode DEFAULT group default
66: vethc8e309f@if65: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker0 state UP mode DEFAULT group default
```

- __docker-compose__ 로 띄우면 다른 네트워크 대역을 가집니다. docker-compose 로 컨테이너를 띄우면 compose 로 묶은 범위에 맞춰 브릿지를 하나 더 생성하기 때문입니다. 따라서 서로 경유하는 브릿지가 다르므로 docker-compose 로 띄운 컨테이너와 일반 컨테이너간의 통신은 불가능합니다.
- 기본적으로 컨테이너는 외부와 통신이 불가능합니다. 포트포워딩을 설정하여 외부에 컨테이너를 공개할 수 있습니다.

```shell
# 포트포워딩 설정과 함께 컨테이너를 생성합니다.
$ docker container run -d -p 8081:80 nginx
16cd67c48e5721a6b666192b8960875c720168bf6c5e3ed2138fb04c492447c6

$ sudo docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                  NAMES
16cd67c48e57        nginx               "/docker-entrypoint.…"   4 seconds ago       Up 3 seconds        0.0.0.0:8081->80/tcp   trusting_bhabha

# Host 의 8081포트가 listen 임을 확인합니다.
$ sudo netstat -nlp | grep 8081
tcp6       0      0 :::8081                 :::*                    LISTEN      10009/docker-proxy

# docker-proxy 라는 프로세스가 해당 포트를 listen 하고 있음을 볼 수 있습니다. 
# docker-proxy 는 들어온 요청을 해당하는 컨테이너로 넘기는 역할만을 수행하는 프로세스입니다. 
# 컨테이너에 포트포워딩이나 expose 를 설정했을 경우 같이 생성됩니다.

$ iptables -t nat -L -n
Chain DOCKER (2 references)
target     prot opt source               destination
RETURN     all  --  0.0.0.0/0            0.0.0.0/0
RETURN     all  --  0.0.0.0/0            0.0.0.0/0
RETURN     all  --  0.0.0.0/0            0.0.0.0/0
RETURN     all  --  0.0.0.0/0            0.0.0.0/0
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:8081 to:172.17.0.2:80

# 보시다시피 모든 요청을 DOCKER Chain 으로 넘기고, DOCKER Chain 에서는 DNAT 를 통해 포트포워딩을 해주고 있음을 볼 수 있습니다.
# 이 iptables 룰은 docker daemon 이 자동으로 설정합니다.
```

> [Container network 방식 4가지](https://bluese05.tistory.com/38)

## Docker Volume

도커 이미지로 컨테이너를 생성하면 이미지는 읽기 전용이 되며, 컨테이너의 변경 사항만 별도로 저장해서 각 컨테이너의 정보를 보존한다고 앞에서 설명한 바 있습니다.
하지만 Mysql 과 같이 컨테이너 계층에 저장돼 있던 데이터베이스의 정보를 삭제해서는 안되는 경우도 있습니다. 컨테이너 데이터를 영속적인 데이터로 활용하기 위한 방법 중 볼륨을 활용하는 방안이 있습니다.

-v 옵션은 호스트의 디렉터리를 컨테이너의 디렉터리에 마운트합니다. 따라서 컨테이너의 해당 경로에 파일이 있었다면 호스트의 볼륨으로 덮어씌워집니다.

```shell
$ docker run -d \
--name wordpressdb_hostvolume \
-e MYSQL_ROOT_PASSWORD=password \
-e MYSQL_DATABAS=wordpress \
-v /home/wordpress_db:/var/lib/mysql \
mysql:5.7

$ docker run -d \
--name wordpress_hostvolume \
-e MYSQL_ROOT_PASSWORD=password \
--link wordpressdb_hostvolume:mysql \
-p 80 \
wordpress
```

이처럼 컨테이너가 아닌 외부에 데이터를 저장하고 컨테이너는 그 데이터로 동작하도록 설계(stateless)하여야 합니다. __컨테이너 자체는 상태가 없고 상태를 결정하는 데이터는 외부로부터 제공받도록 구성__ 하도록 합니다.

## Links

- [What is Container Registry](https://www.mirantis.com/cloud-native-concepts/understanding-containers/what-is-a-container-registry/)
- [인프라 공방 - NextStep](https://edu.nextstep.camp/)