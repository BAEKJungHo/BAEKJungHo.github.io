---
layout  : wiki
title   : Fetch Execute Cycle
summary : 
date    : 2024-03-10 15:02:32 +0900
updated : 2024-03-10 15:12:24 +0900
tag     : operatingsystem cpu
toc     : true
comment : true
public  : true
parent  : [[/operatingsystem]]
latex   : true
---
* TOC
{:toc}

## Fetch Execute Cycle

CPU 는 한 번에 한 가지 일만 할 수 있다.

CPU(Central Processing Unit) 는 모든 __연산__ 을 담당한다. CPU 가 실행하는 __명령(instructions)__ 은 __이진 데이터(binary data)__ 이다.
CPU 는 항상 RAM(Random Access Memory) 에서 직접 기계어 코드를 읽기 때문에 RAM 에는 실행중인 프로그램의 코드와, 운영체제의 핵심 코드 등이 올라가 있어야 한다.

__Fetch Execute Cycle__

- Fetch: CPU 는 현재 Instruction Pointer 에 해당되는 Memory 에서 명령어를 가져온다.
- Execute: Instruction 을 처리하고 포인터를 이동시킨다. 따라서, Instruction Pointer 는 다음 명령어를 가리키게 된다.

즉, 메모리에서 명령어를 인출하고 -> 명령어를 실행하고 -> 다음 명령어를 인출하는 과정을 반복한다.

CPU 는 PC 라는 register 를 통해 메모리에서 명령어를 가져온다. PC Register 에는 __메모리에 저장된 명령어의 주소를 저장__ 하고 있다.

명령어는 메모리에 저장되어 있고, 메모리에 저장된 명령어는 디스크에 저장된 실행 파일에서 적재 되고, 그 실행 파일은 컴파일러로 생성된다.
컴파일러는 프로그램 코드를 기반으로 기계 명령어를 생성한다. 그 시작 지점이 main 이다. (main 함수를 실제로 실행하기 전에 일부 레지스터의 초기화처럼 별도의 초기화 과정이 진행된다.)

## Links

- [CPU Land](https://cpu.land/the-basics)

## References

- The secret of the underlying computer / lu xiaofeng