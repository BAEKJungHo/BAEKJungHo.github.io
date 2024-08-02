---
layout  : wiki
title   : DNS
summary : Domain Name System
date    : 2024-07-20 15:54:32 +0900
updated : 2024-07-20 18:15:24 +0900
tag     : network dns
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## DNS

___[DNS(Domain Name System)](https://wiki.kldp.org/KoreanDoc//html/PoweredByDNS-KLDP/PoweredByDNS.html)___ 은 전화번호부와 같은 역할을 한다. '도미노 피자'와 같은 이름이 전화번호부를 통해 전화번호로 변환되는 것처럼 'www.google.com' 과 같은 웹 주소는 DNS 를 통해 '74.125.19.147'과 같이 실제 IP 주소로 변환된다.
이러한 Domain 에서 IP 로의 변환 작업을 ___[Resolving](https://wiki.kldp.org/KoreanDoc//html/PoweredByDNS-KLDP/PoweredByDNS.html#FIG-RESOLVING)___ 이라고 한다.

__[How Dose DNS Work](https://www.slideshare.net/slideshow/dns-security-presentation-issa/40894222#4)__:

![](/resource/wiki/network-dns/dns-work.png)

### Records

DNS 에서는 다양한 _[Records](https://support.google.com/a/answer/48090?hl=ko)_ 들이 존재한다. 그 중에서 'A' 레코드는 Host Record 라고 부르며, 도메인 서비스를 호스팅하는 컴퓨터의 실제 IP 주소에 도메인을 연결한다.

- __NS record(name server)__ - Specifies the DNS servers for your domain/subdomain.
- __MX record(mail exchange)__ - Specifies the mail servers for accepting messages.
- __A record (address)__ - Points a name to an IP address.
- __CNAME(canonical)__ - Points a name to another name or CNAME (example.com to www.example.com) or to an A record.

Services such as CloudFlare and Route 53 provide managed DNS services.

### Time to Live

DNS _[TTL(Time To Live)](https://www.cloudflare.com/ko-kr/learning/cdn/glossary/time-to-live-ttl/)_ 은 레코드의 변경사항이 적용될 때까지 걸리는 시간(초)를 의미한다. 예를 들어 TTL 값이 86400초인 레코드는 변경사항은 적용될 때까지 24시간이 소요된다.

A 레코드에 대한 변경이 일어났을때 TTL 이 길면, Domain 전파가 늦을 수 있다. 
실무에서 만약 Working Times 에 실수로 도메인 작업을 하다가 이전 도메인을 날리게 되면 TTL 동안 장애가 발생할 수 있다.

이때 서버 로그에서는 Domain 명과 함께 'UnknownHostException' 과 같은 에러를 볼 수 있다.

### NSLOOKUP

___[NSLOOKUP](https://wiki.kldp.org/KoreanDoc//html/PoweredByDNS-KLDP/PoweredByDNS.html#NSLOOKUP)___ 은 DNS 가 문제가 발생했을때 해결하기 위해 사용되는 네임 서버 질의 도구이다. 

주로 아래와 같은 경우에 사용된다.

- 네트워크 문제 해결: 특정 도메인에 접근할 수 없을 때, DNS 문제인지 확인할 수 있다.
- DNS 설정 검증: 도메인에 대한 DNS 레코드가 올바르게 설정되었는지 확인할 수 있다.

__nslookup {Domain}__:

```
Server:  dns.example.net
Address:  192.168.1.1

Non-authoritative answer:
Name:    www.example.com
Address: 93.184.216.34
```

__nslookup {IpAddress}__ 을 통해 IP 주소에 매핑된 도메인 이름을 찾을 수 있다.

```
Server:  dns.example.net
Address:  192.168.1.1

Non-authoritative answer:
34.216.184.93.in-addr.arpa  name = www.example.com
```

NSLOOKUP 과 유사한 도구로 _[Dig(Domain Information Groper)](https://wiki.kldp.org/KoreanDoc//html/PoweredByDNS-KLDP/PoweredByDNS.html#DIG)_ 도 있다.