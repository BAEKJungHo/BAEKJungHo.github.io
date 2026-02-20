---
layout  : wiki
title   : Docker, Kubernetes
summary :
date    : 2026-02-15 15:54:32 +0900
updated : 2026-02-15 20:15:24 +0900
tag     : infra k8s docker helm
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Container vs VM

컨테이너와 가상머신의 근본적인 차이는 ***운영체제 커널을 공유하는가***에 있다.

***가상머신(VM)*** 은 하이퍼바이저 위에서 완전히 독립된 OS 커널을 실행한다. 각 VM은 자체 커널, 시스템 라이브러리, 바이너리를 가지며, 하드웨어를 에뮬레이션하거나 가상화한다(KVM, Xen, VMware ESXi). 이로 인해 무겁고 부팅이 느리지만, OS 레벨 격리가 강력하다.

***컨테이너***는 호스트 OS의 커널을 공유하면서 ***Linux 네임스페이스와 cgroups***를 통해 격리를 구현한다. 같은 커널을 사용하므로 가볍고 빠르게 시작되지만, 커널 레벨 취약점에는 VM보다 취약할 수 있다.

## Linux Namespaces

네임스페이스는 프로세스가 볼 수 있는 시스템 리소스를 제한한다. Docker는 다음 네임스페이스를 사용한다:

- ***PID namespace***: 각 컨테이너는 독립된 프로세스 트리를 가진다. 컨테이너 내부에서 PID 1은 실제 호스트에서는 다른 PID를 가진다. `ps aux`를 실행하면 컨테이너 내부에서는 자신의 프로세스만 보인다.
- ***Network namespace***: 각 컨테이너는 독립된 네트워크 스택(네트워크 인터페이스, 라우팅 테이블, iptables 규칙)을 가진다. Docker는 기본적으로 `veth` pair를 생성하여 컨테이너의 네트워크 네임스페이스와 호스트의 docker0 브리지를 연결한다.
- ***Mount namespace***: 각 컨테이너는 독립된 파일시스템 마운트 포인트를 가진다. 컨테이너가 파일시스템을 마운트하거나 언마운트해도 호스트나 다른 컨테이너에 영향을 주지 않는다.
- ***UTS namespace***: 각 컨테이너는 독립된 hostname과 domain name을 가진다.
- ***IPC namespace***: System V IPC, POSIX 메시지 큐를 격리한다. 컨테이너 간 공유 메모리 세그먼트가 분리된다.
- ***User namespace***: UID/GID 매핑을 통해 컨테이너 내부의 root(UID 0)를 호스트의 non-root 사용자로 매핑할 수 있다. Rootless container의 핵심 기술이다.
- ***Cgroup namespace*** (Linux 4.6+): cgroup 계층 구조를 격리하여 컨테이너가 자신의 cgroup 정보만 볼 수 있게 한다.

## Control Groups

cgroups는 프로세스 그룹의 리소스 사용량을 ***제한, 격리, 측정***한다.

***cgroups v1***은 각 리소스 타입(cpu, memory, blkio, net_cls 등)이 독립된 계층 구조를 가진다. 예를 들어 `/sys/fs/cgroup/cpu`와 `/sys/fs/cgroup/memory`가 별도로 존재한다.

***cgroups v2*** (unified hierarchy)는 단일 계층 구조를 사용하며, 모든 컨트롤러가 `/sys/fs/cgroup` 아래에 통합된다. v2는 더 일관된 인터페이스와 개선된 리소스 격리를 제공한다. Kubernetes 1.25부터 cgroups v2를 공식 지원한다.

주요 컨트롤러:
- ***cpu***: CPU 시간 할당 (cpu.shares, cpu.cfs_quota_us, cpu.cfs_period_us)
- ***memory***: 메모리 사용량 제한 (memory.limit_in_bytes, OOM killer 동작)
- ***blkio***: 블록 디바이스 I/O 제한
- ***pids***: 프로세스 개수 제한

## Union Filesystem

Docker는 ***레이어드 이미지 시스템***을 사용하여 저장 공간을 효율적으로 관리한다. 현재 권장되는 스토리지 드라이버는 ***overlay2***이다.

overlay2는 두 개의 디렉토리를 합쳐서 하나의 통합된 뷰를 제공한다:
- ***lowerdir***: 읽기 전용 레이어 (이미지 레이어들)
- ***upperdir***: 읽기-쓰기 레이어 (컨테이너 레이어)
- ***merged***: 통합된 뷰 (실제 컨테이너가 보는 파일시스템)
- ***workdir***: overlay2의 내부 작업용 디렉토리

컨테이너가 파일을 수정하면 ***copy-on-write*** 메커니즘이 동작한다. lowerdir의 파일을 수정하려 하면, 해당 파일이 upperdir로 복사된 후 수정된다.

```bash
# overlay2 마운트 구조 확인
mount | grep overlay
# overlay on /var/lib/docker/overlay2/.../merged type overlay (rw,relatime,lowerdir=...,upperdir=...,workdir=...)
```

## OCI Specification

> OCI는 컨테이너 런타임과 이미지 포맷의 표준을 정의한다.

- ***runtime-spec***: 컨테이너를 실행하는 방법 (config.json 형식, 프로세스 실행, 네임스페이스, cgroup 설정)
- ***image-spec***: 컨테이너 이미지 포맷 (레이어, 메타데이터, manifest)
- ***distribution-spec***: 이미지 배포 프로토콜

Docker는 내부적으로 ***containerd***를 컨테이너 런타임으로 사용하며, containerd는 ***runc*** (OCI runtime 구현체)를 통해 실제 컨테이너를 실행한다. Kubernetes도 containerd를 직접 사용할 수 있다 (CRI - Container Runtime Interface).

## Image Layering and Multi-stage Builds

***Image Layering***: Dockerfile의 각 명령어(RUN, COPY, ADD)는 새로운 레이어를 생성한다. 레이어는 읽기 전용이며, 이전 레이어 위에 쌓인다. 레이어는 SHA256 해시로 식별되어 재사용 가능하다.

```dockerfile
FROM ubuntu:22.04        # Layer 1
RUN apt-get update       # Layer 2
RUN apt-get install -y nginx  # Layer 3
COPY index.html /var/www/html # Layer 4
```

레이어 수를 줄이기 위해 RUN 명령을 체이닝한다:

```dockerfile
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
 && rm -rf /var/lib/apt/lists/*  # 캐시 삭제로 레이어 크기 감소
```

***Multi-stage Builds***: 빌드 환경과 런타임 환경을 분리하여 최종 이미지 크기를 줄인다.

```dockerfile
# Build stage
FROM golang:1.21 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o myapp

# Runtime stage
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/myapp .
CMD ["./myapp"]
```

위 예제에서 최종 이미지는 alpine 기반으로, Go 컴파일러와 소스코드는 포함되지 않는다. 이미지 크기가 수백 MB에서 수 MB로 감소한다.

## Container Security

***Rootless Containers***: 컨테이너를 non-root 사용자로 실행하여 컨테이너 탈출 시 호스트 피해를 최소화한다. User namespace를 사용하여 컨테이너 내부 root(UID 0)를 호스트의 일반 사용자(예: UID 1000)로 매핑한다.

