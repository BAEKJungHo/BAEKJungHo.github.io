---
layout  : wiki
title   : Cross-Origin Resource Sharing
summary : 
date    : 2024-08-28 17:02:32 +0900
updated : 2024-08-28 18:12:24 +0900
tag     : api cors
toc     : true
comment : true
public  : true
parent  : [[/api]]
latex   : true
---
* TOC
{:toc}

## Cross-Origin Resource Sharing

___[CORS(Cross-Origin Resource Sharing)](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)___ 는 웹 브라우저에서 실행되는 스크립트가 다른 출처(도메인, 프로토콜, 포트)의 리소스에 접근할 수 있도록 허용하는 보안 메커니즘이다.

__[CORS Error](https://towardsdev.com/cross-origin-resource-sharing-cors-b0304911b241)__:

![](/resource/wiki/api-cors/cors.png)

__What is Cross-Origin__:

다른 출처(cross-origin) 이란 ___protocol, domain, port___ 중 하나라도 다른 경우를 의미한다.

```
https://hoxy.x.com:80/**
https://hoxy-z.com:80/**
```

모든 브라우저들은 ___[Same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy)___ Security Policy 를 따라야 한다.
Script 내의 HTTP 요청이 SOP 정책을 따르며, HTML 요청에 대해서는 Cross-Origin 요청이 가능하다.


__[Simple request example](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)__:

하나의 서비스를 개발하는데, 서버와 클라이언트의 도메인이 서로 다른 경우 서버에서 cross-origin request 를 허용해야 한다.

