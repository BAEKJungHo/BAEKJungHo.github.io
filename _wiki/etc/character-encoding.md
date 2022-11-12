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

## Character Encoding

문자열 인코딩(Character Encoding)은 컴퓨터가 이해할 수 있도록 인간의 언어를 2진수로 변환하는 방식을 말한다.

```
// ASCII
01000001(10진수 65) 는 문자 A 다
```


__문자열 인코딩 규칙 종류__:
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

## Unicode

유니코드(Unicode)는 국가별로 독자적인 문자열 인코딩을 사용하는 문제를 해결하기 위해 국제 표준화 기구(International Organization for Standardization, ISO) 에서 만든 문자 집합이다. 즉, 국제적으로 전세계 언어를 모두 표시할 수 있는 표준코드를 의미한다.

- [Unicode Area](https://ko.wikipedia.org/wiki/%EC%9C%A0%EB%8B%88%EC%BD%94%EB%93%9C_%EC%98%81%EC%97%AD)

__유니코드는 국제표준 문자표이고 UTF-8 은 인코딩 방식이다.__ 유니코드 문자열 인코딩은 UTF-8, UTF-16, UTF-32 가 있다. UTF-8 등은 유니코드를 컴퓨터가 이해할 수 있도록 형태를 바꿔준다. 즉, 인코딩 방식을 의미한다.

### UTF-8

UTF-8 은 8비트(1바이트)로 인코딩 하는 것을 의미한다. UTF-8 은 아스키 코드와 완벽하게 호환되며, 표현하려는 문자에 따라 최소 1바이트에서 최대 6바이트까지 사용한다.

> 일반적으로 문자는 3바이트 내로 처리되고, 이모지 같은 것들은 4바이트로 처리된다. 고대문자 같은 것을 쓰지 않는 이상 5바이트 이상을 사용할 일은 없다.

```
Hello: 5byte
안녕하세요: 15byte
```

> JSON 은 UTF-8 인코딩만 사용하며, 다른 문자열 인코딩은 표준에서 지원하지 않는다.

### UTF-16

UTF-16 은 16비트(2바이트)로 인코딩 하는 것을 의미한다. UTF-16 2바이트 또는 4바이트만 사용하기 때문에 아스키 코드와 호환되지 않는다.

유니코드에는 문자 종류에 따라 기본 다국어 평면(BMP), 보충 다국어 평면(SMP), 상형 문자 보충 평면(SIP), 특수 목적 보충 평면(SSP) 으로 4개가 존재하며, 바이트 수는 표현하려는 문자가 어떤 평면에 속하는지에 따라 결정된다.

UTF-16 은 일반 글자를 2바이트, 특별한 글자를 4바이트로 처리한다.

```
Hello: 12byte
안녕하세요: 12byte
```

> 자바와 윈도우는 유니코드를 사용하기 전부터 고정된 2바이트 길이의 문자 집합을 사용했다. 두 환경에서의 호환성 외에 UTF-16을 사용할 일은 없다. 

### UTF-32

모든 문자를 32비트(4바이트) 길이로 고정하여 사용한다. 그 외에는 UTF-16 과 규칙이 동일하다. 또한 반드시 UTF-32 를 사용해야 하는 환경이 아니라면 사용하지 않는다.

### 바이트 순서 표시

UTF-16 과 UTF-32 는 `바이트 순서 표시(byte order mark, BOM)`를 사용한다. BOM 은 문자열 가장 맨 앞 2바이트에 0xFEFF(유니코드로 U+FEFF)로 표기하여 사용한다는 것을 의미한다. 

OxFE 와 0xFF 중 어떤 문자가 먼저 오는지에 따라 `리틀 엔디언(little endian, LE)`과 `빅 엔디언(big endian, BE)`으로 나뉜다.

BOM 을 사용하여 바이트 표현 순서를 정하는 이유는, CPU 설계에 따라 바이트 값을 처리하는 순서가 다르기 때문이다.

- __특정 인코딩에 대한 바이트 순서 표시(U+FEFF)의 이진 표현__

|제목|내용|
|------|---|
|UTF-8	|EF BB BF
|UTF-16 big-endian|FE FF
|UTF-16 little-endian|	FF FE
|UTF-32 big-endian|	00 00 FE FF
|UTF-32 little-endian|	FF FE 00 00

## Links

- [ASCII Chart](https://en.cppreference.com/w/cpp/language/ascii)
- [EUC-KR Chart](http://i18nl10n.com/korean/euckr.html)
- [UTF-8 Chart](https://www.utf8-chartable.de/)
- [UTF-16 Chart](https://www.fileformat.info/info/charset/UTF-16/list.htm)
- [UTF-32 Chart](https://www.fileformat.info/info/charset/UTF-32/list.htm)
- [byte order mark](https://docs.microsoft.com/ko-kr/globalization/encoding/byte-order-mark)
- [Transformations of Unicode code points](https://docs.microsoft.com/ko-kr/globalization/encoding/transformations-of-unicode-code-points)
- [Unicode 와 UTF-8 간단히 이해하기](https://jeongdowon.medium.com/unicode%EC%99%80-utf-8-%EA%B0%84%EB%8B%A8%ED%9E%88-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-b6aa3f7edf96)

## References

- 학교에서 알려주지 않는 17가지 실무 개발 기술 / 이기곤 저 / 한빛미디어

## 주석

[^chapter-1-21]: [학교에서 알려주지 않는 17가지 실무 개발 기술] 1장. 21p