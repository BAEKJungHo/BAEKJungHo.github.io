---
layout  : wiki
title   : Response and Exception Handling
summary : ControllerAdvice, ExceptionHandler and ResponseBodyAdvice
date    : 2022-12-08 09:28:32 +0900
updated : 2022-12-08 12:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## ControllerAdvice

- [ControllerAdvice](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/ControllerAdvice.html)
- @ExceptionHandler 와 같이 사용하면 예외를 글로벌하게 Catch 하여 처리할 수 있다.
- [Global Exception Handling With @ControllerAdvice - DZone](https://dzone.com/articles/global-exception-handling-with-controlleradvice)
- [Exception Handling With @ControllerAdvice in Spring 3.2](https://javabeat.net/exception-controlleradvice-spring-3-2/)
- [Spring From the Trenches: Adding Validation to a REST API](https://www.petrikainulainen.net/programming/spring-framework/spring-from-the-trenches-adding-validation-to-a-rest-api/)
  - [Spring Validation](https://baekjungho.github.io/wiki/spring/spring-validation/)
- 주요 Spring MVC Exception 에 대해 오버라이드 하지 말 것
  - [Spring MVC part V: Exception handling - DuyHai's Java Blog](https://doanduyhai.wordpress.com/2012/05/06/spring-mvc-part-v-exception-handling/)
  - [DefaultHandlerExceptionResolver](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.html)

## HandlerExceptionResolver

- [HandlerExceptionResolver](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerExceptionResolver.html)
- Spring MVC 의 예외 처리를 담당한다.
- @ControllerAdvice 를 사용하는게 더 좋다.
- [AbstractHandlerExceptionResolver](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/handler/AbstractHandlerExceptionResolver.html) 나 [SimpleMappingExceptionResolver](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/handler/SimpleMappingExceptionResolver.html) 를 상속하여 구현하면 좋다.
  이때 logException() 과 buildLogMessage() 메서드를 Override 하여 자신이 사용하는 로그 라이브러리에 로그를 남기도록 처리하는 것이 좋다.
- [Error Handling for REST with Spring - Baeldung](https://www.baeldung.com/exception-handling-for-rest-with-spring)

## HTTP Problem

- [Problem Spring Web](https://github.com/zalando/problem-spring-web)
- [RFC 7807 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- HTTP API 에 대해 오류 발생시 문제점에 대한 JSON/XML 표준 응답
- [A standardized error format for HTTP responses](https://www.mscharhag.com/api-design/rest-error-format)

## ResponseBodyAdvice

- [ResponseBodyAdvice](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseBodyAdvice.html)
- 반환된 body 의 데이터들을 선택된 converter 를 이용하여 json 으로 serialize 하기 전에 호출된다.

```java
@RestControllerAdvice
public class CommonResponseAdvice implements ResponseBodyAdvice {

    /**
     * Whether this component supports the given controller method return type
     * and the selected {@code HttpMessageConverter} type.
     * @param returnType the return type
     * @param converterType the selected converter type
     * @return {@code true} if {@link #beforeBodyWrite} should be invoked;
     * {@code false} otherwise
     */
    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    /**
     * Invoked after an {@code HttpMessageConverter} is selected and just before
     * its write method is invoked.
     * @param body the body to be written
     * @param returnType the return type of the controller method
     * @param selectedContentType the content type selected through content negotiation
     * @param selectedConverterType the converter type selected to write to the response
     * @param request the current request
     * @param response the current response
     * @return the body that was passed in or a modified (possibly new) instance
     */
    @Override
    public T beforeBodyWrite(T body, MethodParameter returnType, MediaType selectedContentType, Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {
        // ExceptionHandlerAdvice 또는 Controller 에서 ResponseEntity or CommonResponse 를 리턴하는 경우 별도 작업 없이 처리
        if (body instanceof ResponseEntity || body instanceof CommonResponse) {
            return body;
        }
        
        // 그 외에는 작업할 내용 작성...
        
        return body;
    }
}
```

## Links

- [ControllerAdvice - kwonnam](https://kwonnam.pe.kr/wiki/springframework/mvc/controlleradvice)