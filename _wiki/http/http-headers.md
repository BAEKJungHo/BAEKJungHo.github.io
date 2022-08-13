---
layout  : wiki
title   : HTTP Headers
summary : HTTP Header 의 종류
date    : 2022-07-16 15:54:32 +0900
updated : 2022-07-16 20:15:24 +0900
tag     : http
toc     : true
comment : true
public  : true
parent  : [[/http]]
latex   : true
---
* TOC
{:toc}

# Headers

## General Header

> 요청과 응답 양쪽에 모두 사용하는 헤더 필드, 헤더가 사용되고있는 컨텍스트에 따라 request header 또는 response header 로 분류된다. entity header 는 아니다.

| Type | HTTP Version | Description  |
|------|--------------|--------------|
|Date  |HTTP 1.0, HTTP 1.1 | 요청과 응답이 작성된 날짜를 의미|
|Pragma|HTTP 1.0, HTTP 1.1 | 데이터의 캐시를 허용할지의 여부를 나타내는 통신 옵션을 지정|
|Cache-Control|HTTP 1.1 | 캐시를 제어하기 위한 정보|
|Connection|HTTP 1.1| 응답 송신 후에 TCP 에 계속 접속할지, 아니면 연결을 끊을지를 나타내는 통신 옵션을 지정|
|Transfer-Encoding|HTTP 1.1|메시지 본문의 인코딩 방식을 의미|
|Via|HTTP 1.1|도중에 경유한 프록시나 게이트웨이를 기록|

## Request Header

> 요청의 부가 정보로 사용하는 헤더 필드

| Type | HTTP Version | Description  |
|------|--------------|--------------|
|Authorization  |HTTP 1.0, HTTP 1.1 | 사용자 인증용 데이터|
|From| HTTP 1.0, HTTP 1.1 | 요청 발신자의 메일 주소|
|If-Modified-Since| HTTP 1.0, HTTP 1.1 | 지정한 날짜 이후 정보가 갱신된 경우에만 요청을 실행하려고 필드값으로 이 날짜를 지정. 보통 클라이언트 측에서 캐시에 저장한 정보를 비교하고, 이것이 오래된 경우에 새 정보를 받으려고 할 때 사용|
|Referer| HTTP 1.0, HTTP 1.1 | 하이퍼링크를 거쳐 어느 페이지를 읽은 경우 등에 링크 대상인 URI 를 나타냄|
|User-Agent| HTTP 1.0, HTTP 1.1 | 클라이언트 소프트웨어의 명칭이나 버전에 관한 정보|
|Accept| HTTP 1.0, HTTP 1.1 | 클라이언트 측이 Content-Type 으로 받는 데이터의 종류, MIME 사양의 데이터 타입으로 표현한 것|
|Accept-Charset| HTTP 1.0, HTTP 1.1 | 클라이언트 측이 받은 문자 코드 세트|
|Accept-Encoding| HTTP 1.0, HTTP 1.1 | 클라이언트 측이 Content-Encoding 으로 받은 인코딩 방식. 보통 데이터 압축 형식을 나타냄|
|Accept-Language| HTTP 1.0, HTTP 1.1 | 클라이언트 측이 받은 언어의 종류. 한국어는 ko, 영어는 en|
|Host| HTTP 1.1 | 요청을 받는 서버의 IP 주소와 포트 번호|
|If-Match| HTTP 1.1 | Etag 참조|
|If-None-Match| HTTP 1.1 | Etag 참조|
|If-Unmodified-Since| HTTP 1.1 | 지정한 날짜 이후 갱신되지 않은 경우에만 요청을 실행|
|Range| HTTP 1.1 | 데이터 전체가 아니라 일부만 읽을 때 해당 범위를 지정|

## Response Header

> 응답의 부가 정보로 사용되는 헤더 필드

| Type | HTTP Version | Description  |
|------|--------------|--------------|
|Location  |HTTP 1.0, HTTP 1.1 | 정보의 정확한 장소를 의미. 요청의 URI 가 상대 이름으로 지정된 경우 절대 이름으로 했을 때의 정보의 위치를 통지하기 위해 사용|
|Server| HTTP 1.0, HTTP 1.1 | 서버 소프트웨어의 명칭이나 버전에 관한 정보|
|WWW-Authenticate| HTTP 1.0, HTTP 1.1 | 요청한 정보에 대한 액세스가 제한되어 있는 경우 사용자 인증용 데이터 등을 반송|
|Accept-Range| HTTP 1.1 | 데이터의 일부만 요청하는 Range 를 지정한 경우 서버가 해당 기능을 가지고 있는지의 여부를 클라이언트에 통지|

## Entity Header

> 엔티티(메시지 본문)의 부가 정보로 사용하는 헤더 필드

| Type | HTTP Version | Description  |
|------|--------------|--------------|
|Allow  |HTTP 1.0, HTTP 1.1 | 지정한 URI 로 사용 가능한 메서드를 의미|
|Content-Encoding  |HTTP 1.0, HTTP 1.1 | 메시지 본문에 압축 등의 인코딩 처리가 되어 있는 경우 해당 방식을 의미|
|Content-Length  |HTTP 1.0, HTTP 1.1 | 메시지 본문의 길이를 의미|
|Expires  |HTTP 1.0, HTTP 1.1 |  메시지 본문의 유효 기간을 의미|
|Last-Modified  |HTTP 1.0, HTTP 1.1 | 정보를 최종 변경한 일시|
|Content-Language | HTTP 1.1 | 메시지 본문의 언어를 의미. 한국어는 ko, 영어는 en|
|Content-Location | HTTP 1.1 | 메시지 본문이 서버의 어디에 놓여 있는지 위치를 URI 로 나타냄|
|Content-Range | HTTP 1.1 | 데이터 전체가 아니라 일부가 요청된 경우 메시지 본문에 어느 범위의 데이터가 포함되어 있는지를 나타냄|
|Etag | HTTP 1.1 | 갱신 처리 등에서 이전 요청의 응답을 바탕으로 한 갱신 데이터를 다음 요청에서 송신하는 경우가 있는데, 이 때 이전 응답과 다음 요청을 관련시키기 위해 사용하는 정보. 이전 응답에서 서버가 Etag 에 따라 고유한 값을 클라이언트에 건네주고, 다음 번 요청의 If-Match, If-None-Match, If-Range 필드에서 값을 서버에 통지하면 서버는 이전 회의 계속이라고 인식한다. 쿠키라는 필드와 역할이 같은데, 쿠키는 넷스케이프의 독자적인 사양이며, Etag 는 이것을 표준화 한 것|

## Links

- [RFC 4229](https://www.rfc-editor.org/rfc/rfc4229)
- [Http Headers](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers)

## 참고 문헌

- 성공과 실패를 결정하는 1% 의 네트워크 원리 / Tsutomu Tone 저 / 성안당