---
layout  : wiki
title   : OpenAPI Specification
summary : OpenAPI Specification, Swagger, SpringFox, Springdoc, Spring REST Docs
date    : 2022-10-30 09:28:32 +0900
updated : 2022-10-30 12:15:24 +0900
tag     : spring swagger
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## OpenAPI Specification

OpenAPI 또는 [OpenAPI Specification(OAS)](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md) 는 Swagger 에서 발전한 API 명세 형태를 의미한다.

### Document Structure

It is RECOMMENDED that the root OpenAPI document be named: `openapi.json` or `openapi.yaml`.

- [Basic Structure](https://swagger.io/docs/specification/basic-structure/)

## Swagger

[What is Swagger](https://swagger.io/docs/specification/2-0/what-is-swagger/) ? Swagger 란 Open Api Specification(OAS)를 위한 프레임워크이다.

[Swagger](https://swagger.io/docs/specification/about/) is a set of open-source tools built around the OpenAPI Specification that can help you design, build, document and consume REST APIs.

Swagger does this by asking your API to return a YAML or JSON that contains a detailed description of your entire API. This file is essentially a resource listing of your API which adheres to OpenAPI Specification. 

- __Related Articles__ 
  - [Why Is Swagger JSON Better Than Swagger Java Client? - DZone](https://dzone.com/articles/why-is-swagger-json-better-than-swagger-java-clien)
  - [How to Turn Off Swagger-ui in Production](https://www.baeldung.com/swagger-ui-turn-off-in-production)
  - [Spring REST Docs Versus SpringFox Swagger for API Documentation - DZone](https://dzone.com/articles/spring-rest-docs-versus-springfox-swagger-for-api)
  - [Swagger-UI](https://github.com/adrianbk/swagger-springmvc-demo/tree/master/swagger-ui)
  - [Swagger Annotations](https://github.com/swagger-api/swagger-core/wiki/Annotations)
  - [Generate PDF from Swagger API Documentation - Baeldung](https://www.baeldung.com/swagger-generate-pdf)

Check [swagger.io/open-source-integrations](https://swagger.io/tools/open-source/open-source-integrations/) for a list of tools that let you generate Swagger from code.

### ReDoc

- [ReDoc](https://github.com/Redocly/redoc)
  - Generate interactive API documentation from OpenAPI definitions
  - Redoc is an open-source tool for generating documentation from OpenAPI (fka Swagger) definitions.
  - [Live Demo](https://redocly.github.io/redoc/)
- [Documenting your API with OpenAPI (Swagger) and Redoc — Web Relay](https://webhookrelay.com/blog/2018/11/05/openapi-redoc-tutorial/)

### Swagger2MarkUp

- [Swagger2Markup](https://github.com/Swagger2Markup/swagger2markup): A Swagger to AsciiDoc or Markdown converter to simplify the generation of an up-to-date RESTful API documentation by combining documentation that’s been hand-written with auto-generated API documentation
- [Swagger2Markup/swagger2markup-gradle-plugin](https://github.com/Swagger2Markup/swagger2markup-gradle-plugin)
- [Swagger2Markup/spring-swagger2markup-demo](https://github.com/Swagger2Markup/spring-swagger2markup-demo): SpringFox 로 Spring Boot 문서를 test 시에 swagger.json 으로 생성하고, 이를 가지고 AsciiDoc을 생성한뒤 AsciiDoctor 를 통해서 다시 HTML/PDF 문서로 바꾼다.
- [Static API Documentation With Spring and Swagger - DZone](https://dzone.com/articles/static-api-documentation-with-spring-and-swagger)

### Swagger Code Generation

- __Related Articles__
  - [Swagger Codegen Document](https://swagger.io/docs/open-source-tools/swagger-codegen/) 
  - [swagger-api/swagger-codegen: swagger-codegen contains a template-driven engine to generate documentation, API clients and server stubs in different languages by parsing your OpenAPI / Swagger definition.](https://github.com/swagger-api/swagger-codegen)
  - [Generate Spring Boot Project with Swagger - Baeldung](https://www.baeldung.com/spring-boot-rest-client-swagger-codegen)
  - [gigaSproule/swagger-gradle-plugin](https://github.com/gigaSproule/swagger-gradle-plugin)
  - [int128/gradle-swagger-generator-plugin](https://github.com/int128/gradle-swagger-generator-plugin)

## What Is the Difference Between Swagger and OpenAPI?

- [What Is the Difference Between Swagger and OpenAPI?](https://swagger.io/blog/api-strategy/difference-between-swagger-and-openapi/)
  - OpenAPI = Specification
  - Swagger = Tools for implementing the specification

OpenAPI 는 RESTful API 설계를 위한 업계 표준 사양을 나타내고 Swagger 는 SmartBear 도구 세트를 의미.

## SpringFox

__[SpringFox = Spring & Swagger](ttps://springfox.github.io/springfox/docs/current/)__ 
- Swagger 3.x 를 사용하려면 [springfox-boot-starter](https://mvnrepository.com/artifact/io.springfox/springfox-boot-starter) Dependency 만 추가하면 됨

Philosophically, we want to discourage using (swagger-core) annotations that are not material to the service description at runtime.

- __Related Articles__
  - [Spring Rest API with Swagger – Creating documentation](https://www.javacodegeeks.com/2014/10/spring-rest-api-with-swagger-creating-documentation.html)
  - [Spring Rest API with Swagger – Exposing documentation](https://www.javacodegeeks.com/2014/11/spring-rest-api-with-swagger-exposing-documentation.html) Spring REST API 를 웹 서비스로 볼 수 있게 해줌
  - [Setting Up Swagger 2 with a Spring REST API Using Springfox](https://www.baeldung.com/swagger-2-documentation-for-spring-rest-api)
- [Spring Boot 2.6.0 / Spring fox 3 - Failed to start bean 'documentationPluginsBootstrapper' - stackoverflow](https://stackoverflow.com/questions/70036953/spring-boot-2-6-0-spring-fox-3-failed-to-start-bean-documentationpluginsboo)

## SpringDoc - SpringFramework Open API Specification

OpenAPI 3 어노테이션 없이, Spring MVC/WebFlux 어노테이션을 인식하여 자동으로 OpenAPI Spec 3 문서 생성.

[springdoc-openapi](https://springdoc.org/#Introduction) java library helps to automate the generation of API documentation using spring boot projects. springdoc-openapi works by examining an application at runtime to infer API semantics based on spring configurations, class structure and various annotations.

Automatically generates documentation in JSON/YAML and HTML format APIs. This documentation can be completed by comments using swagger-api annotations.

- __Related Articles__
  - [springdoc openapi - Library for OpenAPI 3 with spring-boot](https://springdoc.org/)
  - [Doing More With Springdoc-OpenAPI - DZone](https://dzone.com/articles/doing-more-with-springdoc-openapi)
  - [Microservices API Documentation with Springdoc OpenAPI](https://piotrminkowski.com/2020/02/20/microservices-api-documentation-with-springdoc-openapi/)
  - [springdoc-openapi-gradle-plugin](https://github.com/springdoc/springdoc-openapi-gradle-plugin)
    - swagger.json 파일을 생성해줌 

## Spring REST Docs

Spring REST Docs 는 테스트 코드 기반으로 RESTful 문서생성을 돕는 도구로 기본적으로 Asciidoctor 를 사용하여 HTML 를 생성한다. Spring MVC 테스트 프레임워크로 생성된 snippet 을 사용해서   올바르지 않으면 생성된 테스트가 실패하여 정확성을 보장해준다.

Rest Docs 는 테스트 코드 기반으로 문서가 작성되기 때문에 문서와 실제 코드의 일치성이 높고 테스트 코드로 문서가 표현되기 때문에 Production 코드에 어떠한 코드(Ex. 문서 관련 Annotation) 추가도 필요가 없다는 장점이 있다.

- __RelatedArticles__
  - [Spring REST Docs API 문서를 자동화 해보자 - popit](https://www.popit.kr/spring-rest-docs/)

## Spring REST Docs with Swagger

- __RelatedArticles__
  - [Swagger 와 Spring Restdocs 의 우아한 조합 (by OpenAPI Spec)](https://taetaetae.github.io/posts/a-combination-of-swagger-and-spring-restdocs/)
  - [Swagger 와 RestDocs 의 우아한 조합](https://catsbi.oopy.io/edcaed06-6df9-4f19-a6f4-05902ad9878d)
  - [oas_restdocs_documents](https://github.com/catsbi/oas_restdocs_documents)

## Links

- [OpenApis](https://www.openapis.org/)
- [kwonnam](https://kwonnam.pe.kr/wiki/springframework/springfox)