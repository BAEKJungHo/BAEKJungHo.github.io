---
layout  : wiki
title   : Docker, Kubernetes with Linux Kernel OOM Killer
summary : 
date    : 2023-06-22 11:28:32 +0900
updated : 2023-06-22 12:15:24 +0900
tag     : linux oom kubernetes java
toc     : true
comment : true
public  : true
parent  : [[/linux]]
latex   : true
---
* TOC
{:toc}

## Debugging OOM errors

사내에서 Kubernetes 환경에서 OOM Error 를 마주하였다. ArgoCD 를 통해 Admin 서버가 몇번씩 주기적으로 
재시작되고 있음을 확인했고, Datadog Metrics 를 통해서 메모리 사용량을 체크하였다.

Lens 를 통해서 Pod 을 확인한 결과 [Exit Code 137 - Out of Memory](https://support.circleci.com/hc/en-us/articles/115014359648-Exit-Code-137-Out-of-Memory) 를 나타내고 있었다.
컨테이너의 메모리 사용량이 메모리 제한을 초과하거나, 컨테이너가 실행 중인 노드의 메모리 부족 상태가 발생하면 Out Of Memory 가 발생한다. 만약 컨테이너가 Code 137로 종료되면 Out Of Memory 에 의해 SIGKILL 을 수신한 것이다.

Java Application 에서는 OutOfMemory Error 로그가 남아있지 않았었기 때문에 JVM OOM 인지 확실하진 않았다.
어쨋든 OOM Issue 를 해결하기 위해 __의심가는 부분들을 하나씩 제거해가며__ 방법을 찾아야 했다.

실제 Pod 에 들어가 아래 명령어를 통해 java heapsize 를 체크할 수 있었다.

- __java -XX:+PrintFlagsFinal -version | grep -iE 'heapsize|permsize|threadstacksize'__

![](/resource/wiki/linux-oom-killer/heapsize.png)

64GB, 16GB 메모리를 가진 맥북 환경에서 위 명령어를 쳐서 확인한 결과 max-heapsize 가 물리적인 메모리의 __1/4(25%)__ 정도 크기로 heapsize 를 기본(default)으로 사용하고 있음을 확인하였다.

OOM 해결을 하는데 [컨테이너 환경에서의 Java 애플리케이션의 리소스와 메모리 설정](https://findstar.pe.kr/2022/07/10/java-application-memory-size-on-container/) 해당 내용을 참고하여 __팀장님께서__ Pod, Heap 의 Memory 를 조정하였다.

> JVM 은 기본적으로 Max Heap 메모리의 사이즈를 물리적인 메모리의 25%를 할당한다. (JVM 10이상부터 컨테이너의 메모리의 25%를 할당한다. 이전 버전에는 버그로 인해서 컨테이너 메모리를 제대로 인식하지 못하는 오류가 있었다.) 따라서 Memory Limit 을 4G로 설정해놓은 상태에서 별도의 설정을 하지 않았다면 Max Heap 사이즈는 1G가 된다.

More Articles. [Docker and OOM(Out Of Memory) Killer](https://blog.2dal.com/2017/03/27/docker-and-oom-killer/)

결과적으로는, Pod, Heap Memory 조정이 있었음에도 OOM 으로 인해 Pod 가 Down/Restart 되는 현상이 있었고, 결과적으로 코드에 문제가 있음을 확신했고, 수정 후 재 배포한 결과 memory.kernel 이 지속적으로 증가하지 않았었고
문제가 해결된 듯 했다. 코드에서 의심가는 부분은 WebClient 의 사용 방식이었는데 이 내용은 다음 아티클을 위해서 남겨둔다.

아래의 내용들은 Pod, Heap Memory 설정을 함에 있어 도움이 되는 지식들을 정리했다.

## Kubernetes Pod Memory Congigurations

Kubernetes 를 사용하고 있다면 deployment.yml 에서 아래 처럼 [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) 를 설정하게 된다. This is known as Quality of Service (QoS) class.

__Kubernetes Pod Memory configurations:__

```
containers:
- name: dope
  image: nginx
  resources:
    limits:
      memory: 4Gi
    requests:
      memory: 4Gi
```

## Java Heap Memory Configurations

기본적으로 JVM 은 물리 메모리의 1/4 을 Max Heap Size 로 할당한다. 따라서, Memory Limit 을 4G로 설정해놓은 상태에서 별도의 설정을 하지 않았다면 Max Heap 사이즈는 1G가 된다.
Pod 의 Limit 에 따라서 JVM Heap Size 를 Dynamic 하게 변경하기 위해서는 Percent 기반으로 설정하는 옵션을 주면 된다.

```
java -XX:InitialRAMPercentage=50.0 -XX:MaxRAMPercentage=50.0 -jar dope.jar
```

Dockerfile 을 사용하는 경우 ENTRYPOINT 에 지정하면 된다.

```dockerfile
ENTRYPOINT [ ... 
    -XX:InitialRAMPercentage=50.0 \
    -XX:MaxRAMPercentage=50.0 \ 
    ...
]
```

## Quality of Service Classes and Node Pressure

QoS classes are used by Kubernetes to decide which Pods to evict from a Node experiencing [Node Pressure](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/).

__[Pod Quality of Service Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/)__:

| Pod QOS                                | oom score adj                                                                     |
|----------------------------------------|-----------------------------------------------------------------------------------|
| Guaranteed (request = limit)           | -997                                                                              |
| Burstable  (request < limit)           | min(max(2, 1000 - (1000 * memoryRequestBytes) / machineMemoryCapacityBytes), 999) |
| BestEffort (Not exists request, limit) | 1000                                                                              |

cAdvisor 는 cgroup 기반으로 모든 Container Resource 사용량을 측정하는 도구이다. The kubelet polls cAdvisor to collect memory usage stats at a regular interval.

oom score 는 0 ~ 1000 까지의 값을 갖는데, 값이 1000 이상이면 넘어가면 무조건 evict 되며, Guaranteed 는 -997로 값이 고정이기 때문에 OOM Killer 로 인해서 갑자기 Pod 가 죽는 상황은 발생하지 않는다.
BestEffort QoS 를 갖는 Pod 의 Container 는 OOM Killer 에 의해서 무조건 제거된다.

## Overcommit and Out of Resource

[Kubernetes 메모리와 스토리지의 Out of Resource - OOM Killer 와 포드의 우선순위에 대하여](https://m.blog.naver.com/alice_k106/221676471427)

Kubernetees 는 CPU, 메모리 등을 Resource 로 취급하는데 자원을 효율적으로 활용하기 위해 __overcommit__ 을 사용한다.
특정 Pod 가 Resource 를 Upper Limit 보다 덜 사용하고 있다면, 다른 Pod 가 리소스를 더 사용할 수 있도록 해주는 것이다.

More Articles. [vm.overcommit에 대한 짧은 이야기](https://brunch.co.kr/@alden/16)

## Deployment Resource and Scheduling

__Kubelet, Cluster, Node, Pod, Container__:

Kubernetes runs your workload by placing containers into Pods to run on [Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/). The components on a node include the kubelet, a container runtime, and the kube-proxy.

![](/resource/wiki/kubernetes-architecture/kubelet.png)

kubelet 은 각 Node 에 실행되는 에이전트로, Node 상태, Podspec 에 맞춰 Pod 들이 정상적으로 동작하는지 등을 확인한다. 이 때 cAdvisor 를 통해 수집한 정보를 활용한다.

__Deployment Resource and Scheduling:__

![](/resource/wiki/kubernetes-architecture/controller.png)

Pod 은 Worker Node 에서 실행된다.

- kubectl 을 사용하여 (api server 에) Deployment Resource 를 생성요청을 하면(etcd 에 기록)
- Deployment Controller 가 이를 감지(watch)하고 (api server 에) ReplicaSet Resource 생성 요청을 한다(etcd 에 기록).
- 이를 ReplicaSet Controller 가 감지(watch)하고 (api server 에) Pod Resource 생성 요청을 한다.(etcd 에 기록).
- Scheduler 는 이를 감지(watch)하고 Worker Node 에 Pod 를 할당한다.(etcd 에 기록)
- Kubelet 은 node 에 스케줄되는 pod 할당을 감지(watch)하고 pod 의 container 를 실행하고 api 서버에 보고한다.
