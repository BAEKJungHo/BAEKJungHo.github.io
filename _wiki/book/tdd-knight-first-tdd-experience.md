---
layout  : wiki
title   : Chapter2 - First TDD Experience Position Class Implementation
summary : 
date    : 2025-08-05 10:08:32 +0900
updated : 2025-08-05 10:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tddknight]]
latex   : true
---
* TOC
{:toc}

# First TDD Experience - Position Class Implementation

> "Make each program do one thing well." - Unix philosophy

## 2.1 도메인 이해: 체스 좌표계

### 요구사항 분석: a-h, 1-8 좌표계

체스 보드는 8x8 격자로 구성되며, 각 칸은 고유한 좌표를 가진다:
- **File (세로줄)**: a, b, c, d, e, f, g, h
- **Rank (가로줄)**: 1, 2, 3, 4, 5, 6, 7, 8

```
8 ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜ 
7 ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ 
6 . . . . . . . . 
5 . . . . . . . . 
4 . . . . . . . . 
3 . . . . . . . . 
2 ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙ 
1 ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖ 
  a b c d e f g h
```

이는 단순해 보이지만, 다음과 같은 복잡성을 가진다:

1. **경계값 검증**: a-h, 1-8 범위를 벗어나는 값 처리
2. **불변성 요구사항**: 체스 게임 중 좌표는 변경되지 않아야 함
3. **성능 고려사항**: 게임 중 수많은 Position 객체가 생성됨

### TDD로 접근하는 이유

Position 클래스는 TDD 학습에 이상적이다:

- **명확한 요구사항**: 체스 좌표계는 모든 사람이 이해할 수 있음
- **적절한 복잡성**: 너무 단순하지도, 복잡하지도 않음
- **기초 블록**: 다른 모든 클래스가 Position에 의존함

## 2.2 첫 번째 RED 사이클

### 테스트 시나리오 도출 과정

TDD에서 가장 중요한 것은 **"무엇을 테스트할 것인가?"** 를 결정하는 것이다.

#### 브레인스토밍: 가능한 테스트 시나리오들
```
1. 유효한 좌표로 Position 생성
2. 무효한 좌표로 Position 생성 시 예외
3. 좌표값 조회 (file, rank)
4. Position 객체 동등성 비교
5. 문자열 표현 (toString)
6. 경계값 테스트 (a, h, 1, 8)
```

#### 첫 번째 테스트 선택 기준

가장 **단순하고 핵심적인 기능**부터 시작한다:

```kotlin
// 첫 번째 테스트: 가장 기본적인 기능
@Test
fun `유효한 좌표로 Position을 생성할 수 있다`() {
    // Given: 유효한 체스 좌표
    val file = 'e'
    val rank = 4
    
    // When: Position 객체 생성
    val position = Position(file, rank)
    
    // Then: 올바른 값이 저장됨
    position.file shouldBe 'e'
    position.rank shouldBe 4
}
```

### 실패하는 테스트 작성의 의도

이 테스트를 실행하면 **컴파일 오류**가 발생한다:

```
Unresolved reference: Position
```

**이것도 RED 상태이다!** 컴파일 오류는 테스트 실패의 한 형태이며, TDD 사이클의 시작점이다.

#### 왜 실패가 중요한가?

1. **가정 검증**: 우리가 만들려는 API가 정말 없다는 것을 확인
2. **인터페이스 설계**: 사용자(테스트) 관점에서 API를 먼저 설계
3. **피드백 루프**: 즉각적인 피드백으로 설계 결정을 검증

### Kent Beck의 "Immediate Feedback for Interface Design Decisions"

이 테스트를 작성하는 순간, 우리는 다음과 같은 설계 결정을 내린다:

1. **클래스 이름**: `Position` (좌표를 나타내는 명확한 이름)
2. **생성자 매개변수**: `file: Char, rank: Int` (체스 표기법과 일치)
3. **접근 방법**: `position.file`, `position.rank` (프로퍼티 접근)
4. **불변성**: val 프로퍼티로 설계 결정

```kotlin
// 테스트가 요구하는 인터페이스
class Position(val file: Char, val rank: Int) {
    // 이것만으로도 테스트가 통과된다!
}
```

### ABSTRACTION과 테스트

