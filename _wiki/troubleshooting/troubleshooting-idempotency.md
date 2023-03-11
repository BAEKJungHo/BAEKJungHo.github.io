---
layout  : wiki
title   : Idempotency Key that resolve consistency issues with retries
summary : 재시도에 따른 정합성 문제를 멱등키로 해결하기
date    : 2023-03-09 15:05:32 +0900
updated : 2023-03-09 15:15:24 +0900
tag     : troubleshooting
toc     : true
comment : true
public  : true
parent  : [[/troubleshooting]]
latex   : true
---
* TOC
{:toc}

## Idempotent

멱등하다는 것은 여러번 같은 요청을 보내도 결과가 같다는 것이다.

멱등키를 사용하면 민감한 API 요청이 반복적으로 일어나는 문제를 막을 수 있고, 네트워크 이슈나 타임아웃 문제로 응답을 받지 못했을 때도 안전하게 같은 요청을 다시 보낼 수 있다.

[The Idempotency-Key HTTP Header Field](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) 멱등키(Idempotency Key) 를 헤더에 담아서 보내는 것을 IETF 에서 표준으로 제안하고 있다.

미국 핀테크 유니콘 대장급 기업인 Stripe 에서도 이미 [Idempotent Requests](https://stripe.com/docs/api/idempotent_requests) 를 사용하고 있다.

Stripe 에서 다음과 같이 말하고 있다. To perform an idempotent request, provide an additional `Idempotency-Key: <key>` header to the request. Idempotency keys can be up to 255 characters long.

- [Idempotency and retries with stripe-java](https://stripe.com/docs/videos/developer-foundations?video=idempotency-and-retries&lang=java)

아래와 같이 API 요청에 멱등키 헤더를 사용하면 같은 요청이 두 번 일어나도 실제로 요청이 이루어지지 않고 첫 번째 요청 응답과 같은 응답을 보내준다.

__Stripe:__

```
curl https://api.stripe.com/v1/charges \
  -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \
  -H "Idempotency-Key: FDkJkm3AJaBnGAdM" \
  -d amount=2000 \
  -d currency=usd \
  -d description="My First Test Charge (created for API docs at https://www.stripe.com/docs/api)" \
  -d source=tok_mastercard
```

Keys are eligible to be removed from the system automatically after they're at least 24 hours old, and a new request is generated if a key is reused after the original has been pruned. The idempotency layer compares incoming parameters to those of the original request and errors unless they're the same to prevent accidental misuse.

__Toss Payments:__

```
curl --request POST \
  --url https://api.tosspayments.com/v1/payments/key-in
  --header 'Authorization: Basic dGVzdF9za196WExrS0V5cE5BcldtbzUwblgzbG1lYXhZRzVSOg=='
  --header 'Content-Type: application/json' \
  --header 'Idempotency-Key: SAAABPQbcqjEXiDL' \
  --data '{"amount":15000,"orderId":"a4CWyWY5m89PNh7xJwhk1","orderName":"토스 티셔츠 외 2건","customerName":"박토스","cardNumber":"4330123412341234","cardExpirationYear":"24","cardExpirationMonth":"07","cardPassword":"12","customerIdentityNumber":"881212"}'
```

## Resolve consistency issues with retries

재시도로 인한 정합성 오류를 해결하기 위해 멱등키를 활용할 수 있다. 

> [Toss Payments Developer center - Idempotency Key](https://docs.tosspayments.com/guides/using-api/idempotency-key)
>
> 예를 들어 결제 고객이 부분 취소 요청을 했는데 네트워크가 불안정해서 성공 응답이 전송되지 않을 수 있습니다. 결제 고객은 부분 취소가 이루어지지 않았다고 판단하고 다시 요청을 보내서 두 번 취소되는 문제가 생깁니다. 이런 상황에서 멱등키를 사용하면 같은 요청이 여러 번 처리되지 않아 안전합니다.

타임아웃 특성상 짧은 주기로 계속 재시도 요청을 보내게 되면 네트워크 지연 상황을 더욱 악화 시킬 수 있다. 네트워크 지연으로 인해 더 빈번한 타임아웃이 발생할 수 있다.

이러한 방법을 __지수적으로 재시도 요청__ 하는 방향으로 개선할 수 있다. 예를 들면, 1분, 2분, 4분, 8분에 한 번씩 보내도록 처리할 수 있다.

그럼에도 정합성이 틀어지는 경우에는 별도의 __Batch__ 에서 정합성을 올바르게 맞추도록 할 수 있다.

## Links

- [Stripe - Low-level error handling](https://stripe.com/docs/error-low-level)
- [Tosspayments - 멱등성이 뭔가요?](https://velog.io/@tosspayments/%EB%A9%B1%EB%93%B1%EC%84%B1%EC%9D%B4-%EB%AD%94%EA%B0%80%EC%9A%94)
- [Toss SLASH 22 - 애플 한 주가 고객에게 전달 되기까지](https://www.youtube.com/watch?v=UOWy6zdsD-c&t=243s)