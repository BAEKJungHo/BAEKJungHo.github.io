---
layout  : wiki
title   : Divide Potential Errors
summary : 
date    : 2024-06-13 15:02:32 +0900
updated : 2024-06-13 15:12:24 +0900
tag     : fp kotlin java api
toc     : true
comment : true
public  : true
parent  : [[/functional]]
latex   : true
---
* TOC
{:toc}

## Divide Potential Errors

__[Divide potential errors into 3 groups](https://bespoyasov.me/blog/domain-modelling-made-functional-3/)__:
- __Domain errors__ are expected in the business processes themselves, such as an unaccepted order or lack of goods in stock;
- __Exceptions(panics)__ lead the system to an unrecoverable state, such as out of array or lack of memory;
- __Infrastructural error__ are expected from a technical point of view, but not by the business, like failed authentication or network problems.