---
layout  : wiki
title   : Regular Expression
summary : 
date    : 2022-07-19 15:54:32 +0900
updated : 2022-07-19 20:15:24 +0900
tag     : etc
toc     : true
comment : true
public  : true
parent  : [[/etc]]
latex   : true
---
* TOC
{:toc}

## Regular Expression

| expression  | description  |
|-------------|--------------|
|[abc]        | A single character of: a, b or c |
|[^abc]       | A character except: a, b or c |
|[a-z]        | A character in range: a-z |
|[^a-z]        | A character not in the range: a-z |
|[0-9]        | A digit in the range: 0-9 |
|[a-zA-Z]        | A character in the range: a-z or A-Z |
|[a-zA-Z0-9]        | A character in the range: a-z, A-Z or 0-9 |
|a?        | Zero or one of a |
|a*        | Zero or more of a |
|a+       | One or more of a |
|[0-9]+       | One or more of 0-9 |
|a{3}      | Exactly 3 of a |
|a{3,}        | 3 or more of a |
|a{3,6}        | Between 3 and 6 of a |
|.      | Any single character |
|\s       | Any whitespace character |
|\S       | Any non-whitespace character |
|\d       | Any digit, Same as [0-9] |
|\D       | Any non-digit, Same as [^0-9] |
|\w      | Any word character |
|\W        | Any non-word character |
|\G       | Start of match |
|^        | Start of string |
|$        | End of string |
|\A       | Start of string |
|\Z       | End of string |
|\z       | Absolute end of string |
|\t       | Tab |
|\n       | New line |

### Sample

- __JSON 형식__
  - Ex. expiry: ~~~
  - `\"expiry\"\s*:\s* \"(.*?)\"`
  - 로그백을 통한 민감정보 마스킹 시 주로 사용

## in Kotlin

### 정규식으로 replace

```kotlin
"{{userId}}".replace("\\{\\{userId}}".toRegex(), "Replace Value")
```

## Links

- [QuickRef RegEx](https://quickref.me/regex)
- [Regular Expression Language - Quick Reference](https://docs.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-language-quick-reference)

## 참고 문헌

- 학교에서 알려주지 않는 17가지 실무 개발 기술 / 이기곤 저 / 한빛미디어