---
layout  : wiki
title   : Masking
summary : 
date    : 2023-04-21 20:54:32 +0900
updated : 2023-04-21 21:15:24 +0900
tag     : logging
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

## Masking Sensitive Data

- [Logstash Logback Encoder](https://github.com/logfellow/logstash-logback-encoder) is Logback JSON encoder and appenders
- Logstash 를 사용하는 경우 [MaskingJsonGeneratorDecorator](https://github.com/logfellow/logstash-logback-encoder#masking) 를 사용해서 Masking 가능
- Path([PathBasedFieldMasker](https://github.com/logfellow/logstash-logback-encoder/blob/main/src/main/java/net/logstash/logback/mask/PathBasedFieldMasker.java)) 기반으로 Masking 처리가 가능함
- [Mask Sensitive Data in Logs With Logback](https://www.baeldung.com/logback-mask-sensitive-data)

__Sample__

```xml
<configuration>
    <appender name="jsonConsoleAppender" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <jsonGeneratorDecorator class="net.logstash.logback.mask.MaskingJsonGeneratorDecorator">

                <defaultMask>****</defaultMask>

                <path>document</path>
                <path>email</path>
                <path>token</path>
                <path>password</path>
                <path>auth</path>

            </jsonGeneratorDecorator>
        </encoder>
    </appender>
    <root level="INFO">
        <appender-ref ref="jsonConsoleAppender"/>
    </root>
</configuration>
```

예를 들어 UserDto 가 아래와 같은 경우, Dto 객체를 로그에 그대로 찍는 경우 민감 정보들이 마스킹 되지 않는다.

```java
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
}
```

```
// 이 때, 객체의 toString() 을 호출하게 된다. toString() 이 없다면 객체의 주소가 찍히게 된다.
log.info(" # [Login] User : {}, userDto);
```

이때, __MaskingUtils 와 toString 을 오버라이딩하여 직접 구현하는 방식__ 으로 해결할 수 있다.


```java
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    
    @Override 
    public String toString() {
        "UserDto : {" +
                "id: " + id +
                "name: " + MaskingUtils.mask(name) +
                "email: " + MaskingUtils.mask(email) +
                "phone: " + MaskingUtils.mask(phone) +
                " }";
    }
}
```