Position 클래스는 체스 보드의 **추상화(Abstraction)** 이다:

```kotlin
// 물리적 현실: 8x8 나무 보드의 특정 칸
// ↓ 추상화
// 논리적 모델: Position('e', 4)
```

이 추상화는 다음을 가능하게 한다:
- **복잡성 숨김**: 내부 구현을 감춤
- **재사용성**: 다른 체스 관련 클래스에서 활용
- **테스트 용이성**: 간단한 값 객체로 검증 가능

## 2.3 첫 번째 GREEN 사이클

### 최소한의 구현으로 테스트 통과

```kotlin
// 가장 간단한 구현
data class Position(val file: Char, val rank: Int)
```

이 한 줄로 첫 번째 테스트가 통과된다!

### "가장 간단한 구현"의 철학

TDD에서는 **"가장 간단한 구현을 하라"**고 강조한다. 이는 다음 이유 때문이다:

1. **오버엔지니어링 방지**: 미래의 요구사항을 추측하지 않음
2. **빠른 피드백**: 즉시 GREEN 상태로 전환하여 성취감 제공
3. **점진적 발전**: 다음 테스트가 더 복잡한 요구사항을 요구함

### GREEN 상태의 의미

GREEN 상태는 다음을 의미한다:
- **작동하는 코드**: 최소한의 기능이 구현됨
- **테스트 통과**: 요구사항이 만족됨
- **다음 단계 준비**: 리팩토링이나 다음 기능 추가 가능

## 2.4 경계값 테스트와 거짓 양성 방지

### 거짓 양성(False Positive)의 위험

현재 구현은 다음과 같은 문제가 있다:

```kotlin
// 이런 무효한 좌표도 허용됨!
Position('z', 9)  // 체스판을 벗어남
Position('@', 0)  // 잘못된 문자
Position('a', -1) // 음수 rank
```

이는 **거짓 양성** 상황이다. 테스트는 통과하지만, 실제로는 잘못된 동작을 허용한다.

### Positive vs Negative 테스트 쌍

거짓 양성을 방지하기 위해 **테스트 쌍**을 작성한다:

```kotlin
context("Position 생성 테스트") {
    // Positive Test: 올바른 경우
    test("유효한 좌표로 Position을 생성할 수 있다") {
        val position = Position('e', 4)
        position.file shouldBe 'e'
        position.rank shouldBe 4
    }
    
    // Negative Test: 잘못된 경우들
    test("유효하지 않은 file로 Position 생성 시 예외가 발생한다") {
        shouldThrow<IllegalArgumentException> {
            Position('z', 4)  // file 범위 초과
        }
        
        shouldThrow<IllegalArgumentException> {
            Position('@', 4)  // 잘못된 문자
        }
    }
    
    test("유효하지 않은 rank로 Position 생성 시 예외가 발생한다") {
        shouldThrow<IllegalArgumentException> {
            Position('e', 0)   // rank 범위 미만
        }
        
        shouldThrow<IllegalArgumentException> {
            Position('e', 9)   // rank 범위 초과
        }
    }
}
```

### 경계값 테스트의 중요성

경계값은 버그가 가장 자주 발생하는 지점이다:

```kotlin
test("경계값에서 Position이 올바르게 동작한다") {
    // 최소 경계값
    shouldNotThrow<Exception> { Position('a', 1) }
    
    // 최대 경계값  
    shouldNotThrow<Exception> { Position('h', 8) }
    
    // 경계 바로 밖
    shouldThrow<IllegalArgumentException> { Position('`', 1) } // 'a' - 1
    shouldThrow<IllegalArgumentException> { Position('i', 1) } // 'h' + 1
    shouldThrow<IllegalArgumentException> { Position('a', 0) } // 1 - 1
    shouldThrow<IllegalArgumentException> { Position('a', 9) } // 8 + 1
}
```

### 구현 진화: 검증 로직 추가

새로운 테스트들을 통과시키기 위해 구현을 진화시킨다:

```kotlin
data class Position(val file: Char, val rank: Int) {
    init {
        require(file in 'a'..'h') { 
            "File must be between 'a' and 'h', but was '$file'" 
        }
        require(rank in 1..8) { 
            "Rank must be between 1 and 8, but was $rank" 
        }
    }
}
```

### DESIGN PATTERN: Value Object

Position은 **Value Object 패턴**의 전형적인 예이다:

#### Value Object의 특징:
1. **불변성(Immutability)**: 생성 후 상태 변경 불가
2. **동등성(Equality)**: 값이 같으면 동일한 객체
3. **자가 검증(Self-Validation)**: 객체 생성 시 유효성 검증

```kotlin
// Value Object로서의 Position
val pos1 = Position('e', 4)
val pos2 = Position('e', 4)

