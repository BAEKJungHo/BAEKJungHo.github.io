---
layout  : wiki
title   : Event Loop
summary : Event Loop and Call Stack
date    : 2022-05-20 16:54:32 +0900
updated : 2022-05-20 19:15:24 +0900
tag     : javascript
toc     : true
comment : true
public  : true
parent  : [[/javascript]]
latex   : true
---
* TOC
{:toc}

## Call Stack

![](https://user-images.githubusercontent.com/47518272/155972402-60ece306-26c8-4e41-bfa8-3d2d15ccc696.png)

- Anonymous 는 가상의 전역 컨텍스트(항상 있다고 생각하는게 좋음)
- 함수 호출 순서대로 쌓이고, 역순으로 실행됨
- 함수 실행이 완료되면 스택에서 빠짐
- LIFO 구조라서 스택이라고 불림

> JS 와 Node 의 동작은 Call Stack, Background, Task Queue 만 기억하면된다.
>
> Call Stack 부분만 자바스크립트 언어이고, Background, Task Queue 는 C, C++ 과 같은 다른 언어로 만들어져 있다. 이 부분은 자바스크립트 엔진이 알아서 처리해주는 것이다.

## Event Loop


```javascript
function run() {
  console.log('3초 후 실행');
}
console.log('시작');
setTimeout(run, 3000);
console.log('끝');
```

![javascripteventloop](https://user-images.githubusercontent.com/47518272/155972663-20c20733-e532-490f-b1ff-d09eb5385560.png)

![javascripteventloop2](https://user-images.githubusercontent.com/47518272/155973003-b6ad4f64-3386-4f4e-9d39-f17576788c2a.png)

![javascripteventloop3](https://user-images.githubusercontent.com/47518272/155973372-f39c18a2-ec43-4ce9-9d9c-694ffc39a36c.png)

- 이벤트 발생(setTimeout 등)시 호출할 콜백 함수들(위의 예제에서는 run)을 관리하고, 호출할 순서를 결정하는 역할
- `Task Queue` : 이벤트 발생 후 호출되어야 할 콜백 함수들이 순서대로 기다리는 공간
- `Background` : 타이머나 I/O 작업 콜백, 이벤트 리스너들이 대기하는 공간, 여러 작업이 동시에 실행될 수 있음
- setTimeout과 anonymous가 실행 완료된 후 `호출 스택(Call Stack)`이 완전히 비워지면, 이벤트 루프가 Task Queue 의 콜백을 호출 스택으로 올림
  - 호출 스택이 `비워져야만` 올림
  - 호출 스택에 함수가 많이 차 있으면 그것들을 처리하느라 3초가 지난 후에도 run 함수가 태스크 큐에서 대기하게 됨 -> `타이머가 정확하지 않을 수 있는 이유`
- run 이 호출 스택에서 실행되고, 완료 후 호출 스택에서 나감
  - 이벤트 루프는 Task Queue 에 다음 함수가 들어올 때 까지 대기
  - Task Queue 는 실제로 여러 개고, Task Queue 들과 함수들 간의 순서를 이벤트 루프가 결정함

> 동기 코드는 백그라운드에 들어가지 않고 호출 스택에서 먼저 처리된다.

## Links

- [Inflearn NodeJS Course](https://www.inflearn.com/course/%EB%85%B8%EB%93%9C-%EA%B5%90%EA%B3%BC%EC%84%9C/dashboard)
