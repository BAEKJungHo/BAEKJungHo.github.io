---
layout  : wiki
title   : Express
summary : 
date    : 2022-05-27 16:54:32 +0900
updated : 2022-05-27 19:15:24 +0900
tag     : nodejs
toc     : true
comment : true
public  : true
parent  : [[/nodejs]]
latex   : true
---
* TOC
{:toc}

## Express

> Node.js 를 위한 빠르고 개방적인 간결한 웹 프레임워크

### Install

```idle
npm install express --save
```

### routing

라우팅은 애플리케이션 엔드 포인트(URI)의 정의, 그리고 URI 가 클라이언트 요청에 응답하는 방식을 말한다.

```javascript
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('hello world');
});
```

라우트는 다양한 메서드를 지원한다. 

```javascript
// GET method route
app.get('/', function (req, res) {
  res.send('GET request to the homepage');
});

// POST method route
app.post('/', function (req, res) {
  res.send('POST request to the homepage');
});
```

만약에, /users, /users/a, /users/a/b 이렇게 3개의 라우트를 미들웨어에 등록한다고 가정해보자. 어떤 순서로 등록을 해야
모든 요청에 대해서 정상적으로 처리할 수 있을까?

```idle
/users/a/b
/users/a
/users
```

위 처럼 디테일한 end-point 를 가장 위쪽에 선언을 해야 한다.

### res

응답 오브젝트에 대한 메소드(res)는 응답을 클라이언트로 전송하고 요청-응답 주기를 종료할 수 있다. 라우트 핸들러로부터 다음 메소드 중 어느 하나도 호출되지 않는 경우, 클라이언트 요청은 정지된 채로 방치된다.

![]( /resource/wiki/node-express/route-res.png)

### app.route()

app.route()를 이용하면 라우트 경로에 대하여 체인 가능한 라우트 핸들러를 작성할 수 있다.

```javascript
app.route('/book')
  .get(function(req, res) {
    res.send('Get a random book');
  })
  .post(function(req, res) {
    res.send('Add a book');
  })
  .put(function(req, res) {
    res.send('Update the book');
  });
```

## 미들웨어 로드 순서

다양한 미들웨어를 사용하는 코드를 보자. 

```kotlin
var express = require('express');
var app = express();

var myLogger = function (req, res, next) {
  console.log('LOGGED');
  next();
};

app.use(myLogger);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000);
```

미들웨어 로드 순서는 먼저 로드되는 미들웨어 함수가 먼저 실행된다. 루트 경로에 대한 라우팅 이후에 myLogger 가 로드되면, 루트 경로의 라우트 핸들러가 요청-응답 주기를 종료하므로 요청은 절대로 myLogger 에 도달하지 못하며 앱은 “LOGGED”를 인쇄하지 않는다.

다음 코드를 보자.

```javascript
var express = require('express');
var app = express();

var requestTime = function (req, res, next) {
  req.requestTime = Date.now();
  next();
};

app.use(requestTime);

app.get('/', function (req, res) {
  var responseText = 'Hello World!';
  responseText += 'Requested at: ' + req.requestTime + '';
  res.send(responseText);
});

app.listen(3000);
```

위 코드는 루트에 대한 요청을 실행할 때, 요청의 타임스탬프를 브라우저에 표시한다.

## Links

- [express](https://expressjs.com/)
- [express routing](https://expressjs.com/en/guide/routing.html)
- [express writing middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [using middleware](https://expressjs.com/en/guide/using-middleware.html)