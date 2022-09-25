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

## SecurityContextHolder

- 기본전략은 ThreadLocal 이다.
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

## Links

- [Spring Security](https://docs.spring.io/spring-security/reference/index.html)
- [Spring Security 공식문서 한글 번역](https://godekdls.github.io/Spring%20Security/contents/)
- [Spring Security 가 적용된 곳을 효율적으로 테스트하자](https://tecoble.techcourse.co.kr/post/2020-09-30-spring-security-test/)
- [Spring Security MVC Test Integration](https://godekdls.github.io/Spring%20Security/testing/#192-spring-mvc-test-integration)
- [Spring Security Expressions](https://www.baeldung.com/spring-security-expressions)
- [Test Sample](#)
  - https://github.com/Anne-Maj/ca3privat/blob/22c968e414f5145a62f4efc548bd46a9a8d6506a/src/test/java/rest/LoginEndpointTest.java
  - https://github.com/Dyrhoi/dat3-ca3-movie-fetch-demo/blob/20fb2875a2a233186a9ceaebf9a381d5298a72d1/src/test/java/rest/LoginEndpointTest.java