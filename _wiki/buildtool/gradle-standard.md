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
- [Kotlin 으로 Spring 개발할 때](https://cheese10yun.github.io/spring-kotlin/)