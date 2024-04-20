---
layout  : wiki
title   : QR Code
summary : vCard, URL Scheme
date    : 2024-04-18 15:02:32 +0900
updated : 2024-04-18 15:12:24 +0900
tag     : architecture qrcode deeplink
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## QR Code

[QR Code](https://en.wikipedia.org/wiki/QR_code) 는 Digital Device 로 Scan 할 수 있는 바코드의 일종으로 다양한 정보를 저장할 수 있다.

- QR 코드는 웹 주소를 휴대폰으로 전송하는 데에도 점점 더 많이 사용되고 있다. 
- QR 코드는 URL을 수동으로 입력하는 것보다 더 빠르게 브랜드 웹사이트에 액세스할 수 있는 방법을 제공하므로 광고 전략의 초점이 되었다.
- QR 코드는 결제에도 사용된다.
  - [PayPay](https://www.paypay.ne.jp/opa/doc/v1.0/dynamicqrcode#section/TLS-implementation)
  - [OPay E-Wallet Payments API](https://doc.opaycheckout.com/e-wallet-payment)
  - [Zalo Pay -  QR PAYMENT](https://docs.zalopay.vn/en/v1/docs/qrcode/api.html#description)
- 다양한 목적에 맞게 맞춤화되거나 더 많은 양의 데이터를 저장할 수 있는 다양한 버전의 QR 코드가 존재 한다.
- 외부 스킴(Custom [URL Scheme](https://gofo-coding.tistory.com/entry/URL-Scheme)) 을 사용하여 모바일 환경에서 QR 코드를 스캔하고 앱이 설치되어있다면 앱을 실행하고 그렇지 않으면 앱 스토어로 이동시킬 수 있다.
  - URL Scheme 을 통해서 애프리케이션간 통신 및 다양한 데이터를 전달할 수 있다.
  앱에서 링크의 특정 콘텐츠로 직접 사용자를 연결하도록 [DeepLinks](https://developer.android.com/training/app-links?hl=ko) 를 사용하여 QR Code 에 적용할 수 있다.
  - [How to Employ Deep Linking for App Download QR Codes: Shorten the Conversion Funnel](https://www.uniqode.com/blog/marketing-and-engagement/deep-linking-for-app-download-qr-codes/)
  - [Allowing apps and websites to link to your content](https://developer.apple.com/documentation/Xcode/allowing-apps-and-websites-to-link-to-your-content)
- [QR Code Generator](https://zxing.appspot.com/generator)

### vCard

[vCard](https://mqr.kr/generate/vcard/3.0/) 는 쉽게 말해 [명함용 QR Code](https://m.blog.naver.com/chancimple/222902825747) 이다.

## Dynamic QR Code Integration Flow 

[PayPay - Dynamic QR Code Integration Flow](https://www.paypay.ne.jp/opa/doc/v1.0/dynamicqrcode#section/TLS-implementation):

![](/resource/wiki/architecture-qr/architecture-qr.png)

## Links

- [Deep Linking Explained: The differences between basic deep links, deferred deep links and contextual deep links](https://www.businessinsider.com/what-is-deep-linking-deferred-deep-links-vs-contextual-deep-links-2016-7)