```bash
# Rootless Docker 실행
dockerd-rootless.sh
```

***seccomp*** (Secure Computing Mode): 컨테이너가 사용할 수 있는 시스템 콜을 제한한다. Docker는 기본 seccomp 프로파일을 제공하며, 약 300개 이상의 시스템 콜 중 위험한 것들(예: keyctl, add_key, ptrace)을 차단한다.

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "syscalls": [
    {
      "names": ["read", "write", "open", "close"],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

***AppArmor/SELinux***: Mandatory Access Control(MAC) 시스템으로, 프로세스가 접근할 수 있는 파일, 네트워크, capability를 제한한다.

```bash
# AppArmor 프로파일로 컨테이너 실행
docker run --security-opt apparmor=docker-default nginx
```

***Capabilities***: Linux는 root 권한을 세분화된 capability로 나눈다 (CAP_NET_ADMIN, CAP_SYS_ADMIN 등). Docker는 기본적으로 일부 capability만 부여한다.

```bash
# 특정 capability 추가
docker run --cap-add=NET_ADMIN nginx
# 모든 capability 제거 후 필요한 것만 추가
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx
```

## Kubernetes Architecture

### Control Plane Components

Kubernetes 컨트롤 플레인은 클러스터의 두뇌 역할을 한다.

***kube-apiserver***: 모든 컴포넌트가 통신하는 중앙 API 서버. RESTful API를 제공하며, etcd에 상태를 저장한다. 인증(authentication), 인가(authorization), Admission Control을 수행한다. 수평 확장이 가능하며, 고가용성을 위해 여러 인스턴스를 실행한다.

***etcd***: 분산 key-value 저장소로, 클러스터의 모든 상태 정보를 저장한다. ***Raft 합의 알고리즘***을 사용하여 일관성을 보장한다. Raft는 리더 선출과 로그 복제를 통해 분산 시스템에서 합의를 이룬다. etcd 클러스터는 일반적으로 3, 5, 7개의 노드로 구성한다 (홀수 개로 구성하여 split-brain 방지). 과반수(quorum, (n/2)+1 노드)가 살아있어야 쓰기가 가능하다. 예: 3노드는 2개, 5노드는 3개 필요.

***kube-scheduler***: 새로 생성된 Pod을 어떤 노드에 배치할지 결정한다. 두 단계로 동작한다:

1. ***Filtering (Predicate)***: 조건을 만족하지 않는 노드를 제외한다.
   - NodeSelector, NodeAffinity, Taints/Tolerations
   - 리소스 요구사항 (requests/limits)
   - PV가 특정 노드에만 접근 가능한 경우

2. ***Scoring (Priority)***: 남은 노드들에 점수를 매겨 최적의 노드를 선택한다.
   - LeastRequestedPriority: 리소스 사용량이 적은 노드 선호
   - BalancedResourceAllocation: CPU와 메모리 사용률 균형
   - ImageLocalityPriority: 이미지가 이미 있는 노드 선호

***kube-controller-manager***: 여러 컨트롤러를 실행하는 단일 프로세스. 각 컨트롤러는 control loop를 돌며 desired state와 current state를 비교하여 reconcile한다.

- Node Controller: 노드 상태 모니터링, 응답 없는 노드 처리
- ReplicaSet Controller: Pod 개수 유지
- Deployment Controller: 롤링 업데이트 관리
- Service Controller: LoadBalancer 타입 Service의 외부 LB 프로비저닝
- EndpointSlice Controller: Service와 Pod 연결

***cloud-controller-manager***: 클라우드 제공자별 로직을 처리한다 (AWS, GCP, Azure). Node, Route, Service, Volume 관련 컨트롤러를 포함한다.

### Node Components

***kubelet***: 각 노드에서 실행되며, Pod과 컨테이너의 실제 실행을 담당한다. kube-apiserver와 통신하여 PodSpec을 받아오고, 컨테이너 런타임(containerd, CRI-O)을 통해 컨테이너를 시작한다. 노드와 Pod의 상태를 apiserver에 보고한다. Static Pod (apiserver 없이 로컬 파일에서 Pod 정의 읽기)를 지원한다.

***kube-proxy***: 각 노드에서 네트워크 규칙을 관리하여 Service 추상화를 구현한다. 두 가지 주요 모드가 있다:

***iptables 모드*** (기본):
- Service의 ClusterIP로 들어온 트래픽을 backend Pod들로 DNAT (Destination NAT)
- iptables 규칙을 사용하여 랜덤하게 Pod 선택
- 장점: 성능이 좋고 커널 스페이스에서 동작
- 단점: Service가 많아지면 iptables 규칙 수가 O(Services × Endpoints)로 증가하여 성능 저하. 규칙 업데이트가 느림 (sequential).

***IPVS 모드***:
- IP Virtual Server를 사용한 L4 로드밸런싱
- 해시 테이블 기반으로 O(1) lookup 성능
- 다양한 로드밸런싱 알고리즘 지원 (rr, lc, dh, sh, sed, nq)
- 장점: 대규모 클러스터(수천 개 Service)에서 iptables보다 훨씬 빠름
- 단점: 커널에 IPVS 모듈 필요, iptables보다 복잡

비교:
- 100개 Service: 두 모드 모두 성능 차이 미미
- 1000개 이상 Service: IPVS가 압도적으로 빠름
- IPVS 모드에서도 일부 iptables 규칙은 사용됨 (SNAT, masquerading)

***Container Runtime***: kubelet이 사용하는 컨테이너 실행 엔진. CRI (Container Runtime Interface) 표준을 따른다. containerd, CRI-O가 주로 사용된다. Docker는 Kubernetes 1.24부터 deprecated되었다 (dockershim 제거).

## Pod Lifecycle

Pod은 다음 단계를 거친다:

1. ***Pending***: Pod이 생성되었지만 아직 스케줄링되지 않았거나, 이미지를 다운로드 중이다.
2. ***Running***: Pod이 노드에 바인딩되고 모든 컨테이너가 생성되었다. 최소 하나의 컨테이너가 실행 중이다.
3. ***Succeeded***: 모든 컨테이너가 성공적으로 종료되었다. Job, CronJob에서 사용.
4. ***Failed***: 모든 컨테이너가 종료되었고, 최소 하나가 실패했다.
5. ***Unknown***: Pod 상태를 확인할 수 없다 (노드와 통신 불가).

추가로 ***CrashLoopBackOff***는 컨테이너가 반복적으로 실패하여 재시작 대기 중임을 나타낸다 (exponential backoff: 10s, 20s, 40s, ... 최대 5분).

## Networking Model

Kubernetes 네트워킹은 세 가지 기본 요구사항을 만족해야 한다:

1. ***모든 Pod은 NAT 없이 서로 통신할 수 있다*** (flat network)
2. ***노드는 NAT 없이 모든 Pod과 통신할 수 있다***
3. ***Pod이 보는 자신의 IP는 다른 Pod이 보는 그 Pod의 IP와 같다***

***CNI (Container Network Interface)***: 컨테이너 네트워크 설정을 위한 플러그인 인터페이스. kubelet은 CNI 플러그인을 호출하여 Pod에 네트워크를 설정한다.

주요 CNI 플러그인:
- ***Calico***: L3 네트워킹, BGP 라우팅, NetworkPolicy 지원. Overlay 없이 라우팅 가능 (성능 우수).
- ***Flannel***: 간단한 overlay 네트워크 (VXLAN, host-gw). 설정이 쉽지만 NetworkPolicy 미지원.
- ***Cilium***: eBPF 기반, L7 정책, 가시성, 보안. 최신 기술.
- ***Weave Net***: Mesh 네트워크, 암호화 지원.

***Pod-to-Pod 통신***: 동일 노드 내에서는 가상 브리지를 통해, 다른 노드 간에는 CNI 플러그인이 제공하는 라우팅/터널링을 통해 통신한다.

***Service 네트워킹***: Service는 가상 IP (ClusterIP)를 가지며, kube-proxy가 이를 backend Pod IP로 변환한다.

1. 클라이언트 Pod이 Service ClusterIP:Port로 요청
2. iptables/IPVS 규칙이 트래픽을 backend Pod IP로 DNAT
3. 응답은 SNAT되어 클라이언트로 돌아감

***DNS***: CoreDNS가 클러스터 내부 DNS를 제공한다. Service는 `<service-name>.<namespace>.svc.cluster.local` 형식의 DNS 이름을 가진다. Pod은 `/etc/resolv.conf`를 통해 CoreDNS를 사용한다.

## Service Types

***ClusterIP*** (기본): 클러스터 내부에서만 접근 가능한 가상 IP를 할당한다. 외부에서 직접 접근 불가.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 8080
```

***NodePort***: 모든 노드의 특정 포트 (30000-32767 범위)를 열어서 외부 트래픽을 받는다. `<NodeIP>:<NodePort>`로 접근 가능. 내부적으로 ClusterIP도 생성된다.

```yaml
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080  # 생략 시 자동 할당
```

***LoadBalancer***: 클라우드 제공자의 외부 로드밸런서를 프로비저닝한다 (AWS ELB, GCP Load Balancer). cloud-controller-manager가 실제 LB를 생성하고, 외부 IP를 Service에 할당한다. NodePort와 ClusterIP도 자동 생성된다.

***ExternalName***: 외부 DNS 이름을 Service로 매핑한다. CNAME 레코드를 반환한다. Selector가 없으며, 실제 Endpoint가 없다.

```yaml
spec:
  type: ExternalName
  externalName: my.database.example.com
```

***Headless Service***: ClusterIP를 `None`으로 설정하면, Service는 가상 IP를 가지지 않고 DNS가 Pod IP들을 직접 반환한다. StatefulSet과 함께 사용하여 각 Pod에 안정적인 DNS 이름을 부여한다 (`<pod-name>.<service-name>.<namespace>.svc.cluster.local`).

## Ingress

Ingress는 HTTP/HTTPS 라우팅을 제공하여 여러 Service를 단일 진입점으로 노출한다. Ingress Controller (nginx-ingress, Traefik, HAProxy, AWS ALB Ingress Controller 등)가 실제 라우팅을 수행한다.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
  tls:
  - hosts:
    - myapp.example.com
    secretName: tls-secret
```

***IngressClass***: Kubernetes 1.18+에서 여러 Ingress Controller를 구분하기 위해 도입되었다. `ingressClassName` 필드로 지정한다.

## Helm

Helm은 Kubernetes의 패키지 매니저로, 복잡한 애플리케이션을 ***Chart***라는 단위로 관리한다.

### Chart Structure

```
mychart/
  Chart.yaml          # 차트 메타데이터
  values.yaml         # 기본 설정값
  charts/             # 의존성 차트 (subcharts)
  templates/          # Kubernetes 매니페스트 템플릿
    deployment.yaml
    service.yaml
    ingress.yaml
    _helpers.tpl      # 재사용 가능한 템플릿 함수
  .helmignore         # 패키징 시 제외할 파일
```

***Chart.yaml***:

```yaml
apiVersion: v2
name: mychart
version: 1.0.0        # Chart 버전 (SemVer)
appVersion: "2.0.0"   # 애플리케이션 버전
description: A Helm chart for my application
dependencies:
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```

***values.yaml***: 사용자가 커스터마이징할 수 있는 설정값을 정의한다.

```yaml
replicaCount: 3

image:
  repository: myapp
  tag: "1.0.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  className: nginx
  hosts:
    - host: myapp.local
      paths:
        - path: /
          pathType: Prefix

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Template Engine

Helm은 ***Go template***과 ***Sprig 함수 라이브러리***를 사용한다.

***templates/deployment.yaml***:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "mychart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "mychart.selectorLabels" . | nindent 8 }}
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - containerPort: 8080
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
```

***templates/_helpers.tpl***: 재사용 가능한 템플릿 함수를 정의한다.

```yaml
{{/*
Full name 생성
*/}}
{{- define "mychart.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "mychart.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "mychart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
```

주요 내장 객체:
- `.Values`: values.yaml의 값
- `.Chart`: Chart.yaml의 메타데이터
- `.Release`: 릴리스 정보 (Name, Namespace, IsUpgrade, IsInstall)
- `.Files`: 차트 내 파일 접근
- `.Capabilities`: Kubernetes 클러스터 정보 (API 버전 등)

주요 Sprig 함수:
- `default`: 기본값 지정
- `quote`, `squote`: 따옴표 추가
- `upper`, `lower`, `title`: 문자열 변환
- `trim`, `trimSuffix`: 공백/접미사 제거
- `b64enc`, `b64dec`: Base64 인코딩/디코딩
- `toYaml`, `toJson`: 구조체를 YAML/JSON으로 변환

### Release Lifecycle

***Install***: 새 릴리스를 생성한다.

```bash
helm install myrelease ./mychart -f custom-values.yaml
```

***Upgrade***: 기존 릴리스를 업데이트한다. Helm은 이전 리비전을 저장하여 롤백이 가능하다.

```bash
helm upgrade myrelease ./mychart --set replicaCount=5
```

***Rollback***: 이전 리비전으로 되돌린다.

```bash
helm rollback myrelease 1  # 리비전 1로 롤백
```

***Uninstall***: 릴리스를 삭제한다.

```bash
helm uninstall myrelease
```

Helm은 릴리스 정보를 ***Secret***으로 저장한다 (Helm 3 기준). `kubectl get secrets -n <namespace> -l owner=helm`으로 확인 가능하다.

### Hooks

Helm Hook은 릴리스 라이프사이클의 특정 시점에 리소스를 실행한다.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "mychart.fullname" . }}-migration
  annotations:
    "helm.sh/hook": pre-upgrade
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: myapp:{{ .Values.image.tag }}
        command: ["python", "manage.py", "migrate"]
      restartPolicy: Never
