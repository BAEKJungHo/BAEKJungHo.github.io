---
layout  : wiki
title   : OpenAPI Specification implementation by Swagger and RestDocs
summary : 
date    : 2022-12-12 09:28:32 +0900
updated : 2022-12-12 12:15:24 +0900
tag     : spring swagger restdocs
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## OpenAPI Specification

> The [OpenAPI Specification](https://baekjungho.github.io/wiki/spring/spring-openapi/) (OAS) defines a standard, language-agnostic interface to RESTful APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection. When properly defined, a consumer can understand and interact with the remote service with a minimal amount of implementation logic.

### Swagger

> Swagger is a framework for implementing OpenAPI Specification

- __Drawbacks__
  - Swagger Dependency
  - Swagger annotation written in production code

### RestDocs

> Based on Test code - Helpful RESTful Apis Documentation

### Core Concepts

- RestDocs 를 사용하여 테스트 코드 기반 신뢰도가 높은 OpenAPI Specification 3 문서 생성
- Swagger UI standardalone 으로 UI 지원
- No required swagger dependency
- OpenAPI Specification 3 문서를 통한 Postman import 사용 가능

## Guide

### Swagger UI 

[Latest Swagger UI - Standardalone](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/)
- 하단에 있는 'Static files without HTTP or HTML' 부분에서 latest release 를 다운 받아 /dist 디렉터리만 복사
- __Location: /resources/static/swagger-ui__
- __필요 없는 파일 삭제__
  - oauth2-redirect.html
  - swagger-ui.js
  - swagger-ui-es-bundle-core.js
  - swagger-ui-es-bundle.js
- __파일명 수정__
  - index.html to swagger-ui.html
- __경로 설정__
  - swagger-initializer.js 의 SwaggerUIBundle 경로를 openapi3.yaml 파일을 바라보도록 수정
  - e.g ../docs/openapi3.yaml

### StaticRoutingConfiguration

```kotlin
@Configuration
class StaticRoutingConfiguration : WebMvcConfigurer {
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // registry.addResourceHandler("/static/swagger-ui/**").addResourceLocations("classpath:/static/swagger-ui/");
        // registry.addResourceHandler("swagger-ui.html").addResourceLocations("classpath:/static/swagger-ui/");
        
        /** 아래 설정으로 static routing 이 잘 안되면 위 설정으로 변경 */
        registry.addResourceHandler("/static/**").addResourceLocations("classpath:/static/")
        registry.addResourceHandler("swagger-ui.html").addResourceLocations("classpath:/static/swagger-ui/")
    }
}
```

### Dependency

- [restdocs-api-spec - ePages](https://github.com/ePages-de/restdocs-api-spec)
- OAS 파일 기본 생성 경로: `/build/api-spec`

```
plugins {
    id("com.epages.restdocs-api-spec") version "0.16.2"
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation("com.epages:restdocs-api-spec-mockmvc:0.16.2")
}

openapi3 {
    this.setServer("https://localhost:8080") // list 로 다양한 서버 설정 가능
    title = "My API"
    description = "My API description"
    version = "0.1.0"
    format = "yaml" // or json
}

// build.gradle.kts
tasks.register<Copy>("copyOasToSwagger") {
    delete("src/main/resources/static/swagger-ui/openapi3.yaml") // 기존 OAS 파일 삭제
    from("$buildDir/api-spec/openapi3.yaml") // 복제할 OAS 파일 지정
    into("src/main/resources/static/docs.") // 타겟 디렉터리로 파일 복제
    dependsOn("openapi3") // openapi3 Task가 먼저 실행되도록 설정
}
```

- __Directory__
  - resources > static
    - swagger-ui
      - swagger ui files
    - docs
      - openapi3.yaml (build/api-spec 으로 부터 복제된 파일)

### Production code

- 테스트를 위한 Production code 작성

### Test code

- 테스트 코드 작성
- 기존 Spring REST Docs 로 작성한 코드를 활용하려면 Spring 의 MockMvcRestDocumentation 을 MockMvcRestDocumentationWrapper 로 변경
  - before: org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
  - after: com.epages.restdocs.apispec.MockMvcRestDocumentationWrapper

### Run Server

- e.g http://localhost:8080/swagger-ui/swagger-ui.html

## Postman

- [Swagger apis in Postman](https://www.baeldung.com/swagger-apis-in-postman)

## Links

- [RestDocs and Swagger by kotlin examples](https://github.com/traeper/api_documentation)
- [RestDocs and Swagger - Kakaopay](https://tech.kakaopay.com/post/openapi-documentation/#%EC%8B%9C%EC%9E%91%ED%95%98%EB%A9%B0)
