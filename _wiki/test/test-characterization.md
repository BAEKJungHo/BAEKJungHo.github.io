---
layout  : wiki
title   : Characterization Test
summary : Golden Master Testing is Testing Techniques Used When Refactoring LegacyCode
date    : 2024-08-15 10:28:32 +0900
updated : 2024-08-15 11:15:24 +0900
tag     : test refactoring
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Characterization Test

___[Characterization Test](https://en.wikipedia.org/wiki/Characterization_test)___ 는 복잡한 Legacy 코드를 리팩토링하는 경우 적절한 단위 테스트를 작성하기 어려운 상황에서 안전하게 ___[Refactoring](https://refactoring.guru/ko/refactoring)___ 할 수 있도록 하는 테스팅 기법이다.
여기서 말하는 LegacyCode 는 _["code without unit tests" or "profitable code that we feel afraid to change"](https://blog.thecodewhisperer.com/permalink/surviving-legacy-code-with-golden-master-and-sampling)_ 의 의미를 담고 있다.

Golden Master Testing 은 ___[Integration Testing](https://baekjungho.github.io/wiki/test/test-integration/)___ 기법이다.

## Links

- [Surviving Legacy Code with Golden Master and Sampling](https://blog.thecodewhisperer.com/permalink/surviving-legacy-code-with-golden-master-and-sampling)
- [리팩토링을 위한 통합 테스트 - MUSINSA](https://medium.com/musinsa-tech/%EB%A6%AC%ED%8C%A9%ED%86%A0%EB%A7%81%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%86%B5%ED%95%A9-%ED%85%8C%EC%8A%A4%ED%8A%B8-cd23498918a7)