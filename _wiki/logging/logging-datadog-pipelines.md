---
layout  : wiki
title   : Datadog Log Collection with Kubernetes
summary : 
date    : 2023-05-13 20:54:32 +0900
updated : 2023-05-13 21:15:24 +0900
tag     : logging observability
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

## Datadog Log Collection with Kubernetes

![](/resource/wiki/logging-datadog-pipelines/datadog.png)

1. [Datadog using STDOUT/STDERR to Collect container logs](https://docs.datadoghq.com/logs/guide/container-agent-to-tail-logs-from-host/?tab=kubernetes)
2. For above, Spring Boot using [Logback Appenders](https://logback.qos.ch/manual/appenders.html#ConsoleAppender). ConsoleAppender using System.out or System.err
3. K8S write logs into directories within /var/log/pods.
4. Datadog Agent collect logs Kubernetes log files (automatically handled by Kubernetes).
5. All your logs (raw and JSON) by sending them through a processing pipeline. Pipelines take logs from a wide variety of formats and translate them into a common format in Datadog.

[Preprocessing](https://docs.datadoghq.com/logs/log_configuration/pipelines/?tab=source#preprocessing) of JSON logs occurs before logs enter pipeline processing. Preprocessing runs a series of operations based on reserved attributes, such as timestamp, status, host, service, and message. If you have different attribute names in your JSON logs, use preprocessing to map your log attribute names to those in the reserved attribute list.

__Appenders with LogstashEncoder:__

```xml
<appender name="DATADOG_STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>
```

LogstashEncoder is Logback JSON encoder and appenders. Datadog [Reserved Attributes](https://docs.datadoghq.com/logs/log_configuration/attributes_naming_convention/#reserved-attributes).

__Kubernetes:__

- [The way that the kubelet and container runtime write logs depends on the operating system that the node uses](https://kubernetes.io/docs/concepts/cluster-administration/logging/#log-location-node)
- [Kubernetes Log Collection](https://docs.datadoghq.com/containers/kubernetes/log/?tab=daemonset#log-collection)  
  - The Agent(datadog) has two ways to collect logs: from the Docker socket, and from the Kubernetes log files (automatically handled by Kubernetes).
  - [Kubernetes Run the Datadog Agent](https://docs.datadoghq.com/containers/kubernetes/) in your Kubernetes cluster to start collecting your cluster and applications metrics, traces, and logs.

__Datadog Agent:__

- The [Datadog Agent](https://docs.datadoghq.com/agent/) is software that runs on your hosts. It collects events and metrics from hosts and sends them to Datadog, where you can analyze your monitoring and performance data.
- Datadog automatically parses JSON-formatted logs with Pipelines.
  - You can then add value to all your logs (raw and JSON) by sending them through a processing pipeline. Pipelines take logs from a wide variety of formats and translate them into a common format in Datadog.