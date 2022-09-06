---
layout  : wiki
title   : HTTP API Response Specification
summary : HTTP API 응답 체계
date    : 2022-08-05 15:54:32 +0900
updated : 2022-08-05 20:15:24 +0900
tag     : http
toc     : true
comment : true
public  : true
parent  : [[/http]]
latex   : true
---
* TOC
{:toc}

## 다양한 API 응답 체계

> API 응답 체계는 시스템 전체가 일관되고 명확한 형태를 가지면, 어떤 구조든지 문제가 되지 않는다. 즉, API 응답이 명시적이고 일관되는 것이 가장 중요하다.

- __[Google](https://cloud.google.com/storage/docs/json_api/v1/status-codes)__
  - Http Status Code 적극 활용
  - Successful requests return HTTP status codes in the 2xx range. 
  - Failed requests return status codes in the 4xx and 5xx ranges.
- __[Facebook](https://developers.facebook.com/docs/graph-api/guides/error-handling)__
  - Http Status Code 를 적극적으로 활용하지는 않는 편
  - code 와 error_subcode 라고 별도로 정의한 값으로 에러를 표현
