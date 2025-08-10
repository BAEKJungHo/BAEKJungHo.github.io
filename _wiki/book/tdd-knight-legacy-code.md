---
layout  : wiki
title   : Chapter7 - Practical TDD Strategies in Legacy code
summary : 
date    : 2025-08-10 10:08:32 +0900
updated : 2025-08-10 10:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tddknight]]
latex   : true
---
* TOC
{:toc}

# Practical TDD Strategies in Legacy code

> "Legacy code is code without tests... but that doesn't mean we have to live with it forever." - Michael Feathers

## 7.1 레거시 테스트 코드의 현실적 문제들

실제 프로덕션 환경에서 마주치는 일반적인 문제 상황들이다:

```kotlin
// 문제 1: 불명확한 테스트 이름
@Test
fun test1() { ... }
@Test
fun testCase() { ... }
@Test
fun shouldWork() { ... }

// 문제 2: 거대한 테스트 메서드
@Test
fun testUserFlow() {
    // 100줄의 복잡한 시나리오
    // 여러 기능을 동시에 테스트
    // 실패 시 원인 파악 어려움
}

// 문제 3: 하드코딩된 값들
@Test
fun testPayment() {
    val result = paymentService.process(1000, "USD", "user123")
    assertEquals(1050, result.amount) // 수수료 포함인지 불명확
}

// 문제 4: 테스트 간 의존성
@Test
@Order(1)
fun createUser() { ... }

@Test
@Order(2)
fun updateUser() { ... } // createUser에 의존

// 문제 5: Mock 남용
@Test
fun testComplexLogic() {
    // 10개 이상의 Mock 객체
    // 실제 로직보다 Mock 설정이 더 복잡
}
```

이런 테스트들은 존재하지만 오히려 개발을 방해한다. 변경이 두렵고, 의도가 불명확하며, 유지보수가 어렵다.

## 7.2 레거시 테스트 환경에서의 TDD 접근 전략

### 7.2.1 "Island of Quality" 전략

새로운 기능을 추가할 때 기존의 낮은 품질 테스트를 모두 개선하려 하지 말고, 새로운 영역에서 고품질 테스트 섬을 만들어나가는 전략이다:

```kotlin
// 기존 레거시 테스트 (건드리지 않음)
class PaymentServiceLegacyTest {
    @Test
    fun test1() { /* 복잡하고 이해하기 어려운 기존 테스트 */ }
}

// 새로운 기능을 위한 새로운 테스트 클래스
class PaymentRefundFeatureTest : FunSpec({
    context("환불 기능") {
        test("전액 환불 시 원래 금액이 반환된다") {
            // Given
            val originalPayment = Payment(
                amount = Money.of(1000, KRW),
                status = COMPLETED
            )

            // When  
            val refund = paymentService.refund(originalPayment, FULL_REFUND)
            
            // Then
            refund.amount shouldBe Money.of(1000, KRW)
            refund.status shouldBe REFUNDED
        }

        test("부분 환불 시 지정된 금액만 반환된다") {
            // 명확한 의도의 새로운 테스트
        }
    }
})
```

**핵심 아이디어:**
- 기존 테스트는 건드리지 않는다
- 새로운 기능만 높은 품질로 작성한다
- 점진적으로 고품질 영역을 확장한다

### 7.2.2 점진적 개선 전략

기존 테스트를 한 번에 모두 개선하지 말고, 관련된 부분만 점진적으로 개선한다:

```kotlin
// 기존 문제 있는 테스트
@Test
fun testUserRegistration() {
    // 50줄의 복잡한 코드
    User user = userService.register("john", "password123", "john@email.com");
    assertTrue(user != null);
    assertEquals("john", user.getName());
    // ... 더 많은 assertion
}

// 새 기능 추가 시, 관련 부분만 개선된 스타일로 분리
class UserRegistrationTest : FunSpec({
    context("사용자 등록") {
        test("유효한 정보로 등록 시 사용자가 생성된다") {
            // Given
            val registrationRequest = UserRegistrationRequest(
                username = "john",
                password = "password123",
                email = "john@email.com"
            )
    
            // When
            val user = userService.register(registrationRequest)
            
            // Then
            user.username shouldBe "john"
            user.email shouldBe "john@email.com"
            user.isActive shouldBe true
        }

        // 새로운 기능: 이메일 중복 검사
        test("중복된 이메일로 등록 시 예외가 발생한다") {
            // 이 부분은 새로운 TDD 사이클로 진행
        }
    } 
})
```