pos1 == pos2  // true (값 기반 동등성)
pos1 === pos2 // false (다른 인스턴스)

// 불변성 보장
// pos1.file = 'f'  // 컴파일 오류!
```

### 실제 코드에서 살펴보는 검증의 가치

체스 엔진을 실제로 실행했을 때, 다음과 같은 시나리오가 있었다:

```kotlin
// 사용자가 잘못된 입력을 할 때
val input = "z9z9"  // 체스판을 벗어나는 좌표

try {
    val move = Move.parse(input)  // 내부에서 Position 생성
} catch (e: IllegalArgumentException) {
    println("⚠️ 유효하지 않은 좌표이다: ${e.message}")
    // 사용자에게 친절한 오류 메시지 제공
}
```

Position의 엄격한 검증 덕분에:
- 🚫 **잘못된 상태 전파 방지**: 시스템 내부에 무효한 좌표가 돌아다니지 않음
- 🔍 **조기 오류 발견**: 문제가 발생한 지점에서 즉시 오류 감지
- 📝 **명확한 오류 메시지**: 사용자가 무엇을 잘못했는지 정확히 알 수 있음

## 2.5 테스트 용이성(Testability) 설계

### 테스트하기 쉬운 Position 클래스

Position 클래스는 높은 테스트 용이성을 가진다:

```kotlin
@Test
fun `Position 동등성이 올바르게 작동한다`() {
    // 준비(Arrange)
    val pos1 = Position('e', 4)
    val pos2 = Position('e', 4)
    val pos3 = Position('d', 4)
    
    // 실행 & 검증(Act & Assert)
    pos1 shouldBe pos2      // 값이 같으면 동등
    pos1 shouldNotBe pos3   // 값이 다르면 다름
    
    // 해시코드 일관성
    pos1.hashCode() shouldBe pos2.hashCode()
}

@Test
fun `Position을 문자열로 표현할 수 있다`() {
    val position = Position('e', 4)
    position.toString() shouldBe "Position(file=e, rank=4)"
}
```

### 부작용 없는 설계(Side-Effect Free)

Position 클래스의 모든 메서드는 **부작용이 없다**:

```kotlin
val position = Position('e', 4)

// 이 모든 호출이 position의 상태를 변경하지 않음
position.file     // 부작용 없음
position.rank     // 부작용 없음  
position.toString() // 부작용 없음
position.equals(other) // 부작용 없음
position.hashCode() // 부작용 없음
```

이는 다음과 같은 장점을 제공한다:
- **예측 가능성**: 메서드 호출 결과를 쉽게 예측
- **테스트 격리**: 테스트 간 상호 영향 없음
- **동시성 안전**: 여러 스레드에서 안전하게 사용

### Mock 객체가 필요 없는 설계

Position은 의존성이 없어 Mock 객체가 불필요하다:

```kotlin
// Mock이 필요한 복잡한 객체
class ComplexService(
    private val database: Database,
    private val httpClient: HttpClient,
    private val logger: Logger
) {
    fun process() {
        // 외부 의존성과 상호작용
    }
}

// Mock이 불필요한 단순한 값 객체
class Position(val file: Char, val rank: Int) {
    // 외부 의존성 없음
}
```

## 2.6 점진적 복잡성 추가

### 다음 요구사항: Position 간 거리 계산

체스에서는 기물 간 거리를 계산해야 하는 경우가 있다:

```kotlin
test("두 Position 간 맨해튼 거리를 계산할 수 있다") {
    val from = Position('a', 1)
    val to = Position('h', 8)
    
    val distance = from.manhattanDistanceTo(to)
    
    distance shouldBe 14  // |h-a| + |8-1| = 7 + 7 = 14
}
```

### 새로운 기능을 위한 TDD 사이클

#### RED: 실패하는 테스트
```kotlin
// 컴파일 오류 발생: manhattanDistanceTo 메서드 없음
val distance = from.manhattanDistanceTo(to)
```

#### GREEN: 최소 구현
```kotlin
data class Position(val file: Char, val rank: Int) {
    init { /* 기존 검증 로직 */ }
    
