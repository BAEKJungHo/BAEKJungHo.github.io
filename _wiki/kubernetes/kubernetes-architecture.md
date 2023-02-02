---
layout  : wiki
title   : Kubernetes Architectures
summary : 쿠버네티스 구성요소와 아키텍처
date    : 2022-09-22 20:54:32 +0900
updated : 2022-09-22 21:15:24 +0900
tag     : kubernetes devops infra
toc     : true
comment : true
public  : true
parent  : [[/kubernetes]]
latex   : true
---
* TOC
{:toc}

## 쿠버네티스를 사용하는 이유

Container 를 운영하다보면 아래와 같은 질문들이 생겨요.

- 여러 Container 에 애플리케이션을 배포할 때는 어떻게 하지?
- Container 가 Immutable Server 라는 점은 이해했는데, 그럼 Health Check 는 어떻게 하지? 설정관리는?
- Container 를 새로 띄우면 IP가 바뀌는데 앞단의 Reverse Proxy 에서 어떻게 감지하지?
- Container 를 어느 시점에 수평확장해야 하지?
- Container 가 많아지면 하나의 Node 에서 관리하기 힘들텐데, 여러 Node 에서 관리하려면 어떻게 해야 하지?
- 여러 Node 에서 관리하다보면 IP 중복 이슈는 없을까?

## 쿠버네티스 특징

### Ochestration

![](/resource/wiki/kubernetes-architecture/ochestration.png)

Master Node 의 관리 아래 다양한 컨테이너를 구동하여 사용자에게 최상의 서비스를 제공합니다.

### 선언적, 자동화 관리

쿠버네티스는 바라는 상태가 있습니다. 보일러를 한번 생각해봐요. 사용자가 바라는 온도를 설정하면, 현재 온도가 이보다 낮을 경우에 난방이 가동되지요. 쿠버네티스도 yml 파일로 정의해두면, 컨테이너가 비정상적으로 종료되더라도 원래대로 복구할 수 있습니다.

### 추상화된 리소스 관리

![](/resource/wiki/kubernetes-architecture/resource.png)

- 서버별 리소스 사용량 모니터링, 리소스 사용량 제한 등 각 서버의 리소스를 알아서 관리해줍니다.
- 컨테이너 증설 시 내장 스케줄러가 최적의 노드를 찾아 배치해줍니다.
- 필요시 자동으로 리소스를 추가하는 자동 확장 기능이 있습니다.

## 구성 요소

![](/resource/wiki/kubernetes-architecture/element.png)

In Kubernetes, Ingress and Service are two important components for exposing and accessing applications running in a cluster.

- __Ingress__: An Ingress is a Kubernetes resource that defines a set of rules for external access to services running in a cluster. It acts as a reverse proxy, routing incoming traffic to the appropriate service based on the request URL. Ingress provides a single entry point for external clients and can be used to expose multiple services over a single IP address or hostname.
- __Service__: A Service in Kubernetes is a logical abstraction over a set of pods that provides a stable network endpoint for accessing the pods. A service can expose pods to the network by creating an IP address and DNS name that can be used to reach the pods. Services can also load balance traffic between multiple pods, providing resilience and high availability for the application.

Together, Ingress and Service work together to provide a way for external clients to access applications running in a Kubernetes cluster. The Ingress provides a single entry point for incoming traffic, while the Service provides a stable network endpoint for accessing the underlying pods. This helps to simplify the network architecture and provides a flexible and scalable solution for exposing applications in a Kubernetes cluster.

### Pod

![](/resource/wiki/kubernetes-architecture/pod.png)

- Pod 은 컨테이너 실행을 담당합니다.
- Pod 은 쿠버네티스 최소 실행 단위입니다.
- Pod 은 1개 이상의 컨테이너를 가질 수 있지만, 보통은 1개 컨테이너만을 실행합니다.
- Pod 은 죽으면 Self Healing 할 수 없습니다. 컨테이너 실행만을 담당하기 때문입니다.

### Replicaset

![](/resource/wiki/kubernetes-architecture/replicaset.png)

