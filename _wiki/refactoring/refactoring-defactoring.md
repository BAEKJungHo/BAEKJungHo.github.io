---
layout  : wiki
title   : Defactoring
summary : Reducing Cognitive Load by Removing Unnecessary Abstraction
date    : 2024-08-14 17:54:32 +0900
updated : 2024-08-14 20:15:24 +0900
tag     : refactoring
toc     : true
comment : true
public  : true
parent  : [[/refactoring]]
latex   : true
---
* TOC
{:toc}

## Defactoring

___[Defactoring](https://understandlegacycode.com/blog/refactoring-and-defactoring/)___ 은 <mark><em><strong>Reducing Cognitive Load by Removing Unnecessary Abstraction</strong></em></mark> 이다.
Defactoring technically is still refactoring, but it involves reversing a refactoring.

__Reversals of our previous refactorings__:

- Extract Method -> Inline Method
- Extract Variable -> Inline Variable
- Extract Class -> Inline Class
- Introduce Field -> Inline Field
- Introduce Parameter -> Inline Parameter

__Defactoring by Inlineing__:

```kotlin
// AS-IS
fun addParens(value: String): String {
  val str = "($value)"
  return str
}

// TO-BE
fun addParens(value: String) = "($value)"
```

___[Refactoring](https://martinfowler.com/books/refactoring.html)___ is a controlled technique for improving the design of an existing code base. Its essence is applying a series of small behavior-preserving transformations, each of which "too small to be worth doing".

___[Factoring](https://raganwald.com/2013/10/08/defactoring.html)___ is  “God Object,” and breaking it out into various entities with individual responsibilities. 

## Links

- [Domain-Driven Refactoring: Defactoring and Pushing Behavior Down](https://www.jimmybogard.com/domain-driven-refactoring-defactoring-and-pushing-behavior-down/)