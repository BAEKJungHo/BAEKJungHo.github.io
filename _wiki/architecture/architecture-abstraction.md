---
layout  : wiki
title   : ABSTRACTION
summary : 
date    : 2024-09-10 15:02:32 +0900
updated : 2024-09-10 18:12:24 +0900
tag     : architecture cs
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## ABSTRACTION

__The Essence of Computer Science is Abstraction__:

The authors of the wonderful book Concepts, Techniques, and Models of Computer Programming define ___[Abstraction](https://en.wikipedia.org/wiki/Abstraction_(computer_science))___ as any tool or device that solves a particular problem.

> ___[Abstractions](https://branislavjenco.github.io/desired-state-systems/)___ are central to what we do. I find that the most rewarding work is not writing programs but rather designing abstractions. Programming a computer is primarily designing and using abstractions to achieve new goals. It’s exciting when you can build something which hides away some of the underlying complexity and present a simpler interface for whoever or whatever is using your system.

![](/resource/wiki/architecture-abstraction/abstraction.png)

추상화는 표현력을 크게 향상시키고 의사소통의 효율을 올려 줄 뿐만 아니라 세부 사항을 노출할 필요가 없다. 추상화를 통해 복잡도를 제어할 수 있으며, 복잡한 내부 구현이 아닌 추상화에만 집중할 수 있어서 프로그램 확장성이 향상되고 요구 사항 변화에도 더 잘 대응할 수 있다.

고급 프로그래밍 언어의 경우에도 기계 명령어의 세부 사항에 신경 쓸 필요가 없고, 고급 프로그래밍 언어로 CPU 를 직접 제어할 수 있다.

- 실행 중인 프로그램은 프로세스로 추상화 된다.
- 물리 메모리와 파일은 가상 메모리로 추상화 된다.
- 네트워크 프로그래밍은 소켓으로 추상화 된다.
- 프로세스와 프로세스에 종속적인 실행환경은 컨테이너(container)로 추상화 된다.
- CPU, 운영 체제, 응용프로그램은 VM 으로 묶여(packaging) 추상화 된다.
- 포인터(pointer)는 메모리 주소를 추상화한 것이고, 참조(reference)는 포인터를 한 번 더 추상화한 것이다.

이처럼 추상화는 프로그래머를 저수준 계층에서 점점 더 멀어지게 만들고, 저수준 계층의 세부 사항도 신경 쓸 필요가 없도록 만든다.
하지만, 저수준 계층에 대한 이해는 고급 프로그래머를 남들과 구분 짓는 특징 중 하나이다.

## Links

- [Abstraction, CS211 course, Cornell University.](https://www.cs.cornell.edu/courses/cs211/2006sp/Lectures/L08-Abstraction/08_abstraction.html)
- [Feedback Systems: An Introduction for Scientists and Engineers](https://fbswiki.org/wiki/index.php/Feedback_Systems:_An_Introduction_for_Scientists_and_Engineers)
- [The Law of Leaky Abstractions](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/)

## References

- The secret of the underlying computer / lu xiaofeng