---
layout  : wiki
title   : Standard Gradle
summary : All about gradle
date    : 2022-09-10 15:54:32 +0900
updated : 2022-09-10 20:15:24 +0900
tag     : buildtool gradle kotlin
toc     : true
comment : true
public  : true
parent  : [[/buildtool]]
latex   : true
---
* TOC
{:toc}

## Build Tool

Build tools are programs that automate the creation of executable applications from source code.

## settings.gradle

Multi-module 프로젝트를 구성할 때, 빌드 대상이 되는 하위 모듈들의 Path 를 지정하는 스크립트 파일이다.
또한 pluginManagement 를 사용하여 전체 빌드에 대한 플러그인 관리를 구성할 수 있다.

### pluginManagement

[PluginManagementSpec](https://docs.gradle.org/current/dsl/org.gradle.plugin.management.PluginManagementSpec.html#org.gradle.plugin.management.PluginManagementSpec) 을 사용한다. plugins 는 [PluginDependenciesSpec](https://docs.gradle.org/current/dsl/org.gradle.plugin.use.PluginDependenciesSpec.html) 을 사용한다.

- __settings.gradle__

```gradle
// Plugin Version Management 
pluginManagement {
    val kotlinVersion: String by settings
    val springBootVersion: String by settings
    val springDependencyManagementVersion: String by settings

    plugins {
        id("org.springframework.boot") version springBootVersion
        id("io.spring.dependency-management") version springDependencyManagementVersion
        kotlin("jvm") version kotlinVersion
        kotlin("plugin.spring") version kotlinVersion
        kotlin("plugin.jpa") version kotlinVersion
    }
}

rootProject.name = "platform-server"
include(
    "auth-server"
)
```

id 에는 artifact 를 지정하면 된다.

## build.gradle

프로젝트의 dependency, task 등을 정의할 때 사용한다.

```gradle
plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    kotlin("jvm")
    kotlin("plugin.spring")
    kotlin("plugin.jpa")
}
```

Gradle 에서 Kotlin DSL 을 사용할 수 있다. 

- kotlin("jvm") is the plugin for building Kotlin projects that target JVM without Android support.
- kotlin 으로 spring 을 사용하는 경우 kotlin("plugin.spring") 플러그인이 필수
- kotlin 으로 jpa 를 사용하는 경우 kotlin("plugin.jpa") 플러그인이 필수

### plugin.spring

해당 플러그인을 사용하면 아래 어노테이션들을 대상으로 all-open 을 자동으로 추가시킨다. 즉, plugin.spring 을 사용하면서 @Transactional 을 지정하면 클래스에 open 키워드가 자동으로 추가된다. kotlin-allopen, plugin.spring 은 동일한 프로젝트이다. Spring Initializr 를 이용해서 프로젝트를 구성하면 plugin.spring 플러그인은 자동 적용된다.

- @Component
- @Async
- @Transactional
- @Cacheable
- @SpringBootTest
- @Configuration, @Controller, @RestController, @Service, @Repository, @Component

그 외에도 Gradle 에서 allOpen 설정으로 특정 어노테이션에 대해서 open 키워드를 추가시킬 수 있다.

```gradle
allOpen{
    annotation("javax.persistence.Entity")
    annotation("javax.persistence.MappedSuperclass")
    annotation("javax.persistence.Embeddable")
}
```

JPA 플러그인을 사용하더라도 위 어노테이션에 대해서는 all-open 설정을 별도로 해줘야 한다. open 키워드가 없으면 Proxy 기반으로 Lazy 로딩을 할 수 없기 때문이다. 만약 설정이 안되어있다고하면 Lazy Loading 이 발생안한다. Debugging 을 통해 Entity 를 확인해보면 Proxy 객체가 아닌 실제 객체인 것을 확인 할 수 있다.

### all-open 이 필요한 이유

![](/resource/wiki/buildtool-standard-gradle/cglib.png)

Spring Boot 2.x 버전부터 [CGLIB Proxy](https://github.com/BAEKJungHo/deepdiveinreflection/blob/main/contents/CGLIB.md) 방식으로 Bean 을 관리하고 있다. CGLIB Proxy 는 Target Class 를 상속받아 생성하기 때문에 open 으로 상속 가능한 상태여야 한다.

### no-arg

default constructor 를 만든다. no-arg 는 주로 plugin.jpa 플러그인과 같이 사용된다. kotlin-spring 플러그인과 마찬가지로 @Entity, @Embeddable, @MappedSuperclass 어노테이션에 자동으로 동작한다.

Hibernate 는 Reflection 으로 객체를 생성하기 때문에 protected 이상의 생성자가 필요하다.

## Links

- [Gradle Kotlin DSL - woowahan](https://techblog.woowahan.com/2625/)
- [What is a build tool](https://stackoverflow.com/questions/7249871/what-is-a-build-tool)
- [Gradle Multi Project Builds](https://docs.gradle.org/current/userguide/multi_project_builds.html)
  - [Gradle Multi Project](https://kwonnam.pe.kr/wiki/gradle/multiproject?s[]=gradle)
- [Project - Gradle Docs](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html)
- [Gradle 에서 서브 프로젝트를 한 디렉토리에 몰아넣기](https://blog.sapzil.org/2018/06/20/gradle-subproject-grouping/)
- [Gradle 2.5 Does Continuous Builds]()
- [Build Lifecycle](https://docs.gradle.org/current/userguide/build_lifecycle.html)
  - [Gradle Build Lifecycle](https://kwonnam.pe.kr/wiki/gradle/buildlifecycle?s[]=gradle)
- [Dependency Management](https://docs.gradle.org/current/userguide/dependency_management.html)
  - [Dependency Management Basic](https://docs.gradle.org/current/userguide/dependency_management_for_java_projects.html)
  - [Gradle Dependencies](https://kwonnam.pe.kr/wiki/gradle/dependencies)
- [Gradle Logging](https://docs.gradle.org/current/userguide/logging.html)
  - [Gradle Logging - kwonnam](https://kwonnam.pe.kr/wiki/gradle/logging)
- [Kotlin 으로 Spring 개발할 때 - cheese10yun](https://cheese10yun.github.io/spring-kotlin/)