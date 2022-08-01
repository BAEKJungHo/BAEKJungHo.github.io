---
layout  : wiki
title   : What is a good implementation?
summary : 좋은 구현이란
date    : 2022-07-10 15:54:32 +0900
updated : 2022-07-10 20:15:24 +0900
tag     : cleancode
toc     : true
comment : true
public  : true
parent  : [[/cleancode]]
latex   : true
---
* TOC
{:toc}

## Good implementation

- __비지니스 가치를 명확히 충족 시켜야 한다.__
  - 기술은 도구일 뿐
- __가독성이 좋아야 한다.__
  - 읽기:쓰기의 비율은 약 8:2 정도
  - 잘 읽혀야 업무 효율이 높아짐
  - 코드를 통해서 도메인 로직을 이해할 수 있어야 함
- __테스트 코드 작성이 쉬어야 한다.__
  - 테스트 코드는 지속적인 런칭과 리팩토링을 가능하게 함
- __변경에 유연해야 한다.__
  - 요구사항은 언제든 추가되고 변경될 수 있음
  - SOLID