    fun manhattanDistanceTo(other: Position): Int {
        val fileDiff = kotlin.math.abs(this.file.code - other.file.code)
        val rankDiff = kotlin.math.abs(this.rank - other.rank)
        return fileDiff + rankDiff
    }
}
```

#### REFACTOR: 가독성 개선
```kotlin
fun manhattanDistanceTo(other: Position): Int {
    val fileDifference = kotlin.math.abs(this.file - other.file)
    val rankDifference = kotlin.math.abs(this.rank - other.rank)
    return fileDifference + rankDifference
}

// 연산자 오버로딩으로 더 읽기 쉽게
private operator fun Char.minus(other: Char): Int = this.code - other.code
```

### 기능 확장의 자연스러운 흐름

TDD를 통해 Position 클래스가 자연스럽게 진화했다:

1. **기본 생성**: 좌표 저장
2. **검증**: 유효성 확인
3. **비교**: 동등성 검사
4. **계산**: 거리 계산
5. **표현**: 문자열 변환

각 단계마다 테스트가 요구사항을 명시하고, 구현이 이를 만족시켰다.

## 2.7 실제 사용에서의 검증

### 체스 엔진에서의 Position 활용

완성된 Position 클래스는 체스 엔진 전체에서 활용된다:

```kotlin
// 기물 이동 검증
fun isValidMove(from: Position, to: Position): Boolean

// 보드 상태 관리  
fun getPiece(position: Position): Piece?

// 이동 명령 파싱
fun parse(notation: String): Move  // 내부에서 Position 생성

// 체크 상태 확인
fun isPositionUnderAttack(position: Position, attackingColor: Color): Boolean
```

### DDD(Domain-Driven Design)에서의 Value Object

Position은 DDD의 **Value Object** 개념을 완벽히 구현한다:

#### 도메인의 핵심 개념
```kotlin
// 도메인 전문가(체스 플레이어)의 언어
"백색 킹을 e1에서 g1로 이동"  

// 코드에서의 표현
val from = Position('e', 1)
val to = Position('g', 1)
val move = Move(from, to)
```

#### 유비쿼터스 언어(Ubiquitous Language)
Position 클래스는 도메인 전문가와 개발자가 공통으로 사용하는 언어를 제공한다:

- **체스 플레이어**: "e4 칸"
- **개발자**: `Position('e', 4)`
- **동일한 개념**, **동일한 표현**

## 2.8 TDD로 얻은 설계 품질

### 단일 책임 원칙 (SRP) 준수
Position 클래스는 오직 **"체스 보드의 좌표"** 라는 하나의 책임만 가진다.

### 개방-폐쇄 원칙 (OCP) 준수
새로운 기능(거리 계산 등)을 기존 코드 수정 없이 확장할 수 있다.

### 인터페이스 분리 원칙 (ISP) 준수
클라이언트는 자신이 필요한 메서드만 사용한다.

### 의존성 역전 원칙 (DIP) 준수
Position은 구체적인 구현이 아닌 추상적인 개념(좌표)에 의존한다.

## 결론: 첫 TDD 경험의 의미

Position 클래스 구현을 통해 우리는 다음을 경험했다:

1. **RED-GREEN-REFACTOR 사이클**의 자연스러운 흐름
2. **테스트가 주도하는 설계**의 힘
3. **거짓 양성 방지**를 위한 전략
4. **점진적 복잡성 추가**의 안전함
5. **높은 품질의 코드** 자동 생성

Kent Beck이 말한 **"Immediate feedback for interface design decisions"**를 몸소 체험했다. 테스트를 작성하는 순간순간마다 우리는 더 나은 설계 결정을 내릴 수 있었다.

다음 장에서는 이런 경험을 바탕으로 **테스트 설계의 원칙**들을 더 체계적으로 살펴보겠다.