```
apiVersion: apps/v1
kind: ReplicaSet
metadata: 
    name: myreplicaset

spec: 
    replicas: 3
    # 컨테이너의 라벨을 선택    
    selector: 
        matchLabels:
            run: nginx-rs
    template:
        metadata:
            labels: 
                run: nginx-rs
        # Pod의 spec과 같음
        spec:
            containers:
            - name: nginx
              image: nginx
```

- yml 파일에 정의된 수 만큼 Pod 의 개수를 유지하려고 합니다. 위의 ReplicaSet 에 대한 yaml 파일을 보면, nginx image 를 활용하여 컨테이너를 만든 템플릿에 nginx-rs 란 라벨을 붙입니다. 그리고 nginx-rs 라벨이 붙은 갯수를 3개로 유지하겠다는 의미입니다.
- Replicaset 은 Pod 의 복제와 유지만을 담당할 뿐, Pod 이 담당하는 컨테이너 (애플리케이션)의 버전을 관리하진 않습니다.

### Deployment

```
$ kubectl get events
```

- 롤링 업데이트를 지원하고 롤링 업데이트되는 Pod 의 비율을 조절할 수 있습니다.
- 업데이트 히스토리를 저장하고 다시 롤백할 수도 있습니다.
- Scale out 기능을 지원합니다.
- 배포되고 있는 상태를 확인할 수 있습니다.

### 배포 전략

- [Deployment Strategy](https://baekjungho.github.io/wiki/infra/infra-deployment/)

### Service

```
<서비스 이름>.<네임스페이스>.svc.cluster.local
```

- 하나의 애플리케이션 묶음을 의미합니다.
- Pod 은 언제든 삭제될 수 있으므로 안정적인 서비스 끝점이 필요한데요. Service 는 Pod 와 연결되는 논리적인 Endpoint 을 제공합니다. 이에 Pod 의 IP가 변경되더라도 사용자는 동일한 IP, 그리고 도메인으로 접근할 수 있습니다.
- 이를 위해 Port 설정, Ingress 와 연결 등을 담당하고 있습니다.

![](/resource/wiki/kubernetes-architecture/service.png)

Service 는 일반적으로 label selector 를 이용하여 Pod 를 선택하는데, 특정 라벨을 가지고 있는 Pod 에 트래픽을 보냅니다. 만약, Service 에서 Pod 의 이름이나 IP를 직접 참조하게 되면 Pod 의 생명주기에 따라 사용자가 매번 새로운 Pod 정보를 Service 에 등록 및 삭제해야 합니다.

```
"metadata": {
  "labels": {
    "key1" : "value1",
    "key2" : "value2"
  }
}
```

### Ingress

![](/resource/wiki/kubernetes-architecture/ingress.png)

- Ingress 는 Nginx 기반의 Reverse Proxy 입니다.
- Service 중 LoadBalancer Type 을 설정하고 AWS ALB 를 활용할 경우에도 도메인 기반 라우팅은 가능하나, TLS 설정을 할 수 없습니다.
- 유입되는 트래픽을 제어합니다. 즉, 부하분산, TLS, 도메인 기반 라우팅 등을 제공합니다. 가령 도메인이 api.nextstep.camp, - admin.nextstep.camp, stat.nextstep.camp 등으로 나뉠 경우, 해당 도메인과 연결된 service 로 트래픽을 보냅니다.

## Architecture

![](/resource/wiki/kubernetes-architecture/architecture.png)

- Master Node 와 Worker Node 로 이루어져 있습니다.
- Master Node 가 Woeker Node 의 각 구성요소(Pod, Deployment, Service, Ingress 등)를 관리합니다.
- Master Node 에는 Api Server, Controller Manager, Scheduler, etcd 등이 있습니다.
- Worker Node 에는 Kubelet(Pod 내의 컨테이너 실행을 직접적으로 관리), Kube proxy(클러스터 내부의 별도의 가상 네트워크를 관리) 그리고 사용자가 구성한 pod 등이 있습니다.

## API Server

![](/resource/wiki/kubernetes-architecture/apiserver.png)

- kubernetes component 는 오직 api 서버와 통신합니다. 즉, api 서버는 etcd 와 통신할 수 있는 유일한 component 입니다.
- api server 는 단일 장애점이 될 수 있습니다. 이에 여러 Node 에 분산하여 고가용성을 유지해야 합니다.

## etcd

![](/resource/wiki/kubernetes-architecture/etcd.png)

- etcd 는 key-value storage 로, 모든 object(pod, replicaset, service, secret 등)에 대한 정보를 분산 저장합니다. api server 를 통해 간접적으로 읽고 쓰이는데, 이때 낙관적 잠금방식을 통해 동시성 제어를 하며 우선순위는 RAFT 알고리즘을 활용합니다. RAFT 알고리즘은 과반 투표 등을 거쳐 판단하기에, etcd 인스턴스는 홀수로 구성해야 합니다.

![](/resource/wiki/kubernetes-architecture/etcd2.png)

- kubectl 등의 client 로 api server 에 post 요청을 할때, 인증/권한승인/승인제어 플러그인 등을 거치게 됩니다. 이 후 api server 는 object 를 적절히 변형(mutate)하고, 유효성을 검사하고(validate), etcd 에 저장한 다음 client 에 응답을 전달합니다.

## Controller

![](/resource/wiki/kubernetes-architecture/controller.png)

- __Pod 는 Worker node 에서 실행됩니다.__

  a. kubectl 을 사용하여 (api server 에) Deployment Resource 를 생성요청을 하면(etcd 에 기록)

  b. Deployment Controller 가 이를 감지(watch)하고 (api server 에) ReplicaSet Resource 생성 요청을 합니다(etcd 에 기록).

  c. 이를 ReplicaSet Controller 가 감지(watch)하고 (api server 에) Pod Resource 생성 요청을 합니다(etcd 에 기록).

  d. Scheduler 는 이를 감지(watch)하고 Worker Node 에 Pod 를 할당합니다.(etcd 에 기록)

  e. Kubelet 은 node 에 스케줄되는 pod 할당을 감지(watch)하고 pod 의 container 를 실행하고 api 서버에 보고합니다.

## Scheduler

Kubernetes 는 Pod 를 어느 Node 에 배치할 지 어떻게 판단할까요?

![](/resource/wiki/kubernetes-architecture/scheduler.png)

Scheduler 는 Pod 가 __1) 스케줄될 수 있는 모든 노드의 목록을 얻은 후__ , __2) affinity 등의 명세를 확인 후 우선순위를 정합니다.__

