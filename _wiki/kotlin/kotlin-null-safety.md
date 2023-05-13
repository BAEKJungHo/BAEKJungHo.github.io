---
layout  : wiki
title   : Null Safety with JSR-305
summary : 
date    : 2023-05-07 15:54:32 +0900
updated : 2023-05-07 20:15:24 +0900
tag     : kotlin spring
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Null Safety with JSR-305

__[Null Safety - Spring Docs](https://docs.spring.io/spring-framework/reference/languages/kotlin/null-safety.html):__

> One of Kotlin’s key features is null-safety, which cleanly deals with null values at compile time rather than bumping into the famous NullPointerException at runtime. This makes applications safer through nullability declarations and expressing “value or no value” semantics without paying the cost of wrappers, such as Optional. (Kotlin allows using functional constructs with nullable values. See this comprehensive guide to Kotlin null-safety.)
> 
> Although Java does not let you express null-safety in its type-system, the Spring Framework provides null-safety of the whole Spring Framework API via tooling-friendly annotations declared in the org.springframework.lang package. By default, types from Java APIs used in Kotlin are recognized as platform types, for which null-checks are relaxed. [Kotlin support for JSR-305 annotations](https://kotlinlang.org/docs/java-interop.html#jsr-305-support) and Spring nullability annotations provide null-safety for the whole Spring Framework API to Kotlin developers, with the advantage of dealing with null-related issues at compile time.
> 
> Libraries such as Reactor or Spring Data provide null-safe APIs to leverage this feature.
>
> You can configure JSR-305 checks by adding the `-Xjsr305` compiler flag with the following options: `-Xjsr305={strict|warn|ignore}`.
>
> For kotlin versions 1.1+, the default behavior is the same as `-Xjsr305=warn`. The strict value is required to have Spring Framework API null-safety taken into account in Kotlin types inferred from Spring API but should be used with the knowledge that Spring API nullability declaration could evolve even between minor releases and that more checks may be added in the future.

## Gradle

__buildSrc:__

```kotlin
object CompilerOptions {
    const val NULL_SAFETY = "-Xjsr305=strict"
}
```

__build.gradle.kt:__

```
tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf(CompilerOptions.NULL_SAFETY)
        jvmTarget = Versions.JVM
    }
}
```