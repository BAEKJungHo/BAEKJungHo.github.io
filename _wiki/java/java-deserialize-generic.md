---
layout  : wiki
title   : Deserialize Generic
summary : 
date    : 2023-08-16 11:28:32 +0900
updated : 2023-08-16 12:15:24 +0900
tag     : java kotlin jackson
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Deserialize Generic

com.fasterxml.jackson 을 사용하여 serialize/deserialize 를 수행한다. Generic Type 의 경우 어떻게 deserialize 할 수 있는지 알아보자.

![](/resource/wiki/java-deserialize-generic/readvalue-jackson.png)

ObjectMapper 의 deserialize 를 수행하는 readValue 메서드를 살펴보면 위와 같은 코드가 존재한다.

2가지 방법으로 deserialize 를 수행할 수 있다.

### TypeReference

```java
public abstract class TypeReference<T> implements Comparable<TypeReference<T>> {
    protected final Type _type;

    protected TypeReference() {
        Type superClass = this.getClass().getGenericSuperclass();
        if (superClass instanceof Class) {
            throw new IllegalArgumentException("Internal error: TypeReference constructed without actual type information");
        } else {
            this._type = ((ParameterizedType)superClass).getActualTypeArguments()[0];
        }
    }

    public Type getType() {
        return this._type;
    }

    public int compareTo(TypeReference<T> o) {
        return 0;
    }
}
```

this._type = ((ParameterizedType)superClass).getActualTypeArguments() 이 코드가 핵심인데, 일반 유형 정보를 보존하기 위해
[Super Type Tokens](https://www.baeldung.com/java-super-type-tokens) 라는 개념을 사용하게 된다.

단계 별로 살펴보자.

```java
TypeReference<Map<String, Integer>> token = new TypeReference<Map<String, String>>() {};
```

먼저 위 처럼 익명 클래스를 생성한다. (__Anonymous classes are inner classes with no name.__)

Inner Class 이기 때문에 자신을 둘러싼 클래스에 대해서 참조를 갖게 된다. 

1. Super Class Metadata 가져오기 - `TypeReference<Map<String, Integer>>`
2. Super Class 에 대한 actual type parameter 가져오기 - `Map<String, Integer>`

__This approach for preserving the generic type information is usually known as super type token__:

```java
TypeReference<Map<String, Integer>> token = new TypeReference<Map<String, Integer>>() {};
Type type = token.getType();

assertEquals("java.util.Map<java.lang.String, java.lang.Integer>", type.getTypeName());

Type[] typeArguments = ((ParameterizedType) type).getActualTypeArguments();
assertEquals("java.lang.String", typeArguments[0].getTypeName());
assertEquals("java.lang.Integer", typeArguments[1].getTypeName());
```

### JavaType

아래와 같이 JavaType 을 활용하여 deserialize 를 할 수 있다.

```java
JavaType javaType = objectMapper.getTypeFactory().constructParametricType(JsonResponse.class, User.class);
JsonResponse<User> jsonResponse = objectMapper.readValue(json, javaType);
```

## Links

- [Deserialize Generic Type with Jackson](https://www.baeldung.com/java-deserialize-generic-type-with-jackson)