---
layout  : wiki
title   : Cookie, Session, Storage
summary : 
date    : 2022-05-20 15:54:32 +0900
updated : 2022-05-20 20:15:24 +0900
tag     : http
toc     : true
comment : true
public  : true
parent  : [[/http]]
latex   : true
---
* TOC
{:toc}

## Cookie

- Server 에서 쿠키를 설정하여 Client 로 전송

로컬스토리지와 세션스토리지가 등장하기 이전에도 브라우저에 저장소의 개념이 존재했는데, 그 역할이 바로 쿠키(Cookie)다.

쿠키는 만료 기간(expiration-period)이 있는 key-value 형식의 저장소이며, 4kb 라는 용량 제한이 있다.

클라이언트의 서버 요청마다 쿠키는 항상 같이 전송되는데 그 이유는 HTTP 의 stateless 한 특징 때문이다.

> __stateless__ - HTTP 요청간 상태를 저장하지 않는다는 의미다. 클라이언트와 서버간 HTTP 요청에 있어서 서버가 클라이언트가 이전에 요청한 상태를 저장하지 않는다는 의미.

만약, 4kb 의 크기를 가진 쿠키를 서버로 전송한다고하면 그 속에는 서버에서 사용할 일이 없는 불필요한 데이터도 포함되어있을 것이다.
이러한 데이터를 스토리지에 저장하면 된다.

스토리지는 도메인별 용량 제한이 있으며, SOP 를 따르므로, 프로토콜, 호스트, 포트가 같으면 같은 저장소를 공유한다.

> 저장소의 크기는 모바일은 2.5MB, 데스크탑은 5~10MB 이며, 더 큰 용량이 필요하다면 50MB를 기본적으로 저장할 수 있는 IndexedDB 가 있다.

### Cookie Send Structures

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie: car=genesis
Set-Cookie: color=black
```

클라이언트는 서버에서 쿠키 저장 요청을 받아 쿠키 저장소에 쿠키를 저장하게 된다. 그 후 서버로 가는 모든 요청에 쿠키를 담아서 서버로 보내게 된다.

```
Cookie: car=genesis; color=black
```

### Cookie options

- __HttpOnly__
  - 브라우저에서 쿠키를 저장할 때 사용하는 옵션으로, 해당 옵션이 활성화된 쿠키는 Javascript 에 접근할 수 없다.
XSS 공격에서 사용자의 세션 정보를 악용하는 것을 방지할 수 있다. 따라서, HttpOnly 옵션을 사용하면 안정성이 향상될 수 있다.
- __SameSite__
  - SameSite 옵션은 SameSite 옵션에서 지정한 정책에 따라, 다른 사이트로부터의 요청에서 쿠키가 전송되지 않게 할 수 있다. (CSRF 공격을 방지할 수 있다.)

### Session Cookie vs Persistent Cookie

세션 쿠키(session cookie)는 브라우저가 종료되는 즉시 삭제되는 쿠키를 의미한다. 반면, 영속 쿠키(persistent cookie)는 만료날짜를 설정하여 그 기간동안 유지되는 쿠키를 의미한다.

- __Set Expiration__
  - Set-Cookie: expires=Thu, 08-Dec-2022 19:39:21 GMT - 만료일이 되면 쿠키 삭제
  - Set-Cookie: max-age=3600 - 0 이나 음수를 지정하면 쿠키 삭제 (3600 초)

## Session

쿠키인데 데이터를 서버에 저장하는 것(= `쿠키 상위호환`)

- __When use ?__
  - 예를 들어 사용자가 로그인을 하게되면 서버는 클라이언트가 로그인 되었다는 상태를 유지시켜야 한다. Stateful 하게 만들기 위해 세션과 쿠키를 사용하게 된다. 클라이언트가 서버에 요청하면 서버는 새 세션을 작성하고 고유한 세션 ID 를 생성한다. 그 다음 서버는 쿠키의 형태로 세션 ID 를 클라이언트에 다시 보내고 클라이언트는 쿠키를 로컬 메모리에 저장한다.
  - 저장 이후의 후속 요청 부터, 클라이언트는 쿠키를 서버로 다시 전송하여 서버가 세션 ID 에 기반한 올바른 세션과 요청을 연결할 수 있도록 한다. 이렇게 하면 서버는 여러 요청과 상호 작용에 걸쳐 사용자의 환경설정 및 쇼핑 카트 내용과 같은 사용자에 대한 상태 저장 정보를 유지 관리할 수 있다.

## Storage

> 로컬스토리지와 세션스토리지는 HTML5 에 추가된 key-value 형태의 저장소이다.

이 둘의 차이는 __데이터의 영구성__ 이다.

세션스토리지에 있는 데이터는 브라우저를 닫으면 데이터가 사라진다. 반면, 로컬스토리지에 있는 데이터는 사용자가
데이터를 직접 지우지 않는 이상 계속 남아있다.

지속적으로 서버에게 전달되어야 하는 데이터(Ex. 자동 로그인을 위한 토큰 등)은 로컬스토리지에 저장하고,
일회성으로 사용되는 데이터는 세션스토리지에 저장하면 된다.

> 단, 개인정보와 같이 외부에 노출되서는 안되는 중요한 정보들은 로컬스토리지든 세션스토리지든 클라이언트에 저장하면 안된다.

로컬스토리지와 세션스토리지에 저장된 데이터는 클라이언트에서 서버로 요청시마다 같이 전송되지 않는다.

## Links

- [Local Storage and Session Storage](https://www.zerocho.com/category/HTML&DOM/post/5918515b1ed39f00182d3048)
