---
layout  : wiki
title   : Chapter3 - Test Design Principle
summary : 
date    : 2025-08-06 10:08:32 +0900
updated : 2025-08-06 10:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tddknight]]
latex   : true
---
* TOC
{:toc}

# Test Design Principle

> "Code without tests is bad code. It doesn't matter how well written it is; it doesn't matter how pretty or object-oriented or well-encapsulated it is. With tests, we can change the behavior of our code quickly and verifiably. Without them, we really don't know if our code is getting better or worse." - Michael Feathers

## 3.1 단일 책임 원칙과 테스트

### "하나의 논리적 개념" 검증

좋은 테스트는 **"하나의 논리적 개념(One Logical Concept)"**만을 검증해야 한다. 이는 SRP(Single Responsibility Principle)의 테스트 버전이다.

#### 잘못된 예: 여러 개념을 한 번에 검증
```kotlin
// 나쁜 테스트: 너무 많은 것을 한 번에 검증
@Test
fun `체스 게임 전체 기능 테스트`() {
    // 보드 초기화 검증
    val game = Game.initialize()
    game.getBoard().get(Position('e', 1)) shouldBe King(Color.WHITE)
    
    // 이동 검증
    val newGame = game.makeMove(Move.parse("e2e4"))
    newGame.getBoard().get(Position('e', 4)) shouldBe Pawn(Color.WHITE)
    
    // 턴 변경 검증
    newGame.getCurrentPlayer() shouldBe Color.BLACK
    
    // 체크 상태 검증
    newGame.isInCheck(Color.BLACK) shouldBe false
    
    // ... 더 많은 검증들
}
```

**문제점:**
- 실패 시 **어떤 부분이 문제인지 파악 어려움**
- 한 부분의 변경이 **전체 테스트에 영향**
- 테스트 **유지보수 비용 증가**

#### 올바른 예: 단일 개념 검증
```kotlin
// 좋은 테스트: 하나의 개념만 검증
context("체스 게임 초기화") {
    test("게임이 초기화되면 백색이 먼저 시작한다") {
        val game = Game.initialize()
        game.getCurrentPlayer() shouldBe Color.WHITE
    }
    
    test("게임 보드가 올바르게 초기화된다") {
        val game = Game.initialize()
        
        // 백색 기물 검증
        game.getBoard().get(Position('e', 1)) shouldBe King(Color.WHITE)
        game.getBoard().get(Position('d', 1)) shouldBe Queen(Color.WHITE)
        
        // 흑색 기물 검증
        game.getBoard().get(Position('e', 8)) shouldBe King(Color.BLACK)
        game.getBoard().get(Position('d', 8)) shouldBe Queen(Color.BLACK)
    }
}

context("기물 이동") {
    test("백색이 먼저 이동한 후 흑색 차례가 된다") {
        val game = Game.initialize()
        val newGame = game.makeMove(Move.parse("e2e4"))
        
        newGame.getCurrentPlayer() shouldBe Color.BLACK
    }
}
```

### 테스트 시나리오 크기 결정 기준

#### 기준 1: 논리적 응집성
```kotlin
// 논리적으로 응집된 검증
test("보드 초기화 시 모든 기물이 올바른 위치에 배치된다") {
    val board = Board.initialize()
    
    // 같은 논리적 개념: "초기 배치"
    board.get(Position('a', 1)) shouldBe Rook(Color.WHITE)
    board.get(Position('b', 1)) shouldBe Knight(Color.WHITE)
    board.get(Position('c', 1)) shouldBe Bishop(Color.WHITE)
    // ... 32개 기물 모두 검증
}
```

32개의 기물을 각각 별도 테스트로 분리하는 것은 **비효율적**이다. 모두 "초기 배치"라는 하나의 논리적 개념에 속하기 때문이다.

