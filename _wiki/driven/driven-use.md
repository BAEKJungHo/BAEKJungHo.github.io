---
layout  : wiki
title   : USE methodology
summary : 
date    : 2022-07-01 15:54:32 +0900
updated : 2022-07-01 20:15:24 +0900
tag     : methodology
toc     : true
comment : true
public  : true
parent  : [[/methodology]]
latex   : true
---
* TOC
{:toc}

## USE

![](/resource/wiki/driven-use/use.png)

### Error

- 우선 에러가 발생했는지 로그를 확인한다. 로그는 크게, 서버에서 남기는 시스템 로그와 애플리케이션 로그로 나눠진다.
- 시스템 로그는 주로 /var/log/syslog 를 확인하며, 그 외에도 cron, boot.log, dmesg 등을 활용한다.
  - `tail -f /var/log/syslog`
- 일반적으로 로그는 logrotate 설정을 하여 자동으로 압축, 삭제 등을 한다.

### Utilization

![](/resource/wiki/driven-use/utilization.png)

> 주로 CPU utilization, Available memory, RX/TX 패킷량, Disk 사용률, IOPS 등을 확인한다.

- 서버의 리소스는 [스크립트](https://github.com/woowacourse/script-practice/blob/master/script/server_resource.sh)로 확인할 수 있다.
- 우선, [Load average](https://brainbackdoor.tistory.com/117) 를 확인한다. 부하가 클 경우, 영향을 주는 프로세스를 확인한다.
- oom-killer 등 시스템 메시지가 발생한다면 dmesg 혹은 syslog 를 통해 확인할 수 있다.
- vmstat 를 통해 OS 커널에서 취득할 수 있는 정보를 확인해본다.
  - ```shell
     $ vmstat 5 5
     procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
     r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
     0  0      0 20774188 124872 10659336    0    0     0     9    3    3  0  0 100  0  0
     0  0      0 20771628 124872 10659576    0    0     0     0 1143 1041  0  0 99  0  0
    ```
  - si, so: swap-in 과 swap-out 에 대한 값으로, 0이 아니라면 현재 시스템에 메모리가 부족하다는 의미
  - us, sy, id, wa, st: 각각 user time, 커널에서 사용되는 system time, idle, wait I/O 그리고 stolen time 을 의미
  - stolen time 은 hypervisor 가 가상 CPU 를 서비스 하는 동안 실제 CPU 를 차지한 시간을 의미
  - I/O 대기와 관련해서는 wa 가 아닌, b 열을 참고
- iostat 을 통해 OS 커널에서 취득한 디스크 사용률을 알 수 있다.
  - ```shell
     $ iostat -xt
     Linux 5.4.0-1038-aws (ip-192-168-0-146.ap-northeast-2.compute.internal) 	03/19/21 	_x86_64_	(8 CPU)
  
     03/19/21 14:59:35
     avg-cpu:  %user   %nice %system %iowait  %steal   %idle
     0.15    0.00    0.08    0.00    0.04   99.73
  
     Device            r/s     rkB/s   rrqm/s  %rrqm r_await rareq-sz     w/s     wkB/s   wrqm/s  %wrqm w_await wareq-sz     d/s     dkB/s   drqm/s  %drqm d_await dareq-sz  aqu-sz  %util
     loop0            0.01      0.01     0.00   0.00    0.30     1.04    0.00      0.00     0.00   0.00    0.00     0.00    0.00      0.00     0.00   0.00    0.00     0.00    0.00   0.00
     loop1            0.00      0.00     0.00   0.00    2.27     1.25    0.00      0.00     0.00   0.00    0.00     0.00    0.00      0.00     0.00   0.00    0.00     0.00    0.00   0.00
    ```
  - r/s, w/s rkB/s, wkB/s: read 요청과 write 요청, read kB/s, write kB/s 를 의미
- free 명령어로 메모리 사용량을 확인할 수 있다.
  - ```shell
    $ free -wh
    total        used        free      shared     buffers       cache   available
    Mem:           31Gi       1.3Gi        19Gi       0.0Ki       122Mi        10Gi        29Gi
    Swap:            0B          0B          0B
    ```
  - available : swapping 없이 새로운 프로세스에서 할당 가능한 메모리의 예상 크기

![](/resource/wiki/driven-use/top.png)

사실, top 명령어만 잘 써도 서버 리소스 사용률을 대부분 파악할 수 있다.

## Links

- [토스의 서버 인프라 모니터링](https://www.youtube.com/watch?v=rxurfKT2lD8&feature=emb_imp_woyt)
- [NextStep 인프라 공방](https://edu.nextstep.camp/)