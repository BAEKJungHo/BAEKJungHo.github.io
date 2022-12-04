---
layout  : wiki
title   : Mapstruct
summary : 
date    : 2022-11-27 11:28:32 +0900
updated : 2022-11-27 12:15:24 +0900
tag     : java kotlin mapstruct
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Mapstruct

MapStruct is a code generator that greatly simplifies the implementation of mappings between Java bean types based on a convention over configuration approach.

The generated mapping code uses plain method invocations and thus is fast, type-safe and easy to understand.

In contrast to other mapping frameworks MapStruct generates bean mappings at __compile-time__ which ensures a __high performance__, allows for fast developer feedback and thorough error checking.

- [Performance of Java Mapping Frameworks](https://www.baeldung.com/java-performance-mapping-frameworks)
- [Object-to-object mapping framework microbenchmark](https://github.com/arey/java-object-mapper-benchmark)

## Maven

```xml
...
<properties>
    <org.mapstruct.version>1.5.3.Final</org.mapstruct.version>
</properties>
...
<dependencies>
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>${org.mapstruct.version}</version>
    </dependency>
</dependencies>
...
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>1.8</source> <!-- depending on your project -->
                <target>1.8</target> <!-- depending on your project -->
                <annotationProcessorPaths>
                    <path>
                        <groupId>org.mapstruct</groupId>
                        <artifactId>mapstruct-processor</artifactId>
                        <version>${org.mapstruct.version}</version>
                    </path>
                    <!-- other annotation processors -->
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
```

- lombok 을 사용하는 경우 other annotation processors 에 lombok annotation processor 를 설정해주면 된다.

```xml
<path>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <version>${org.projectlombok.version}</version>
</path>
```

## How to use?

- __Source__

```java
@Getter
@Builder
public class Source {
    private String test;
}
```

- __Target__

```java
@Getter
@Builder
public class Target {
    private Long testing;
}
```

- __Mapper__

```java
@Mapper
public interface SourceTargetMapper {

    SourceTargetMapper MAPPER = Mappers.getMapper(SourceTargetMapper.class);

    @Mapping(source = "test", target = "testing")
    Target toTarget(Source s);
}
```

## Options

```java
@Mapper(
        componentModel = "spring",
        injectionStrategy = InjectionStrategy.CONSTRUCTOR,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface OrderMapper {

    @Mappings(value = @Mapping(source = "orderedAt", target = "orderedAt", dateFormat = "yyyy-MM-dd HH:mm:ss"))
    OrderDto.Main of(OrderInfo.Main mainResult);
}
```

### componentModel

- componentModel 을 spring 으로 설정하면 @Mapper 어노테이션이 붙은 인터페이스의 구현체를 빈으로 등록하여 사용할 수 있게 해준다.
- injectionStrategy 는 의존성 주입 방법을 나타낸다.

### unmappedTargetPolicy

- __ReportingPolicy.ERROR 이면서 Target 에 있는 속성이 Source 에 모두 다 있는 경우 Error 발생 안함__
  - Target 에 없는 속성이 Source 에 있어도 상관 없음 
- __ReportingPolicy.ERROR 이면서 Target 에 있는 속성이 Source 에 일부 없는 경우와 Target 에 있는 속성 일부와 Source 에 있는 속성 일부가 이름이 다른 경우__
  - Compile Time 에 Unmapped target properties error 발생
- __ReportingPolicy.IGNORE 이면서 Target 에 있는 속성이 Source 에 일부 없는 경우와 Target 에 있는 속성 일부와 Source 에 있는 속성 일부가 이름이 다른 경우__
  - Error 발생 안하고 null 로 바인딩 됨
  - `{"orderToken":null,"userId":2,"payMethod":"Card","totalAmount":10000, "orderNumber":null}`

### @InheritInverseConfiguration

[@InheritInverseConfiguration](https://mapstruct.org/documentation/stable/api/org/mapstruct/InheritInverseConfiguration.html)역방향 매핑에, 반대되는 설정을 상속하여 사용한다는 의미

```java
@Mapper
public interface SourceTargetMapper {

    SourceTargetMapper INSTANCE = Mappers.getMapper(SourceTargetMapper.class);

    @Mapping(source = "qax", target = "baz")
    @Mapping(source = "baz", target = "qax")
    Target sourceToTarget(Source source);

    // @Mapping(source = "baz", target = "qax")
    // @Mapping(source = "qax", target = "baz")
    @InheritInverseConfiguration
    Source targetToSource(Target target);
}
```

## In the Field

현업에서는 ReportingPolicy 를 IGNORE 정책을 사용하고, Mapping Test Code 를 작성하거나 Mapper 에 세세하게 매핑 규칙을 명시하는 전략을 사용할 수 있다.

## Links

- [Mapstruct](https://mapstruct.org/)
- [Mapstruct Examples](https://github.com/mapstruct/mapstruct-examples)