#### 기준 2: 실패 영향 범위
```kotlin
// 실패 영향이 명확히 구분됨
test("폰이 전방으로 1칸 이동할 수 있다") {
    val pawn = Pawn(Color.WHITE)
    pawn.isValidMove(Position('e', 2), Position('e', 3)) shouldBe true
}

test("폰이 초기 위치에서 2칸 이동할 수 있다") {
    val pawn = Pawn(Color.WHITE)
    pawn.isValidMove(Position('e', 2), Position('e', 4)) shouldBe true
}
```

이 두 테스트는 분리되어야 한다. 서로 다른 규칙이며, 하나가 실패해도 다른 하나는 성공할 수 있기 때문이다.

#### 기준 3: 변경 빈도
```kotlin
// 변경 빈도가 다른 개념들은 분리
test("일반적인 폰 이동 규칙") {
    // 기본 규칙 (변경 빈도 낮음)
}

test("앙파상 특별 규칙") {
    // 특별 규칙 (변경 빈도 높을 수 있음)
}
```

### SOLID 원칙과 테스트 설계

#### Single Responsibility Principle (SRP)
```kotlin
// 하나의 책임만 검증
class PositionTest {
    // 오직 Position 클래스의 동작만 검증
}

class PawnTest {
    // 오직 Pawn 클래스의 동작만 검증
}
```

#### Open/Closed Principle (OCP)
```kotlin
// 새로운 기물 추가 시 기존 테스트 수정 불필요
abstract class PieceMovementTest {
    abstract fun createPiece(): Piece
    abstract fun getValidMoves(): List<Pair<Position, Position>>
    
    @Test
    fun `기물이 유효한 이동을 할 수 있다`() {
        val piece = createPiece()
        val validMoves = getValidMoves()
        
        validMoves.forEach { (from, to) ->
            piece.isValidMove(from, to) shouldBe true
        }
    }
}

class PawnMovementTest : PieceMovementTest() {
    override fun createPiece() = Pawn(Color.WHITE)
    override fun getValidMoves() = listOf(
        Position('e', 2) to Position('e', 3),
        Position('e', 2) to Position('e', 4)
    )
}
```

#### Liskov Substitution Principle (LSP)
```kotlin
// 모든 Piece 구현체가 동일한 계약을 준수
@Test
fun `모든 기물이 Piece 인터페이스를 올바르게 구현한다`() {
    val pieces = listOf(
        Pawn(Color.WHITE),
        Rook(Color.WHITE),
        Knight(Color.WHITE),
        Bishop(Color.WHITE),
        Queen(Color.WHITE),
        King(Color.WHITE)
    )
    
    pieces.forEach { piece ->
        // 모든 Piece는 이 계약을 준수해야 함
        piece.getColor() shouldNotBe null
        piece.getType() shouldNotBe null
    }
}
```

## 3.2 테스트 네이밍과 가독성

### 한국어 테스트명의 장점

체스 엔진 프로젝트에서 **한국어 테스트명**을 사용한 이유:

#### 1. 도메인 지식의 정확한 표현
```kotlin
// 한국어: 도메인 개념이 명확
test("앙파상으로 상대방 폰을 잡을 수 있다") {
    // 체스 규칙의 복잡성이 그대로 드러남
}

// 영어: 도메인 개념이 모호
test("en passant capture is valid") {
    // 비체스플레이어에게는 의미 불명확
}
```

#### 2. 비즈니스 언어와의 일치
```kotlin
// 비즈니스 요구사항과 일치
// 요구사항: "킹이 공격받고 있을 때는 체크 상태이다"
test("킹이 공격받고 있을 때 체크 상태를 감지한다") {
    // 요구사항과 테스트명이 정확히 일치
}
```

#### 3. 테스트 리포트의 가독성
```
폰이 전방으로 1칸 이동할 수 있다
폰이 초기 위치에서 2칸 이동할 수 있다  
폰이 대각선으로 적 기물을 잡을 수 있다
폰이 후방으로 이동할 수 없다
```

### 비즈니스 용어 vs 기술 용어

