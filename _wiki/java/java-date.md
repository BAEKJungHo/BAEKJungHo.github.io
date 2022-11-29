---
layout  : wiki
title   : GMT, UTC and Date API (작성중)
summary : Date, Calendar, LocalDateTime, ZoneDateTime
date    : 2022-11-22 11:28:32 +0900
updated : 2022-11-22 12:15:24 +0900
tag     : java kotlin spring
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Greenwich Mean Time

[GMT is a time zone](https://www.timeanddate.com/time/zones/gmt) officially used in some European and African countries. The time can be displayed using both the 24-hour format (0 - 24) or the 12-hour format (1 - 12 am/pm).

## Coordinated Universal Time

협정 세계시라고 불리는 UTC 는 세계 표준시를 의미한다. 

__UTC - The World's Time Standard.__ This 24-hour time standard is kept using highly precise atomic clocks combined with the Earth's rotation.

[Current UTC Time](https://www.worldtimeserver.com/time-zones/utc/) 링크를 통해서 현재 UTC 시간을 볼 수 있다. 한국 시간대랑 비교하면 9시간이 차이난다. 

한국 표준시를 KST(Korea Standard Time)이라고 하고 UTC 보다 9시간 빠른 표준시(`UTC+09:00`)이다. 

### A Standard, Not a Time Zone

UTC is the time standard commonly used across the world. The world's timing centers have agreed to keep their time scales closely synchronized - or coordinated - therefore the name Coordinated Universal Time.

## Date

- java.util.Date Class 는 Comparable 을 구현하고 있기 때문에 비교 가능
- 기본 생성자를 통해서 Date 객체 생성 가능
  - 이때, fastTime 이라는 변수에 System.currentTimeMillis() 값을 할당한다.

Date 클래스의 단점 - [ALL ABOUT JAVA.UTIL.DATE](https://codeblog.jonskeet.uk/2017/04/23/all-about-java-util-date/)
- mutable 하기 때문에 thread safe 하지 않다.
- 클래스 이름이 Date 인데 시간까지 다룬다.
- 버그 발생 여지가 많다. (타입 안정성이 없고, 월이 0부터 시작)

## Date Time API in Java 8

[Date-Time Design Principles](https://docs.oracle.com/javase/tutorial/datetime/overview/design.html):
- Clear
- Fluent
- Immutable
- Extensible

[주요 API](https://docs.oracle.com/javase/tutorial/datetime/iso/overview.html):
- 기계용 시간 (machine time)과 인류용 시간(human time)으로 나눌 수 있다.
- 기계용 시간은 EPOCK(1970년 1월 1일 0시 0분 0초)부터 현재까지의 타임스탬프를 표현한다.
- 인류용 시간은 우리가 흔히 사용하는 연,월,일,시,분,초 등을 표현한다.
- 타임스탬프는 Instant 를 사용한다.
- 특정 날짜(LocalDate), 시간(LocalTime), 일시(LocalDateTime)를 사용할 수 있다.
- 기간을 표현할 때는 Duration(시간 기반)과 Period(날짜 기반)를 사용할 수 있다.
- DateTimeFormatter 를 사용해서 일시를 특정한 문자열로 포매팅할 수 있다.

![](/resource/wiki/java-date/apis.png)

### Instant

- [Instant API Doc](https://docs.oracle.com/javase/tutorial/datetime/iso/instant.html)
- Instant 는 EPOCH 의 1초부터 시작하여 시간을 계산함. EPOCH 이전에 발생하는 순간은 음수 값을 가지며, 이후에 발생하는 순간은 양수값을 갖음
- Instant 는 기계 시간을 나타내는 Timestamp 를 생성하는데 용이함
  - Instant timestamp = Instant.now();
- Instant 에서 toString() 호출 시 아래와 같은 출력이 생성됨
  - 2013-05-30T23:38:23.085Z
- Instant 클래스 는 년, 월 또는 일과 같은 인간 시간 단위로 작동하지 않음. 인간 시간 단위로 계산을 수행하려면 Instant 를 LocalDateTime 또는 ZoneDateTime 으로 변환해야 함.
- ZonedDateTime 또는 OffsetTimeZone 개체는 각각 타임라인의 정확한 순간에 매핑되므로 Instant 개체 로 변환 할 수 있다. 그러나 Instant 개체를 ZonedDateTime 또는 OffsetDateTime 개체 로 변환하려면 표준 시간대 또는 표준 시간대 오프셋 정보를 제공해야 한다.

```java
// 현재 시간에 1시간 더하기
Instant oneHourLater = Instant.now().plus(1, ChronoUnit.HOURS);

// Converting
LocalDateTime ldt = LocalDateTime.ofInstant(timestamp, ZoneId.systemDefault());
System.out.printf("%s %d %d at %d:%d%n", ldt.getMonth(), ldt.getDayOfMonth(), ldt.getYear(), ldt.getHour(), ldt.getMinute ());
```

## Links

- [About UTC](https://www.timeanddate.com/time/aboututc.html)

