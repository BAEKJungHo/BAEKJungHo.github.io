---
layout  : wiki
title   : RELIABILITY
summary : 
date    : 2023-09-08 15:02:32 +0900
updated : 2023-09-08 15:12:24 +0900
tag     : architecture cloudnative infra
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## RELIABILITY

신뢰성(reliability)은 __의도한 기능을 올바르고 일관되게 수행하는 능력__ 이다. Reliability depends on multiple factors, of which resiliency is one of the most impactful.
탄력성(resiliency)은 인프라 또는 서비스 중단을 복구, 수요를 충족하기 위해 컴퓨팅 리소스를 동적으로 확보, 네트워크 이슈 같은 문제를 완화하는 능력이다. 쉽게 말해 __변화에 적응하고 원래 상태로 돌아갈 수 있는 능력__ 이다.

__[Design principles](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html)__:
- Automatically recover from failure
- Test recovery procedures
- Scale horizontally to increase aggregate workload availability
- Stop guessing capacity
- Manage change through automation

__[Shared Responsibility Model for Resiliency](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/shared-responsibility-model-for-resiliency.html)__:
- Each AWS Region is fully isolated and consists of multiple [Availability Zones](https://aws.amazon.com/ko/about-aws/global-infrastructure/regions_az/#Availability_Zones), which are physically isolated partitions of infrastructure.
  - AWS 가 전 세계에서 데이터 센터를 클러스터링하는 물리적 위치를 리전이라고 한다. 그리고 각 그룹의 가용 영역을 AZ 라고 하며 최소 3개로 구성되어 있다.
  - AWS 리전의 모든 AZ 는 높은 대역폭, 지연 시간이 짧은 네트워킹, 완전한 중복성을 갖춘 전용 메트로 광 네트워크와 상호 연결되어 있어 AZ 간에 높은 처리량과 지연 시간이 짧은 네트워킹을 제공한다. AZ 간의 모든 트래픽은 암호화된다.

위 내용 까지가 Resiliency of the cloud 를 위한 AWS 의 책임(responsibility) 이다. 아래는 고객의 책임(responsibility)에 해당된다.

Customers that deploy Amazon EC2 instances are responsible for deploying Amazon EC2 instances across multiple locations (such as AWS Availability Zones), implementing self-healing using services like Auto Scaling, and using resilient workload architecture best practices for applications installed on the instances.

### Self-Healing

If your workload is using AWS services, such as Amazon S3 or Amazon DynamoDB, then they are
automatically deployed to multiple Availability Zones.

For Amazon RDS you must choose Multi-AZ as a configuration option, and then on failure AWS
automatically directs traffic to the healthy instance.

하지만 RDS 의 경우에는 High Availability 를 위해 [Multi-AZ Configuration](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html) 을 사용해야 한다.

### Design your workload service architecture

신뢰성을 위한 고객의 책임 중 하나가 [Design your workload service architecture](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-your-workload-service-architecture.html) 이다.
SOA, MSA 등의 아키텍처로 workload service 를 구성해야 한다.

## References

- [AWS Well-Architected Labs RELIABILITY](https://www.wellarchitectedlabs.com/reliability/)

