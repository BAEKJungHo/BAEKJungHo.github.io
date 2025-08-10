---
layout  : wiki
title   : Coupon Issuance System
summary : 
date    : 2025-05-31 11:02:32 +0900
updated : 2025-05-31 12:12:24 +0900
tag     : systemdesign stream
toc     : true
comment : true
public  : true
parent  : [[/systemdesign]]
latex   : true
---
* TOC
{:toc}

## Coupon Issuance System

__Common Used Redis Data Structure in Coupon Issuance System__:

```
# 쿠폰 재고 관리
coupon:stock:{couponId} → "1000"

# 발급 큐
coupon:issue:queue → [request1, request2, request3...]

# 대기열 (Sorted Set)
coupon:waiting:{eventId} → {userId: timestamp}

# 중복 발급 방지 (Set)
coupon:issued:{couponId} → {userId1, userId2, userId3...}

# 사용자별 발급 내역 (Hash)
user:coupons:{userId} → {couponId: issueTime}

# 쿠폰 상태 추적
coupon:status:{requestId} → "PROCESSING|COMPLETED|FAILED"

# 분산 락
coupon:lock:{couponId} → "locked"
```

### Story1: Black Friday Event

__Scenario__:
- 블랙프라이데이 이벤트: 10,000원 할인 쿠폰 1,000장 한정, 오후 2시 정각 시작
- 예상 동시 접속자: 50,000명
- 이벤트 시작과 동시에 폭발적인 트래픽 발생

#### Phase1: Cache Warming & Event Start Scheduling

```java
// 1. 캐시 워밍업 (이벤트 시작 10분 전)
@Scheduled(cron = "0 50 13 * * *") // 오후 1시 50분
public void warmUpCacheForBlackFridayEvent() {
    String couponId = "BLACK_FRIDAY_2024";
    
    // Redis에 쿠폰 재고 초기화
    redisTemplate.opsForValue().set("coupon:stock:" + couponId, "1000");
    
    // 쿠폰 정보 캐시 로드
    CouponInfo couponInfo = couponRepository.findById(couponId);
    redisTemplate.opsForValue().set("coupon:info:" + couponId, couponInfo, Duration.ofHours(2));
    
    // 이벤트 활성화 플래그 설정
    redisTemplate.opsForValue().set("event:active:" + couponId, "false");
    
    log.info("Black Friday event cache warmed up. Stock: 1000, Event: READY");
}

// 2. 정확히 오후 2시에 이벤트 활성화
@Scheduled(cron = "0 0 14 * * *") // 오후 2시 정각
public void activateBlackFridayEvent() {
    String couponId = "BLACK_FRIDAY_2024";
    redisTemplate.opsForValue().set("event:active:" + couponId, "true");
    
    // 대기열 초기화
    redisTemplate.delete("coupon:waiting:" + couponId);
    
    log.info("🚀 Black Friday event ACTIVATED!");
}
```

#### Phase2: Massive Traffic

