---
layout  : wiki
title   : Deserialize Data Class
summary : 코틀린 Data Class 역직렬화 하기
date    : 2022-10-03 15:54:32 +0900
updated : 2022-10-03 20:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## No Creators, cannot deserialize from Object value

Kotlin 에서 data class 를 사용하여 API 통신을 하다보면 __No Creators, like default construct, exist): cannot deserialize from Object value (no delegate- or property-based Creator__ 이런 에러를 마주치곤한다.

```kotlin
class TokenDto {

    data class Response(
        val accessToken: String,
        val refreshToken: String,
        val email: String? = "",
        val status: TokenIssueStatus
    )
}
```

default constructor 가 없으면 Jackson Library 가 모델을 생성하는방법을 모르기 때문에 발생한다. 

### @JsonProperty

Jackson 은 기본적으로 Property 로 동작한다. 프로퍼티는 멤버변수랑은 다르다. Java 의 프로퍼티는 보통 getter/setter 의 이름 명명 규칙으로 정해진다. 

> Jackson 뿐만 아니라 대부분의 라이브러리들이 Property 개념으로 동작한다.

```java
public class TokenDto {
    
    private String accessToken;
 
    // Jackson 이 사용하는 이름
    public getToken() {
        return accessToken;
    }
}
```

Jackson 의 데이터 매핑을 Getter 가 아닌 멤버변수로 하고 싶은 경우에는 `@JsonProperty` 어노테이션을 사용하면 된다. 기본 생성자가 없더라도 deserialize 가 가능하다.

```kotlin
class TokenDto {

    data class Response(
        @JsonProperty val accessToken: String,
        @JsonProperty val refreshToken: String,
        @JsonProperty val email: String? = "",
        @JsonProperty val status: TokenIssueStatus
    )
}
```

### @JsonAutoDetect

일일이 @JsonProperty 를 붙이기 귀찮다면, @JsonAutoDetect 를 사용하면 된다.

@JsonAutoDetect 는 멤버변수 뿐만 아니라, getter/setter 의 데이터 매핑 정책도 정할 수 있다. 아래의 경우는 멤버변수 뿐만 아니라, 기본정책인 getter 역시 데이터 매핑이 진행된다.

```kotlin
class TokenDto {

    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    data class Response(
        val accessToken: String,
        val refreshToken: String,
        val email: String? = "",
        val status: TokenIssueStatus
    )
}
```

### Adding Default Values to the Primary Constructor

data class 의 primary constructor 의 parameter 에 기본 값을 설정할 수 있다. 이러한 방식은 객체를 생성함에 있어서 유연성을 제공해 준다.

```kotlin
class TokenDto {

    data class Response(
        val accessToken: String = "",
        val refreshToken: String = "",
        val email: String? = "",
        val status: TokenIssueStatus = TokenIssueStatus.SUCCESS
    )
}

// 기본 생성자를 호출하여 객체 생성
val response = TokenDto.Response()
```

### FasterXML - jackson-module-kotlin

다음으로는 [FasterXML - jackson-module-kotlin](https://github.com/FasterXML/jackson-module-kotlin) 라이브러리를 사용하는 것이다.

> Module that adds support for serialization/deserialization of Kotlin classes and data classes. Previously a default constructor must have existed on the Kotlin object for Jackson to deserialize into the object. With this module, single constructor classes can be used automatically, and those with secondary constructors or static factories are also supported.

### Custom Annotation with NoArg Plugin

plugin.jpa 플러그인을 사용 하면 @Entity, @Embeddable, @MappedSuperclass 어노테이션을 사용해면 no-arg 생성자(기본 생성자)가 자동으로 생성된다.

> noArg Plugin 은 default constructor 를 만든다. plugin.jpa 플러그인을 사용하면 @Entity, @Embeddable, @MappedSuperclass 어노테이션을 사용했을 때 default constructor 를 생성한다. Hibernate 는 Reflection 으로 객체를 생성하기 때문에 protected 이상의 생성자가 필요하다.

- __noArg Plugin__

```
noArg {
    annotation("org.clonecoder.member.common.support.NoArg")
}
```

- __Create Custom Annotation__

```kotlin
annotation class NoArg
```

- __data class__

```kotlin
class TokenDto {

    @NoArg
    data class Response(
        val accessToken: String,
        val refreshToken: String,
        val email: String? = "",
        val status: TokenIssueStatus
    )
}

```

### synthetic method

생성자의 파라미터나, 필드를 private val/var 로 선언한 경우에는 프로퍼티가 생성되지 않는다. 따라서 @JsonProperty 혹은 @JsonAutoDetect 를 활성화 시켜야 Serialize/Deserialize 가 가능해진다.

```kotlin
class CommonResponse {

    // Is Not Property
    private var result: Result? = null
    private var data: T? = null
    
    // property
    var message: String? = null
    var errorCode: String? = null
    var errorFields: List<ErrorField>? = emptyList()
    
    // ...
}
```

- __Decompile__

```java
public final class CommonResponse {
    private Result result;
    private Object data;
    @Nullable
    private String message;
    @Nullable
    private String errorCode;
    @Nullable
    private List errorFields = CollectionsKt.emptyList();
    @NotNull
    public static final Companion Companion = new Companion((DefaultConstructorMarker) null);

    @Nullable
    public final String getMessage() {
        return this.message;
    }

    public final void setMessage(@Nullable String var1) {
        this.message = var1;
    }

    @Nullable
    public final String getErrorCode() {
        return this.errorCode;
    }

    public final void setErrorCode(@Nullable String var1) {
        this.errorCode = var1;
    }

    @Nullable
    public final List getErrorFields() {
        return this.errorFields;
    }

    public final void setErrorFields(@Nullable List var1) {
        this.errorFields = var1;
    }

    // $FF: synthetic method
    public static final Result access$getResult$p(CommonResponse $this) {
        return $this.result;
    }

    // $FF: synthetic method
    public static final Object access$getData$p(CommonResponse $this) {
        return $this.data;
    }
   
    // ...
}
```

- private [Visibility Modifier](https://kotlinlang.org/docs/visibility-modifiers.html) 를 붙이지 않은 필드는 프로퍼티가 생성된다.
- 반면, private 이 붙은 경우에는 synthetic method 라는 것이 생긴다.
- synthetic method 는 kotlin 을 JVM 에서 컴파일 하기 위해서 컴파일러가 만드는 method 이다. 
  - [KOTLIN-JVM-SYNTHETIC](https://en.getdocs.org/kotlin-jvm-synthetic/)
  - Any element that the compiler marks as synthetic will be inaccessible from the Java language.

## Next

- [JavaBeans and Property](https://baekjungho.github.io/wiki/kotlin/kotlin-property/)

## Links

- [FasterXML - jackson-module-kotlin](https://github.com/FasterXML/jackson-module-kotlin)
- [Jackson 라이브러리 이해하기](https://mommoo.tistory.com/83)
- [Kotlin 으로 Spring 개발할 때](https://cheese10yun.github.io/spring-kotlin)
- [Instantiate a Kotlin Data Class Using an Empty Constructor](https://www.baeldung.com/kotlin/instantiate-data-class-empty-constructor)
- [NoArg Plugin - Kotlin Docs](https://kotlinlang.org/docs/no-arg-plugin.html)
- [Jackson Kotlin - Baeldung](https://www.baeldung.com/kotlin/jackson-kotlin)