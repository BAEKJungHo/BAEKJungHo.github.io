---
layout  : wiki
title   : Memory Analyzer
summary : GC Monitoring, Thread/Heap Dump and Resolution Memory Leak
date    : 2023-11-10 15:05:32 +0900
updated : 2023-11-10 15:15:24 +0900
tag     : troubleshooting gc java memoryleak threaddump heapdump
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
- [jcmd](https://dzone.com/articles/jvm-tuning-using-jcmd)
- [Thread Analyzers](https://fasterj.com/tools/threadanalysers.shtml)
  - [FastThread](https://fastthread.io/)
  - [Samurai](https://samuraism.jp/samurai/ja/)
- [jstack](https://docs.oracle.com/javase/1.5.0/docs/tooldocs/share/jstack.html)
  - `jstack PID > THREAD_DUMP_OUTPUT_FILENAME`
- How to Analyze
  - [Thread Dump 분석하기 - Naver D2](https://d2.naver.com/helloworld/10963)
  - [How to Analyze Java Thread Dumps - DZone](https://dzone.com/articles/how-analyze-java-thread-dumps)
  - [How to Analyze Java Thread Dumps - Baeldung](https://www.baeldung.com/java-analyze-thread-dumps)
- [Making Thread Dumps Intelligent](https://www.javacodegeeks.com/2015/08/making-thread-dumps-intelligent.html)
- [Create Thread Dumps (Nine Options)](https://dzone.com/articles/how-to-take-thread-dumps-7-options)
- [Capturing a Java Thread Dump - Baeldung](https://www.baeldung.com/java-thread-dump)
- tid vs nid
  - tid : Java 가 스스로 붙이는 쓰레드 단위 ID 
  - nid : Native ID. OS 차원의 쓰레드 ID, Linux 에서는 top -H 로 볼 때 PID 라고 보임.

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
- Native Memory Leak 발생 시 해결 방법
  - Java Native Inteface 를 사용하는데 자원을 해제하지 않은 경우가 있는지 살펴봄 
  - GC 에 의해서 관리되는 Heap 메모리가 아니기 때문에, Process Dump 를 떠서 확인 
  - 혹은 linux 에서 malloc 대신 jemalloc 을 사용하여 어떤 곳에서 메모리를 많이 사용하는지 확인

## Links

- [Java Memory Monitoring](https://homoefficio.github.io/2020/04/09/Java-Memory-Monitoring/)
- [Garbage Collection 모니터링 방법 - Naver D2](https://d2.naver.com/helloworld/6043)
- [ThreadDump - kwonnam](https://kwonnam.pe.kr/wiki/java/performance/threaddump)
