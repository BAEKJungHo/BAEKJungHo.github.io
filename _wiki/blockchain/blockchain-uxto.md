---
layout  : wiki
title   : UTXO
summary : Unspent transaction output
date    : 2026-01-06 18:54:32 +0900
updated : 2026-01-06 19:15:24 +0900
tag     : blockchain bitcoin
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## Unspent transaction output

***[UTXO(Unspent transaction output)](https://en.wikipedia.org/wiki/Unspent_transaction_output)*** 는 미사용 거래 출력으로 "아직 소비되지 않은 거래의 결과물" 이다.

- 은행(Account Model): 내 장부에 10,000원이라는 숫자가 있고, 3,000원을 쓰면 숫자가 7,000원으로 업데이트된다. (Update 방식)
- UTXO: 내 지갑에 10,000원짜리 지폐 한 장이 있다. 3,000원을 쓰려면, 10,000원 지폐를 내고(Input), 3,000원은 가게에 주고, 7,000원을 **거스름돈(Change)** 으로 돌려받는다(Output). 이때 돌려받은 7,000원이 바로 새로운 UTXO 가 된다.

UTXO 모델에서 모든 거래는 **입력(Input)** 과 **출력(Output)** 으로 구성된다.

- 입력(Input): 과거에 내가 받아서 가지고 있던 UTXO를 잠금 해제하여 사용합니다. (지폐를 꺼냄)
- 출력(Output): 새로운 주인에게 갈 UTXO와, 나에게 돌아올 거스름돈 UTXO를 생성합니다. (새 지폐를 발행함)

__핵심 규칙__:
- UTXO는 쪼개질 수 없다. 1 BTC짜리 UTXO가 있다면, 0.1 BTC만 보내더라도 1 BTC 전체를 입력으로 넣어야 한다. 남은 0.9 BTC는 나에게 다시 '새로운 UTXO'로 돌아온다.

UTXO는 공개키 암호화를 통해 소유권을 관리한다. 기술적으로 이를 **잠금(Locking)과 해제(Unlocking)** 라고 표현한다.

- 잠금 (Locking Script): 누군가 나에게 비트코인을 보낼 때, 그 UTXO에 내 **공개키(Public Key)** 를 기반으로 자물쇠를 채운다. "이 돈은 A의 공개키에 대응하는 서명이 있어야만 쓸 수 있다" 고 명시하는 것이다.
- 해제 (Unlocking Script): 내가 이 UTXO를 사용하려면, 내 **개인키(Private Key)** 로 만든 디지털 서명을 제시해야 한다. 네트워크는 서명을 검증하고, 맞다면 자물쇠를 열어 해당 UTXO를 '소비(Spent)' 상태로 만든다.

이 과정이 반복되면서 코인의 탄생(채굴)부터 현재까지 이어지는 **'소유권의 체인(Chain of Ownership)'** 이 형성된다.

### Account Model vs UTXO Model

**Account Model** (Banks, Ethereum):
```
Account Balance Ledger:
┌──────────────┬─────────┐
│   Account    │ Balance │
├──────────────┼─────────┤
│ Alice        │  $1,000 │
│ Bob          │    $500 │
│ Charlie      │  $2,000 │
└──────────────┴─────────┘

Transaction: Alice sends Bob $100
Result: Alice = $900, Bob = $600
```

**UTXO Model** (Bitcoin):
```
UTXO Set (Unspent Outputs):
┌──────────┬────────┬───────┬──────────┐
│   TXID   │ Output │ Value │  Owner   │
├──────────┼────────┼───────┼──────────┤
│ 4a5e1e.. │   0    │ 1 BTC │  Alice   │
│ 7b3c2a.. │   1    │ 2 BTC │  Bob     │
│ 9f8d5b.. │   2    │ 0.5   │  Charlie │
└──────────┴────────┴───────┴──────────┘

Transaction: Alice sends Bob 0.3 BTC

Input:  Consumes Alice's 1 BTC output
Output 0: Creates 0.3 BTC output for Bob
Output 1: Creates 0.7 BTC output for Alice (change)

New UTXO Set:
┌──────────┬────────┬───────┬──────────┐
│   TXID   │ Output │ Value │  Owner   │
├──────────┼────────┼───────┼──────────┤
│ new_tx.. │   0    │ 0.3   │  Bob     │  ← NEW
│ new_tx.. │   1    │ 0.7   │  Alice   │  ← NEW (change)
│ 7b3c2a.. │   1    │ 2 BTC │  Bob     │
│ 9f8d5b.. │   2    │ 0.5   │  Charlie │
└──────────┴────────┴───────┴──────────┘
```

__Why UTXO?__
1. **Parallel Validation**: Different transactions spending different UTXOs can be validated in parallel
2. **Stateless Verification**: You only need the referenced UTXO to verify a transaction, not the entire history
3. **Double-Spend Prevention**: Once a UTXO is spent, it's removed from the set—no race conditions
4. **Privacy**: Users can generate new addresses for each transaction
5. **Simplicity**: Clear ownership chain—either a UTXO exists (unspent) or it doesn't (spent)


## Links

- [UXTO 가 무엇인가요? - Upbit](https://support.upbit.com/hc/ko/articles/40850785727257-UTXO%EA%B0%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80%EC%9A%94)