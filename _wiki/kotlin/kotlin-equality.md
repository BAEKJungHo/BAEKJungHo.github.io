---
layout  : wiki
title   : Equality
summary : 코틀린과 자바의 식별성과 동등성
date    : 2022-10-18 20:54:32 +0900
updated : 2022-10-18 21:15:24 +0900
tag     : kotlin java
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Identity

> It calls __Referential equality__.
> - You use `==` to compare the identities of two objects.
> 
> Notice that identity is something external. A reference is not part of the object it simply points to the object. __Another important point is identity doesn't change over time__: As I get older, I'm going through a lot of changes, but I'm still the same person.
>
> In Kotlin, we use the `===(negated: !==)`. For values represented by __primitive types__ at runtime (for example, Int), the `===` equality check is equivalent to the `==` check.

## Equality

> It calls __Structural equality__.
> 
> Equality refers to two objects being the same. Two objects being equal doesn't necessarily mean that they are the same object. In Java, we use the `equals()` method to check if two objects are equal. This is also called structural equality.
>
> In Kotlin, we use the `==(negated: !=)`. That same as `equals()` method in Java.

```kotlin
// a == b  is translated to in Kotlin:
a?.equals(b) ?: (b === null) // a == null will be automatically translated to a === null.
```

## Floating-point numbers comparison

> [Floating-point numbers comparison - Kotlin Docs](https://kotlinlang.org/docs/numbers.html#floating-point-numbers-comparison)

## Links

- [Identity Vs. Equality in Java - DZone](https://dzone.com/articles/identity-vs-equality-in-java#:~:text=Equality%20refers%20to%20two%20objects%20being%20the%20same.,method%20to%20check%20if%20two%20objects%20are%20equal.)
- [Equality in Kotlin](https://kotlinlang.org/docs/equality.html)