```

주요 Hook:
- `pre-install`, `post-install`
- `pre-upgrade`, `post-upgrade`
- `pre-delete`, `post-delete`
- `pre-rollback`, `post-rollback`

`helm.sh/hook-weight`: 같은 Hook 내에서 실행 순서 지정 (낮을수록 먼저 실행)
`helm.sh/hook-delete-policy`: Hook 리소스 삭제 시점 (hook-succeeded, hook-failed, before-hook-creation)

### Chart Dependencies

Chart.yaml에 의존성을 선언하고, `helm dependency update`로 다운로드한다.

```yaml
dependencies:
  - name: redis
    version: 17.x.x
    repository: https://charts.bitnami.com/bitnami
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled  # values.yaml의 조건으로 활성화 제어
```

values.yaml에서 subchart 값을 오버라이드:

```yaml
postgresql:
  enabled: true
  auth:
    username: myapp
    password: secretpassword
    database: myappdb
```

## Resource Management

Kubernetes에서 리소스 관리는 ***requests***와 ***limits***로 이루어진다.

### CPU Requests and Limits

- ***CPU requests***: Pod이 필요로 하는 최소 CPU 양. 스케줄러가 노드를 선택할 때 사용한다. 노드의 allocatable CPU에서 이미 할당된 requests를 빼서 여유가 있는 노드에 배치한다.
- ***CPU limits***: Pod이 사용할 수 있는 최대 CPU 양. 이를 초과하면 ***throttling***된다.

CPU는 ***밀리코어(millicores)*** 단위로 표현한다:
- `1000m` = `1` = 1 CPU 코어
- `500m` = 0.5 CPU 코어
- `100m` = 0.1 CPU 코어

### Linux CFS and CPU Throttling

Kubernetes는 Linux cgroups의 ***CFS (Completely Fair Scheduler)*** 를 사용하여 CPU를 제한한다.

cgroup의 CPU 컨트롤러는 두 파일로 제한을 설정한다:
- **cpu.cfs_period_us**: 스케줄링 주기 (기본값: 100000, 즉 100ms)
- **cpu.cfs_quota_us**: 주기당 사용 가능한 CPU 시간 (마이크로초)

예: CPU limit이 `500m` (0.5 CPU)인 경우:
- `cpu.cfs_period_us` = 100000 (100ms)
- `cpu.cfs_quota_us` = 50000 (50ms)

즉, 100ms마다 최대 50ms의 CPU 시간만 사용할 수 있다. 컨테이너가 50ms를 다 쓰면, 남은 50ms 동안은 ***throttled*** 상태가 되어 실행되지 않는다.

***Multi-threaded 환경에서의 Throttling***: 여러 스레드가 동시에 실행되는 경우, 모든 스레드의 CPU 사용 시간 합이 quota에 계산된다. 예를 들어 4-core 시스템에서 500m limit을 가진 컨테이너가 4개 스레드를 실행하면, 각 스레드가 100ms 주기 동안 약 12.5ms씩 실행될 수 있다.

CPU Throttling은 K8s의 `resources.limits.cpu` 설정 때문에 발생한다.
- 현상
  - 애플리케이션이 CPU limit을 초과하려 할 때
  - 멀티스레드 애플리케이션에서 여러 스레드가 합쳐서 limit을 초과할 때
- 의미: 컨테이너가 정해진 시간(Quota) 동안 사용할 수 있는 CPU 양을 모두 소진했을 때, 리눅스 커널(CFS 스케줄러)이 강제로 해당 컨테이너의 CPU 사용을 중단시키는 현상이다.
- K8s 상황: 노드에 CPU 자원이 남아돌더라도, 컨테이너가 설정된 limit을 넘어서면 가차 없이 발생합니다.
- GC에 미치는 영향: GC가 실행될 때 병렬로 작업을 처리해야 하는데, 도중에 Throttling이 걸리면 GC 스레드가 멈춰버린다. 이로 인해 실제 청소할 양은 적어도 STW(Stop-The-World) 시간이 비정상적으로 길어지게 된다.
- 해결책: CPU limits를 상향하거나 제거

Throttling 확인:

```bash
# cgroup 경로에서 throttling 통계 확인
cat /sys/fs/cgroup/cpu/kubepods/.../cpu.stat
# nr_periods: 총 period 수
# nr_throttled: throttled된 period 수
# throttled_time: throttled된 총 시간 (나노초)
```

***CPU requests는 throttling에 영향을 주지 않는다***. Requests는 스케줄링과 우선순위에만 사용되며, limits만이 실제 CPU 사용량을 제한한다.

### CPU Starvation

CPU Starvation은 프로세스가 일을 하고 싶어도 실행될 CPU 자원 자체를 할당받지 못하는 상황을 의미한다. 즉, 노드 전체의 자원 부족 및 경합이 주된 원인이다.

- 의미: 스레드가 'Runable(실행 대기)' 상태임에도 불구하고, OS 스케줄러가 CPU를 할당해주지 않아 실제로 일을 하지 못하고 굶고(Starving) 있는 상태이다. 즉, 스레드가 CPU 차례를 계속 기다린다.
- K8s 상황: * 노드 전체의 CPU 사용률이 100%에 도달하여 다른 컨테이너들과의 경쟁에서 밀릴 때.
- requests는 낮게 잡고 limits는 높게 잡은 'Burstable' 등급의 Pod들이 한 노드에 몰려 자원 경합이 심할 때 발생한다.
- GC에 미치는 영향: GC 스레드가 CPU를 점유하려고 하지만, OS가 다른 급한 일(다른 컨테이너나 커널 작업 등)을 처리하느라 GC 스레드를 뒤로 미룬다. 결과적으로 GC 수행 속도가 현저히 느려진다.
- 해결책: 노드 증설(Scaling) 또는 Pod 재배치

### K8S Scheduling

__K8s의 스케줄링 원칙: "Request 기준"__:
- K8s 스케줄러가 Pod를 어느 노드에 배치할지 결정할 때, limits는 아예 보지 않습니다. 오직 requests 값만 보고 노드의 여유 공간을 계산한다.
- 노드 사양: CPU 8 Core
- Pod 설정: requests: 1 / limits: 4 (Burstable 등급)
- 결과: 스케줄러는 이 노드에 위와 같은 Pod를 8개나 배치할 수 있다고 판단

모든 Pod가 평소에 CPU를 1 Core 미만으로 사용한다면 아무 문제가 없다. 남는 자원(Idle CPU)이 많기 때문에, 특정 Pod가 잠깐 바빠져서 1 Core 이상(Limit인 4 Core 근처까지) 사용하더라도 노드는 이를 수용할 수 있습니다. 이것이 Burstable 등급의 장점인 **'유연한 자원 활용'** 이다.

문제는 갑자기 모든 Pod가 동시에 바빠질 때 발생합니다. 예를 들어, 특정 시점에 8개의 Pod가 일제히 트래픽을 받거나 GC(Garbage Collection)를 수행한다고 가정해 보자.

- 8개의 Pod가 각각 자신의 limits인 4 Core를 쓰겠다고 손을 든다.
- 전체 요구량은 32 Core 된다.
- 하지만 물리적인 노드의 자원은 여전히 8 Core 이다.

이때 리눅스 커널의 스케줄러(CFS)가 개입한다. 자원이 부족하면 커널은 각 Pod가 보장받은 requests 비율에 맞춰 자원을 쪼개서 분배한다.
- 결과: 각 Pod는 4 Core를 쓰고 싶어 하지만, 실제로는 1 Core 내외의 자원만 할당받게 된다.
- 현상: 애플리케이션 입장에서는 limits까지 쓸 수 있다고 설정되어 있는데, 실제 CPU 연산 속도는 평소보다 훨씬 느려진다.
- 특히 GC 스레드들이 CPU를 점유해서 빨리 청소를 끝내야 하는데, 다른 Pod들과의 경쟁 때문에 CPU 차례가 오지 않아 STW(Stop-The-World) 시간이 수 배로 늘어난다.
- 이것이 바로 CPU Starvation 이다.

만약 특정 시점에 모든 Pod의 응답 속도가 느려지고 GC 시간이 튀고 있다면, 다음을 확인해야 한다.
- Node CPU Utilization: 노드 전체 사용률이 100%에 근접했는가? (Starvation 의심)
- CPU Throttling Metric: `container_cpu_cfs_throttled_seconds_total` 이 증가했는가? (Limit 도달 의심)

__중요한 서비스라면 requests와 limits를 동일하게 설정하는 Guaranteed 등급을 사용하여 자원을 점유(Reserved)하는 것이 가장 안전하다.__

### Memory Requests and Limits

***Memory requests***: Pod이 필요로 하는 최소 메모리 양. 스케줄러가 이를 기준으로 노드를 선택한다.

***Memory limits***: Pod이 사용할 수 있는 최대 메모리 양. 이를 초과하면 ***OOM (Out Of Memory) Killer***가 컨테이너를 강제 종료한다.

메모리는 바이트 단위로 표현하며, 다음 접미사를 사용한다:
- `128974848`, `129e6`, `129M`, `128Mi` (Mebibyte, 1Mi = 1024Ki)
- `1Gi` = 1024Mi = 1073741824 bytes

***CPU와 달리 메모리는 압축 불가능한 리소스***다. CPU는 throttling으로 제한할 수 있지만, 메모리는 한번 할당하면 회수하기 어렵다. 따라서 메모리 limit 초과 시 컨테이너를 죽이는 것이 유일한 방법이다.

***OOM Killer***: Linux 커널은 시스템 메모리가 부족하면 프로세스를 강제 종료한다. 각 프로세스는 `oom_score`를 가지며, 점수가 높을수록 먼저 종료된다. Kubernetes는 QoS 클래스에 따라 `oom_score_adj`를 조정한다:
- Guaranteed: -997 (거의 안 죽음)
- Burstable: min(max(2, 1000 - (1000 * memoryRequestBytes) / machineMemoryCapacityBytes), 999)
- BestEffort: 1000 (제일 먼저 죽음)

### QoS Classes

Kubernetes는 Pod의 리소스 설정에 따라 세 가지 QoS 클래스를 자동으로 부여한다.

***Guaranteed***: 모든 컨테이너가 requests와 limits를 동일하게 설정하고, CPU와 메모리 모두 설정한 경우.

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "500m"    # requests와 동일
    memory: "512Mi"  # requests와 동일
```