이 때, 아래 항목들을 체크합니다.

- Node 가 Pod 의 하드웨어 리소스 요청을 이행할수 있는지
- Node 에 리소스가 부족한지(메모리나 디스크 상태)
- Node 가 PodSpec 의 Node Selector 에 맞는 라벨을 가질 수 있는지
- 특정 호스트 포트에 바인딩 된 경우, 해당 Node 의 Port 가 이미 사용되고 있는지
- Pod 가 특정 볼륨 유형을 요청하는 경우 이 볼륨을 Node 가 마운트 할 수 있는지

## kubelet

Kubernetes 는 각 Node 의 Pod 이 정상인지 어떻게 판단할까요?

![](/resource/wiki/kubernetes-architecture/kubelet.png)

kubelet 은 각 Node 에 실행되는 에이전트로, Node 상태, Podspec 에 맞춰 Pod 들이 정상적으로 동작하는지 등을 확인합니다. 이 때 cAdvisor 를 통해 수집한 정보를 활용합니다.

## Network

Pod 는 1개 이상의 Container 를 가질 수 있다는 의미가 무엇인가요?

우선, Kubernetes 의 경우 실제 동작하는 컨테이너 외에도 pause 컨테이너가 생성되는 것을 확인할 수 있는데요. pause 명령으로 실행된 Container 는 실제로도 쿠버네티스가 SIGTERM 명령을 내리기 전까지는 아무것도 하지 않고 Sleep 상태로 존재합니다.

pause container 의 역할을 파악하기 위해서는, 우선 Container network 방식 중 container 모드를 이해할 필요가 있습니다.

