---
layout  : wiki
title   : Jdk Vendors
summary : 
date    : 2022-10-19 11:28:32 +0900
updated : 2022-10-19 12:15:24 +0900
tag     : java
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## OracleJDK

오라클(Oracle)이 2010년에 Sun Microsystems 을 인수한 후 현재는 Oracle JDK 라는 이름이 되었다. Java SE 10 이후 부터는 6개월 마다 새 릴리즈가 나오고 있다.

## OpenJDK

Open JDK 는 Java SE Platform Edition 의 무료 오픈 소스 구현이다. OpenJDK 는 7 버전 이후 Java Standard Edition 의 공식 레퍼런스 구현이다. Oracle JDK 처럼 6개월 마다 새로운 기능 릴리즈를 제공하고 있다.

## How it's differences

- __License__
  - Open JDK: GNU General Public License 가 포함된 완전한 오픈소스 Java 이다.
  - Oracle JDK: Oracle Binary Code License Agreement 에 따른 사용 라이센스가 필요하다. Oracle Java SE 8의 공개 업데이트 부터 상용 라이선스 없이는 비즈니스, 상업용 또는 생산 용도로 사용할 수 없다.
- __Performance__
  - 이전에는 Oracle JDK 가 성능이 더 좋았지만, Open JDK 의 성능이 지속적으로 개선되고 있다.

## Vendors

Oracle contributed all the JDK features to OpenJDK 11. Therefore, Oracle JDK 11 and Oracle OpenJDK 11 are now interchangeable.

![](/resource/wiki/java-jdk-vendors/vendors.png)

- __Related Articles__
  - [Most commonly available JDKs](https://blog.frankel.ch/common-jdks/)
  - [Oracle Java 대안: Oracle Java SE vs 대안 제품](https://www.azul.com/ko-kr/java-alternative-vendors/)
  - [An Overview of JDK Vendors - DZone](https://dzone.com/articles/an-overview-on-jdk-vendors)

## Links

- [Oracle - Java](https://www.oracle.com/java/)
- [Oracle JDK vs OpenJdk](https://www.baeldung.com/oracle-jdk-vs-openjdk)
- [OpenJDK Update Release Map](https://shipilev.net/jdk-updates/map/)
- [LINE 의 OpenJDK 적용기: 호환성 확인부터 주의 사항까지](https://engineering.linecorp.com/ko/blog/line-open-jdk/)
