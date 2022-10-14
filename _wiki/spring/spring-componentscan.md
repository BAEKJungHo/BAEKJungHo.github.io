---
layout  : wiki
title   : Component Scanning
summary : 
date    : 2022-10-09 15:02:32 +0900
updated : 2022-10-09 15:12:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Component

During startup, Spring instantiates objects and adds them to the application context. Objects in the application context are called “Spring beans” or “components”.

## Component Scanning

The process of searching the classpath for classes that should contribute to the application context is called component scanning.

## Stereotype

> [What is a spring stereotype](https://stackoverflow.com/questions/14756486/what-is-a-spring-stereotype)

- [JavaDoc](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/package-summary.html)
    - Annotations denoting the roles of types or methods in the overall architecture (at a conceptual, rather than implementation, level).
- [Merriam-Webster](https://www.merriam-webster.com/dictionary/stereotype)
    - something conforming to a fixed or general pattern; especially : a standardized mental picture that is held in common by members of a group and that represents an oversimplified opinion, prejudiced attitude, or uncritical judgment

Stereotype Annotations In Spring: __@Component, @Controller, @Service, @Repository__

## How component scanning works

Spring Boot’s @SpringBootApplication annotation implies the @Configuration, @ComponentScan, and @EnableAutoConfiguration annotations.

With Spring, we use the __@ComponentScan__ annotation along with the __@Configuration__ annotation to specify the packages that we want to be scanned.

- __@SpringBootApplication__

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {}
```

__Component Scanning is worked by @SpringBootConfiguration and @ComponentScan on sub-packages with applied @SpringBootApplication__

## Links

- [Spring Component Scanning](https://reflectoring.io/spring-component-scanning/)
- [Component Scan - Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/ComponentScan.html)
- [Creating Your Own Auto-configuration](https://docs.spring.io/spring-boot/docs/2.1.11.RELEASE/reference/html/boot-features-developing-auto-configuration.html)
- [Component Scanning - Baeldung](https://www.baeldung.com/spring-component-scanning)