```java
// 1. API Gateway에서 요청 수신
@PostMapping("/api/v1/coupons/issue")
public Mono<ResponseEntity<CouponIssueResponse>> issueCoupon(
    @RequestHeader("X-User-ID") String userId,
    @RequestBody CouponIssueRequest request) {
    
    String requestId = UUID.randomUUID().toString();
    log.info("🎫 Coupon issue request received. User: {}, RequestId: {}", userId, requestId);
    
    return couponIssueService.issueCouponAsync(userId, request, requestId)
        .map(result -> ResponseEntity.ok(result))
        .onErrorResume(ex -> handleError(ex, requestId));
}

// 2. 쿠폰 발급 서비스에서 즉시 검증
@Service
public class CouponIssueService {
    
    public Mono<CouponIssueResponse> issueCouponAsync(String userId, CouponIssueRequest request, String requestId) {
        String couponId = request.getCouponId();
        
        return Mono.fromCallable(() -> {
            // Step 1: 이벤트 활성화 확인
            Boolean isActive = (Boolean) redisTemplate.opsForValue().get("event:active:" + couponId);
            if (!Boolean.TRUE.equals(isActive)) {
                throw new EventNotActiveException("이벤트가 아직 시작되지 않았습니다.");
            }
            
            // Step 2: 중복 발급 확인 (Redis Set 사용)
            String issuedKey = "coupon:issued:" + couponId;
            Boolean alreadyIssued = redisTemplate.opsForSet().isMember(issuedKey, userId);
            if (Boolean.TRUE.equals(alreadyIssued)) {
                throw new DuplicateIssueException("이미 발급받은 쿠폰입니다.");
            }
            
            // Step 3: 재고 확인 및 원자적 차감 (Lua Script)
            Long remainingStock = decrementStockAtomically(couponId);
            if (remainingStock < 0) {
                throw new OutOfStockException("쿠폰이 모두 소진되었습니다.");
            }
            
            // Step 4: 발급 큐에 추가
            CouponIssueQueueItem queueItem = CouponIssueQueueItem.builder()
                .requestId(requestId)
                .userId(userId)
                .couponId(couponId)
                .timestamp(System.currentTimeMillis())
                .build();
                
            redisTemplate.opsForList().rightPush("coupon:issue:queue", queueItem);
            
            // Step 5: 중복 발급 방지를 위해 사용자 추가
            redisTemplate.opsForSet().add(issuedKey, userId);
            
            // Step 6: 요청 상태 추적
            redisTemplate.opsForValue().set("coupon:status:" + requestId, "PROCESSING", Duration.ofMinutes(10));
            
            log.info("Coupon issue queued. User: {}, Remaining stock: {}", userId, remainingStock);
            
            return CouponIssueResponse.builder()
                .requestId(requestId)
                .status("PROCESSING")
                .message("쿠폰 발급이 진행 중입니다.")
                .estimatedProcessingTime("30초 이내")
                .build();
                
        }).subscribeOn(Schedulers.boundedElastic());
    }
    
    // 원자적 재고 차감을 위한 Lua Script
    private Long decrementStockAtomically(String couponId) {
        String script = 
            "local stockKey = KEYS[1] " +
            "local current = redis.call('GET', stockKey) " +
            "if current and tonumber(current) > 0 then " +
            "  local newStock = redis.call('DECR', stockKey) " +
            "  return newStock " +
            "else " +
            "  return -1 " +
            "end";
            
        return redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class),
            Collections.singletonList("coupon:stock:" + couponId)
        );
    }
}
```

#### Phase3: Background Async

```java
// Consumer Service가 큐에서 요청을 처리
@Component
public class CouponIssueConsumer {
    
    @Scheduled(fixedDelay = 50) // 50ms마다 폴링
    public void processCouponIssueQueue() {
        try {
            // 배치 단위로 처리 (성능 최적화)
            List<CouponIssueQueueItem> batch = getBatchFromQueue(10);
            
            if (!batch.isEmpty()) {
                log.info("🔄 Processing batch of {} coupon requests", batch.size());
                processBatch(batch);
            }
            
        } catch (Exception e) {
            log.error("Error processing coupon queue", e);
        }
    }
    
    private List<CouponIssueQueueItem> getBatchFromQueue(int batchSize) {
        List<CouponIssueQueueItem> batch = new ArrayList<>();
        
        for (int i = 0; i < batchSize; i++) {
            CouponIssueQueueItem item = (CouponIssueQueueItem) 
                redisTemplate.opsForList().leftPop("coupon:issue:queue");
            if (item == null) break;
            batch.add(item);
        }
        
        return batch;
    }
    
    @Transactional
    private void processBatch(List<CouponIssueQueueItem> batch) {
        List<UserCoupon> couponsToSave = new ArrayList<>();
        
        for (CouponIssueQueueItem item : batch) {
            try {
                // 1. 쿠폰 엔티티 생성
                UserCoupon userCoupon = UserCoupon.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(item.getUserId())
                    .couponId(item.getCouponId())
                    .issueDate(LocalDateTime.now())
                    .expiryDate(LocalDateTime.now().plusDays(30))
                    .status(CouponStatus.ACTIVE)
                    .build();
                    
                couponsToSave.add(userCoupon);
                
                // 2. 상태 업데이트
                updateCouponStatus(item.getRequestId(), "COMPLETED", userCoupon.getId());
                
                // 3. 사용자별 쿠폰 목록 캐시 업데이트
                updateUserCouponCache(item.getUserId(), userCoupon);
                
                log.info("Coupon issued successfully. User: {}, CouponCode: {}", 
                    item.getUserId(), userCoupon.getId());
                
            } catch (Exception e) {
                // 실패 처리
                handleFailure(item, e);
            }
        }
        
        // 배치 DB 저장
        if (!couponsToSave.isEmpty()) {
            userCouponRepository.saveAll(couponsToSave);
            log.info("💾 Batch saved {} coupons to database", couponsToSave.size());
        }
    }
    
    private void updateCouponStatus(String requestId, String status, String couponCode) {
        CouponStatusUpdate statusUpdate = CouponStatusUpdate.builder()
            .requestId(requestId)
            .status(status)
            .couponCode(couponCode)
            .timestamp(System.currentTimeMillis())
            .build();
            
        redisTemplate.opsForValue().set("coupon:status:" + requestId, statusUpdate, Duration.ofHours(1));
        
        // 실시간 알림을 위한 pub/sub
        redisTemplate.convertAndSend("coupon:status:updates", statusUpdate);
    }
}
```