- 가장 높은 우선순위
- 노드 리소스 부족 시 가장 나중에 evict됨
- OOM 점수가 가장 낮음

***Burstable***: Guaranteed 조건을 만족하지 않지만, 최소 하나의 컨테이너가 requests 또는 limits를 설정한 경우.

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "1000m"   # requests보다 큼
    memory: "1Gi"
```

- 중간 우선순위
- requests 이상의 리소스를 사용할 수 있지만, 노드 리소스 부족 시 BestEffort 다음으로 evict됨
- OOM 점수는 메모리 사용량에 비례

***BestEffort***: 어떤 컨테이너도 requests나 limits를 설정하지 않은 경우.

```yaml
resources: {}  # 리소스 미설정
```

- 가장 낮은 우선순위
- 노드 리소스 부족 시 제일 먼저 evict됨
- OOM 점수가 가장 높음

### Helm values.yaml Example

```yaml
resources:
  requests:
    cpu: "500m"      # 0.5 CPU 코어 요청
    memory: "512Mi"  # 512 MiB 메모리 요청
  limits:
    cpu: "1000m"     # 최대 1 CPU 코어
    memory: "1Gi"    # 최대 1 GiB 메모리
```

템플릿에서 사용:

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
```

### LimitRange

네임스페이스 레벨에서 Pod/컨테이너의 리소스 기본값, 최소값, 최대값을 설정한다.

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: cpu-mem-limit-range
  namespace: myapp
