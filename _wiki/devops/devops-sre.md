---
layout  : wiki
title   : Site Reliability Engineering
summary : SLO, SLO
date    : 2023-01-18 15:54:32 +0900
updated : 2023-01-18 20:15:24 +0900
tag     : devops observability sre sli slo
toc     : true
comment : true
public  : true
parent  : [[/devops]]
latex   : true
---
* TOC
{:toc}

## Site Reliability Engineering

__[Google Cloud - SRE fundamentals: SLIs, SLAs and SLOs](https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-slis-slas-and-slos?hl=en)__

SRE begins with the idea that a prerequisite to success is __availability__.

__[What Is a Site Reliability Engineer?](https://www.purestorage.com/knowledge/what-is-a-site-reliability-engineer.html)__
- A site reliability engineer is responsible for the monitoring, automation, and reliability of IT operations. They use software development tools to automate IT operations tasks like change management, incident response, and production system management. They’re also responsible for monitoring the health of software deployments and relaying logs and data back to the developers. 


### Service Level Indicators

SLI 는 시스템의 가용성을 파악하기 위한 __핵심 지표__ 를 의미한다. 지표로는 error rate (http 요청에 대한 http status 5xx 의 비율) 와 latency 등이 있다.

### Service Level Objectives

SLO 는 시스템에서 __기대되는 가용성을 설정한 목표__ 이고, 이것을 위반하면 incidents 로 간주하고 [opsgenie](https://www.atlassian.com/software/opsgenie/what-is-opsgenie?&aceid=&adposition=&adgroup=143005044933&campaign=18829211510&creative=633276593217&device=c&keyword=opsgenie&matchtype=e&network=g&placement=&ds_kids=p74152817431&ds_e=GOOGLE&ds_eid=700000001786355&ds_e1=GOOGLE&gad_source=1&gclid=Cj0KCQjw2PSvBhDjARIsAKc2cgNAjlBKH7_3UzGB2arYanJ1GAHOXIQCHdqpmvZ3pXFnb0WQ9BLGDusaAnjHEALw_wcB&gclsrc=aw.ds) 등으로 incidents 알람이 온다.

## References

- [SRE Google](https://sre.google/sre-book/table-of-contents/)