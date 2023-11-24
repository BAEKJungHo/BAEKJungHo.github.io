---
layout  : wiki
title   : Polymorphism Functions
summary : 
date    : 2023-11-15 12:54:32 +0900
updated : 2023-11-15 13:15:24 +0900
tag     : go
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Polymorphism Functions

reader 인터페이스의 계약(interface contract)을 구현한 모든 타입을 다 파라미터로 받을 수 있는 함수를 __다형성 함수(polymorphism function)__ 라고 한다. 이 함수는 구체적 타입에 대해서는 전혀 알지 못한다.
따라서 완전히 디커플링 되어 있으며, 이는 Go에서 할 수 있는 __최상위 디커플링(decoupling)__ 이다.

```go
// reader is Interface
func retrieve(r reader) error {
    // ...
}
```