spec:
  limits:
  - max:
      cpu: "2"
      memory: "2Gi"
    min:
      cpu: "100m"
      memory: "128Mi"
    default:  # limits 기본값
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:  # requests 기본값
      cpu: "250m"
      memory: "256Mi"
    type: Container
```

리소스를 명시하지 않은 Pod은 자동으로 default 값을 받는다.

### ResourceQuota

네임스페이스의 전체 리소스 사용량을 제한한다.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: myapp
spec:
  hard:
    requests.cpu: "10"        # 총 CPU requests 합계 10 코어
    requests.memory: "20Gi"   # 총 메모리 requests 합계 20Gi
    limits.cpu: "20"          # 총 CPU limits 합계 20 코어
    limits.memory: "40Gi"     # 총 메모리 limits 합계 40Gi
    pods: "50"                # 최대 50개 Pod
    services: "10"            # 최대 10개 Service
    persistentvolumeclaims: "5"  # 최대 5개 PVC
```

ResourceQuota가 있는 네임스페이스에서는 ***모든 Pod이 requests/limits를 명시해야 한다*** (그렇지 않으면 생성 거부됨).

## Health Probes

Kubernetes는 세 가지 프로브를 통해 컨테이너의 상태를 모니터링한다.

### livenessProbe

컨테이너가 살아있는지 확인한다. 실패하면 kubelet이 컨테이너를 ***재시작***한다.

***사용 목적***:
- 데드락 상태에서 복구
- 응답 불가 상태의 컨테이너 재시작
- 메모리 누수로 인한 성능 저하 시 재시작

***주의사항***:
- 너무 짧은 `initialDelaySeconds`와 `periodSeconds`는 정상 컨테이너를 죽일 수 있음
- 외부 의존성(DB, 캐시)을 체크하면 안 됨 (의존성 문제로 컨테이너가 재시작되면 안 됨)
- ***CrashLoopBackOff 위험***: liveness 실패 → 재시작 → 아직 준비 안 됨 → liveness 실패 → 재시작 무한 반복

### readinessProbe

컨테이너가 트래픽을 받을 준비가 되었는지 확인한다. 실패하면 해당 Pod을 ***Service의 Endpoint에서 제거***한다 (트래픽 차단). 컨테이너는 재시작되지 않는다.

***사용 목적***:
- 애플리케이션 초기화 완료 대기 (DB 연결, 캐시 워밍업 등)
- 일시적 과부하 상태에서 트래픽 차단
- 외부 의존성 문제 시 트래픽 중단

***주의사항***:
- 모든 Pod의 readiness가 동시에 실패하면 Service 다운
- 외부 의존성 체크 시 신중하게 (DB 다운 시 모든 Pod이 unready되면 안 됨)

### startupProbe

느리게 시작하는 컨테이너를 위해 초기 시작 시간을 확보한다. startupProbe가 성공하기 전까지는 ***liveness와 readiness가 비활성화***된다.

***사용 목적***:
- JVM 애플리케이션처럼 시작이 느린 경우 (30초 ~ 수분)
- 대용량 데이터 로딩이 필요한 경우
- liveness의 `initialDelaySeconds`를 너무 길게 설정하지 않기 위해

