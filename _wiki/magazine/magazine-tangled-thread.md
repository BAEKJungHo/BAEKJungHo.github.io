---
layout  : wiki
title   : Hard to untangle the tangled thread
summary : 
date    : 2023-10-01 10:54:32 +0900
updated : 2023-10-01 11:15:24 +0900
tag     : magazine fp
toc     : true
comment : true
public  : true
parent  : [[/magazine]]
latex   : true
---
* TOC
{:toc}

## Hard to untangle the tangled thread

함수형 프로그래밍에서 [계산(calculate)](https://baekjungho.github.io/wiki/functional/functional-skills/)을 작게 분리하는 것은 좋다.

- 재사용성
- 테스트 용이성
- 유지보수 용이성

함수를 너무 작게 분리하는 경우, 어떤 사람은 뭉쳐있는 것이 더 잘짠 것으로 생각하고 선호한다. 
잘 짠 경우에는 문제가 안된다. 하지만 잘 짰다고 생각하는 코드가 __엉킨 실타래(tangled thread)__ 라면, 나중에 코드를 분리하는 비용이 너무 많이 든다.
작게 쪼개진 함수를 합치는 비용이 훨씬 적다.

calculate function 에서 불변(immutable)을 유지하기 위해서 __복사(copy)__ 를 사용하기도 한다.
이때, 특정 함수를 호출할 때마다 복사가 이뤄지면 비용이 너무 많이 든다고 생각할 수 있다. 확실히 배열을 변경하는 것보다 비용이 들긴하다. 하지만 최신 프로그래밍 언어들은 GC 를 지원하기 때문에, __복사 비용(copy cost)__ 에 대해서 크게 신경쓰지 않아도 된다.
오히려 불변성을 유지해서 얻는 장점이 많다.

성능 문제는 발생했을 때 개선하면 된다.

[좋은 함수 만들기 - 부작용과 거리두기 by jojoldu](https://jojoldu.tistory.com/697):

![](/resource/wiki/magazine-tangled-thread/jojoldu.png)

함수형 프로그래밍에서 계산을 작게 쪼개는 원칙은 마치 [Thoughtworks anthology - Object Calisthenics](https://www.bennadel.com/resources/uploads/2012/ObjectCalisthenics.pdf) 첫 번째 규칙인 "한 메서드에 오직 한 단계의 들여쓰기만 한다(Only one level of indentation per method)" 와 유사한 느낌을 준다.

정리하자면, 작게 쪼개진 부수효과가 없는 함수(calculate)는 재사용성, 테스트 용이성, 유지보수 용이성이라는 장점을 갖는다.