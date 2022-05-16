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

아스키 코드(American Standard Code for Information Interchange, ASCII)는 처음으로 표준을 정립한 문자열 인코딩 방식이다. 출력 가능한 문자들은 0 ~ 127 까지 총 128개의 숫자를 사용하며, 52개의 영문 알파벳 대소문자와, 10개의 숫자, 32개의 특수 문자, 그리고 하나의 공백 문자로 이루어진다.

> 과거에는 7비트 2진수만 사용했지만, 현대 운영체제들은 성능 향상과 편의를 위해 8비트를 사용한다.

![](/resource/wiki/character-encoding/ascii.png)

## EUC-KR

EUC-KR 은 한국 산업 표준(Korean Industrial Standards, KS)으로 지정된 한국어 문자 집합으로 문자 하나를 표현하기 위해 2바이트를 사용한다. 단, 아스키 코드 문자를 표현할 때는 1바이트를 사용하기 때문에 아스키 코드와 호환된다.

```
Hello: 5byte
안녕하세요: 10byte
```

> [EUC-KR Chart](http://i18nl10n.com/korean/euckr.html)

EUC-KR 은 모든 글자가 완성된 형태로 존재하는 `완성형` 코드이다. 따라서 한글의 초성, 중성, 종성을 조합해 문자를 만들 수 없기 때문에 EUC-KR 로 표현할 수 없는 한글도 일부 존재한다.

> CP949 는 EUC-KR 을 확장한 문자 집합으로 EUC-KR 과 같은 문자열 인코딩이며, 더 많은 문자를 표현할 수 있다. 실제로 EUC-KR 로 표기하더라도 CP949 문자 집합을 사용하는 경우가 많다.

## Links

- [ASCII](https://ko.wikipedia.org/wiki/ASCII)
- [EUC-KR Chart](http://i18nl10n.com/korean/euckr.html)

## 참고 문헌

- 학교에서 알려주지 않는 17가지 실무 개발 기술 / 이기곤 저 / 한빛미디어

## 주석

[^chapter-1-21]: [학교에서 알려주지 않는 17가지 실무 개발 기술] 1장. 21p