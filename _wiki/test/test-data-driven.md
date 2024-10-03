---
layout  : wiki
title   : DataDrivenTest
summary : 
date    : 2024-10-03 11:54:32 +0900
updated : 2024-10-03 12:15:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## DataDrivenTest

___[Data Driven Testing](https://kotest.io/docs/framework/datatesting/data-driven-testing.html)___ 은 테스트를 수행할 때 입력 데이터와 예상 결과를 외부 소스(예: 엑셀 파일, CSV 파일, 데이터베이스, XML 등)에서 불러와 테스트 케이스에 적용하는 소프트웨어 테스트 기법이다.
또는 미리 정의된 입출력 값 Set 을 사용하여 동일한 테스트를 반복해서 빠르게 실행하는 것을 의미하기도 한다.

```kotlin
class MyTests : FunSpec({
  withData(
    PythagTriple(3, 4, 5),
    PythagTriple(6, 8, 10),
    PythagTriple(8, 15, 17),
    PythagTriple(7, 24, 25)
  ) { (a, b, c) ->
    isPythagTriple(a, b, c) shouldBe true
  }
})
```