#### 비즈니스 용어 우선
```kotlin
// 비즈니스 용어 사용
test("체크메이트가 되면 게임이 종료된다") {
    // 체스 플레이어가 이해할 수 있는 용어
}

// 기술 용어 사용
test("GameState.CHECKMATE가 반환되면 isGameOver()가 true를 반환한다") {
    // 구현 세부사항에 집중
}
```

#### 도메인 전문가와의 소통
```kotlin
// 도메인 전문가(체스 플레이어)와 소통 가능
test("킹사이드 캐슬링을 할 수 있다") {
    // 체스 용어 그대로 사용
}

test("퀸사이드 캐슬링을 할 수 있다") {
    // 전문 용어의 정확한 사용
}
```

### 테스트 네이밍 패턴

#### Given-When-Then 패턴을 네이밍에 반영
```kotlin
// 패턴: [상황]에서 [행동]을 하면 [결과]가 나온다
test("체크 상태에서 킹을 지키는 수를 두면 체크가 해제된다") {
    // Given: 체크 상태
    // When: 킹을 지키는 수
    // Then: 체크 해제
}

test("스테일메이트 상황에서는 무승부가 된다") {
    // Given: 스테일메이트 상황
    // When: (암시적)
    // Then: 무승부
}
```

#### 부정적 케이스의 명확한 표현
```kotlin
// 무엇이 불가능한지 명확히 표현
test("폰이 후방으로 이동할 수 없다") {
    val pawn = Pawn(Color.WHITE)
    pawn.isValidMove(Position('e', 4), Position('e', 3)) shouldBe false
}

test("킹이 체크 상태에 빠지는 이동을 할 수 없다") {
    // 체스의 핵심 규칙을 명확히 표현
}
```

## 3.3 테스트 구조화

### Given-When-Then 패턴

#### 명시적 Given-When-Then
```kotlin
test("폰이 전방으로 1칸 이동할 수 있다") {
    // Given: 폰과 시작/목표 위치
    val pawn = Pawn(Color.WHITE)
    val from = Position('e', 2)
    val to = Position('e', 3)
    
    // When: 이동 유효성 검사
    val isValid = pawn.isValidMove(from, to)
    
    // Then: 유효한 이동으로 판정
    isValid shouldBe true
}
```

#### 암시적 Given-When-Then (Kotlin 스타일)
```kotlin
test("폰이 전방으로 1칸 이동할 수 있다") {
    // 간결하지만 의도가 명확
    Pawn(Color.WHITE).isValidMove(
        Position('e', 2), 
        Position('e', 3)
    ) shouldBe true
}
```

### Context와 테스트 그룹화

#### 논리적 그룹화
```kotlin
context("폰의 기본 이동") {
    test("전방으로 1칸 이동할 수 있다")
    test("초기 위치에서 2칸 이동할 수 있다")
    test("대각선으로 빈 칸에 이동할 수 없다")
}

context("폰의 공격") {
    test("대각선으로 적 기물을 잡을 수 있다")
    test("같은 편 기물을 잡을 수 없다")
    test("앙파상으로 적 폰을 잡을 수 있다")
}

context("폰의 승급") {
    test("8행에 도달하면 퀸으로 승급할 수 있다")
    test("8행에 도달하면 다른 기물로도 승급할 수 있다")
}
```

#### 상태별 그룹화
```kotlin
context("게임 초기 상태") {
    test("백색이 먼저 시작한다")
    test("모든 기물이 올바른 위치에 있다")
}

context("게임 진행 중") {
    test("턴이 올바르게 교대된다")
    test("체크 상태를 감지한다")
}

context("게임 종료") {
    test("체크메이트 시 게임이 종료된다")
    test("스테일메이트 시 무승부가 된다")
}
```

### 테스트 간 독립성 보장

#### 각 테스트가 독립적으로 실행 가능
```kotlin
class GameTest : FunSpec({
    context("게임 상태 테스트") {
        test("테스트 1") {
            // 새로운 Game 인스턴스 생성
            val game = Game.initialize()
            // ... 테스트 로직
        }
        
        test("테스트 2") {
            // 이전 테스트와 완전히 독립적
            val game = Game.initialize()
            // ... 테스트 로직
        }
    }
})
```

