---
layout  : wiki
title   : Desired/Actual State Patterns
summary : Spec and Status Patterns
date    : 2024-09-11 15:28:32 +0900
updated : 2024-09-11 18:15:24 +0900
tag     : designpattern kubernetes mobility
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Desired/Actual State Patterns

HVAC stands for heating, ventilation, and air conditioning.

- ___Desired State___ is the state that you want the system to be in
- ___Actual State___ is the state that the system is actually in

HVAC 에서 원하는(desried) 실내 온도를 설정할 수 있다. 그리고 Actual Temperature 와 비교(diff) 하고 실내 온도가 Desired Temperature 에 도달할 때 까지
해당 과정을 반복해서 수행한다.

![](/resource/wiki/designpattern-desired-actual/desired-actual.png)

___[Desired/Actual State Patterns](https://branislavjenco.github.io/desired-state-systems/)___ 은 ___[Kubernetes](https://downey.io/blog/desired-state-vs-actual-state-in-kubernetes/)___ 에서도 적용된다.

![](/resource/wiki/designpattern-desired-actual/k8s.png)

yaml 이 Desired State 이며 resources(pods, ...) 들이 Actual State 이다.

> By ___[convention, the Kubernetes API](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#spec-and-status)___ makes a distinction between the specification of the desired state of an object (a nested object field called `spec(Desired State)`) and the status of the object at the current time (a nested object field called `status(Actual State)`).
> Over time the system will work to bring the status into line with the spec.

In distributed systems ___“[Perceived State](https://downey.io/blog/desired-state-vs-actual-state-in-kubernetes/)”___ refers to the imprecision of our measurements and lag time between when the system was measured and when we observe the results. In the HVAC example, you can think of the current temperature reported by the thermostat as being the Perceived State and know that the Actual State may have changed slightly since the temperature was last probed.

When you’re employing GitOps and IaC, your CD trigger is often the divergence between the actual and desired states.