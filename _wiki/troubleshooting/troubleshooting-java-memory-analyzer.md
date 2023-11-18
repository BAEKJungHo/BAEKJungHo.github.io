---
layout  : wiki
title   : Memory Analyzer
summary : GC Monitoring, Thread/Heap Dump and Resolution Memory Leak
date    : 2023-11-10 15:05:32 +0900
updated : 2023-11-10 15:15:24 +0900
tag     : troubleshooting gc java memoryleak
toc     : true
comment : true
public  : true
parent  : [[/troubleshooting]]
latex   : true
---
* TOC
{:toc}

## Memory Analyzer

jmap 으로 생성한 Heap Dump 파일을 열어서 분석할 수 있는 도구로는 [Eclipse Memory Analyzer (MAT)](https://eclipse.dev/mat/) 가 있다.
메모리 누수 의심 내역을 보고서 형태로 보여줘서 좋다. 다른 도구로는 [VisualVM](https://visualvm.github.io/) 이라는 것도 있다.

- [Eclipse Memory Analyzer (MAT) Docs](https://help.eclipse.org/latest/index.jsp?topic=/org.eclipse.mat.ui.help/welcome.html)
- [Eclipse MAT: Shallow Heap Vs. Retained Heap](https://dzone.com/articles/eclipse-mat-shallow-heap-retained-heap)
  - shallow heap: 한 객체만이 점유한 힙의 크기
  - retained heap: 한 객체가 제거될 때 함께 제거될 수 있는 객체들이 점유하고 있는 힙의 크기

__Find PIDs__:
- `jps`
- ![](/resource/wiki/troubleshotting-java-memory-analyzer/jps.png)

__Heap Dump__:
- `jmap -dump:format=b,file=HEAP_DUMP_OUTPUT_FILE_NAME.hprof PID`
  - 힙에 있는 모든 객체 Dump
- `jmap -dump:live,format=b,file=HEAP_DUMP_OUTPUT_FILE_NAME.hprof PID`
  - 힙에 있는 Live 객체만 Dump
- 메모리 부족시 Heap Dump 뜨도록 자동 설정
  - ```
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=./jvm.hprof
    ```

__GC Monitoring__:
- `jstat -gc -h10 -t PID 64305` 
  - 10줄마다 헤더 출력, 타임스탬프 출력, 10000밀리초마다 출력

__Thread Dump__:
- `jstack PID > THREAD_DUMP_OUTPUT_FILENAME`
- [Java Thread Dump Analyzer - FastThread](https://fastthread.io/)
- [Java Thread Dump Analyzer - Samurai](https://samuraism.jp/samurai/ja/)

### Eclipse Memory Analyzer (MAT) Guides

1. Heap Dump 
2. Open -> File 에서 Heap Dump 파일 선택 
3. Getting Started 창 나오면 Cancel (필요한 것 클릭해도 됨, 메모리 누수 분석 시 Leak Suspects Report 클릭)

__Leak Suspects System Overviews__:

![](/resource/wiki/troubleshotting-java-memory-analyzer/leak-suspects.png)

소스에 문제가 있다면 문제가 되는 곳의 Location 까지 알려준다.

## Prevention Memory Leak

__Preventions__:
- [Java Memory Leak Prevention](https://baekjungho.github.io/wiki/java/java-memoryleak/)
- [Netty Memory Leak Prevention](https://baekjungho.github.io/wiki/reactive/reactive-netty-memory-leak/)

__Knowhow__:
- [하나의 메모리 누수를 잡기 까지 - Naver D2](https://d2.naver.com/helloworld/1326256)
- [도움이 될수도 있는 JVM memory leak 이야기 - Woowabros](https://techblog.woowahan.com/2628/)

## Links

- [Java Memory Monitoring](https://homoefficio.github.io/2020/04/09/Java-Memory-Monitoring/)
- [Garbage Collection 모니터링 방법 - Naver D2](https://d2.naver.com/helloworld/6043)