## 7.3 레거시 환경에서의 TDD 사이클 변형

### 7.3.1 "EXPLORE → ISOLATE → TDD" 사이클

기존의 RED → GREEN → REFACTOR 대신:

```kotlin
// 1. EXPLORE: 기존 코드 탐색
class LegacyCodeExplorationTest {
    @Test
    fun understandCurrentBehavior() {
        // 기존 코드가 어떻게 동작하는지 파악하는 테스트
        val result = legacyPaymentService.process(testPayment)
    
        // 현재 동작을 문서화
        println("Current behavior: $result")
        // 이 테스트는 임시적이며, 이해 후 삭제 가능
    }
}

// 2. ISOLATE: 새 기능을 위한 격리된 공간 생성
class NewPaymentFeatureTest : FunSpec({
    // 기존 코드와 독립적인 새로운 테스트 공간

    // 3. TDD: 격리된 공간에서 전통적 TDD 진행
    context("새로운 할부 결제 기능") {
        test("6개월 할부 시 월 할부금이 정확히 계산된다") {
            // RED → GREEN → REFACTOR 사이클 진행
        }
    }
})
```

이 방식은 레거시 코드의 복잡성에 휩쓸리지 않고 새로운 기능에 집중할 수 있게 해준다.

### 7.3.2 기존 테스트와의 상호작용 전략

```kotlin
// 기존 테스트가 깨지지 않도록 보장
class PaymentServiceIntegrationTest {
    @Test
    fun newFeatureDoesNotBreakExistingBehavior() {
        // 기존 기능들이 여전히 작동하는지 확인
        val legacyResults = runAllLegacyScenarios()
        val newSystemResults = runSameScenariosWithNewSystem()
            
        // 기존 동작 보장
        legacyResults shouldBe newSystemResults
    }
}
```

## 7.4 실용적 리팩터링 전략

### 7.4.1 "Strangler Fig" 패턴 활용

기존 코드를 점진적으로 대체하면서 TDD를 적용한다:

```kotlin
// 1단계: 기존 서비스 래핑
class PaymentServiceV2(
    private val legacyPaymentService: LegacyPaymentService,
    private val newPaymentEngine: NewPaymentEngine
) {
    fun processPayment(request: PaymentRequest): PaymentResult {
        return if (isNewFeatureEnabled(request)) {
            // 새로운 로직 (TDD로 개발됨)
            newPaymentEngine.process(request)
        } else {
            // 기존 로직 유지
            legacyPaymentService.process(request)
        }
    }
}

// 2단계: 새 로직에 대한 TDD
class NewPaymentEngineTest : FunSpec({
    test("신용카드 결제 시 즉시 승인된다") {
        // 새로운 기능만을 위한 깔끔한 TDD
    }
})

// 3단계: 점진적 마이그레이션 테스트
class PaymentMigrationTest {
    @Test
    fun gradualMigrationWorks() {
        // 단계별 마이그레이션 검증
    }
}
```

### 7.4.2 기존 테스트 개선의 우선순위

모든 테스트를 동시에 개선할 수는 없다. 우선순위를 정해야 한다:

```kotlin
// 우선순위 1: 자주 실패하는 테스트
@Test
fun flakyTestThatNeedsImprovement() {
    // 이런 테스트를 우선적으로 개선
}

// 우선순위 2: 새 기능과 직접 관련된 테스트
@Test
fun testRelatedToNewFeature() {
    // 새 기능 개발 시 함께 개선
}

// 우선순위 3: 높은 비즈니스 가치의 핵심 로직 테스트
@Test
fun criticalBusinessLogicTest() {
    // 비즈니스 영향도가 높은 부분 우선 개선
}
```

## 7.5 레거시 환경에서의 테스트 작성 패턴

### 7.5.1 "Golden Master" 패턴

**개념 설명:**