***작동 방식***:
- startupProbe가 성공하면 liveness, readiness가 활성화됨
- startupProbe가 `failureThreshold * periodSeconds` 시간 내에 성공하지 못하면 컨테이너 재시작

### Probe Types

***httpGet***: HTTP GET 요청을 보내서 200-399 응답 코드를 받으면 성공.

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
    httpHeaders:
    - name: Custom-Header
      value: Awesome
  initialDelaySeconds: 3
  periodSeconds: 3
```

***tcpSocket***: TCP 소켓 연결을 시도하여 연결되면 성공.

```yaml
readinessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

***exec***: 컨테이너 내부에서 명령을 실행하여 exit code 0이면 성공.

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```

***gRPC*** (Kubernetes 1.24+): gRPC health check 프로토콜 사용.

```yaml
livenessProbe:
  grpc:
    port: 9090
  initialDelaySeconds: 5
```

### Probe Parameters

- **initialDelaySeconds**: 컨테이너 시작 후 프로브를 시작하기까지 대기 시간 (기본값: 0). startupProbe가 있으면 liveness/readiness는 이 값을 작게 설정해도 됨.
- **periodSeconds**: 프로브 실행 주기 (기본값: 10초). 너무 짧으면 오버헤드, 너무 길면 장애 감지가 느림.
- **timeoutSeconds**: 프로브 타임아웃 (기본값: 1초). 애플리케이션이 느리면 늘려야 함.
- **successThreshold**: 실패 후 성공으로 간주하기 위한 연속 성공 횟수 (기본값: 1). liveness와 startupProbe는 1만 허용.
- **failureThreshold**: 성공 후 실패로 간주하기 위한 연속 실패 횟수 (기본값: 3).

### Complete Helm values.yaml Example

```yaml
# Spring Boot 애플리케이션 예제
image:
  repository: myapp
  tag: "1.0.0"
  pullPolicy: IfNotPresent

replicaCount: 3

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

resources:
  requests:
    cpu: "500m"
    memory: "768Mi"
  limits:
    cpu: "2000m"
    memory: "2Gi"

# 프로브 설정
probes:
  # Startup probe: JVM 시작에 최대 120초 소요 가능
  startup:
    enabled: true
    httpGet:
      path: /actuator/health/liveness
      port: 8080
    initialDelaySeconds: 0
    periodSeconds: 10
    timeoutSeconds: 3
    failureThreshold: 12  # 10s * 12 = 120s 최대 대기
    successThreshold: 1

  # Liveness probe: 데드락 감지
  liveness:
    enabled: true
    httpGet:
      path: /actuator/health/liveness
      port: 8080
    initialDelaySeconds: 0  # startupProbe 이후에 시작되므로 0
    periodSeconds: 10
    timeoutSeconds: 3
    failureThreshold: 3  # 30초(10*3) 연속 실패 시 재시작
    successThreshold: 1

  # Readiness probe: 트래픽 수신 가능 여부
  readiness:
    enabled: true
    httpGet:
      path: /actuator/health/readiness
      port: 8080
    initialDelaySeconds: 0
    periodSeconds: 5
    timeoutSeconds: 3
    failureThreshold: 3  # 15초(5*3) 연속 실패 시 트래픽 차단
    successThreshold: 1

# Graceful shutdown 설정
lifecycle:
  preStop:
    exec:
      command:
      - sh
      - -c
      - sleep 15  # kube-proxy가 iptables 업데이트할 시간 확보

terminationGracePeriodSeconds: 30
```

템플릿에서 사용:

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      terminationGracePeriodSeconds: {{ .Values.terminationGracePeriodSeconds }}
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: 8080
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
        {{- if .Values.probes.startup.enabled }}
        startupProbe:
          {{- toYaml .Values.probes.startup.httpGet | nindent 10 }}
          initialDelaySeconds: {{ .Values.probes.startup.initialDelaySeconds }}
          periodSeconds: {{ .Values.probes.startup.periodSeconds }}
          timeoutSeconds: {{ .Values.probes.startup.timeoutSeconds }}
          failureThreshold: {{ .Values.probes.startup.failureThreshold }}
        {{- end }}
        {{- if .Values.probes.liveness.enabled }}
        livenessProbe:
          {{- toYaml .Values.probes.liveness.httpGet | nindent 10 }}
          initialDelaySeconds: {{ .Values.probes.liveness.initialDelaySeconds }}
          periodSeconds: {{ .Values.probes.liveness.periodSeconds }}
          timeoutSeconds: {{ .Values.probes.liveness.timeoutSeconds }}
          failureThreshold: {{ .Values.probes.liveness.failureThreshold }}
        {{- end }}
        {{- if .Values.probes.readiness.enabled }}
        readinessProbe:
          {{- toYaml .Values.probes.readiness.httpGet | nindent 10 }}
          initialDelaySeconds: {{ .Values.probes.readiness.initialDelaySeconds }}
          periodSeconds: {{ .Values.probes.readiness.periodSeconds }}
          timeoutSeconds: {{ .Values.probes.readiness.timeoutSeconds }}
          failureThreshold: {{ .Values.probes.readiness.failureThreshold }}
        {{- end }}
        {{- if .Values.lifecycle }}
        lifecycle:
          {{- toYaml .Values.lifecycle | nindent 10 }}
        {{- end }}
```

### Common Pitfalls

***너무 공격적인 liveness probe***: `initialDelaySeconds: 5, periodSeconds: 5, failureThreshold: 1`로 설정하면, 5초 시작 대기 후 단 한 번 실패해도 재시작된다. 이는 일시적 네트워크 지연에도 컨테이너를 죽일 수 있다. `failureThreshold: 3` 이상 권장.

***startupProbe 미사용***: JVM 애플리케이션이 60초 걸려 시작되는데 `livenessProbe.initialDelaySeconds: 60`으로 설정하면, 재시작 후 60초 동안 데드락을 감지하지 못한다. startupProbe를 사용하면 시작 시에만 오래 기다리고, 이후 liveness는 빠르게 동작한다.

***readiness에 외부 의존성 포함***: DB가 다운되면 모든 Pod의 readiness가 실패하여 전체 Service가 다운될 수 있다. readiness는 해당 Pod 자체의 준비 상태만 체크해야 한다.

## High-Traffic Environment

일일 1000만 건 이상의 트래픽을 처리하는 환경에서는 신중한 용량 계획과 자동화가 필수다. 다만, ***구체적인 수치는 애플리케이션 특성에 따라 크게 달라진다***.

### Pod Count Estimation

***1. 트래픽 분석***

일일 요청 수를 평균 RPS(Requests Per Second)로 변환:
- 평균 RPS = 10,000,000 / 86400 ≈ 116 RPS

하지만 실제 트래픽은 균일하지 않다. ***피크 타임 배율***을 고려해야 한다:
- 전자상거래: 저녁 시간대 2~4배 증가
- B2B SaaS: 업무 시간대 3~5배 증가
- 글로벌 서비스: 시간대별 변동 작음 (1.5~2배)

예: 피크 배율 3배 가정
- 피크 RPS = 116 × 3 ≈ 350 RPS

