---
layout  : wiki
title   : Encapsulation
summary : 
date    : 2024-03-08 15:02:32 +0900
updated : 2024-03-08 15:12:24 +0900
tag     : oop
toc     : true
comment : true
public  : true
parent  : [[/oop]]
latex   : true
---
* TOC
{:toc}

## Encapsulation

__[Wikipedia](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming))__:

In software systems, encapsulation refers to the bundling of data with the mechanisms or methods that operate on the data. It may also refer to the limiting of direct access to some of that data, such as an object's components. Essentially, encapsulation prevents external code from being concerned with the internal workings of an object.

Encapsulation is often described as just concealing data or restricting access to it, but:

The most important notion of encapsulation is that an object should guarantee that it'll never be in an invalid state... The ___[Encapsulated](https://github.com/bespoyasov/refactor-like-a-superhero/blob/main/manuscript-en/08-abstraction.md#encapsulation)___ object knows best what <mark><em><strong>“valid”</strong></em></mark> means, and how to make that guarantee

In some languages, we can disallow changing data after creating using [immutable structures](https://baekjungho.github.io/wiki/functional/functional-copy-on-write/). They make it impossible to bring the data to an invalid state from the outside.