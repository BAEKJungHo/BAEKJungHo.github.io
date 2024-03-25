---
layout  : wiki
title   : API Designs
summary : 
date    : 2023-05-19 15:02:32 +0900
updated : 2023-05-19 15:12:24 +0900
tag     : architecture api
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## API Designs

- [Architectural Styles and the Design of Network-based Software Architectures, Roy Fielding (the inventor of REST)](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- [Awesome API DevTools](https://github.com/yosriady/awesome-api-devtools?tab=readme-ov-file)
- [Best practices for REST API design, Stack Overflow Blog](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [Undisturbed REST: a guide to designing the perfect API: very complete book about RESTful API design](https://www.mulesoft.com/sites/default/files/resource-assets/ebook-UndisturbedREST_v1.pdf)
- [Microsoft REST API Guidelines](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md)
- [Zalando RESTful API and Event Scheme Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
- [Google's API Design Guide: a general guide to design networked API](https://cloud.google.com/apis/design/)
- [AIP Purpose and Guidelines](https://google.aip.dev/1)
- [Why you should use links, not keys, to represent relationships in APIs, Martin Nally, Google](https://cloud.google.com/blog/products/application-development/api-design-why-you-should-use-links-not-keys-to-represent-relationships-in-apis?hl=en)
  - "Using links instead of foreign keys to express relationships in APIs reduces the amount of information a client needs to know to use an API, and reduces the ways in which clients and servers are coupled to each other."
- [Give me /events, not webhooks](https://blog.sequin.io/events-not-webhooks/)
  - Events can unlock much-needed webhook features, like allowing your webhook consumers to replay or reset the position of their webhook subscription.