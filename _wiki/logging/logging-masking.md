---
layout  : wiki
title   : Mask Sensitive Data 
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

## Mask Sensitive Data 

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