#### 공유 상태 사용 시 주의사항
```kotlin
// 나쁜 예: 공유 상태로 인한 의존성
class BadGameTest : FunSpec({
    private lateinit var game: Game  // 공유 상태
    
    beforeEach {
        game = Game.initialize()
    }
    
    test("첫 번째 테스트") {
        game = game.makeMove(Move.parse("e2e4"))  // 상태 변경!
    }
    
    test("두 번째 테스트") {
        // 이전 테스트의 영향을 받음!
        game.getCurrentPlayer() shouldBe Color.WHITE  // 실패할 수 있음
    }
})

// 좋은 예: 각 테스트가 독립적
class GoodGameTest : FunSpec({
    test("첫 번째 테스트") {
        val game = Game.initialize()
        val newGame = game.makeMove(Move.parse("e2e4"))
        // 원본 game은 변경되지 않음 (불변성)
    }
    
    test("두 번째 테스트") {
        val game = Game.initialize()
        // 항상 같은 초기 상태로 시작
        game.getCurrentPlayer() shouldBe Color.WHITE
    }
})
```

## 3.4 테스트 데이터 관리

### 테스트 픽스처(Test Fixture) 설계

#### Builder 패턴 활용
```kotlin
// 테스트용 빌더 클래스
class GameBuilder {
    private var board: Board = Board.initialize()
    private var currentPlayer: Color = Color.WHITE
    
    fun withCustomBoard(setup: (MutableMap<Position, Piece>) -> Unit): GameBuilder {
        val squares = board.getSquares().toMutableMap()
        squares.clear()
        setup(squares)
        this.board = Board(squares.toMap())
        return this
    }
    
    fun withCurrentPlayer(player: Color): GameBuilder {
        this.currentPlayer = player
        return this
    }
    
    fun build(): Game = Game(board, currentPlayer)
}

// 테스트에서 사용
test("체크메이트 상황을 감지한다") {
    val game = GameBuilder()
        .withCustomBoard { squares ->
            squares[Position('a', 8)] = King(Color.BLACK)
            squares[Position('a', 7)] = Rook(Color.WHITE)
            squares[Position('b', 7)] = King(Color.WHITE)
        }
        .withCurrentPlayer(Color.BLACK)
        .build()
    
    game.getGameState() shouldBe GameState.CHECKMATE
}
```

#### Factory 메서드 패턴
```kotlin
object TestPositions {
    val BOARD_CENTER = Position('d', 4)
    val WHITE_KING_START = Position('e', 1)
    val BLACK_KING_START = Position('e', 8)
    val WHITE_QUEEN_START = Position('d', 1)
    val BLACK_QUEEN_START = Position('d', 8)
}

object TestGames {
    fun checkmate(): Game = GameBuilder()
        .withCustomBoard { squares ->
            // 체크메이트 상황 설정
        }
        .build()
    
    fun stalemate(): Game = GameBuilder()
        .withCustomBoard { squares ->
            // 스테일메이트 상황 설정
        }
        .build()
}
```

### 경계값 데이터 체계화

```kotlin
object BoundaryValues {
    // 체스판 경계값들
    val MIN_FILE = 'a'
    val MAX_FILE = 'h'
    val MIN_RANK = 1
    val MAX_RANK = 8
    
    // 경계 밖 값들
    val INVALID_FILES = listOf('`', 'i', 'z', '@')
    val INVALID_RANKS = listOf(0, 9, -1, 10)
    
    // 경계값 조합
    val CORNER_POSITIONS = listOf(
        Position(MIN_FILE, MIN_RANK),  // a1
        Position(MIN_FILE, MAX_RANK),  // a8
        Position(MAX_FILE, MIN_RANK),  // h1
        Position(MAX_FILE, MAX_RANK)   // h8
    )
}

