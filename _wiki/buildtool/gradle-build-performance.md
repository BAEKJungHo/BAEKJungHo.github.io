---
layout  : wiki
title   : Improve Gradle Build Performance
summary : 
date    : 2023-05-04 15:54:32 +0900
updated : 2023-05-04 20:15:24 +0900
tag     : gradle
toc     : true
comment : true
public  : true
parent  : [[/buildtool]]
latex   : true
---
* TOC
{:toc}

## Gradle Build Performance

__[Improve the Performance of Gradle Builds](https://docs.gradle.org/current/userguide/performance.html)__

```gradle
// 병렬 빌드를 활성화한다. 이는 다수의 CPU 코어를 사용하여 프로젝트를 동시에 빌드하여 빌드 시간을 단축시키는 기능이다.
org.gradle.parallel=true

// Gradle maintains a Virtual File System (VFS) to calculate what needs to be rebuilt on repeat builds of a project. By watching the file system, Gradle keeps the VFS current between builds.
org.gradle.vfs.watch=true

// Gradle 캐시를 사용하여 이전 빌드에서 생성된 출력물을 재사용하여 빌드 시간을 단축시킨다.
org.gradle.caching=true 

// This feature can save you a couple of seconds from the Configuration phase of Gradle, as only ‘projects’ related to the current tasks are configured. This setting is relevant for multi- modules projects. When this property is set, Gradle configures modules that are only relevant to the requested tasks instead of configuring all of them, which is a default behavior.
org.gradle.configureondemand = true

// 빌드 데몬을 사용하여 Gradle 프로세스를 백그라운드에서 실행한다. 이를 통해 Gradle 실행 시간을 단축시키고 메모리 사용량을 최적화할 수 있다.
org.gradle.daemon=true 

// Increase the amount of memory allocated to the Gradle Daemon VM to 4Gb.  Gradle 실행에 사용되는 JVM의 최대 힙 크기를 4GB로 지정한다. 
org.gradle.jvmargs=-Xmx4g 
```

## Links

- [Increase your Gradle Build Speed](https://www.linkedin.com/pulse/increase-your-gradle-build-speed-rohan-lodhi/)