---
layout  : wiki
title   : Kotlin Simple Syntax
summary : 코틀린이 간결한 구문을 지원하는 방법
date    : 2022-06-17 20:54:32 +0900
updated : 2022-06-17 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Simple Syntax

|일반 구문   |간결한 구문         |사용한 언어 특성     |
|------------|--------------------|---------------------|
|StringUtils.capitalize(s)| s.capitalize()| 확장함수 호출|
|1.to("one")| 1 to "one" | 중위 호출|
|set.add(2)|set+=2|연산자 오버로딩|
|map.get("key")|map["key"]|get 메서드에 대한 관례|
|file.use({f -> f.read()})|file.use { it.read() }|람다를 괄호 밖으로 빼내는 관례|
|sb.append("yes") sb.append("no")|with (Sb) { append("yes") append("no") } |수신 객체 지정 람다|

## 참고 문헌

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