추가 여유 (버퍼): 예상치 못한 트래픽 증가, 마케팅 이벤트 등을 고려하여 20~50% 여유 확보
- 목표 RPS = 350 × 1.3 ≈ 450 RPS

***2. 단일 Pod 처리 용량 측정***

***Pod당 처리 용량은 애플리케이션 유형에 따라 크게 다르다***:

- **경량 API (Node.js, Go, Rust)**:
  - 단순 CRUD, 인메모리 캐시 사용
  - CPU-bound가 아닌 I/O-bound
  - 예상 처리량: 200~500 RPS per Pod
  - 리소스: CPU 200m~500m, Memory 256Mi~512Mi

- **중량 API (Spring Boot, Django)**:
  - DB 쿼리, 외부 API 호출 포함
  - 복잡한 비즈니스 로직
  - 예상 처리량: 30~100 RPS per Pod
  - 리소스: CPU 500m~1000m, Memory 512Mi~1Gi

- **CPU 집약적 (데이터 처리, ML 추론)**:
  - 계산량이 많은 작업
  - 예상 처리량: 10~50 RPS per Pod
  - 리소스: CPU 1000m~2000m, Memory 1Gi~4Gi

***실제 성능은 부하 테스트로 측정해야 한다***:

```bash
# 부하 테스트 도구 예시
# k6, Apache Bench, Gatling, Locust 등 사용
k6 run --vus 100 --duration 30s loadtest.js
```

측정 시 확인할 메트릭:
- **Throughput**: 초당 처리 요청 수 (RPS)
- **Latency**: p50, p95, p99 응답 시간
- **Error Rate**: 에러 비율
- **CPU/Memory Usage**: 리소스 사용률

***3. Pod 수 계산***

Spring Boot API 예시 (Pod당 50 RPS 처리 가능):
- 필요 Pod 수 = 450 RPS / 50 RPS = 9 Pods

Go API 예시 (Pod당 300 RPS 처리 가능):
- 필요 Pod 수 = 450 RPS / 300 RPS = 1.5 ≈ 2 Pods

***중요***: 이는 초기 예측치일 뿐이다. 실제 운영에서는:
- 부하 테스트로 검증
- HPA로 자동 스케일링
- 메트릭 모니터링으로 지속적 최적화

### HPA (Horizontal Pod Autoscaler)

HPA는 메트릭 기반으로 Pod 수를 자동으로 조정한다.

***기본 CPU 기반 HPA***:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # 평균 CPU 70% 유지
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # 5분 동안 안정화 후 scale down
      policies:
      - type: Percent
        value: 50  # 한 번에 최대 50% 감소
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0  # 즉시 scale up
      policies:
      - type: Percent
        value: 100  # 한 번에 최대 100% (2배) 증가
        periodSeconds: 60
      - type: Pods
        value: 5  # 또는 한 번에 최대 5개 추가
        periodSeconds: 60
      selectPolicy: Max  # 두 정책 중 더 공격적인 것 선택
```

***커스텀 메트릭 기반 HPA*** (Prometheus 연동):

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa-custom
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 5
  maxReplicas: 50
  metrics:
  # CPU 메트릭
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  # 메모리 메트릭
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  # Prometheus 커스텀 메트릭: RPS
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"  # Pod당 평균 100 RPS 유지
  # Prometheus 커스텀 메트릭: 응답 시간
  - type: Pods
    pods:
      metric:
        name: http_request_duration_p99
      target:
        type: AverageValue
        averageValue: "500m"  # p99 응답시간 500ms 이하 유지
```

***HPA 작동 원리***:
1. metrics-server (또는 Prometheus adapter)에서 메트릭 수집
2. 현재 메트릭 값과 목표 값을 비교
3. 필요 replica 수 계산: `ceil(현재_replica * (현재_메트릭 / 목표_메트릭))`
4. `minReplicas`와 `maxReplicas` 범위 내에서 조정
5. `behavior` 설정에 따라 스케일링 속도 제어

***주의사항***:
- CPU/메모리 기반 HPA는 requests를 설정해야 동작함
- 여러 메트릭 사용 시, 각각 계산한 replica 수 중 최대값 사용
- 너무 빠른 scale down은 flapping(진동) 유발 → `stabilizationWindowSeconds` 설정

### VPA (Vertical Pod Autoscaler)

VPA는 Pod의 CPU/메모리 requests와 limits를 자동으로 조정한다.

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  updatePolicy:
    updateMode: "Auto"  # Off, Initial, Recreate, Auto
  resourcePolicy:
    containerPolicies:
    - containerName: myapp
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 4Gi
      controlledResources: ["cpu", "memory"]
```

***Update Modes***:
- **Off**: 권장 값만 계산, 자동 적용 안 함
- **Initial**: Pod 생성 시에만 적용
- **Recreate**: Pod을 재시작하여 적용 (downtime 발생)
- **Auto**: In-place 업데이트 (실험적 기능, 아직 안정적이지 않음)

***HPA vs VPA***:
- HPA: Pod 수를 늘림 (scale out)
- VPA: Pod 크기를 키움 (scale up)
- ***HPA와 VPA를 CPU/메모리 메트릭으로 동시 사용하면 충돌 가능*** (서로 다른 방향으로 스케일링)
- 권장: HPA로 수평 확장, VPA는 "Off" 모드로 권장 값만 확인하여 수동 조정

### Cluster Autoscaler

노드 레벨에서 클러스터 크기를 자동 조정한다.

***작동 원리***:
1. Pod이 리소스 부족으로 Pending 상태가 됨
2. Cluster Autoscaler가 새 노드를 프로비저닝 (클라우드 제공자 API 호출)
3. 노드가 추가되면 스케줄러가 Pending Pod을 배치
4. 노드 사용률이 낮으면 (보통 50% 이하) 노드를 제거

***HPA + Cluster Autoscaler 조합***:
1. HPA가 Pod 수를 늘림
2. 노드 리소스 부족으로 Pod이 Pending
3. Cluster Autoscaler가 노드 추가
4. Pod이 새 노드에 스케줄링

### PodDisruptionBudget

자발적 중단(voluntary disruption) 시 최소 가용 Pod 수를 보장한다.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 2  # 최소 2개 Pod은 항상 Running
  # 또는 maxUnavailable: 1  # 최대 1개까지만 중단 허용
  selector:
    matchLabels:
      app: myapp
```

***Voluntary disruption*** (PDB 적용됨):
- 노드 드레인 (kubectl drain)
- Cluster Autoscaler에 의한 노드 제거
- 롤링 업데이트

***Involuntary disruption*** (PDB 적용 안 됨):
- 하드웨어 장애
- 커널 패닉
- OOM killer
- 네트워크 파티션

고가용성을 위해 `minAvailable`을 전체 replica의 50~80%로 설정한다. 예: replica 10개면 `minAvailable: 7`.

### Pod Topology Spread Constraints