Golden Master는 복잡한 시스템의 출력을 완전히 기록하여, 리팩토링 후에도 동일한 결과가 나오는지 검증하는 기법이다. 특히 복잡한 알고리즘이나 계산 로직을 안전하게 리팩토링할 때 유용하다.

**핵심 원칙:**
- 다양한 입력에 대한 출력을 파일로 저장
- 리팩토링 후 동일한 입력으로 출력 비교
- 차이가 없으면 리팩토링 성공
- 텍스트 기반 비교로 검증

```kotlin
class PaymentServiceGoldenMasterTest {
    @Test
    fun captureCurrentBehaviorAsGoldenMaster() {
        val testCases = loadComprehensiveTestCases()
        
        testCases.forEach { testCase ->
            val result = legacyPaymentService.process(testCase.input)
        
            // 현재 결과를 "황금 표준"으로 저장
            goldenMasterRecorder.record(testCase.id, result)
        }
    }

    @Test
    fun ensureRefactoredCodeMatchesGoldenMaster() {
        val testCases = loadComprehensiveTestCases()
        
        testCases.forEach { testCase ->
            val newResult = refactoredPaymentService.process(testCase.input)
            val expectedResult = goldenMasterRecorder.playback(testCase.id)
        
            newResult shouldBe expectedResult
        }
    }
}
```

**실제 게임 시나리오를 활용한 Golden Master:**

```kotlin
// 실제 GameTest의 시나리오들을 Golden Master로 활용
class GameGoldenMasterTest : FunSpec({
    
    val goldenMasterDir = "src/test/resources/golden-master"
    
    context("실제 게임 시나리오 Golden Master") {
        test("기본 게임 시나리오들의 Golden Master 생성") {
            val scenarios = listOf(
                // 실제 GameTest.kt의 시나리오들을 활용
                "initial" to Game.initialize(),
                
                "after_e2e4" to Game.initialize().makeMove(Move.parse("e2e4")),
                
                "two_moves" to Game.initialize()
                    .makeMove(Move.parse("e2e4"))
                    .makeMove(Move.parse("e7e5")),
                
                "check_scenario" to Game.initialize()
                    .makeMove(Move.parse("e2e4"))
                    .makeMove(Move.parse("f7f6"))
                    .makeMove(Move.parse("d1h5"))
            )
            
            scenarios.forEach { (name, game) ->
                val output = buildString {
                    appendLine("=== Scenario: $name ===")
                    appendLine("Current Player: ${game.getCurrentPlayer()}")
                    appendLine("Game State: ${game.getGameState()}")
                    appendLine("Winner: ${game.getWinner()}")
                    
                    // 체크 상태 기록
                    appendLine("White in check: ${game.isInCheck(Color.WHITE)}")
                    appendLine("Black in check: ${game.isInCheck(Color.BLACK)}")
                    
                    // 보드 상태 기록
                    appendLine("\nBoard positions:")
                    val sortedPieces = game.getBoard().getSquares().toSortedMap(
                        compareBy<Position> { it.file }.thenBy { it.rank }
                    )
                    sortedPieces.forEach { (pos, piece) ->
                        appendLine("  $pos: ${piece.javaClass.simpleName}(${piece.color})")
                    }
                    
                    appendLine("Total pieces: ${game.getBoard().getSquares().size}")
                }
                
                // Golden Master 파일 저장
                File("$goldenMasterDir").mkdirs()
                File("$goldenMasterDir/$name.golden").writeText(output)
                
                println("Golden Master created for scenario: $name")
            }
        }
    }
    
    context("Golden Master 검증") {
        test("리팩토링 후 동일한 결과 검증") {
            val scenarios = listOf(
                "initial" to Game.initialize(),
                "after_e2e4" to Game.initialize().makeMove(Move.parse("e2e4")),
                "two_moves" to Game.initialize()
                    .makeMove(Move.parse("e2e4"))
                    .makeMove(Move.parse("e7e5"))
            )
            
            scenarios.forEach { (name, game) ->
                val currentOutput = buildString {
                    appendLine("=== Scenario: $name ===")
                    appendLine("Current Player: ${game.getCurrentPlayer()}")
                    appendLine("Game State: ${game.getGameState()}")
                    appendLine("Winner: ${game.getWinner()}")
                    
                    appendLine("White in check: ${game.isInCheck(Color.WHITE)}")
                    appendLine("Black in check: ${game.isInCheck(Color.BLACK)}")
                    
                    appendLine("\nBoard positions:")
                    val sortedPieces = game.getBoard().getSquares().toSortedMap(
                        compareBy<Position> { it.file }.thenBy { it.rank }
                    )
                    sortedPieces.forEach { (pos, piece) ->
                        appendLine("  $pos: ${piece.javaClass.simpleName}(${piece.color})")
                    }
                    
                    appendLine("Total pieces: ${game.getBoard().getSquares().size}")
                }
                
                // Golden Master와 비교
                val goldenMasterFile = File("$goldenMasterDir/$name.golden")
                if (goldenMasterFile.exists()) {
                    val goldenMaster = goldenMasterFile.readText()
                    currentOutput shouldBe goldenMaster
                } else {
                    println("Golden Master file not found: $name.golden")
                }
            }
        }
    }
})
```

