---
layout  : wiki
title   : Spring Security
summary : 
date    : 2022-09-18 21:28:32 +0900
updated : 2022-09-18 22:15:24 +0900
tag     : spring security
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

# Security Core

## SecurityContextHolder

- Default Strategy: ThreadLocal
  - [Thread Local 사용 시 주의해야할 점](https://baekjungho.github.io/wiki/spring/spring-concurrency/#threadlocal-%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%A0-%EB%95%8C%EB%8F%84-%EC%A3%BC%EC%9D%98%EC%A0%90%EC%9D%B4-%EC%9E%88%EB%8A%94%EB%8D%B0)
- SecurityContext 를 저장
  - MODE_THREADLOCAL: 스레드당 SecurityContext 객체 할당
  - MODE_INHERITABLETHREADLOCAL: 메인 스레드와 자식 스레드에 관하여 동일한 SecurityContext 유지
  - MODE_GLOBAL: 응용 프로그램에서 단 하나의 SecurityContext 를 저장
- SecurityContextHolder().clearContext(): SecurityContext 기존 정보 초기화

### SecurityContext

- Authentication 객체가 저장되는 보관소
- ThreadLocal 에 저장되어 아무 고셍서나 참조 가능
- 인증이 완료되면 HttpSession 에 저장되어 애플리케이션 전바에 걸쳐 전역적인 참조 가능

### ThreadLocalSecurityContextHolderStrategy

```java
final class ThreadLocalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {

	private static final ThreadLocal<SecurityContext> contextHolder = new ThreadLocal<>();

	@Override
	public void clearContext() {
		contextHolder.remove();
	}

	@Override
	public SecurityContext getContext() {
		SecurityContext ctx = contextHolder.get();
		if (ctx == null) {
			ctx = createEmptyContext();
			contextHolder.set(ctx);
		}
		return ctx;
	}

	@Override
	public void setContext(SecurityContext context) {
		Assert.notNull(context, "Only non-null SecurityContext instances are permitted");
		contextHolder.set(context);
	}

	@Override
	public SecurityContext createEmptyContext() {
		return new SecurityContextImpl();
	}
}
```

# Config

## WebSecurityConfigurerAdapter

[Spring Security without the WebSecurityConfigurerAdapter](https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter). In Spring Security 5.7.0-M2 we __deprecated__ the WebSecurityConfigurerAdapter,

- __AS-IS__

```kotlin
@EnableWebSecurity
class WebSecurity: WebSecurityConfigurerAdapter() {
  override fun configure(web: WebSecurity) { 
  }
  
  override fun configure(http: HttpSecurity) { 
  }
}
```

- __TO-BE__

```kotlin
@EnableWebSecurity
class SecurityConfig {

  private val log = LoggerFactory.getLogger(this::class.java)

  @Bean
  fun webSecurityCustomizer(): WebSecurityCustomizer {
    return WebSecurityCustomizer { web: WebSecurity ->
      web.debug(false)
        .ignoring()
        .antMatchers("/css/**", "/js/**", "/img/**", "/lib/**", "/favicon.ico")
    }
  }

  @Bean
  fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
    http.cors().and()
      .httpBasic().disable()
      .anyRequest().authenticated()

    return http.build()
  }
}
```

## csrf

Spring Security enables CSRF protection by default since version 4

![](/resource/wiki/spring-security/csrf.png)

- [Spring Security CSRF](https://www.baeldung.com/spring-security-csrf#example)
  - [CSRF With Stateless REST API](https://www.baeldung.com/csrf-stateless-rest-api)
  - [How to get CSRF for Current Session](https://rusyasoft.github.io/java/2019/02/15/spring-security-csrf-from-context/)
  - [Cross Site Request Forgery (CSRF) - What is a CSRF Attack](https://docs.spring.io/spring-security/reference/features/exploits/csrf.html#csrf-explained)
  - [Spring Security + Ajax 호출 시 CSRF 관련 403 Forbidden 에러](https://www.popit.kr/spring-security-ajax-%ED%98%B8%EC%B6%9C-%EC%8B%9C-csrf-%EA%B4%80%EB%A0%A8-403-forbidden-%EC%97%90%EB%9F%AC/)

### Does REST API Require CSRF Protection?

Let's take a typical example: a Spring REST API application and a Javascript client. The client uses a secure token as credentials (such as JSESSIONID or JWT), which the REST API issues after a user successfully signs in.

__CSRF vulnerability depends on how the client stores and sends these credentials to the API__

### CSRF and Stateless Browser Applications

- __Cookie__
  - JWT 를 사용하는 stateless 한 애플리케이션의 경우에도 토큰을 쿠키에 저장하여 클라이언트로부터 전달 받는다면 CSRF 공격에 취약해질 수 있다.
- __Browser Storage__
  - JWT Local Storage(Browser Storage) 에 저장한다면 Local Storage 는 SOP(same origin policy)를 갖기 대문에 CSRF 공격을 막을 수 있다.
    - This is a prevalent way to use, for example, JWT: it's easy to implement and prevents attackers from using CSRF attacks. Indeed, unlike cookies, the browser storage variables are not sent automatically to the server.
    - However, this implementation is vulnerable to XSS attacks.
    - A malicious JavaScript code can access the browser storage and send the token along with the request. In this case, we must protect our application.

### Disable CSRF Protection in Spring Boot

```kotlin
@EnableWebSecurity
class SecurityConfig {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.csrf().disable()

        return http.build()
    }
}
```

## cors

- [Spring Security CORS](https://docs.spring.io/spring-security/reference/reactive/integrations/cors.html)
  - [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
  - [webflux cors](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-cors-intro)

## Links

- [Spring Security](https://docs.spring.io/spring-security/reference/index.html)
- [Spring Security 공식문서 한글 번역](https://godekdls.github.io/Spring%20Security/contents/)
- [Spring Security 가 적용된 곳을 효율적으로 테스트하자](https://tecoble.techcourse.co.kr/post/2020-09-30-spring-security-test/)
- [Spring Security MVC Test Integration](https://godekdls.github.io/Spring%20Security/testing/#192-spring-mvc-test-integration)
- [Spring Security Expressions](https://www.baeldung.com/spring-security-expressions)