```
$ docker network inspect bridge
[
    {
        "Name": "bridge",
        "Id": "11f19f488ad3e93c199ceb1e9b22b9541a4777fe4916f1c7b379e93773ce26cf",
        "Created": "2019-11-28T06:15:22.406695801Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.18.0.1/24",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "09e556688ac65de82dbc4b08fe442853bbd3d2a2418e6564d9feb1677edf712e": {
                "Name": "k8s_POD_kubernetes-bootcamp-5b48cfdcbd-qzcsm_default_00dbb354-dc17-469c-a586-d5bd4d8158a9_0",
                "EndpointID": "7b8a3c0f47db0c39673fc1e5a82610cd094f3669d4b210f2c76796dfa2525222",
                "MacAddress": "02:42:ac:12:00:04",
                "IPv4Address": "172.18.0.4/24",
                "IPv6Address": ""
            },
 
$ docker ps -a
CONTAINER ID        IMAGE                  COMMAND                  CREATED             STATUS              PORTS               NAMES
09e556688ac6        k8s.gcr.io/pause:3.1   "/pause"                 About an hour ago   Up About an hour                        k8s_POD_kubernetes-bootcamp-5b48cfdcbd-qzcsm_default_00dbb354-dc17-469c-a586-d5bd4d8158a9_0
```

Kubernetes 는 Pod 내에서 컨테이너 생성시 일반적인 Docker 가 사용하는 Bridge 모드가 아닌 Container 모드로 띄우는데, Container 모드는 아래와 같이 다른 컨테이너를 지정하여 띄울 수 있어 지정한 Container 간 네트워크를 공유하는 형태로 생성할 수 있습니다. 이 때, 각 Container 의 IP가 같으므로 외부에서 같은 IP로 접근하며, Container 들은 서로 같은 port 를 사용하는 것은 불가능합니다.

```
$ docker run --net=container:{container_id} -d {image_name}
```

![](/resource/wiki/kubernetes-architecture/network.png)

여러 Node 에 Pod 을 할당하면서 IP 중복이 되는 경우는 없나요?

![](/resource/wiki/kubernetes-architecture/network2.png)

Kubernetes 는 이처럼 각 Node 의 Bridge 가 서로 겹치지 않게 주소 대역을 할당한 수 routing table 을 작성하는데, 이렇게 Virtual Network Interface 와 Bridge, Routing Rule 의 조합을 일컬어 overlay network 라 합니다.

다른 Node 에 있는 Pod 과 어떻게 통신하나요?

![](/resource/wiki/kubernetes-architecture/network3.png)

우선, 클러스터 내에서 사용하는 DNS Server pod 가 있습니다. 그리고 각 Service 들이 Pod 의 Endpoint 를 담당하고 있습니다.

Service 는 label selector 를 활용하여 Pod 에 트래픽을 전달한다고 했는데 가령, backend Service 로 요청을 할 경우, kubernetes api 는 Pod 목록을 가지고 있으며, kube-proxy 는 이 목록을 활용하여 적절한 pod (10.255.255.202:8080)에 연결될 수 있도록 리다이렉팅합니다. 즉, iptables 의 정책을 구성(DNAT)하여 트래픽을 전달합니다.

## Links

- [Kubernetes Documentation](https://kubernetes.io/docs/home/supported-doc-versions/)
- [인프라 공방 - NextStep](https://edu.nextstep.camp/)
- [Why Do You Need Istio When You Already Have Kubernetes?](https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/)
- [Kubernetes — Deep Dive Series](https://medium.com/kubehub/kubernetes-deep-dive-series-1ee22f8da8ef)
- [Kubernetes — Deep dive](https://medium.com/walmartglobaltech/kubernetes-deep-dive-aeebfa1516c3)
- [A Deep Dive into Architecting a Kubernetes Infrastructure](https://thenewstack.io/a-deep-dive-into-architecting-a-kubernetes-infrastructure/)
- [Kubernetes Tutorial — Learn Kubernetes from Experts](https://intellipaat.com/blog/kubernetes-tutorial/)