Pod을 여러 노드, AZ(Availability Zone), 리전에 분산한다.

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      topologySpreadConstraints:
      # AZ 간 분산
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: myapp
      # 노드 간 분산
      - maxSkew: 1
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app: myapp
```

- **maxSkew**: topology 간 Pod 수 차이의 최대값. 1이면 최대 1개 차이까지 허용.
- **topologyKey**: 노드 레이블 키. 이 키의 값이 같은 노드들을 하나의 topology로 간주.
- **whenUnsatisfiable**: 제약 위반 시 동작
  - `DoNotSchedule`: 스케줄링 거부 (hard constraint)
  - `ScheduleAnyway`: 가능하면 따르지만 필요 시 위반 허용 (soft constraint)

### Recommended Production Configuration

***Deployment 예시***:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 10  # 초기 replica 수 (HPA가 조정)
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0   # 무중단 배포
      maxSurge: 25%       # 최대 25% 추가 Pod 생성
  template:
    metadata:
      labels:
        app: myapp
        version: v1.0.0
    spec:
      # Topology spread
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: myapp

      # Graceful shutdown
      terminationGracePeriodSeconds: 60

      containers:
      - name: myapp
        image: myapp:1.0.0
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP

        # 리소스 설정 (Burstable QoS)
        resources:
          requests:
            cpu: "1000m"
            memory: "1Gi"
          limits:
            cpu: "2000m"
            memory: "2Gi"

        # 헬스 프로브
        startupProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          periodSeconds: 10
          failureThreshold: 18  # 180초 대기
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          periodSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          periodSeconds: 5
          failureThreshold: 3

        # Graceful shutdown
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 15

        # 환경변수
        env:
        - name: JAVA_OPTS
          value: "-Xmx1536m -Xms1536m -XX:+UseG1GC"
```

***PDB 설정***:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 8  # 10개 중 최소 8개 유지
  selector:
    matchLabels:
      app: myapp
```

***HPA 설정***:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 10
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 25
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

## Production Best Practices

### Graceful Shutdown

Kubernetes에서 Pod 종료 시퀀스:

1. **Pod이 Terminating 상태가 됨**
   - kube-apiserver에 삭제 요청
   - Pod 상태가 `Terminating`으로 변경
   - EndpointSlice에서 Pod IP 제거 (Service에서 트래픽 차단)

2. **두 가지가 동시에 시작됨**:
   - ***preStop 훅 실행*** (있는 경우)
   - ***SIGTERM 신호 전송*** (컨테이너 메인 프로세스에)

3. **애플리케이션이 SIGTERM 처리**:
   - 새 요청 수락 중단
   - 진행 중인 요청 완료 대기
   - DB 연결, 파일 핸들 정리
   - 로그 flush

4. **terminationGracePeriodSeconds 대기** (기본 30초):
   - 이 시간 내에 프로세스가 종료되면 정상 종료
   - 시간 초과 시 SIGKILL 전송 (강제 종료)

5. **Pod 완전히 삭제됨**

***문제점***: EndpointSlice 업데이트와 SIGTERM 전송이 동시에 시작되므로, SIGTERM을 받은 애플리케이션이 종료 절차를 시작해도 ***일부 트래픽이 여전히 유입될 수 있다*** (kube-proxy가 iptables를 업데이트하는 데 수 초 소요).

***해결책: preStop Hook***

```yaml
lifecycle:
  preStop:
    exec:
      command:
      - sh
      - -c
      - sleep 15  # kube-proxy가 iptables 업데이트할 시간 확보
```

타임라인:
- 0초: Pod Terminating, EndpointSlice 업데이트, preStop과 SIGTERM이 동시에 시작
- 0~15초: preStop의 sleep 실행 (이 동안 애플리케이션은 SIGTERM을 받았지만, preStop이 완료될 때까지 대기)
- 15초: preStop 완료, kube-proxy의 iptables 업데이트 완료, 새 요청은 이미 차단됨
- 15~45초: 애플리케이션이 기존 요청 처리 완료
- 45초: 프로세스 종료 (또는 60초에 SIGKILL)

### Rolling Update Strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0   # 동시에 unavailable한 Pod 최대 개수/비율
    maxSurge: 25%       # 동시에 생성할 수 있는 추가 Pod 최대 개수/비율
```

***maxUnavailable: 0, maxSurge: 25%*** (무중단 배포):
- replica 10개인 경우
- 먼저 새 버전 Pod 2~3개 생성 (25% surge)
- 새 Pod이 Ready되면 구 버전 Pod 종료
- 전체 과정에서 최소 10개 Pod 유지

***maxUnavailable: 25%, maxSurge: 25%*** (빠른 배포):
- replica 10개인 경우
- 구 버전 2~3개 종료
- 새 버전 2~3개 생성
- 더 빠르지만 순간적으로 7~8개만 available

***고트래픽 환경 권장***: `maxUnavailable: 0, maxSurge: 25~50%`

### Network Policies

Pod 간 트래픽을 제어하는 방화벽 규칙.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: myapp-netpol
  namespace: myapp
spec:
  podSelector:
    matchLabels:
      app: myapp
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # Ingress Controller로부터의 트래픽만 허용
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  # DNS 쿼리 허용
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53
  # PostgreSQL DB 접근 허용
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
```

***기본 정책***: NetworkPolicy가 없으면 모든 트래픽 허용. NetworkPolicy를 하나라도 적용하면 명시하지 않은 트래픽은 차단된다.

***CNI 지원***: Calico, Cilium, Weave Net은 NetworkPolicy를 지원하지만, Flannel은 지원하지 않는다.

### Observability

***Metrics: Prometheus + Grafana***

주요 메트릭:
- `container_cpu_usage_seconds_total`: CPU 사용 시간
- `container_memory_working_set_bytes`: 메모리 사용량
- `kube_pod_container_status_restarts_total`: 재시작 횟수
- `http_server_requests_seconds`: 요청 응답 시간 (애플리케이션 메트릭)
- `http_server_requests_total`: 요청 수

***Logging: Fluentd/Fluent Bit + Elasticsearch + Kibana***

***Structured Logging*** (JSON 형식 권장):

```json
{
  "timestamp": "2026-02-15T06:00:00.123Z",
  "level": "INFO",
  "logger": "com.myapp.UserService",
  "message": "User login successful",
  "userId": "12345",
  "traceId": "abc123",
  "spanId": "def456"
}
```

***Tracing: Jaeger / Zipkin / Tempo***

분산 추적으로 요청이 여러 마이크로서비스를 거치는 경로를 추적한다.

### GitOps with ArgoCD

GitOps는 Git을 single source of truth로 사용하여 선언적 인프라 관리를 한다.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/myapp-config
    targetRevision: main
    path: k8s/overlays/production
    helm:
      valueFiles:
      - values-prod.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: myapp
  syncPolicy:
    automated:
      prune: true      # Git에서 삭제된 리소스 자동 삭제
      selfHeal: true   # 클러스터 상태가 Git과 다르면 자동 동기화
```

***워크플로우***:
1. 개발자가 애플리케이션 코드 변경 → Git push
2. CI (GitHub Actions, GitLab CI)가 Docker 이미지 빌드 → 레지스트리 push
3. CI가 config 저장소의 image tag 업데이트 → Git push
4. ArgoCD가 변경 감지 → Kubernetes에 자동 배포
5. ArgoCD UI/CLI로 배포 상태 모니터링

***장점***:
- Git이 audit trail 제공 (누가, 언제, 무엇을 변경했는지)
- Declarative: desired state를 선언, ArgoCD가 자동으로 reconcile
- 롤백 간편: Git revert → 자동 재배포
