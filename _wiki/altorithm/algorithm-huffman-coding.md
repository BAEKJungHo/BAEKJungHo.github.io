---
layout  : wiki
title   : Huffman Coding Algorithms
summary : 
date    : 2023-04-17 15:54:32 +0900
updated : 2023-04-17 20:15:24 +0900
tag     : algorithm
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Huffman Coding

Huffman Coding is __lossless data compression algorithm__. It is an algorithm that gives short binary codes to characters with high frequency of appearance of characters.

허프만 코딩에서는 __접두사 규칙__ 이라는 개념이 존재한다. 이는 __고유하게 디코딩 가능한 코드__ 가 되도록 하는 것이다. 접두사 규칙은 코드가 다른 코드의 접두사가 되면 안된다는 의미이다.

아래 처럼 문자에 부여된 각각의 코드를 __prefix code__ 라고 한다.

__Violation:__

```
a: 0 
b: 01 (zero is prefix code of 'a')
```

이 규칙을 지켜야 하는 이유는 __Decoding__ 을 가능하게 하기 위함이다.

```
a 0
b 11
c 100
d 011
```

위 처럼, 접두사 규칙을 지키지 않으면 아래와 같이 디코딩이 될 수 있다.

```
0|011|0|100|011|0|11    adacdab
0|0|11|0|100|0|11|011   aabacabd
0|011|0|100|0|11|0|11   adacabab

...
```

허프만 코딩 알고리즘은 __완전 이진트리(리프노드를 제외한 나머지 노드는 2개의 자식을 가짐)__ 로 구성된다.

![](/resource/wiki/algorithm-huffman-coding/huffman.png)

[Pictures - Wikipedia](https://en.wikipedia.org/wiki/Huffman_coding#/media/File:HuffmanCodeAlg.png)

1. 각 문자의 빈도수를 파악한다.
2. 각 문자를 노드로 배치한다.
3. 가장 작은 빈도수를 가진 두 노드를 합쳐서 부모 노드를 만든다. (__각 그래프의 좌측 간선은 0, 우측은 1__)
4. 이 과정을 반복한다.

위 그림에서 각 문자가 갖는 코드 값은 다음과 같다.

```
a: 0
b: 100
c: 101
d: 110
e: 111
```

Performance is __O(NlogN)__ N is Total characters.

## Links

- [Huffman Coding Compression Algorithm](https://www.techiedelight.com/huffman-coding/)