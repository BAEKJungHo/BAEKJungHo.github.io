---
layout  : wiki
title   : Content Delivery Network
summary : 
date    : 2024-07-08 15:02:32 +0900
updated : 2024-07-08 15:12:24 +0900
tag     : architecture aws cdn
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Content Delivery Network

A ___[Content Delivery Network(CDN)](https://github.com/donnemartin/system-design-primer?tab=readme-ov-file#content-delivery-network)___ is a globally distributed network of proxy servers, serving content from locations closer to the user. Generally, static files such as HTML/CSS/JS, photos, and videos are served from CDN, although some CDNs such as Amazon's CloudFront support dynamic content. The site's DNS resolution will tell clients which server to contact.

![](/resource/wiki/architecture-cdn/cdn.png)

Serving content from CDNs can significantly improve performance in two ways:
- Users receive content from data centers close to them
- Your servers do not have to serve requests that the CDN fulfills

![](/resource/wiki/architecture-cdn/cdn-flow.png)
*<small><a href="https://lethain.com/introduction-to-architecting-systems-for-scale/">Contents Distributed Network</a></small>*

CDN 을 사용하면 정적 콘텐츠, 동적 콘텐츠를 클라이언트가 받기 위해서 원본 서버 대신 가까운 CDN 엣지 서버로 요청을 보낸다.
이때 CDN 은 자주 요청되는 콘텐츠를 캐시하여 제공하기 때문에 원본 서버로의 부하가 줄어들게 된다. 캐시된 콘텐츠의 유효기간이 만료되면 CDN 은 원본 서버에 새로운 버전을 요청한다.
애플리케이션은 CDN 이 힘든 작업을 처리하기 때문에 연결을 열고 콘텐츠를 직접 전달할 책임이 없다. 즉, <mark><em><strong>CDN 을 사용하면 애플리케이션이 정적 콘텐츠에 대한 수요를 충족하기 위해 애플리케이션을 확장할 필요가 없다는 것</strong></em></mark> 이다.

__[Amazon CloudFront Integration with AWS Components](https://aws.amazon.com/ko/caching/cdn/)__:

![](/resource/wiki/architecture-cdn/cloudfront-architecture.png)

글로벌 분산 네트워크 플랫폼을 구축하기 위해 Amazon 의 CDN 서비스인 _[Amazon CloudFront](https://aws.amazon.com/ko/what-is/cdn/)_ 를 Amazon Simple Storage Service(Amazon S3) 와 같이 사용한다.
CDN 은 고품질의 풍부한 미디어 파일을 안정적이고 비용 효율적으로 제공할 수 있도록 지원하기 때문에 비디오 및 오디오를 스트리밍하는 기업은 CDN 을 사용하여 대역폭 비용 절감, 확장성 향상, 제공 시간 단축이라는 세 가지 과제를 해결할 수 있다.

_[AWS CloudFront 를 사용하기 위한 단계](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)_ 는 아래와 같다.

- Step 1: Create an Amazon S3 bucket
- Step 2: Upload the content to the bucket
- Step 3: Create a CloudFront distribution that uses an Amazon S3 origin with OAC
- Step 4: Access your content through CloudFront
- Step 5: Clean up