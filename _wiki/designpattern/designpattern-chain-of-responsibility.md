---
layout  : wiki
title   : CHAIN OF RESPONSIBILITY
summary : 
date    : 2025-04-14 15:28:32 +0900
updated : 2025-04-14 18:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## CHAIN OF RESPONSIBILITY

![](/resource/wiki/designpattern-chain-of-responsibility/chain-of-responsibility-meaning.png)

### Design Principle

![](/resource/wiki/designpattern-chain-of-responsibility/cor-structure.png)

- __Defines__
  - 요청을 보내는 쪽(sender)과 요청을 처리하는 쪽(receiver)의 분리하는 패턴
  - Handler Chain 이라는 것을 사용해서 요청을 처리
- __Benefits__
  - 클라이언트 코드를 변경하지 않고 새로운 핸들러를 체인에 추가할 수 있다.
  - 각각의 체인은 자신이 해야하는 일만 한다.
  - 체인을 다양한 방법으로 구성할 수 있다
- __Usage__
  - [Java Servlet Filter](https://docs.oracle.com/javaee/7/api/javax/servlet/FilterChain.html)
  - [Spring Security Filter](https://docs.spring.io/spring-security/site/docs/4.2.1.RELEASE/reference/htmlsingle/#security-filter-chain)
    - [How to Spring Security filter chain works](https://stackoverflow.com/questions/41480102/how-spring-security-filter-chain-works)

![](/resource/wiki/designpattern-chain-of-responsibility/cor.png)

책임 연쇄 패턴은 프레임워크에서 사용하는 필터, 인터셉터, 플러그인을 개발하기 위해 사용된다.

### RequestHandler

```java
public abstract class RequestHandler {

    private RequestHandler nextHandler;

    public RequestHandler(RequestHandler nextHandler) {
        this.nextHandler = nextHandler;
    }

    public void handle(Request request) {
        if (nextHandler != null) {
            nextHandler.handle(request);
        }
    }
}
```

### AuthRequestHandler

```java
public class AuthRequestHandler extends RequestHandler {

    public AuthRequestHandler(RequestHandler nextHandler) {
        super(nextHandler);
    }

    @Override
    public void handle(Request request) {
        System.out.println("Authorization");
        super.handle(request);
    }
}
```

### LoggingRequestHandler

```java
public class LoggingRequestHandler extends RequestHandler {

    public LoggingRequestHandler(RequestHandler nextHandler) {
        super(nextHandler);
    }

    @Override
    public void handle(Request request) {
        System.out.println("Logging");
        super.handle(request);
    }
}
```

### Client

```java
public class Client {

    private RequestHandler requestHandler;

    public Client(RequestHandler requestHandler) {
        this.requestHandler = requestHandler;
    }

    public void doWork() {
        Request request = new Request("body");
        requestHandler.handle(request);
    }

    public static void main(String[] args) {
        RequestHandler chain = new AuthRequestHandler(new LoggingRequestHandler(new PrintRequestHandler(null)));
        Client client = new Client(chain);
        client.doWork();
    }
}
```

## Links

- [Chain of Responsibility - Guru](https://refactoring.guru/design-patterns/chain-of-responsibility)
- [GoF DesignPattern - Inflearn](https://www.inflearn.com/course/%EB%94%94%EC%9E%90%EC%9D%B8-%ED%8C%A8%ED%84%B4/dashboard)

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争
- Head First Design Pattern / 에릭 프리먼, 엘리자베스 프리먼, 케이시 시에라, 버트 베이츠 저 / O'REILLY
- Java 객체지향 디자인 패턴 / 정인상, 채흥석 저 / 한빛미디어