test("경계값에서 Position이 올바르게 동작한다") {
    BoundaryValues.CORNER_POSITIONS.forEach { position ->
        shouldNotThrow<Exception> {
            Position(position.file, position.rank)
        }
    }
    
    BoundaryValues.INVALID_FILES.forEach { file ->
        shouldThrow<IllegalArgumentException> {
            Position(file, 4)
        }
    }
    
    BoundaryValues.INVALID_RANKS.forEach { rank ->
        shouldThrow<IllegalArgumentException> {
            Position('e', rank)
        }
    }
}
```

## 3.5 테스트 대역(Test Double) 활용

### Mock vs Stub vs Fake

체스 엔진에서는 대부분 **실제 객체**를 사용하지만, 일부 상황에서는 테스트 대역이 유용한다:

#### Stub: 미리 정의된 응답
```kotlin
// 게임 로그 기능을 테스트할 때
class StubGameLogger : GameLogger {
    val logs = mutableListOf<String>()
    
    override fun log(message: String) {
        logs.add(message)
    }
}

test("게임 이동이 로그에 기록된다") {
    val logger = StubGameLogger()
    val game = Game.initialize(logger)
    
    game.makeMove(Move.parse("e2e4"))
    
    logger.logs shouldContain "White moves pawn from e2 to e4"
}
```

#### Mock: 호출 검증
```kotlin
// 외부 시스템 연동을 테스트할 때
test("게임 종료 시 결과가 서버에 전송된다") {
    val mockServer = mockk<GameServer>()
    every { mockServer.submitResult(any()) } returns true
    
    val game = Game.initialize(mockServer)
    val finishedGame = simulateCheckmate(game)
    
    verify { mockServer.submitResult(any()) }
}
```

#### Fake: 단순한 구현
```kotlin
// 인메모리 데이터베이스로 테스트
class FakeGameRepository : GameRepository {
    private val games = mutableMapOf<String, Game>()
    
    override fun save(id: String, game: Game) {
        games[id] = game
    }
    
    override fun load(id: String): Game? = games[id]
}
```

### 테스트 대역을 최소화하는 설계

체스 엔진에서 테스트 대역이 거의 불필요한 이유:

#### 1. 불변성(Immutability)
```kotlin
// 원본을 수정하지 않으므로 Mock 불필요
val game = Game.initialize()
val newGame = game.makeMove(Move.parse("e2e4"))

// game은 여전히 초기 상태
// newGame은 이동이 적용된 새로운 상태
```

#### 2. 부작용 없는 설계(Side-Effect Free)
```kotlin
// 외부 시스템과 상호작용하지 않음
val isValid = pawn.isValidMove(from, to)  // 순수 함수
val gameState = game.getGameState()       // 부작용 없음
```

#### 3. 의존성 최소화
```kotlin
// Position은 다른 클래스에 의존하지 않음
class Position(val file: Char, val rank: Int) {
    // 외부 의존성 없음
}

// Piece는 Position에만 의존
abstract class Piece {
    abstract fun isValidMove(from: Position, to: Position): Boolean
}
```

## 3.6 테스트의 문서화 역할

### 실행 가능한 명세서(Executable Specification)

테스트는 **살아있는 문서**이다:

```kotlin
// 이 테스트들이 체스 규칙을 완전히 문서화함
context("폰의 이동 규칙") {
    test("전방으로 1칸 이동할 수 있다") {
        // 기본 규칙 명시
    }
    
    test("초기 위치에서만 2칸 이동할 수 있다") {
        // 특별 규칙 명시
    }
    
    test("대각선으로는 적 기물이 있을 때만 이동 가능하다") {
        // 공격 규칙 명시
    }
    
    test("앙파상으로 적 폰을 잡을 수 있다") {
        // 특수 규칙 명시
    }
}
```

### API 사용법 가이드

```kotlin
// 이 테스트가 Move 클래스 사용법을 보여줌
test("다양한 표기법으로 이동을 생성할 수 있다") {
    // 기본 이동
    val pawnMove = Move.parse("e2e4")
    
    // 캐슬링
    val kingsideCastling = Move.parseCastling("O-O")
    val queensideCastling = Move.parseCastling("O-O-O")
    
    // 승급
    val promotion = Move.parse("e7e8Q")
    
    // 모든 표기법이 올바르게 파싱됨을 보여줌
}
```

### 비즈니스 규칙의 추적성

```kotlin
// 요구사항 추적 가능
test("킹이 체크 상태에 있으면 킹을 지키는 수만 둘 수 있다") {
    // 요구사항 ID: CHESS-RULE-001
    // 체크 상태의 킹은 반드시 보호되어야 함
}

