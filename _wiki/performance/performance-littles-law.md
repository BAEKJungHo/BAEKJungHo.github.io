---
layout  : wiki
title   : Little's Law
summary : 
date    : 2024-12-14 11:54:32 +0900
updated : 2024-12-14 12:15:24 +0900
tag     : performance
toc     : true
comment : true
public  : true
parent  : [[/performance]]
latex   : true
---
* TOC
{:toc}

## Little's Law

![](/resource/wiki/performance-littles-law/littles-law.png)

___[Little's Law](https://en.wikipedia.org/wiki/Little%27s_law)___ provides a fundamental formula for performance capacity:

$$N = Z * (R + T)$$
 
- **N**: Number of Virtual Users (VUser)
- **Z**: Transactions Per Second (TPS)
- **R**: Response Time (in seconds)
- **T**: Think Time (in seconds)
  - Think Time represents the delay between user actions (e.g., reading or deciding the next step) and simulates real user behavior.

```
- TPS (Z) = 100
- Response Time (R) = 3 seconds
- Think Time (T) = 2 seconds

[ VUser = 100 * (3 + 2) = 500 ]
```

- **Applications**:
  - Calculate required Virtual Users (vUser) for performance tests.
  - Use it as a baseline metric for desired system performance.

By collecting TPS, Response Time, and Think Time from project-specific business requirements, you can determine the required test metrics and validate desired system performance with these calculations.

### Active User, Current User

$$Active User = TPS * Response Time$$
- Users actively engaged in request and response during the response time.

$$Concurrent User = TPS * (Response Time + Think Time)$$
- Users active within the interval of request and response, including Think Time.

$$Request Interval = Response Time + Think Time$$

### Throughput(RPS)

Throughput (RPS) measures the system's ability to handle requests over time.

1. **Estimate DAU (Daily Active Users)**:
  - Predict the number of users expected to interact with the system daily.
2. **Peak Traffic Estimation**:
   - Determine how much higher traffic will get during peak hours.
   - **Formula**:
     - Peak Factor = Peak Traffic / Normal Traffic
     - 피크 시간대에 최대 트래픽이 평소의 10배라면, **최대 트래픽 / 평소 트래픽 = 10**
3. **Calculate Daily Throughput**:
  - **Total Requests in a Day**:
    - Requests = DAU * Average Requests per User per Day
  - **Average RPS**:
    - Daily Average RPS = Total Daily Requests / 86,400(seconds/day)
  - **Maximum RPS**:
    - Daily Max RPS = Daily Average RPS * Peak Factor