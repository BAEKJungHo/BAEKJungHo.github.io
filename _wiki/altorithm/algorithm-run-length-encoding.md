---
layout  : wiki
title   : Run-Length Encoding
summary : 
date    : 2023-04-16 15:54:32 +0900
updated : 2023-04-16 20:15:24 +0900
tag     : algorithm
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Run-Length Encoding

Run-Length Encoding (RLE) is a way to compress data without losing any information (lossless compression). It replaces consecutive repeating characters with a single character and a number representing the number of times it appears. For example, the string "aaaabaaaac" can be compressed to "4a1b4a1c".

연속된 문자가 없을 수록 효율이 떨어진다는 단점이 있다.

## Links

- [An Efficient Compression Algorithm for Short Text Strings](https://www.baeldung.com/cs/bwt-rle-compression-algorithm-for-short-text-strings)