## 7.6 팀 협업을 위한 실용적 가이드라인

### 7.6.1 점진적 개선 전략

```kotlin
// 단계 1: 새 기능은 항상 고품질 테스트
class NewFeatureTest : FunSpec({
    // 새로운 모든 테스트는 최고 품질 기준 적용
})

// 단계 2: 기존 테스트 리팩터링 시 부분적 개선
class ExistingFeatureTest {
    // 기존 메서드들은 그대로 두고
    @Test
    fun oldTestMethod() { ... }
    
    // 새로 추가되는 부분만 새 스타일 적용
    @Nested
    inner class NewRequirements : FunSpec({
        test("새로운 요구사항은 새 스타일로") { ... }
    })
}

// 단계 3: 점진적 전환
class TransitioningTest {
    @Test
    @Deprecated("Use newStyleTest instead")
    fun oldStyleTest() { ... }

    // 동일한 기능의 새 스타일 테스트
    fun newStyleTest() = test("동일 기능의 개선된 테스트") { ... }
}
```

## 7.7 실무에서의 의사결정 가이드

### 7.7.1 언제 기존 테스트를 개선할 것인가?

**개선해야 하는 경우:**
- 새 기능 추가 시 관련 테스트 개선
- 버그 수정 시 해당 테스트 개선
- 자주 실패하는 불안정한 테스트
- 팀원들이 이해하기 어려워하는 테스트

**개선하지 않는 경우:**
- 잘 동작하고 있는 레거시 테스트
- 곧 삭제될 기능의 테스트
- 개선 비용이 과도하게 큰 테스트
- 비즈니스 우선순위가 낮은 기능의 테스트

### 7.7.2 실용적 TDD 적용 기준

**항상 TDD 적용:**
- 새로운 비즈니스 로직
- 복잡한 계산 로직
- 에러 처리 로직

**선택적 TDD 적용:**
- 단순한 CRUD 작업
- 기존 패턴의 반복
- 프로토타입 개발

**TDD 적용 안함:**
- 단순한 설정 변경
- 로깅, 모니터링 코드
- 일회성 스크립트

## 7.8 결론: 현실적 TDD 접근법

레거시 환경에서의 TDD는 완벽을 추구하기보다는 점진적 개선을 통한 지속가능한 발전에 초점을 맞춰야 한다.

**핵심 원칙들:**
1. **"모든 것을 고치려 하지 마라"** - 새로운 영역에서 품질을 시작하라
2. **"기존 동작을 보장하라"** - 리팩터링 시 회귀를 방지하라
3. **"팀과 함께 기준을 만들어라"** - 일관된 개선 방향을 설정하라
4. **"비즈니스 가치 우선"** - 중요한 부분부터 개선하라
5. **"점진적으로 발전시켜라"** - 한 번에 모든 것을 바꾸려 하지 마라

이러한 접근법을 통해 레거시 환경에서도 TDD의 장점을 점진적으로 확산시킬 수 있다. 완벽한 TDD보다는 지속가능한 TDD가 실제 프로덕션 환경에서는 더 가치 있다.

***"Progress, not perfection"*** - 완벽함보다는 발전이 레거시 환경에서 TDD 적용의 핵심 철학이다.