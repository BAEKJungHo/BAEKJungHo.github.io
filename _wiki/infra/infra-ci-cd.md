---
layout  : wiki
title   : CI/CD
summary : Continuous Integration, Delivery, Deployment
date    : 2022-09-05 15:54:32 +0900
updated : 2022-09-05 20:15:24 +0900
tag     : infra devops cicd
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}
 
## Meaning and Workflow

__Workflow__:

![](/resource/wiki/infra-ci-cd/cicd.png)

__A deeper look into the CI/CD workflow__:

![](/resource/wiki/infra-ci-cd/cicd-devops.png)

- __Verify__
  - Continuous Integration
- __Package__
- __Release__
  - Continuous Delivery, Continuous Deployment

### Continuous Integration

[Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html) - You can create a set of scripts to __build and test__ your application __automatically.__

### Continuous Delivery

[Continuous Delivery](https://martinfowler.com/bliki/ContinuousDelivery.html) - Not only is your application built and tested each time a code change is pushed to the codebase, the application is also __deployed continuously.__ However, with continuous delivery, __you trigger the deployments manually.__

### Continuous Deployment

Similar to Continuous Delivery. The difference is … __human intervention is not required. deployments automatically.__

## GuideLines

- [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/index.html)
- [Tutorial: Create and run your first GitLab CI/CD pipeline](https://docs.gitlab.com/ee/ci/quick_start/)
- Job 은 want to do 를 의미하고, Stages 는 Job 를 모아둔 것이다.

__Pipelines Sample__

```
stages:
  - init # CI 를 수행하기 위한 초기화 단계 (ENV 결정 등)
  - analyze # 정적 분석 실행
  - build # 빌드
  - test # unittest 등의 테스트 실행
  - package # docker build/push 
  - update_gitops_repo # Gitops Repository Update
  - release # GitLab 에서 Release 를 생성
```

__[Continuous Delivery for Kubernetes Using GitOps and Argo CD](https://www.gspann.com/resources/blogs/continuous-delivery-for-kubernetes-with-gitops-and-argo-cd/)__:

![](/resource/wiki/infra-ci-cd/ci-cd-argocd.png)

__[What is ArgoCD](https://argo-cd.readthedocs.io/en/stable/)__:
- Argo CD is a Kubernetes controller, responsible for continuously monitoring all running applications and comparing their live state to the desired state specified in the Git repository
- Argo CD is a declarative, GitOps continuous delivery tool for Kubernetes.

## Links

- [Integrating with GitHub Actions – CI/CD pipeline to deploy a Web App to Amazon EC2](https://aws.amazon.com/ko/blogs/devops/integrating-with-github-actions-ci-cd-pipeline-to-deploy-a-web-app-to-amazon-ec2/)

## References

- [Software Delivery Guide](https://martinfowler.com/delivery.html)