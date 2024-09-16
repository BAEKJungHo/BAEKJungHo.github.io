---
layout  : wiki
title   : ReplayAttacks
summary : 
date    : 2024-09-08 10:05:32 +0900
updated : 2024-09-08 10:08:24 +0900
tag     : auth
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## ReplayAttacks

___[ReplayAttacks](https://en.wikipedia.org/wiki/Replay_attack)___ 은 인증 과정에서 이전에 유효했던 데이터를 가로채서 나중에 이를 재사용함으로써 불법적인 액세스를 시도하는 공격이다. 주로 네트워크 환경에서 발생하며, 공격자는 인증 요청 또는 통신 데이터를 가로챈 후, 이를 그대로 재전송하여 합법적인 사용자로 가장할 수 있다.

예를 들어, 사용자 A가 서버에 로그인할 때 전송한 인증 토큰이나 메시지를 공격자가 가로챈 후, 해당 정보를 그대로 재전송함으로써 A로 가장하여 서버에 접근할 수 있다. 이 경우, 서버는 이미 인증된 정보를 다시 받기 때문에 공격자를 합법적인 사용자로 오인할 수 있다.

___How to prevent ReplayAttacks___:
- Timestamp: 각 인증 요청에 시간 정보를 포함하여 일정 시간 내에만 요청이 유효하도록 한다.
- Nonce: 각 요청마다 고유한 난수를 포함시켜 동일한 요청을 다시 전송하더라도 무효화된다.
- Session Token: 세션 기반 인증을 사용하여 각 세션에 고유한 토큰을 발급하고, 해당 세션이 종료되면 토큰이 무효화되도록 한다.

이러한 방법들을 통해 공격자가 이전에 가로챈 데이터를 재사용하는 것을 방지할 수 있다.

## Links

- [Relay Attacks on Passive Keyless Entry and Start Systems in Modern Cars](https://eprint.iacr.org/2010/332.pdf)