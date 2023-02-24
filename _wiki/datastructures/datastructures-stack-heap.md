---
layout  : wiki
title   : Difference Stack and Heap
summary : 
date    : 2023-02-22 10:54:32 +0900
updated : 2023-02-22 11:15:24 +0900
tag     : datastructures
toc     : true
comment : true
public  : true
parent  : [[/datastructures]]
latex   : true
---
* TOC
{:toc}

## Difference Stack and Heap

In computer science, the terms "stack" and "heap" refer to two different types of memory allocation methods used by programs.

The stack is a region of memory where local variables, function parameters, and other temporary data are stored during program execution. It is managed by the operating system and is typically allocated and deallocated automatically as functions are called and returned. The stack has a limited size and is optimized for fast access, making it well-suited for storing data that is frequently accessed and has a short lifespan.

The heap, on the other hand, is a larger region of memory that is used for dynamic memory allocation. When a program needs to allocate memory for a data structure, it requests a block of memory from the heap. The heap is managed by the program itself, and the programmer is responsible for allocating and freeing memory as needed. The heap has a much larger size than the stack and is slower to access, but it is more flexible and can be used to store data that has a longer lifespan.

In summary, the stack is a small, fast, and automatically managed region of memory used for storing temporary data, while the heap is a larger, slower, and manually managed region of memory used for storing dynamically allocated data.

__Stack:__
- Thread safe (스레드간 고유한 영역임)
- 임시 자료 구조를 할당하기 좋은 곳
- 단점으로는 메모리가 제한적이라 StackOverflow 위험이 있음

__Heap:__
- Not Thread safe (프로세스에서 공유되는 메모리 영역)
- 동적 메모리 할당에 유리함
- 변수를 오랫동안 유지해야하는 경우 사용하기 좋음
- 단점으로는 Heap 메모리를 주기적으로 관리(할당, 해제) 해야 함 (JVM 에서는 GC 가 대신 해줌)

## Links

- [Guru99 - Stack vs Heap](https://www.guru99.com/stack-vs-heap.html)