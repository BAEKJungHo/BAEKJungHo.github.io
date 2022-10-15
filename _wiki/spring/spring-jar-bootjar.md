---
layout  : wiki
title   : Configuration Jar/BootJar in Spring Multi-module
summary : 스프링 멀티모듈 구성 시 Jar, BootJar 옵션 설정하기
date    : 2022-10-11 15:05:32 +0900
updated : 2022-10-11 15:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Jar

- Jar 에 의해 생성된 jar 는 __plain archive__ 라고 하며, 애플리케이션 실행에 필요한 모든 의존성을 포함하지 않고
  소스코드의 클래스 파일과 리소스 파일만 포함한다.
- executing tests, code coverage, static code analysis 과 관련된 작업(check task)을 위해선 plain archive 가 필요하다.

## BootJar

- jar task 를 확장하여 만든 것
- BootJar 에 의해 생성된 jar 는 __executable archive__ 라고 하며 애플리케이션 실행에 필요한 모든 의존성을 함께 빌드한다.

## Configuration Multi-Modules

- __Root Module__
  - member-server
  - auth-server
  - core

위 처럼 멀티 모듈 프로젝트로 구성이 되어있을 때, Sub Module 에서 jar, bootjar 옵션 설정이 각각 다르다.

- __Application Server__
  - 애플리케이션을 띄워야하는 서버인 경우(Ex. member-server, auth-server)에는 아래와 같이 설정해야 한다.
  
```
tasks.jar { enabled = false }
tasks.bootJar { enabled = true } 
```

member-server 와 auth-server 의 옵션이 위 처럼 설정되어있을 때, auth-server 에서 member-server 를 implements 하고 있다고 하더라도, member-server 에 있는 소스 코드를 제대로 인식하지 못하는 현상이 발생한다. 따라서, 참조 되어야 할 소스들은 bootJar 빌드가 필요없는 하위 모듈로 빼내어 관리해야 한다.

- __Common Module__
  - 독립적인 애플리케이션을 띄우지 않으며, 다른 서브 모듈에서 공통으로 사용하기 위한 패키지를 모아둔 모듈의 경우에는 아래와 같이 설정해야 한다.

```
tasks.jar { enabled = true }
tasks.bootJar { enabled = false }
```

## Links

- [Spring Boot Gradle Plugin Reference Guide](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/)
- [Difference between gradle build and gradle bootJar?](https://stackoverflow.com/questions/64747475/difference-between-gradle-build-and-gradle-bootjar)