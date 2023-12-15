---
layout  : wiki
title   : Deadcode
summary : 
date    : 2023-12-08 16:01:32 +0900
updated : 2023-12-08 16:05:24 +0900
tag     : cleancode go
toc     : true
comment : true
public  : true
parent  : [[/cleancode]]
latex   : true
---
* TOC
{:toc}

## Deadcode

프로젝트 소스 코드의 일부이지만 어떤 실행에서도 도달할 수 없는 함수를 __[DeadCode](https://en.wikipedia.org/wiki/Dead_code)__ 라고 하며 코드베이스 유지 관리 노력에 지장을 준다.

- [Finding unreachable functions with deadcode - Go](https://go.dev/blog/deadcode)

The dead-code elimination technique is in the same class of optimizations as unreachable code elimination and redundant code elimination.