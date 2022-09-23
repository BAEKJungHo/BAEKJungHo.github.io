---
layout  : wiki
title   : Deployment Strategy
summary : Rolling Update, Blue-Green, Canary
date    : 2022-09-12 15:54:32 +0900
updated : 2022-09-12 20:15:24 +0900
tag     : infra devops
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## RollingUpdate

Rolling updates allow Deployments' update to take place with zero downtime by incrementally updating Pods instances with new ones.

![](/resource/wiki/infra-deployment/rollingupdate.png)

RollingUpdate 의 단점은, 업데이트 프로세스 중 이전 버전과 새 버전이 같이 실행되고 트래픽을 수신하게 된다. 이 기간동안 모든 요청은 두 버전 중 하나로 라우팅 될 수 있다.

- 쿠버네티스는 보통 Rolling Update 를 사용
- N 대의 서버에 새로운 버전을 교체해가는 방식으로 배포
- 다른 버전의 서비스가 동시에 진행되는 시간이 있으며, 문제가 있을 경우 전체를 중단하지 않고 업데이트를 중단할 수 있습다.

## BlueGreen

A blue/green deployment is a deployment strategy in which you create two separate, but identical environments. One environment (blue) is running the current application version and one environment (green) is running the new application version. Using a blue/green deployment strategy increases application availability and reduces deployment risk by simplifying the rollback process if a deployment fails. Once testing has been completed on the green environment, live application traffic is directed to the green environment and the blue environment is deprecated.

![](/resource/wiki/infra-deployment/bluegreen.png)

BlueGreen 은 이전 버전과 새 버전을 함께 배포한다. 새 버전의 유효성을 검사한 후 이전 버전에서 새 버전으로 모든 트래픽을 한 번에 전환한다. 전환 후 모든 문제에 대해 애플리케이션을 모니터링하고, 문제가 발생하는 경우 이전 버전으로 바꿀 수 있다. 문제가 없으면 이전 버전을 삭제할 수 있다.

- 블루가 서비스하고 있는 상태에서 그린에 새 버전을 배포한 후, 트래픽을 그린으로 전환시켜주는 방식을 의미
- 트래픽을 전환하는 동안에는 인스턴스가 두배 필요하며, 전체 테스트가 필요
- 빠르게 롤백이 가능하며, 트래픽을 전환하기 전 내부 테스트를 수행할 수도 있음

## canary

The purpose of a canary deployment is to reduce the risk of deploying a new version that impacts the workload. The method will incrementally deploy the new version, making it visible to new users in a slow fashion. As you gain confidence in the deployment, you will deploy it to replace the current version in its entirety.

![](/resource/wiki/infra-deployment/canary.png)

- Blue-Green 과 유사하지만 트래픽을 한번에 전환하지 않고, 새 버전으로 점차 늘려감
- 오류를 빠르게 감지할 수 있으며, A/B 테스트 용도로 활용할 수도 있음

## Links

- [Rolling update - AWS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-ecs.html)
- [Rolling updates overview - kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [Blue/Green Deployements - AWS](Blue/Green Deployments)
- [BlueGreenDeployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [what is blue green deployment](https://www.spiceworks.com/tech/devops/articles/what-is-blue-green-deployment/)
- [Canary deployment - AWS](https://docs.aws.amazon.com/whitepapers/latest/introduction-devops-aws/canary-deployments.html)
- [CanaryRelease](https://martinfowler.com/bliki/CanaryRelease.html?ref=wellarchitected)