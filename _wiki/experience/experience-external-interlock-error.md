---
layout  : wiki
title   : Countermeasures For External Interlocking Failures
summary : 외부 연동 장애 대응책 고민
date    : 2024-02-01 20:54:32 +0900
updated : 2024-02-01 21:15:24 +0900
tag     : experience database
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Countermeasures For External Interlocking Failures

__Connection Pool Error__:
- 서버를 재시작 함으로써 쌓여있던 커넥션, 요청들을 정리하며 기존 요청들에 대해서는 Exception 이 발생되도록 처리 + 커넥션 풀 사이즈 조정

__Lack of Connection Pool__:
- DB 트랜잭션 범위에서 외부 API 를 호출하는 구조라서 커넥션 풀이 부족하게 됨
- 특정 외부 API 에 트래픽이 순간 몰림 (Push 발송)
  - 외부 API 의 응답 시간 증가
  - 커넥션이 커넥션 풀에 반환되지 않음
  - 커넥션 풀에 커넥션 부족
  - 커넥션을 구하는 다르 쓰레드 대기
  - 대기 시간 초과하면서 구하기 실패 에러

```
1. 풀에서 커넥션 구함
2. 트랜잭션 시작
3. DB 조회
4. 외부 API 조회 (데이터 조회)
5. DB 연동
6. 트랜잭션 커밋
7. 풀에 커넥션 반환
```

__Solutions__:
- 1안: (가능한 기능이면) 트랜잭션 범위에서 외부 연동 분리
  - 많이 불리는 API 에 적용
  - 외부 연동 응답 지연이 발생해도 커넥션 풀에 주는 영향 감소
- 2안: 외부 API 별로 동시 실행 가능한 쓰레드 개수 제한
  - 특정 외부 API 가 쓰레드 풀을 다 점유하는 것을 막기 위함
  - 외부 API 에 따라 다른 개수 할당
  - 허용 개수만큼 동시 요청 발생시 빠르게 에러 응답 처리
- 3안: 푸시를 천천히 보내기
  - 푸시 발송 규모가 늘어난 외부 API 대상으로 천천히 보내기
  - 조금 천천히 가도 되는 푸시인 경우
- 다른 대응 방안
  - 외부 API 에 서킷 브레이커 적용
  - 조회 API 결과를 캐시에 보관
    - 다수 조회 API 는 실시간 특징을 보임 (e.g 결제 후 상태 변경)
    - 데이터 변화가 거의 없는 조회 API 에 적용함
  - 비동기 처리
    - 데이터 동기화 목적으로 조회하는 API

## Links

- [외부 연동 장애 대응책 고민](https://www.youtube.com/watch?v=xc0tnJVGQEw)