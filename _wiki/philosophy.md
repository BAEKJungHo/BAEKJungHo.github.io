---
layout  : wiki
title   : PHILOSOPHY
summary :
date    : 2026-06-14 10:02:32 +0900
updated : 2026-06-14 12:02:32 +0900
tag     : artifact philosophy test tdd
toc     : true
comment : true
public  : true
parent  : [[/artifact]]
latex   : true
favorite: true
---
* TOC
  {:toc}

## PHILOSOPHY

자신이 내린 결정과 결과물에 대해서는 논리적으로 설득이 가능해야 한다.
설계에 정답은 없다. 같은 시스템을 구현하더라도 엔지니어가 내린 설계 방향성에 따라 탄생한 코드 결과물은 각기 다를 수 있다.
따라서 본인만의 올바른 <mark><em><strong>철학(PHILOSOPHY, 哲學)</strong></em></mark>이 중요하다고 생각한다.

예를 들어, 서버와 클라이언트가 양방향 커넥션을 맺고 데이터를 주고 받는 시스템을 만든다고 할때 인터페이스의 이름, 인터페이스가 갖는 필드 종류 등
어떻게 추상화를 해야할지 막막한 경우가 있다. 특히 경험이 부족한 영역에서 자주 발생된다.
이러한 상황에서 가장 좋은 방법은 <mark><em><strong>Simplification & TDD</strong></em></mark> 라고 생각한다.
단순화(simplification) 란 내가 만들고자 하는 시스템이 갖는 기능들을 가장 단순화 한 형태로 그려보는 것이다.
그리고 그 단순화된 기능 부터 ***[TDD](https://klarciel.net/wiki/book/tdd-knight-what-is-tdd/#what-is-tdd-)*** 를 통해 진행한다.
TDD 를 사용하는 이유 중 하나는 **추상화를 창조하지 않고 발견하여 설계에 대한 근거를 마련하기 위함**이다.