---
layout  : wiki
title   : EventLoop
summary : 
date    : 2024-02-12 15:05:32 +0900
updated : 2024-02-12 15:15:24 +0900
tag     : reactive redis operatingsystem designpattern multiplexing 
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## EventLoop

__[EventLoop](https://en.wikipedia.org/wiki/Event_loop)__ 는 이벤트(event) 가 발생할 때 까지 대기했다가, 이벤트가 발생되면 dispatch 하는 방식으로 처리되는 디자인 패턴을 의미한다.

__Pseudo__:

```
function main
    initialize()
    while event != quit
        event := get_next_event()
        process_event(event)
    end while
end function
```

보통 반복문은 Infinite Loop 로 구현되며, 특정 이벤트(event) 가 발생되면 처리하는 방식이다.

## Links

- [비동기 서버에서 이벤트 루프를 블록하면 안 되는 이유 1부 - 멀티플렉싱 기반의 다중 접속 서버로 가기까지 - LINE](https://engineering.linecorp.com/ko/blog/do-not-block-the-event-loop-part1)
- [비동기 서버에서 이벤트 루프를 블록하면 안 되는 이유 2부 - Java NIO 와 멀티플렉싱 기반의 다중 접속 서버 - LINE](https://engineering.linecorp.com/ko/blog/do-not-block-the-event-loop-part2)
- [비동기 서버에서 이벤트 루프를 블록하면 안 되는 이유 3부 - Reactor 패턴과 이벤트 루프 - LINE](https://engineering.linecorp.com/ko/blog/do-not-block-the-event-loop-part3)
- [자바 NIO 의 동작원리 및 IO 모델 - 개발한입](https://brewagebear.github.io/fundamental-nio-and-io-models/)
- [Back to the Essence - Java 컴파일에서 실행까지](https://homoefficio.github.io/2019/01/31/Back-to-the-Essence-Java-%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C-%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80-1/)