---
layout  : wiki
title   : Netty Memory Leak
summary : 
date    : 2023-08-25 15:05:32 +0900
updated : 2023-08-25 15:15:24 +0900
tag     : reactive netty
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Netty Memory Leak

### Exchange was deprecated in favor of Retrieve

WebClient 의 [exchange 메서드는 Memory Leak 가능성 때문에 deprecated](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/reactive/function/client/WebClient.RequestHeadersSpec.html) 되었다.

![](/resource/wiki/reactive-netty-memory-leak/exchange-deprecated.png)

__Memory Leak__:

![](/resource/wiki/reactive-netty-memory-leak/memory-leak.png)