#### Phase4: Real-time Status Inquiry

```java
// 사용자가 발급 상태를 실시간으로 확인
@GetMapping(value = "/api/v1/coupons/status/{requestId}", 
           produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<CouponStatusUpdate>> getCouponStatus(@PathVariable String requestId) {
    
    return Flux.create(sink -> {
        // 1. 현재 상태 즉시 전송
        CouponStatusUpdate currentStatus = getCurrentStatus(requestId);
        if (currentStatus != null) {
            sink.next(ServerSentEvent.builder(currentStatus).build());
        }
        
        // 2. Redis Pub/Sub으로 실시간 업데이트 구독
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory);
        
        MessageListener listener = (message, pattern) -> {
            CouponStatusUpdate update = parseMessage(message);
            if (requestId.equals(update.getRequestId())) {
                sink.next(ServerSentEvent.builder(update).build());
                
                // 완료되면 스트림 종료
                if ("COMPLETED".equals(update.getStatus()) || "FAILED".equals(update.getStatus())) {
                    sink.complete();
                }
            }
        };
        
        container.addMessageListener(listener, new PatternTopic("coupon:status:updates"));
        container.start();
        
        // 정리 작업
        sink.onDispose(() -> {
            container.stop();
            container.destroy();
        });
    })
    .timeout(Duration.ofMinutes(5)) // 5분 타임아웃
    .onErrorResume(ex -> Flux.just(ServerSentEvent.builder(
        CouponStatusUpdate.error(requestId, "상태 조회 중 오류가 발생했습니다.")).build()));
}
```

### Story2: System overload situation

__Scenario__:
- Black Friday Event 에 "예상보다 10배 많은 트래픽 발생 (500,000명 동시 접속)"

#### Circuit Breaker

