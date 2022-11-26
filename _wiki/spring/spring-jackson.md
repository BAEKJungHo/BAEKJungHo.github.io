---
layout  : wiki
title   : Jackson
summary : 
date    : 2022-11-20 21:28:32 +0900
updated : 2022-11-20 22:15:24 +0900
tag     : spring java kotlin
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## What is Jackson

Jackson has been known as "the Java JSON library" or "the best JSON parser for Java". Or simply as "JSON for Java".

- [FasterXML/Jackson](https://github.com/FasterXML/jackson)
- [FasterXML/Jackson-module-kotlin](https://github.com/FasterXML/jackson-module-kotlin)

Jackson contains 2 different JSON parsers:
- The [Jackson ObjectMapper](https://jenkov.com/tutorials/java-json/jackson-objectmapper.html) which parses JSON into custom Java objects, or into a Jackson specific tree structure (tree model).
- The [Jackson JsonParser](https://jenkov.com/tutorials/java-json/jackson-jsonparser.html) which is Jackson's JSON pull parser, parsing JSON one token at a time.

Jackson also contains two JSON generators:
- The [Jackson ObjectMapper](https://jenkov.com/tutorials/java-json/jackson-objectmapper.html) which can generate JSON from custom Java objects, or from a Jackson specific tree structure (tree model).
- The [Jackson JsonGenerator](https://jenkov.com/tutorials/java-json/jackson-jsongenerator.html) which can generate JSON one token at a time.

## Installation

Spring Boot 를 사용한다면 Jackson Library 가 자동으로 포함되어있다.

![](/resource/wiki/spring-jackson/starter.png)

만약, Spring 을 사용한다면 Jackson Library 를 추가해줘야 한다. Jackson Library 는 크게 3가지 Jar 가 있다.
- [Jackson Core](https://github.com/FasterXML/jackson-core)
- [Jackson Annotations](https://github.com/FasterXML/jackson-annotations)
- [Jackson Databind](https://github.com/FasterXML/jackson-databind)

Jackson Annotation uses the Jackson Core features, and the Jackson Databind uses Jackson Annotation.

### Maven

- [Jackson Core Release](https://github.com/FasterXML/jackson-core/releases)

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-core</artifactId>
  <version>2.9.6</version>
</dependency>

<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-annotations</artifactId>
  <version>2.9.6</version>
</dependency>

<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.9.6</version>
</dependency>
```

## Jackson Databind

Jackson 은 [ObjectMapper](https://jenkov.com/tutorials/java-json/jackson-objectmapper.html) 라는 클래스를 통해서 JSON 과 Object 간의 Serialize/Deserialize 를 한다.
따라서, Jackson ObjectMapper 가 JSON 필드를 Java 필드와 매핑 하는 방법에 대해서 잘 아는 것이 중요하다.

By default Jackson maps the fields of a JSON object to fields in a Java object by matching the names of the JSON field to the getter and setter methods in the Java object.
Jackson removes the "get" and "set" part of the names of the getter and setter methods, and converts the first character of the remaining name to lowercase.

Jackson 과 같은 대부분의 라이브러리들은 Deserialize 시에 [Property](https://baekjungho.github.io/wiki/kotlin/kotlin-property/) 를 사용하여 값을 바인딩 시킨다.

- [Kotlin Jackson Deserialize Data Class](https://baekjungho.github.io/wiki/kotlin/kotlin-deserialize-dataclass/)

즉, Jackson Databind 는 __Property Based Databind__ 라고 할 수 있다. 만약에 다른 방법으로 Databind 를 원하는 경우에는
[Custom Serialize/Deserialize](https://jenkov.com/tutorials/java-json/jackson-objectmapper.html#custom-deserializer) 를 만들어서 사용하거나 [Jackson Annotations](https://github.com/FasterXML/jackson-annotations/wiki/Jackson-Annotations#jackson-annotations) 를 사용하면 된다.

### Public Fields

public 접근 제어자를 갖는 경우에는 getter/setter 가 없더라도 Jackson 으로 직렬화가 가능하다.

```java
public class DtoAccessLevel {
    private String stringValue;
    int intValue;
    protected float floatValue;
    public boolean booleanValue; // Possible to Serialize
    // NO setters or getters
}
```

### A Getter Makes a Non-Public Field Serializable and Deserializable

```java
public class DtoWithGetter {
    private String stringValue; // Possible to Serialize and Deserialize
    private int intValue; // Impossible to Serialize and Deserialize

    public String getStringValue() {
        return stringValue;
    }
}
```

Getter 가 있으면 private 접근 제어자를 갖는 필드도 __Serialize/Deserialize__ 가 가능한데 그 이유는, getter 가 있으면 필드가 아닌 Property 로 간주되기 때문이다.

### A Setter Makes a Non-Public Field Deserializable Only

```java
public class DtoWithSetter {
    private int intValue; // Possible to Deserialize Only

    public void setIntValue(int intValue) {
        this.intValue = intValue;
    }

    public int accessIntValue() {
        return intValue;
    }
}
```

### Make All Fields Globally Serializable

- Turn of Auto Detection

```java
ObjectMapper mapper = new ObjectMapper();
mapper.setVisibility(PropertyAccessor.ALL, Visibility.NONE);
mapper.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
```

## Reflection

Jackson ObjectMapper 를 사용하여 Serialize/Deserialize 를 사용하려면 Default Constructor 가 있어야 한다.
그 이유는 Reflection 을 사용하기 때문이다.

> Almost all frameworks require a default(no-argument) constructor in your class 
> because these frameworks use reflection to create objects by invoking the default constructor

Reflection 을 통해 생성자의 인자 정보는 가져오지 못한다. 따라서 기본 생성자 없이 파라미터가 있는 생성자만 존재한다면 Reflection 이 객체를 생성할 수 없게 되는 것이다.
JPA Hibernate 를 사용할 때에도 Reflection 을 통해 Proxy 객체를 생성하기 때문에 protected or public 접근 제어자를 가진 default constructor 를 필요로 한다.

> The entity class should have a no-argument constructor. Both Hibernate and JPA require this.
JPA requires that this constructor be defined as public or protected. Hibernate, for the most part, does not care about the constructor visibility, as long as the system SecurityManager allows overriding the visibility setting. That said, the constructor should be defined with at least package visibility if you wish to leverage runtime proxy generation.

## Links

- [Java JSON Tutorial - JenKov](https://jenkov.com/tutorials/java-json/jackson-installation.html)
- [Jackson – Decide What Fields Get Serialized/Deserialized](https://www.baeldung.com/jackson-field-serializable-deserializable-or-not)
- [Hibernate - Entity pojo-constructor](https://docs.jboss.org/hibernate/orm/5.0/userguide/html_single/Hibernate_User_Guide.html#entity-pojo-constructor)
- [Deserialize json with Java parameterized constructor](https://blogs.jsbisht.com/blogs/2016/09/12/deserialize-json-with-java-parameterized-constructor)