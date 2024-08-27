---
layout  : wiki
title   : Cloud Native
summary : 
date    : 2023-05-08 15:02:32 +0900
updated : 2023-05-08 15:12:24 +0900
tag     : architecture cloudnative
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Cloud Native

___[Cloud Native](https://www.cncf.io/)___ 란 Microservices 를 느슨하게 결합하여, 크기 조절이 가능하고 탄력적이며 관리, 관찰이 용이한 소프트웨어 애플리케이션을
만드는 것을 의미한다.

Cloud Native 의 핵심은 ___[Containerization](https://aws.amazon.com/ko/what-is/containerization/)___ 이다. 컨테이너화란 애플리케이션을 마이크로서비스로 분할하고 경량 컨테이너에 패키징하여 다양한 서버에 배포하고 조정하는 것을 말한다.

> Microservices for the Enterprise (Apress, 2018)
> 
> 마이크로서비스 아키텍처는 독립적으로 개발하고 배포하고 크기 조절이 가능한 비지니스 기능 지향 서비스들을 느슨하게 결합하여 애플리케이션을 만드는 방법이다.

__[Characteristics](https://aws.amazon.com/ko/what-is/cloud-native/)__:

- 마이크로서비스 아키텍처: 애플리케이션을 작고 독립적인 서비스로 분할
- 컨테이너화: Docker 와 같은 기술을 사용해 애플리케이션과 의존성을 패키징
- 동적 오케스트레이션: Kubernetes 등을 사용해 컨테이너를 자동으로 관리 및 확장
- DevOps 문화: 개발과 운영의 통합, 지속적 배포
- 자동화된 인프라: 인프라를 코드로 관리 (IaC)
- 탄력성과 확장성: 수요에 따라 자동으로 리소스를 조정
- 관찰 가능성: 모니터링, 로깅, 추적 기능 내장

Cloud Native 환경에서 사용되는 다양한 ___[Tools](https://landscape.cncf.io/)___ 를 해당 링크에서 확인할 수 있다.

## Links

- [What is cloud-native? The modern way to develop software](https://www.infoworld.com/article/2255318/what-is-cloud-native-the-modern-way-to-develop-software.html)

## References

- Design Patterns for Cloud Native Applications / Kasun Indrasiri, Sriskandarajah Suhothayan Author / O'REILLY