test("앙파상은 상대방 폰이 2칸 전진한 직후에만 가능하다") {
    // 요구사항 ID: CHESS-RULE-042
    // 앙파상의 타이밍 제약 조건
}
```

## 3.7 테스트 코드의 품질 관리

### 테스트 코드도 프로덕션 코드

테스트 코드 역시 다음 원칙을 따라야 한다:

#### DRY (Don't Repeat Yourself)
```kotlin
// 중복된 테스트 설정
class PawnTest : FunSpec({
    test("백색 폰 이동 테스트 1") {
        val pawn = Pawn(Color.WHITE)
        val board = Board.initialize()
        // ... 테스트 로직
    }
    
    test("백색 폰 이동 테스트 2") {
        val pawn = Pawn(Color.WHITE)  // 중복!
        val board = Board.initialize()  // 중복!
        // ... 테스트 로직
    }
})

// 공통 설정 추출
class PawnTest : FunSpec({
    fun createWhitePawn() = Pawn(Color.WHITE)
    fun createInitialBoard() = Board.initialize()
    
    test("백색 폰 이동 테스트 1") {
        val pawn = createWhitePawn()
        val board = createInitialBoard()
        // ... 테스트 로직
    }
})
```

#### 가독성 우선
```kotlin
// 의도가 명확한 헬퍼 메서드
fun createCheckmateScenario(): Game {
    return GameBuilder()
        .withCustomBoard { squares ->
            squares[Position('a', 8)] = King(Color.BLACK)
            squares[Position('a', 7)] = Rook(Color.WHITE)
            squares[Position('b', 7)] = King(Color.WHITE)
        }
        .withCurrentPlayer(Color.BLACK)
        .build()
}

test("체크메이트 상황에서 게임이 종료된다") {
    val game = createCheckmateScenario()  // 의도가 명확
    game.getGameState() shouldBe GameState.CHECKMATE
}
```

### 테스트 코드 리뷰 체크리스트

1. **명확성**: 테스트의 의도가 명확한가?
2. **독립성**: 다른 테스트에 의존하지 않는가?
3. **반복가능성**: 실행할 때마다 같은 결과가 나오는가?
4. **빠른 실행**: 합리적인 시간 내에 실행되는가?
5. **자체 검증**: 테스트 결과가 자동으로 판정되는가?

## 결론: 테스트 설계는 소프트웨어 설계

> "Test design is software design. Bad tests are bad software." — Michael Feathers

Michael Feathers의 말처럼, **"테스트 설계는 소프트웨어 설계"**이다. 좋은 테스트는:

1. **단일 책임**을 가지고
2. **명확한 의도**를 표현하며
3. **독립적으로** 실행되고
4. **문서 역할**을 수행하며
5. **지속 가능한** 코드 품질을 제공한다

체스 엔진 프로젝트를 진행하면서 작성된 테스트는 이런 원칙들을 실제로 적용한 결과이다. 각 테스트가 하나의 명확한 개념을 검증하고, 전체적으로는 체스 규칙이라는 복잡한 도메인을 완전히 문서화하고 있다.

다음 장에서는 이런 테스트 설계 원칙이 **객체지향 설계**와 어떻게 조화를 이루는지 살펴볼 것이다.