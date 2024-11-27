---
layout  : wiki
title   : POINTER
summary : 
date    : 2024-11-20 15:02:32 +0900
updated : 2024-11-20 15:12:24 +0900
tag     : operatingsystem go memory
toc     : true
comment : true
public  : true
parent  : [[/operatingsystem]]
latex   : true
---
* TOC
{:toc}

## POINTER

___[Pointer](https://en.wikipedia.org/wiki/Pointer_(computer_programming))___ 를 이해하기 위해서는 ___[Memory](https://www.britannica.com/technology/computer-memory)___ 에 대해서 이해할 필요가 있다.

메모리는 ___사물함(memory cell)___ 에 비유할 수 있다. 이 사물함은 0과 1만 보관할 수 있고, 이를 ___1bit___ 라고 한다.
하지만, 1bit 만으로는 true or false 등의 표현만 가능하며, 현실 세계의 복잡한 정보들을 표현할 순 없다. 

현실 세계의 복잡한 정보를 표현하려면 여러개의 bit 가 있어야 하며 8개의 bit 를 묶은 것을 ___1byte___ 라고 한다.
즉, 사물함 8개라고 생각하면 된다.

1byte 마다 주소를 붙이게 되는데 이것을 ___메모리 주소(memory address)___ 라고 한다. 하지만 1byte 도 고작 unsigned integer 로 0~255 까지만 표현 가능하기 때문에
더 많은 숫자를 표현하기 위해서는 N byte 가 필요하다. 구조체를 표현해야하는 경우는 더 많은 byte 가 필요하다.

CPU 는 메모리에서 값을 읽어 레지스터에 저장해야 연산을 수행할 수 있다.

메모리에 데이터를 읽고, 쓰기 위해서는 메모리 주소를 다뤄야 한다.

```
// $ 가 붙어있으면 값, 없으면 메모리 주소
store $1 8
load r1 8
```

하지만, 이러한 메모리 주소를 직접 다룬다고 생각하면 프로그래머들은 머리가 아플 것이다. 따라서 부르기 쉬운 이름이 필요한데, 이것이 ___변수(variable)___ 이다.

```
a = 8
```

여기서 다음과 같은 고민을 해보자, b = a 를 처리해야 한다. 결과적으로 b 변수가 a 의 ___Memory Address___ 를 메모리상에 저장하고 있으면 해결된다.
즉, 메모리에는 값 뿐만 아니라 메모리 주소도 저장할 수 있다. 이것이 포인터의 탄생이다.

A pointer is a programming concept used in computer science to reference or point to a memory location that stores a value or an object. It is essentially a variable that stores the memory address of another variable or data structure rather than storing the data itself.

<mark><em><strong>포인터는 메모리 주소를 더 높은 수준으로 추상화 것이다.</strong></em></mark>

```
load r1 @1
```

이 명령어는 메모리 주소 1에 저장된 값인 3을 읽어, 이 3이라는 값을 메모리 주소로 간주하여 메모리 주소 3이 가리키는 값을 진짜 데이터로 간주한다.

- 주소1 -> 주소3 -> 데이터

이를 ___간접 주소 지정(indirect addressing)___ 이라 한다.

Java, Kotlin 과 같은 언어는 포인터를 사용하지 않는다. 즉, x = y + z 라는 코드를 작성할 때 각 변수가 어디에 저장되는지 신경 쓸 필요가 없다.
따라서 메모리 주소를 직접 확인할 수 없어서, 메모리 위치에 있는 데이터를 직접 조작할 수 없다.
대신 ___참조(reference)___ 라는 기능을 사용하기 때문에 포인터가 없더라도 사실상 동일하게 프로그래밍하는 것이 가능하다.

<mark><em><strong>포인터는 메모리 주소를 추상화한 것이고, 참조(reference)는 포인터를 한 번 더 추상화한 것이다.</strong></em></mark>

![](/resource/wiki/os-pointer/pointer-reference.png)

포인터는 메모리를 직접 조작할 수 있는 능력을 부여함과 동시에, 포인터를 조작할 때는 실수하지 않아야 한다는 높은 기준을 제공한다.
이러한 위험을 포인터 위험이라 한다. 대부분의 함수형 프로그래밍 언어 와 Java 와 같은 최근의 명령형 언어 를 포함한 많은 언어는 포인터를 일반적으로 간단히 참조 라고 하는 더 불투명한 유형의 참조로 대체한다. 이는 객체를 참조하는 데만 사용할 수 있고 숫자로 조작할 수 없으므로 이러한 유형의 오류를 방지한다.

반면, 포인터를 사용하는 C, Go, Rust 등의 언어들은 다르다. 포인터를 통해 메모리 주소를 알 수 있고, 저수준 계층에 도달할 수 있다.
저수준 계층에 도달할 수 있기 때문에 C 언어가 시스템 프로그래밍 언어로 자주 선택되는 것이다.

그리고 포인터를 통해 얻어지는 0x7ffd8ca8924 와 같은 메모리 주소는 실제 메모리 주소가 아닌 ___가상 메모리 주소___ 이다.
메모리 자체를 더 추상화 한 것은 가상 메모리이다.

## Links

- [Pointers in Go](https://www.geeksforgeeks.org/pointers-in-golang/)

## References

- The secret of the underlying computer / lu xiaofeng