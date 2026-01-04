---
layout  : wiki
title   : Base58, Base58Check
summary : 
date    : 2026-01-04 17:54:32 +0900
updated : 2026-01-04 18:15:24 +0900
tag     : blockchain bitcoin
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## Base58

***base*** 라는 의미는 값을 나타내는데 사용되는 문자 수를 의미한다.
base2 는 0,1 이진수, base10 은 10진수, base16 은 16진수 0123456789abcdef 를 의미한다.

***[Base58](https://learnmeabitcoin.com/technical/keys/base58/)*** 은 alphanumeric(`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`) 에서 혼동하기 쉬운 문자 0, O, l, I 를 제거하고 남은 58개를 의미한다.
이렇게 하면 전사 과정에서 발생하는 오류를 방지하는 데 도움이 된다.

![](/resource/wiki/blockchain-base58/base58.png)

Base58은 비트코인에서 자주 사용되는 데이터를 공유하기 쉬운 형식으로 변환할 때 사용된다.

- ***[Address](https://learnmeabitcoin.com/technical/keys/address/)***
- ***[WIF Private Key](https://learnmeabitcoin.com/technical/keys/private-key/wif/)***
  - 개인 키는 비트코인을 사용하기 위해 잠금을 해제하는 데 사용하는 "비밀번호"와 같다. 때때로 개인 키를 지갑에 가져와야 할 수도 있다. 이러한 경우를 위해 WIF 개인 키라는 것이 있는데, 이는 기본적으로 개인 키를 base58로 변환한 것이다.
- ***[Extended Key](https://learnmeabitcoin.com/technical/keys/hd-wallets/extended-keys/)***

## Base58Check

Base58Check 인코딩은 데이터를 Base58로 인코딩하기 전에 ***[체크섬(checksum)](https://klarciel.net/wiki/blockchain/blockchain-checksum/)*** 을 추가하는 것을 의미한다.
비트코인 주소를 인코딩할 때 사용된다.

__[Encoding a Bitcoin address](https://en.bitcoin.it/wiki/Base58Check_encoding#Encoding_a_Bitcoin_address)__:

![](/resource/wiki/blockchain-base58/bitcoinaddress.png)

## Links

- [Number Bases: Introduction & Binary Numbers](https://www.purplemath.com/modules/numbbase.htm)
- [Base58 Decoder and Encoder](https://www.darklaunch.com/tools/base58-encoder-decoder)