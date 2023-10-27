---
layout  : wiki
title   : Fuzz
summary : 
date    : 2023-10-19 12:54:32 +0900
updated : 2023-10-19 13:15:24 +0900
tag     : go
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Fuzz

__[Fuzzing](https://go.dev/security/fuzz/)__ is a type of automated testing which __continuously manipulates inputs__ to a program to find bugs.

Fuzz testing can be particularly valuable for finding security exploits and vulnerabilities.
값을 지속적으로 조작하기 때문에, 개발자가 놓칠 수 있는 부분들(bugs)을 조기에 발견할 수 있다.

- [Native Go Fuzzing support](https://google.github.io/oss-fuzz/getting-started/new-project-guide/go-lang/#native-go-fuzzing-support)
- [Tutorial: Getting started with fuzzing](https://go.dev/doc/tutorial/fuzz)
    - Go's built-in support for [unit testing](https://go.dev/doc/tutorial/add-a-test) makes it easier to [test](https://go.dev/doc/tutorial/fuzz#unit_test) as you go.
