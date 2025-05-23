---
layout  : wiki
title   : Postel's Law
summary : Robustness Principle
date    : 2025-05-22 11:54:32 +0900
updated : 2025-05-22 12:15:24 +0900
tag     : principle
toc     : true
comment : true
public  : true
parent  : [[/principle]]
latex   : true
---
* TOC
{:toc}

## Postel's Law

The ___[robustness principle](https://en.wikipedia.org/wiki/Robustness_principle)___ is a design guideline for software that states: "be conservative in what you do, be liberal in what you accept from others"

*<small>TCP(Transmission Control Protocol)</small>*

자신이 하는 일에는 엄격하고, 다른 사람으로부터 받을때는 관대하라는 원칙이다.

___[DOD STANDARD INTERNET PROTOCOL - RFC760](https://datatracker.ietf.org/doc/html/rfc760)___:

> The implementation of a protocol must be robust. Each implementation must expect to interoperate with others created by different individuals. While the goal of this specification is to be explicit about the protocol there is the possibility of differing interpretations. In general, an implementation should be conservative in its sending behavior, and liberal in its receiving behavior. That is, it should be careful to send well-formed datagrams, but should accept any datagram that it can interpret (e.g., not object to technical errors where the meaning is still clear)