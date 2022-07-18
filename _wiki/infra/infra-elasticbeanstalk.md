---
layout  : wiki
title   : AWS Elastic Beanstalk
summary : 
date    : 2022-07-06 15:54:32 +0900
updated : 2022-07-06 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Elastic Beanstalk

웹 애플리케이션을 서비스 할 때, NodeJS, Django 등의 플랫폼도 설치해야하고, 지속적으로 버전도 업데이트 해줘야하는 불편함이 있다. 또한 서버에 소스를 업로드 했는데 문제가 생기면 긴급하게 이전 버전으로 되돌려야 한다.

AWS Elastic Beanstalk 은 이런 작업들을 대신 해주며, 개발자가 코딩에만 집중할 수 있게 도와주는 도구이다.

코드를 업로드하기만 하면 Elastic Beanstalk 이 용량 프로비저닝, 로드 밸런싱, Auto Scaling 부터 시작하여 애플리케이션 상태 모니터링에 이르기까지 배포를 자동으로 처리합니다.

__즉, 개발자가 코딩에 집중할 수 있게 애플리케이션 스택(플랫폼)을 관리해주며, 인프라 구성에 드는 시간을 줄여주고, 쉽고 빠르게 배포할 수 있는 AWS 도구이다.__

## Links

- [AWS Elastic Beanstalk](https://aws.amazon.com/ko/elasticbeanstalk/)
- [AWS Elastic Beanstalk - 생활코딩](https://www.youtube.com/watch?v=g7W5LK1DM8o)