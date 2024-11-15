---
layout  : wiki
title   : Deeplink
summary : 
date    : 2024-11-13 15:02:32 +0900
updated : 2024-11-13 15:12:24 +0900
tag     : mobile deeplink
toc     : true
comment : true
public  : true
parent  : [[/mobile]]
latex   : true
---
* TOC
{:toc}

## Deeplink

딥링크(deeplink) 는 사용자를 특정 앱으로 이동시켜 원하는 화면을 보여주는 링크를 의미한다.

- __Default Deeplink__
  - 사용자가 이미 특정 앱이 설치된 경우에만 작동한다. 이 딥링크를 통해 앱 내의 특정 화면이나 콘텐츠로 직접 이동할 수 있다.
  - e.g 쇼핑 앱에서 특정 상품 페이지로 이동하는 링크 - myshoppingapp://product/12345 
- __Universal Links and App Links__
  - 유니버설 링크는 iOS 용, 앱 링크는 Android 용으로 사용되며, 특정 앱이 설치되어 있지 않은 경우 웹 페이지로 연결된다. 앱이 설치되어 있으면 앱이 실행되며, 설치되지 않은 경우 브라우저로 웹 페이지가 열린다.
  - e.g https://www.myshoppingapp.com/product/12345
- __Deferred Deep Link__
  - 디퍼드 딥링크는 앱이 설치되지 않은 경우에도 작동하여, 사용자가 앱을 설치한 후에도 특정 콘텐츠로 연결될 수 있도록 한다. 보통 사용자 획득 캠페인에서 많이 사용되며, 앱 설치 후 특정 화면으로 연결할 수 있는 기능을 제공한다.
  - e.g 사용자가 광고를 클릭하고 앱을 설치한 후 바로 프로모션 페이지로 이동하는 경우

## Links

- [Android, iOS 웹뷰에서 딥링크 열기 - Toss Payments](https://www.tosspayments.com/blog/articles/dev-4)