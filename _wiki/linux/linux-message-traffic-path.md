---
layout  : wiki
title   : Abstraction of the Linux message traffic path
summary : 
date    : 2024-04-08 11:54:32 +0900
updated : 2024-04-08 12:15:24 +0900
tag     : linux network socket
toc     : true
comment : true
public  : true
parent  : [[/linux]]
latex   : true
---
* TOC
{:toc}

## What is Socket ?

A way to speak to other programs using standard Unix file descriptors.

Linux 에서는 소켓도 하나의 파일(file), 더 정확히는 파일 디스크립터(file descriptor)로 생성해 관리한다. Network I/O 의 본질은 File descriptors 에 대한 작업 이다.

## Abstraction of the Linux message traffic path

__Abstraction of the Linux message traffic path__:

![](/resource/wiki/linux-message-traffic-path/message-traffic-path.png)

## References

- [A Guide to the Implementation and Modification of the Linux Protocol Stack](https://www.cs.unh.edu/cnrg/people/gherrin/linux-net.html#tth_chAp1)