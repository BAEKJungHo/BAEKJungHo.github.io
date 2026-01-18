---
layout  : wiki
title   : Bitcoin Address
summary : 
date    : 2026-01-18 11:54:32 +0900
updated : 2026-01-18 12:15:24 +0900
tag     : blockchain bitcoin
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## Bitcoin Address

비트코인 지갑을 설치하면 제일 먼저 사용자를 위한 두 개의 암호키(public key, private key)가 생성된다. 비트코인 탈중앙화 시스템이므로 개인키를 분실하거나 도난 당하면 문제를 해결할 방법이 없다.

***[비트코인 주소(Bitcoin Address)](https://klarciel.net/wiki/blockchain/blockchain-bitcoin-wallet/)*** 는 계좌 번호로 생각하면 된다. 주소는 1로 시작하며, 약 35글자 내외로 이루어진다. 비트코인 주소는 각 개인이 임의로 만들어 사용한다.

***[비트코인 주소(Bitcoin Address)는 "공개키의 RIPEMD160(SHA256()) 해시" 이다.](https://klarciel.net/wiki/blockchain/blockchain-checksum/)***

```
┌──────────────────────────────────────────────────┐
│  Public Key (33 or 65 bytes)                     │
│       ↓                                          │
│  SHA-256 (32 bytes)                              │
│    • 표준화되고 널리 검증됨                            │
│    • 충돌 저항성 강함                                │
│       ↓                                          │
│  RIPEMD-160 (20 bytes)                           │
│    • 주소 크기 단축 (QR 코드, 저장 공간)                │
│    • SHA-2와 다른 설계 = 이중 방어                    │
│       ↓                                          │
│  Bitcoin Address (after Base58Check)             │
│    1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa            │
└──────────────────────────────────────────────────┘
```

__Flow__:
- 개인키로부터 공개키를 생성
- SHA256 과 RIPEMD160 을 사용해 해시 값을 생성
- 생성된 공개키 해시 값 앞에 1바이트 0x00 을 추가
- 생성된 공개키 해시 값과 그 앞에 0x00 을 붙인 값이 SHA256 을 두 번 적용해 생성된 256비트 해시 값의 맨 앞 4바이트만을 취한 후 공개키 해시 값 맨 뒤에 체크섬 추가
- 위 결과를 ***[base58](https://klarciel.net/wiki/blockchain/blockchain-base58/)*** 로 인코딩한 결과가 비트코인 주소

## References

- 비트코인의 탄생부터 블록체인의 미래까지 명쾌하게 이해하는 비트코인·블록체인 바이블 / 장세형 저
- 비트코인과 블록체인 가상자산의 실체 2/e / 이병욱 저 