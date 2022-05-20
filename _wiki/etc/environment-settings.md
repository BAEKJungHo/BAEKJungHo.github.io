---
layout  : wiki
title   : Environment Settings
summary : 
date    : 2022-05-18 15:54:32 +0900
updated : 2022-05-18 20:15:24 +0900
tag     : etc
toc     : true
comment : true
public  : true
parent  : [[/etc]]
latex   : true
---
* TOC
{:toc}

## Environment Settings

> 이직을 하게 되면 대부분의 회사에서 첫날은 환경설정과 온보딩 등을 진행할 것이다. 본인만의 환경 설정 가이드가 있다면 쉽고 빠르게 환경 설정을 끝낼 수 있을 것이다.

## Mac

> Window 따위는 취급하지 않는다.

- [Home brew 설치](https://brew.sh/index_ko)
    - Chrome 
    - Git 
    - aws cli
    - DBeaver
    - IntelliJ
    - robo-3t
    - VS Code
    - NodeJs

## IntelliJ Settings

- __Appearance & Behavior__
    - Theme : `High contrast`
    - Use custom font : `Malgun Gothic` size : 12
    - Presentation Mode : Font size : 24
- __Editor > Font__
    - ![fontsetting](https://user-images.githubusercontent.com/47518272/155870655-ec52dcbb-5d9f-4567-95b8-d269e25ddd8a.png)
- __Editor > File Encodings__
    - `UTF-8`
- __Editor > Code Style > Java__
    - Use single class import
    - Class count to use import with `*`, Names count to use static import with `*` : 100 으로 설정
- __Editor > Code Style > Kotlin__
    - Use single name import
    - Packages to Use import with `*` 에서 `java.util.*` 제거
- __Editor > Live Templates > custom__
    - `atdd`
        - ```
          // when
          java.util.Map<String, String> params = new java.util.HashMap<>();
          io.restassured.response.ExtractableResponse<io.restassured.response.Response> response = io.restassured.RestAssured
          .given().log().all()
          .body(params)
          .contentType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
          .when().$METHOD$("$URI$")
          .then().log().all().extract();

          // then
          org.assertj.core.api.Assertions.assertThat(response.statusCode()).isEqualTo(org.springframework.http.HttpStatus.$STATUS$.value());
          ```
    - `tdd`
        - ```
          @DisplayName("Scenario")
          @Test
          void $NAME$() {
              $END$
          }
          ```
- __Plugins__
    - AsciiDoc
    - Class Decompile
    - Java Decompiler
    - Kotlin to Java Decompiler
    - Kotlin
    - Key Promoter X
    - Live Edit
    - CodeMetrics
    - Commit Message Template
    - Database Navigator
    - Duck Progress Bar
    - Extra Icons
    - Translator
        - Tools > Translator > DEFAULT
    - SonarLint
    - String Manipulation
    - .ignore

