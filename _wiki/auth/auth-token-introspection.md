---
layout  : wiki
title   : Token Introspection
summary : OAuth 2.0 Resource Server Opaque Token
date    : 2024-12-18 22:57:32 +0900
updated : 2024-12-18 23:21:24 +0900
tag     : auth jwt
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## Token Introspection

___[JWT(Json Web Token)](https://klarciel.net/wiki/auth/auth-jwt/)___ 방식은 토큰 자체에 필요한 클레임 정보가 포함되어 있어 별도의 인증 서버에 요청하지 않고도 토큰 유효성 판단 가능하다.
하지만, __인증서버에서 해당 토큰을 만료시켜도 토큰 자체만 검증하기 때문에 유효하다고 판단__ 된다는 단점이 있다.

이러한 경우에 ___[Token Introspection](https://auth.wiki/ko/token-introspection)___ 을 사용하면 된다.

Token Introspection 은 클라이언트가 인가 서버에 질의하여 액세스 토큰을 검증하고 그 메타데이터를 가져오는 OAuth 2.0 확장 기능이다.

__Opaque tokens__:
- Tokens in a proprietary format that typically contain some identifier to information in a server’s persistent storage. 
- To validate an opaque token, the recipient of the token needs to call the server that issued the token.

![](/resource/wiki/auth-token-introspection/token-introspection.png)

위 흐름을 설명하면 다음과 같다.

- 사내에 IAM, Auth 등의 별도 인증 서버가 존재하고, Token 발급 주체가 Auth Server 
- 클라이언트가 ___[Client Credentials Flow](https://klarciel.net/wiki/auth/auth-client-credentials/)___ 방법으로 AccessToken 을 발급
- Resource Server 로 리소스를 요청할 때 커스텀 헤더(X Headers)를 사용하여 요청
- Gateway 에서는 Bypass
- Resource Server 에서는 해당 토큰이 실제로 유효한 토큰인지 모르기 때문에 Introspection 을 통해서 Auth Server 로 Token Validation 을 진행한다. 이때 client-id 와 client-secret 을 같이 담아서 보내야 하며, 커스텀 헤더 대신 ___Authorization___ 헤더를 사용
  - Header Conversion 을 위해서 ___[Custom BearerTokenResolver](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/bearer-tokens.html)___ 를 구현해야 한다.
  - Debugging 은 ___[BearerTokenAuthenticationFilter](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/server/resource/web/BearerTokenAuthenticationFilter.html)___ 를 참고
- Token 검증 성공 시, 이후 프로세스 진행

토큰 검증 시 매번 Auth Server 로 요청해야하는 부담이 있다. 이러한 부분은 Expiration 등을 참고하여 내부적으로 캐싱 정책을 수립할 수 있다. 

__Dependency__:

```
implementation("org.springframework.boot:spring-boot-starter-web")
implementation("org.springframework.boot:spring-boot-starter-security")

// Opaque 토큰 처리
// Introspection 엔드포인트를 호출하여 Opaque 토큰(일반적으로 서명되지 않은 토큰)을 검증
// 주로 외부 인증 서버와 통신하여 토큰의 유효성을 확인
implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
```

__SecurityConfig__:

```kotlin
@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val securityProperties: SecurityProperties,
    private val customAccessTokenResolver: CustomAccessTokenResolver
) {
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .securityMatcher("/auth-api/**") // Token 검증이 필요한 경로에 대해서만 Security 활성화
            .cors { it.configurationSource(corsConfigurationSource()) } // CORS 설정
            .csrf { it.disable() } // CSRF 비활성화
            .logout { }
            .authorizeHttpRequests { auth ->
                // securityMatcher 에 해당되는 모든 경로에 대해서 Authorization Check
                auth.anyRequest().authenticated()
            }
            .oauth2ResourceServer { rs ->
                rs.opaqueToken { token ->
                    token.introspectionUri(securityProperties.serverUrl) // Introspection 엔드포인트 URL
                    token.introspectionClientCredentials(
                        securityProperties.clientId, // Introspection 엔드포인트에 접근하기 위한 Client ID
                        securityProperties.clientSecret // Introspection 엔드포인트에 접근하기 위한 Client Secret
                    )
                }
                rs.bearerTokenResolver(customAccessTokenResolver)
            }

            .formLogin { it.disable() } // Form Login 비활성화
            .httpBasic { it.disable() } // Basic Auth 비활성화

            // 예외 처리 설정
            .exceptionHandling {
                it.authenticationEntryPoint { request, response, _ ->
                    response.status = SC_UNAUTHORIZED // 인증 실패 시 401
                }.accessDeniedHandler { request, response, _ ->
                    response.status = SC_FORBIDDEN // 접근 거부 시 403
                }
            }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", CorsConfiguration())
        }
    }
}
```

## Links

- [OAuth 2.0 Resource Server Opaque Token - Spring Docs](https://docs.spring.io/spring-security/reference/reactive/oauth2/resource-server/opaque-token.html)