---
layout  : wiki
title   : Namespace
summary : 
date    : 2024-02-22 15:54:32 +0900
updated : 2024-02-22 20:15:24 +0900
tag     : kubernetes
toc     : true
comment : true
public  : true
parent  : [[/kubernetes]]
latex   : true
---
* TOC
{:toc}
 
## Namespace

[Namespace](https://en.wikipedia.org/wiki/Namespace) 란 Package/Directory 정도로 생각하면 된다. 특정 공간(space) 내에서 이름(name) 을 식별하기 위한 기술이다.

Java/Kotlin 의 경우를 살펴보자. FQCN(Fully Qualified Class Name) 은 java.lang.StackOverflowError 이다. 여기서 Namespace 는 java.lang 이다. 즉, java.lang 패키지내에서 StackOverflowError 이름을 갖는 클래스는 1개이다.
하지만, 다른 Namespace 를 통틀어서 name 이 유일할 필요는 없다. 즉, abc.efg.StackOverFlowError 도 존재할 수 있다는 뜻이다.

[k8s 의 경우 Namespace](https://kubernetes.io/ko/docs/concepts/overview/working-with-objects/namespaces/) 는 리소스 그룹 격리 매커니즘을 제공한다. 리소스의 이름은 Namespace 내에서 유일해야하며, Namespace 간에 유일할 필요는 없다.

서비스를 생성하면 해당 DNS 엔트리가 생성된다. 이 엔트리는 `<서비스-이름>.<네임스페이스-이름>.svc.cluster.local` 의 형식을 갖는데, 이는 컨테이너가 `<서비스-이름>` 만 사용하는 경우, 네임스페이스 내에 국한된 서비스로 연결된다. dev, stage, real 과 같이 여러 네임스페이스 내에서 동일한 설정을 사용하는 경우에 유용하다.
예를 들어, 쿠버네티스 클러스터를 development(개발)와 production(운영)이라는 두 개의 네임스페이스로 분할할 수 있다. 네임스페이스를 넘어서 접근하기 위해서는, 전체 주소 도메인 이름(FQDN)을 사용해야 한다. 

## Links

- [네임스페이스를 사용해 클러스터 공유하기](https://kubernetes.io/ko/docs/tasks/administer-cluster/namespaces/#%EC%83%88-%EB%84%A4%EC%9E%84%EC%8A%A4%ED%8E%98%EC%9D%B4%EC%8A%A4-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0)
- [Kubernetes 네임스페이스(namespace)](https://m.blog.naver.com/PostView.nhn?blogId=adamdoha&logNo=222309259027&proxyReferer=https:%2F%2Fblog.naver.com%2Fadamdoha%2F222309259027)