---
layout  : wiki
title   : Character Encoding
summary : 
date    : 2022-05-16 15:54:32 +0900
updated : 2022-05-16 20:15:24 +0900
tag     : etc
toc     : true
comment : true
public  : true
parent  : [[/etc]]
latex   : true
---
* TOC
{:toc}

## 문자열 인코딩이란

문자열 인코딩(Character Encoding)은 컴퓨터가 이해할 수 있도록 인간의 언어를 2진수로 변환하는 방식을 말한다.

```
// ASCII
01000001(10진수 65) 는 문자 A 다
```

## 문자열 인코딩 규칙 종류

- ASCII 
- EUC-KR
- UTF-8
- UTF-16
- UTF-32

그 외에도 다양한 문자열 인코딩 규칙 종류가 존재한다.

어떤 문자열 인코딩 규칙을 적용하는지에 따라서 문자가 깨지거나 보이지 않는 문제가 생길 수 있다.

> 컴퓨터가 처음 등장 했을 때 모든 프로그램은 영어와 일부 특수 문자만 지원했다. 그리고 모든 언어를 같은 규칙으로 표현하기 위한 유니코드가 등장하기 전까지는 각 나라에서 사용하는 언어를 표현하고자 독자적인 규칙들을 적용했다. 그러나 모든 개발 환경이 유니코드를 동일하게 처리하지 않는다. [^chapter-1-21]

## charset

문자 집합(charset) 은 유니코드, ISO-8859, ASCII 등을 의미한다. 예를 들어, 유니코드라는 문자 집합을 표현하는 문자열 인코딩에는 UTF-8, UTF-16, UTF-32 등이 있다.

## ASCII

아스키 코드(American Standard Code for Information Interchange, ASCII)는 처음으로 표준을 정립한 문자열 인코딩 방식이다. 0 ~ 127 까지 총 128개의 숫자를 사용한다.

> 과거에는 7비트 2진수만 사용했지만, 현대 운영체제들은 성능 향상과 편의를 위해 8비트를 사용한다.

![](/resource/wiki/character-encoding/ascii.png)

## Links

- [ASCII](https://ko.wikipedia.org/wiki/ASCII)

## 참고 문헌

- 학교에서 알려주지 않는 17가지 실무 개발 기술 / 이기곤 저 / 한빛미디어

## 주석

[^chapter-1-21]: [학교에서 알려주지 않는 17가지 실무 개발 기술] 1장. 21p