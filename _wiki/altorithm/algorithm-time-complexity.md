---
layout  : wiki
title   : Time Complexity
summary : 
date    : 2023-04-08 15:54:32 +0900
updated : 2023-04-08 20:15:24 +0900
tag     : algorithm
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Time Complexity

Time Complexity is represented Big-O.

Time complexity in algorithm analysis refers to the estimation of the amount of time that an algorithm takes to complete its execution as a function of the input size.

$$( 5n^3 + 3n )$$ = $$( O(n^3) )$$

### Constant time

입력 크기에 구애 받지 않는 경우 O(1) 이라고 표현하고, 상수 시간이라고 부른다.

### Logarithmic time

O(logN) 이라고 표시하며, 이런 타입의 가장 쉬운 예제 알고리즘은, 문자열을 절반으로 쪼개어 그 오른쪽의 문자열을 다시 또 절반으로 쪼개고, 이를 반복하는 알고리즘으로 생각할 수 있다.

### Linear time

O(n) 이라고 표기하며, 선형시간으로 부른다. 입력 크기에 따라 수행시간이 선형적으로 증가한다는 의미이다.

## Links

- [Wikipedia](https://ko.wikipedia.org/wiki/%EC%8B%9C%EA%B0%84_%EB%B3%B5%EC%9E%A1%EB%8F%84)