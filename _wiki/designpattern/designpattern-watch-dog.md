---
layout  : wiki
title   : WatchDog
summary : 
date    : 2024-10-01 15:28:32 +0900
updated : 2024-10-01 18:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## WatchDog

___[Watchdog Mechanism](https://en.wikipedia.org/wiki/Watchdog_timer)___ 은 시스템의 안정성과 신뢰성을 모니터링하고 유지하기 위한 감시 시스템입니다. 주로 시스템이 정상적으로 동작하는지 감시하고, 문제가 발생했을 때 적절한 조치를 취하는 역할을 한다.

1. 감시 대상 시스템/프로세스는 주기적으로 워치독에게 신호(heartbeat)를 보냄
2. 워치독은 일정 시간 동안 신호가 오지 않으면 시스템에 문제가 있다고 판단
3. 문제 발생 시 시스템 재시작 등의 복구 동작을 수행

서버 애플리케이션이나 분산 환경에서는 아래와 같은 목적으로 사용된다.

- 프로세스 모니터링
- 서비스 가용성 확보
- 자동 복구 메커니즘 구현
- 노드 상태 모니터링
- 장애 노드 감지 및 복구
- 서비스 연속성 보장

```java
public class WatchdogExample {
    public class Watchdog {
        private final long timeout;
        private final Timer timer;
        private volatile boolean isActive = false;
        
        public Watchdog(long timeout) {
            this.timeout = timeout;
            this.timer = new Timer(true);
        }
        
        public void start() {
            isActive = true;
            scheduleWatchdog();
        }
        
        public void stop() {
            isActive = false;
            timer.cancel();
        }
        
        public void reset() {
            if (isActive) {
                timer.cancel();
                scheduleWatchdog();
            }
        }
        
        private void scheduleWatchdog() {
            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    if (isActive) {
                        handleTimeout();
                    }
                }
            }, timeout);
        }
        
        private void handleTimeout() {
            System.out.println("Watchdog timeout detected!");
            // 여기에 복구 로직 구현
            // 예: 시스템 재시작, 알림 발송 등
        }
    }

    public class MonitoredSystem {
        private final Watchdog watchdog;
        private final ExecutorService executor;
        
        public MonitoredSystem() {
            this.watchdog = new Watchdog(5000); // 5초 타임아웃
            this.executor = Executors.newSingleThreadExecutor();
        }
        
        public void start() {
            watchdog.start();
            
            executor.submit(() -> {
                while (!Thread.currentThread().isInterrupted()) {
                    try {
                        // 정상적인 동작 시뮬레이션
                        doWork();
                        // 워치독에게 정상 동작 중임을 알림
                        watchdog.reset();
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            });
        }
        
        private void doWork() {
            // 실제 작업 수행
            System.out.println("System is working normally...");
        }
        
        public void stop() {
            executor.shutdown();
            watchdog.stop();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        MonitoredSystem system = new MonitoredSystem();
        system.start();
        
        // 10초 동안 실행
        Thread.sleep(10000);
        
        system.stop();
    }
}
```

__Pseudo Code__:

```java
public class TraditionalWatchdog {
    private final Timer timer = new Timer(true);
    private final long timeout;
    
    public TraditionalWatchdog(long timeout) {
        this.timeout = timeout;
    }
    
    public void start() {
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                if (!checkSystemHealth()) {
                    performRecovery();
                }
            }
        }, timeout, timeout);
    }
    
    private boolean checkSystemHealth() {
        // 시스템 상태 체크 로직
        return true;
    }
    
    private void performRecovery() {
        // 복구 동작 수행
    }
}
```