```java
@Component
public class CouponServiceWithResilience {
    
    @CircuitBreaker(name = "coupon-service", fallbackMethod = "fallbackToWaitingQueue")
    @RateLimiter(name = "coupon-service")
    @TimeLimiter(name = "coupon-service")
    public Mono<CouponIssueResponse> issueCoupon(String userId, CouponIssueRequest request) {
        return couponIssueService.issueCouponAsync(userId, request, UUID.randomUUID().toString());
    }
    
    // 폴백: 대기열 시스템으로 전환
    public Mono<CouponIssueResponse> fallbackToWaitingQueue(String userId, CouponIssueRequest request, Exception ex) {
        log.warn("🚨 Circuit breaker activated. Redirecting to waiting queue. User: {}", userId);
        
        return waitingQueueService.addToWaitingQueue(userId, request.getCouponId())
            .map(position -> CouponIssueResponse.builder()
                .status("QUEUED")
                .message("현재 대기 중입니다.")
                .queuePosition(position)
                .estimatedWaitTime(calculateEstimatedWaitTime(position))
                .build());
    }
}

// 대기열 서비스
@Service
public class WaitingQueueService {
    
    public Mono<Integer> addToWaitingQueue(String userId, String couponId) {
        return Mono.fromCallable(() -> {
            String queueKey = "coupon:waiting:" + couponId;
            double score = System.currentTimeMillis(); // 타임스탬프를 스코어로 사용
            
            // Sorted Set에 추가
            redisTemplate.opsForZSet().add(queueKey, userId, score);
            
            // 현재 대기 순번 반환
            Long rank = redisTemplate.opsForZSet().rank(queueKey, userId);
            return rank != null ? rank.intValue() + 1 : 1;
            
        }).subscribeOn(Schedulers.boundedElastic());
    }
    
    // 대기열에서 배치 단위로 처리
    @Scheduled(fixedDelay = 1000) // 1초마다
    public void processWaitingQueue() {
        String couponId = "BLACK_FRIDAY_2024";
        String queueKey = "coupon:waiting:" + couponId;
        
        // 현재 시스템 부하 확인
        if (isSystemHealthy()) {
            // 상위 100명을 실제 발급 큐로 이동
            Set<String> nextBatch = redisTemplate.opsForZSet().range(queueKey, 0, 99);
            
            if (!nextBatch.isEmpty()) {
                for (String userId : nextBatch) {
                    // 실제 발급 프로세스로 이동
                    CouponIssueRequest request = CouponIssueRequest.builder()
                        .couponId(couponId)
                        .build();
                        
                    couponIssueService.issueCouponAsync(userId, request, UUID.randomUUID().toString())
                        .subscribe(
                            result -> {
                                // 대기열에서 제거
                                redisTemplate.opsForZSet().remove(queueKey, userId);
                                log.info("User {} moved from waiting queue to processing", userId);
                            },
                            error -> log.error("Failed to process user {} from waiting queue", userId, error)
                        );
                }
            }
        }
    }
}
```

### Story3: Users use Coupons

__Scenario__:
- 사용자가 발급 받은 쿠폰을 결제 시 사용

```java
@PostMapping("/api/v1/orders/{orderId}/apply-coupon")
public Mono<OrderResponse> applyCoupon(
    @PathVariable String orderId,
    @RequestHeader("X-User-ID") String userId,
    @RequestBody CouponApplyRequest request) {
    
    return couponUsageService.applyCoupon(userId, orderId, request.getCouponCode())
        .map(result -> OrderResponse.builder()
            .orderId(orderId)
            .originalAmount(result.getOriginalAmount())
            .discountAmount(result.getDiscountAmount())
            .finalAmount(result.getFinalAmount())
            .appliedCoupon(result.getCouponCode())
            .build());
}

@Service
public class CouponUsageService {
    
    public Mono<CouponApplyResult> applyCoupon(String userId, String orderId, String couponCode) {
        return Mono.fromCallable(() -> {
            // 1. 쿠폰 소유권 확인
            String userCouponKey = "user:coupons:" + userId;
            Boolean hasCoupon = redisTemplate.opsForHash().hasKey(userCouponKey, couponCode);
            
            if (!Boolean.TRUE.equals(hasCoupon)) {
                throw new CouponNotOwnedException("보유하지 않은 쿠폰입니다.");
            }
            
            // 2. 쿠폰 상태 확인 (분산 락 사용)
            String lockKey = "coupon:lock:" + couponCode;
            Boolean lockAcquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "locked", Duration.ofSeconds(10));
                
            if (!Boolean.TRUE.equals(lockAcquired)) {
                throw new CouponLockedException("쿠폰이 다른 곳에서 사용 중입니다.");
            }
            
            try {
                // 3. DB에서 쿠폰 상세 정보 조회
                UserCoupon userCoupon = userCouponRepository.findByUserIdAndCouponCode(userId, couponCode)
                    .orElseThrow(() -> new CouponNotFoundException("쿠폰을 찾을 수 없습니다."));
                
                // 4. 쿠폰 유효성 검증
                validateCouponUsage(userCoupon, orderId);
                
                // 5. 쿠폰 사용 처리
                userCoupon.use(orderId);
                userCouponRepository.save(userCoupon);
                
                // 6. 캐시 업데이트
                updateCouponCacheAfterUsage(userId, couponCode);
                
                // 7. 사용 이벤트 발행
                publishCouponUsedEvent(userId, couponCode, orderId);
                
                return CouponApplyResult.builder()
                    .couponCode(couponCode)
                    .discountAmount(userCoupon.getDiscountAmount())
                    .build();
                    
            } finally {
                // 락 해제
                redisTemplate.delete(lockKey);
            }
            
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
```