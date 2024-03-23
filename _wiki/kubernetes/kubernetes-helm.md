---
layout  : wiki
title   : Helm
summary : Helm is a tool for managing Kubernetes packages called charts
date    : 2024-03-18 15:54:32 +0900
updated : 2024-03-18 20:15:24 +0900
tag     : kubernetes helm
toc     : true
comment : true
public  : true
parent  : [[/kubernetes]]
latex   : true
---
* TOC
{:toc}
 
## Helm

The package manager for Kubernetes. Helm is a tool for managing Kubernetes packages called __charts__.

핵심은 charts 이다.

헬름을 사용하면 Kubernetes 클러스터에 복잡한 애플리케이션을 간단하게 배포할 수 있으며, 이를 통해 애플리케이션 배포 및 관리 프로세스를 자동화하고 표준화할 수 있다.

For Helm, there are three important concepts:
- The __chart__ is a bundle of information necessary to create an instance of a Kubernetes application.
- The __config__ contains configuration information that can be merged into a packaged chart to create a releasable object.
- A __release__ is a running instance of a chart, combined with a specific config.

[Helm 을 이용한 Pod 등의 K8S 자원을 생성하는 과정은 크게 다음과 같다.](https://homoefficio.github.io/2022/03/19/helm-%EC%B4%88%EA%B0%84%EB%8B%A8-%EC%A0%95%EB%A6%AC/)
- 개발자가 작성한 Helm Chart 를 helm push 명령으로 Helm Chart Repository 에 업로드 한다.
- 개발자가 만든 Container Image 를 docker push 명령으로 Container Registry 에 업로드 한다.
- 개발자가 k8s Control Plane 에 values.yaml 파일을 지정하면서 helm install 명령을 전달하면,
  - values.yaml 에 있는 값이 Helm Chart 에 주입되고 Helm Release 가 생성되고,
  - Helm Chart 에 들어있는 Image 정보를 통해 Container Image 를 가져와서 Helm Chart 정보를 토대로 Pod 등 k8s 자원이 생성된다.

### Charts

차트는 디렉터리 안에 파일들의 모음으로 구성된다. 디렉터리명은 (버전 정보 없는) 차트명이다.

__[Chart Files Structures](https://helm.sh/ko/docs/topics/charts/#%EC%B0%A8%ED%8A%B8-%ED%8C%8C%EC%9D%BC-%EA%B5%AC%EC%A1%B0)__:

```
chartName/
  Chart.yaml          # 차트에 대한 정보를 가진 YAML 파일
  LICENSE             # 옵션: 차트의 라이센스 정보를 가진 텍스트 파일
  README.md           # 옵션: README 파일
  values.yaml         # 차트에 대한 기본 환경설정 값들
  values.schema.json  # 옵션: values.yaml 파일의 구조를 제약하는 JSON 파일
  charts/             # 이 차트에 종속된 차트들을 포함하는 디렉터리
  crds/               # 커스텀 자원에 대한 정의
  templates/          # values 와 결합될 때, 유효한 쿠버네티스 manifest 파일들이 생성될 템플릿들의 디렉터리
  templates/NOTES.txt # 옵션: 간단한 사용법을 포함하는 텍스트 파일
```

templates/ 디렉터리는 다음과 같이 구성되어 있다.

```
NOTES.txt : 차트의 "도움말". 이것은 helm install 을 실행할 때 사용자에게 표시될 것이다.
deployment.yaml : 쿠버네티스 디플로이먼트를 생성하기 위한 기본 매니페스트
service.yaml : 디플로이먼트의 서비스 엔드포인트를 생성하기 위한 기본 매니페스트
_helpers.tpl : 차트 전체에서 다시 사용할 수 있는 템플릿 헬퍼를 지정하는 공간
```

## Links

- [Chart Templates Guide](https://helm.sh/ko/docs/chart_template_guide/getting_started/)