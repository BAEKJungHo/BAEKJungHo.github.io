---
layout  : wiki
title   : First Citizen
summary : 일급 시민과 고차 함수
date    : 2022-09-24 15:54:32 +0900
updated : 2022-09-24 20:15:24 +0900
tag     : kotlin java fp
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## First Citizen

One of the core values of functional programming is that functions should be first-class. A language that considers procedures to be "first-class" allows functions to be passed around just like any other value.

__First-class be used as a parameter to another function or used as the return value from another function.__

- Function can be assigned to a variable
- Function can be stored in a data structure
- Function can be passed around as an argument to other functions
- Function can be returned from the functions

## Higher-Order Functions

__Functions that accept other functions as parameters and/or use functions as return values are known as higher-order functions.__ 

- __Most famous higher-order functions__
  - map()
    - The map() higher-order function takes a function parameter and uses it to convert one or more items to a new value and/or type.
  - reduce()
    - The reduce() higher-order function takes a function parameter and uses it to reduce a collection of multiple items down to a single item.
- __Benefits__
  - One of the benefits of using higher-order functions to work with data is that the actual how of processing the data is left as an implementation detail to the framework that has the higher-order function.

## Links

- [First-Class Functions - O'REILLY](https://www.oreilly.com/library/view/learning-scala/9781449368814/ch05.html#:%7E:text=A%20first%2Dclass%20function%20may,return%20value%20from%20another%20function.)
- [First-class citizen - wikipedia](https://en.wikipedia.org/wiki/First-class_citizen)
- [What is a first-class-citizen function?](https://stackoverflow.com/questions/5178068/what-is-a-first-class-citizen-function)