---
layout  : wiki
title   : Event and Separation of De-concerns
summary : 
date    : 2023-06-03 17:54:32 +0900
updated : 2023-06-03 20:15:24 +0900
tag     : msa reactive
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Event and Separation of De-concerns

__Internal Event vs External Event:__
- The purpose of Internal Event is __Separation of De-concerns__.
- The purpose of External Event is __Reduce coupling with an external system__.
- Internal events exist in the same application.

__When a member order:__
1. Create Order
2. Processing Payment (External Event)
3. Reduce Product Amount (External Event)

__When a member logs in:__
1. Change membership to login status (Core Domain Logic)
2. Handling logouts to other devices with the same account logged in according to the "Limit the number of logins to the same account" rule 
3. Record which device the member is logged in from 
4. Log out of other accounts on the same device

2,3,4 are __Policies that must be performed together when a domain action is performed__. 
It's called __De-concerns__.

## How to reduce coupling Using Event

When an event is published, if the `purpose` is included, a coupling occurs.

Publishers should not be interested in what the subscriber does.

Therefore, external events should be treated as __domain events themselves__ to reduce coupling between services.

## Links

- [회원시스템 이벤트기반 아키텍처 구축하기](https://techblog.woowahan.com/7835/)