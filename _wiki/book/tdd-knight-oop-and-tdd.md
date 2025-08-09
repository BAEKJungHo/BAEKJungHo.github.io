---
layout  : wiki
title   : Chapter4 - Driving OOP design with TDD
summary : 
date    : 2025-08-07 10:08:32 +0900
updated : 2025-08-07 10:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tddknight]]
latex   : true
---
* TOC
{:toc}

# Chapter 4: Driving OOP design with TDD

> "Objects are not just bundles of data and functions. They are models of concepts in your domain." - Eric Evans

## 4.1 도메인 모델링: 체스 기물 계층구조

### 추상화의 발견 과정

TDD에서 **추상화(Abstraction)**는 테스트가 요구할 때 자연스럽게 등장한다. 체스 기물 계층구조는 이를 보여주는 완벽한 사례이다.

#### 초기 문제 상황: 중복된 테스트 패턴
```kotlin
// 각 기물마다 반복되는 유사한 테스트들
test("폰이 유효한 이동을 할 수 있다") {
    val pawn = Pawn(Color.WHITE)
    val result = pawn.isValidMove(Position('e', 2), Position('e', 3))
    result shouldBe true
}

test("룩이 유효한 이동을 할 수 있다") {
    val rook = Rook(Color.WHITE)
    val result = rook.isValidMove(Position('a', 1), Position('a', 8))
    result shouldBe true
}

test("비숍이 유효한 이동을 할 수 있다") {
    val bishop = Bishop(Color.WHITE)
    val result = bishop.isValidMove(Position('c', 1), Position('f', 4))
    result shouldBe true
}
```

이 테스트들은 **공통 패턴**을 보여줍니다:
1. 기물 생성
2. 이동 유효성 검증
3. 결과 확인

### TDD가 요구하는 설계: Piece 인터페이스

Kent Beck의 **"Immediate feedback for interface design decisions"** 원칙에 따라, 테스트가 공통 인터페이스의 필요성을 알려줍니다:

```kotlin
// 테스트가 요구하는 공통 추상화
interface Piece {
    fun isValidMove(from: Position, to: Position): Boolean
    fun getColor(): Color
    fun getType(): PieceType
}

// 이제 다형성을 활용한 테스트가 가능
test("모든 기물이 공통 인터페이스를 구현한다") {
    val pieces = listOf(
        Pawn(Color.WHITE),
        Rook(Color.WHITE),
        Knight(Color.WHITE),
        Bishop(Color.WHITE),
        Queen(Color.WHITE),
        King(Color.WHITE)
    )
    
    pieces.forEach { piece ->
        // 모든 기물이 동일한 계약을 준수
        piece.getColor() shouldBe Color.WHITE
        piece.getType() shouldNotBe null
        
        // 기본적인 이동 인터페이스 존재 확인
        shouldNotThrow<Exception> {
            piece.isValidMove(Position('e', 4), Position('e', 5))
        }
    }
}
```

### ABSTRACTION과 DDD의 만남

#### 도메인 전문가 언어의 코드화
```kotlin
// 체스 플레이어: "나이트는 L자로 움직인다"
// 개발자: 이를 어떻게 코드로 표현할 것인가?

test("나이트는 L자 형태로 이동할 수 있다") {
    val knight = Knight(Color.WHITE)
    val startPosition = Position('b', 1)
    
    // L자 이동 패턴: 2+1 또는 1+2 조합
    val validMoves = listOf(
        Position('d', 2),  // 2칸 오른쪽, 1칸 위
        Position('c', 3),  // 1칸 오른쪽, 2칸 위
        Position('a', 3)   // 1칸 왼쪽, 2칸 위
    )
    
    validMoves.forEach { targetPosition ->
        knight.isValidMove(startPosition, targetPosition) shouldBe true
    }
}
```

이 테스트는 **도메인 지식**을 **실행 가능한 명세**로 변환한다.

#### 유비쿼터스 언어(Ubiquitous Language) 구현
```kotlin
enum class PieceType(val displayName: String, val symbol: Char) {
    PAWN("폰", '♙'),
    ROOK("룩", '♖'),
    KNIGHT("나이트", '♘'),
    BISHOP("비숍", '♗'),
    QUEEN("퀸", '♕'),
    KING("킹", '♔')
}

// 도메인 언어가 코드에 직접 반영됨
abstract class Piece(
    protected val color: Color,
    protected val type: PieceType
) {
    abstract fun isValidMove(from: Position, to: Position): Boolean
    
    fun getColor(): Color = color
    fun getType(): PieceType = type
    
    // 도메인 전문가와 개발자가 같은 언어 사용
    override fun toString(): String = "${color.name} ${type.displayName}"
}
```

## 4.2 다형성과 테스트 전략

### 상속 vs 컴포지션 결정 과정

TDD는 **어떤 설계 패턴을 사용할지** 결정하는 데도 도움을 준다.

#### 상속 기반 접근법 (선택된 방법)
```kotlin
test("각 기물이 고유한 이동 규칙을 갖는다") {
    val pieces = mapOf(
        Pawn(Color.WHITE) to listOf(
            Position('e', 2) to Position('e', 3),  // 1칸 전진
            Position('e', 2) to Position('e', 4)   // 초기 2칸 전진
        ),
        Rook(Color.WHITE) to listOf(
            Position('a', 1) to Position('a', 8),  // 세로 이동
            Position('a', 1) to Position('h', 1)   // 가로 이동
        ),
        Bishop(Color.WHITE) to listOf(
            Position('c', 1) to Position('f', 4),  // 대각선 이동
            Position('c', 1) to Position('a', 3)   // 반대 대각선
        )
    )
    
    pieces.forEach { (piece, moves) ->
        moves.forEach { (from, to) ->
            piece.isValidMove(from, to) shouldBe true
        }
    }
}
```

이 테스트는 **상속 구조**의 필요성을 보여준다. 각 기물이 `Piece`를 상속하되, 고유한 이동 로직을 구현해야 한다.

#### 컴포지션 기반 접근법 (고려했지만 선택하지 않은 방법)
```kotlin
// 만약 컴포지션을 선택했다면
class Piece(
    private val color: Color,
    private val type: PieceType,
    private val movementStrategy: MovementStrategy  // 컴포지션
) {
    fun isValidMove(from: Position, to: Position): Boolean =
        movementStrategy.isValid(from, to, color)
}

interface MovementStrategy {
    fun isValid(from: Position, to: Position, color: Color): Boolean
}

class PawnMovementStrategy : MovementStrategy { /* ... */ }
class RookMovementStrategy : MovementStrategy { /* ... */ }
```

**TDD가 상속을 선택한 이유:**
1. **테스트 단순성**: 각 기물을 독립적으로 테스트하기 쉬움
2. **도메인 모델 일치**: 체스에서 각 기물은 본질적으로 다른 개체
3. **확장성**: 새로운 기물 추가 시 기존 코드 변경 불필요

### isValidMove 메서드의 진화 과정

#### 1단계: 가장 간단한 구현 (RED → GREEN)
```kotlin
test("폰이 전방으로 1칸 이동할 수 있다") {
    val pawn = Pawn(Color.WHITE)
    pawn.isValidMove(Position('e', 2), Position('e', 3)) shouldBe true
}

// 최소 구현
class Pawn(color: Color) : Piece(color, PieceType.PAWN) {
    override fun isValidMove(from: Position, to: Position): Boolean = true  // 모든 이동 허용
}
```

#### 2단계: 거짓 양성 방지 (추가 테스트)
```kotlin
test("폰이 후방으로 이동할 수 없다") {
    val pawn = Pawn(Color.WHITE)
    pawn.isValidMove(Position('e', 3), Position('e', 2)) shouldBe false
}

test("폰이 옆으로 이동할 수 없다") {
    val pawn = Pawn(Color.WHITE)
    pawn.isValidMove(Position('e', 2), Position('f', 2)) shouldBe false
}

// 구현 진화
class Pawn(color: Color) : Piece(color, PieceType.PAWN) {
    override fun isValidMove(from: Position, to: Position): Boolean {
        val direction = if (color == Color.WHITE) 1 else -1
        val rankDiff = to.rank - from.rank
        val fileDiff = kotlin.math.abs(to.file.code - from.file.code)
        
        return when {
            fileDiff == 0 && rankDiff == direction -> true  // 1칸 전진
            fileDiff == 0 && rankDiff == 2 * direction && 
                isAtStartingPosition(from) -> true  // 초기 2칸 전진
            else -> false
        }
    }
}
```

#### 3단계: 복잡한 규칙 추가 (REFACTOR)
```kotlin
test("폰이 대각선으로 적 기물을 잡을 수 있다") {
    // 이 테스트는 Board 컨텍스트가 필요함을 시사
    val board = BoardBuilder()
        .withPiece(Position('e', 2), Pawn(Color.WHITE))
        .withPiece(Position('f', 3), Pawn(Color.BLACK))
        .build()
    
    val game = Game(board)
    val move = Move.parse("e2f3")  // 대각선 공격
    
    shouldNotThrow<Exception> { game.makeMove(move) }
}
```

이 테스트가 **Board와 Game의 필요성**을 알려준다. 단순한 위치 이동이 아닌, **컨텍스트가 있는 이동**이 필요한다.

## 4.3 캡슐화와 테스트 용이성

### 정보 은닉과 테스트의 균형

체스 엔진에서 **캡슐화(Encapsulation)**와 **테스트 용이성(Testability)** 사이의 균형을 찾는 과정:

#### Private 메서드의 테스트 전략

```kotlin
class Pawn(color: Color) : Piece(color, PieceType.PAWN) {
    override fun isValidMove(from: Position, to: Position): Boolean {
        return when {
            isSimpleForwardMove(from, to) -> true
            isDoubleForwardMove(from, to) -> true
            isDiagonalCapture(from, to) -> true  // Board 컨텍스트 필요
            else -> false
        }
    }
    
    // Private 메서드들 - 직접 테스트하지 않음
    private fun isSimpleForwardMove(from: Position, to: Position): Boolean { /* ... */ }
    private fun isDoubleForwardMove(from: Position, to: Position): Boolean { /* ... */ }
    private fun isDiagonalCapture(from: Position, to: Position): Boolean { /* ... */ }
}
```

**TDD 원칙: 외부 행동만 테스트**
```kotlin
// ✅ 좋은 테스트: 외부 행동 검증
test("폰의 모든 유효한 이동 패턴을 검증한다") {
    val pawn = Pawn(Color.WHITE)
    
    // 각 private 메서드의 결과가 여기서 간접적으로 테스트됨
    pawn.isValidMove(Position('e', 2), Position('e', 3)) shouldBe true  // isSimpleForwardMove
    pawn.isValidMove(Position('e', 2), Position('e', 4)) shouldBe true  // isDoubleForwardMove
    pawn.isValidMove(Position('e', 5), Position('f', 6)) shouldBe false // isDiagonalCapture (Board 없이는 false)
}

// ❌ 나쁜 테스트: 내부 구현 테스트
test("isSimpleForwardMove 메서드가 올바르게 동작한다") {
    // Private 메서드에 직접 접근 - 캡슐화 위반
}
```

### 테스트를 위한 설계 vs 설계를 위한 테스트

#### 적절한 가시성(Visibility) 결정

```kotlin
class Game(
    private val board: Board,
    private val currentPlayer: Color = Color.WHITE,
    private val gameState: GameState = GameState.IN_PROGRESS
) {
    // Public: 외부에서 사용해야 하는 핵심 행동
    fun makeMove(move: Move): Game { /* ... */ }
    fun getGameState(): GameState = gameState
    fun getCurrentPlayer(): Color = currentPlayer
    
    // Internal: 테스트에서만 접근 (같은 패키지)
    internal fun getBoard(): Board = board
    
    // Private: 내부 구현 세부사항
    private fun isValidMove(move: Move): Boolean { /* ... */ }
    private fun applyMove(move: Move): Board { /* ... */ }
    private fun switchPlayer(): Color { /* ... */ }
}
```

#### 테스트를 위한 생성자 오버로딩

```kotlin
class Game {
    // 프로덕션 코드용: 기본 초기화
    constructor() : this(Board.initialize())
    
    // 테스트용: 커스텀 상태 주입
    internal constructor(
        board: Board,
        currentPlayer: Color = Color.WHITE,
        gameState: GameState = GameState.IN_PROGRESS
    ) {
        this.board = board
        this.currentPlayer = currentPlayer
        this.gameState = gameState
    }
}

// 테스트에서 활용
test("체크메이트 상황에서 게임이 종료된다") {
    val checkmateBoard = BoardBuilder()
        .withKingInCheckmate(Color.BLACK)
        .build()
    
    val game = Game(checkmateBoard, Color.BLACK)  // 테스트용 생성자
    game.getGameState() shouldBe GameState.CHECKMATE
}
```

## 4.4 SOLID 원칙과 TDD의 자연스러운 조화

### Single Responsibility Principle (SRP)

TDD는 자연스럽게 **단일 책임**을 유도합니다:

```kotlin
// 각 클래스가 하나의 명확한 책임을 가짐
class Position(val file: Char, val rank: Int) {
    // 책임: 체스판 좌표 표현 및 검증
}

class Pawn(color: Color) : Piece(color, PieceType.PAWN) {
    // 책임: 폰의 이동 규칙 구현
}

class Board(private val squares: Map<Position, Piece>) {
    // 책임: 체스판 상태 관리
}

class Game(private val board: Board, private val currentPlayer: Color) {
    // 책임: 게임 진행 로직
}
```

각 테스트 클래스도 하나의 클래스만 검증:
```kotlin
class PositionTest { /* Position만 테스트 */ }
class PawnTest { /* Pawn만 테스트 */ }
class BoardTest { /* Board만 테스트 */ }
class GameTest { /* Game만 테스트 */ }
```

### Open/Closed Principle (OCP)

새로운 기물 추가 시 기존 코드 수정 없이 확장 가능:

```kotlin
// 기존 인터페이스는 변경하지 않음
interface Piece {
    fun isValidMove(from: Position, to: Position): Boolean
    fun getColor(): Color
    fun getType(): PieceType
}

// 새로운 기물 추가 (예: 체스 변형 게임의 특수 기물)
class Archbishop(color: Color) : Piece(color, PieceType.ARCHBISHOP) {
    override fun isValidMove(from: Position, to: Position): Boolean {
        // 비숍 + 나이트 이동 조합
        return BishopMovement.isValid(from, to) || KnightMovement.isValid(from, to)
    }
}

// 새로운 테스트 추가
class ArchbishopTest : FunSpec({
    test("대주교는 비숍처럼 대각선으로 이동할 수 있다") { /* ... */ }
    test("대주교는 나이트처럼 L자로 이동할 수 있다") { /* ... */ }
})
```

### Liskov Substitution Principle (LSP)

모든 `Piece` 구현체가 동일한 계약 준수:

```kotlin
test("모든 기물이 Piece 계약을 올바르게 구현한다") {
    val pieces: List<Piece> = listOf(
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
        
        // isValidMove는 예외를 던지지 않아야 함
        shouldNotThrow<Exception> {
            piece.isValidMove(Position('e', 4), Position('e', 5))
        }
        
        // 같은 위치로의 이동은 항상 false (체스 규칙)
        piece.isValidMove(Position('e', 4), Position('e', 4)) shouldBe false
    }
}
```

### Interface Segregation Principle (ISP)

클라이언트가 사용하지 않는 인터페이스에 의존하지 않음:

```kotlin
// 단순하고 집중된 인터페이스
interface Piece {
    fun isValidMove(from: Position, to: Position): Boolean
    fun getColor(): Color
    fun getType(): PieceType
}

// 추가 기능이 필요한 경우 별도 인터페이스
interface SpecialMovePiece {
    fun hasSpecialMoveAvailable(board: Board): Boolean
}

// 필요한 기물만 구현
class King(color: Color) : Piece, SpecialMovePiece {
    override fun hasSpecialMoveAvailable(board: Board): Boolean = canCastle(board)
    private fun canCastle(board: Board): Boolean { /* 캐슬링 가능 여부 */ }
}

class Pawn(color: Color) : Piece {
    // SpecialMovePiece 구현하지 않음 - 필요 없으므로
}
```

### Dependency Inversion Principle (DIP)

고수준 모듈이 저수준 모듈에 의존하지 않음:

```kotlin
// 고수준: Game 클래스
class Game(private val board: Board) {  // 구체 클래스에 의존 (간단한 경우)
    fun makeMove(move: Move): Game {
        val newBoard = board.applyMove(move)  // Board의 추상화된 인터페이스 사용
        return Game(newBoard)
    }
}

// 복잡한 경우: 인터페이스 도입
interface GameBoard {
    fun applyMove(move: Move): GameBoard
    fun getPiece(position: Position): Piece?
}

class Game(private val board: GameBoard) {  // 추상화에 의존
    // 구현 세부사항에 의존하지 않음
}
```

## 4.5 도메인 주도 설계(DDD)와 TDD

### Value Object 패턴의 자연스러운 등장

```kotlin
// Position이 Value Object로 설계된 이유를 테스트가 보여줌
test("같은 좌표를 가진 Position은 동등하다") {
    val pos1 = Position('e', 4)
    val pos2 = Position('e', 4)
    
    pos1 shouldBe pos2  // 값 기반 동등성
    pos1.hashCode() shouldBe pos2.hashCode()  // 해시코드 일관성
}

test("Position은 불변 객체이다") {
    val position = Position('e', 4)
    
    // 상태 변경 메서드가 없음을 확인
    // position.file = 'f'  // 컴파일 오류!
    
    // 새로운 인스턴스 생성만 가능
    val newPosition = Position('f', 4)
    position shouldNotBe newPosition
}
```

### Entity vs Value Object 구분

```kotlin
// Game은 Entity - 상태가 변할 수 있고, 식별자가 있음
test("Game 인스턴스는 상태가 변해도 동일한 게임이다") {
    var game = Game.initialize()
    val gameId = game.getId()  // 식별자
    
    game = game.makeMove(Move.parse("e2e4"))
    game = game.makeMove(Move.parse("e7e5"))
    
    // 상태는 변했지만 여전히 같은 게임
    game.getId() shouldBe gameId
}

// Position은 Value Object - 값 자체가 정체성
test("Position은 값 자체가 정체성이다") {
    val pos1 = Position('e', 4)
    val pos2 = Position('e', 4)
    
    // 별도의 식별자 없이 값으로만 구분
    pos1 shouldBe pos2
}
```

### 도메인 서비스의 등장

복잡한 비즈니스 로직이 테스트를 통해 서비스로 추출됨:

```kotlin
// 처음에는 Game 클래스 내부 메서드
class Game {
    private fun isInCheckmate(color: Color): Boolean { /* 복잡한 로직 */ }
}

// 테스트가 복잡해지면서 별도 서비스 필요성 대두
test("복잡한 체크메이트 시나리오들") {
    // 수십 개의 체크메이트 패턴 테스트
    // Game 클래스가 너무 비대해짐
}

// 도메인 서비스로 추출
class CheckmateService {
    fun isCheckmate(board: Board, kingColor: Color): Boolean { /* ... */ }
    fun isStalemate(board: Board, playerColor: Color): Boolean { /* ... */ }
}

// 명확하고 집중된 테스트
class CheckmateServiceTest : FunSpec({
    test("백의 킹이 체크메이트 상황을 감지한다") { /* ... */ }
    test("흑의 킹이 스테일메이트 상황을 감지한다") { /* ... */ }
})
```

## 4.6 DESIGN PATTERN과 TDD

### 팩토리 패턴의 자연스러운 등장

```kotlin
// 테스트에서 반복적인 보드 설정이 필요해짐
test("체크메이트 테스트 1") {
    val board = Board.empty()
        .placePiece(Position('a', 8), King(Color.BLACK))
        .placePiece(Position('a', 7), Rook(Color.WHITE))
        .placePiece(Position('b', 7), King(Color.WHITE))
    // 복잡한 설정...
}

test("체크메이트 테스트 2") {
    val board = Board.empty()
        .placePiece(Position('h', 8), King(Color.BLACK))
        .placePiece(Position('h', 7), Queen(Color.WHITE))
        .placePiece(Position('g', 6), King(Color.WHITE))
    // 또 다른 복잡한 설정...
}

// Builder 패턴으로 해결
class BoardBuilder {
    private val pieces = mutableMapOf<Position, Piece>()
    
    fun withKing(position: Position, color: Color): BoardBuilder {
        pieces[position] = King(color)
        return this
    }
    
    fun withQueen(position: Position, color: Color): BoardBuilder {
        pieces[position] = Queen(color)
        return this
    }
    
    fun build(): Board = Board(pieces.toMap())
}

// Factory Method로 특정 시나리오 제공
object TestBoards {
    fun createCheckmateScenario1(): Board = BoardBuilder()
        .withKing(Position('a', 8), Color.BLACK)
        .withRook(Position('a', 7), Color.WHITE)
        .withKing(Position('b', 7), Color.WHITE)
        .build()
        
    fun createCheckmateScenario2(): Board = BoardBuilder()
        .withKing(Position('h', 8), Color.BLACK)
        .withQueen(Position('h', 7), Color.WHITE)
        .withKing(Position('g', 6), Color.WHITE)
        .build()
}

// 깔끔해진 테스트
test("백 룩으로 흑 킹을 체크메이트할 수 있다") {
    val board = TestBoards.createCheckmateScenario1()
    val game = Game(board, Color.BLACK)
    
    game.getGameState() shouldBe GameState.CHECKMATE
}
```

### 전략 패턴 vs 상속 결정

TDD가 알려준 최적 선택:

```kotlin
// 전략 패턴을 고려했지만...
interface MovementStrategy {
    fun isValidMove(from: Position, to: Position, board: Board): Boolean
}

class PawnMovementStrategy : MovementStrategy { /* ... */ }
class RookMovementStrategy : MovementStrategy { /* ... */ }

// 테스트가 더 복잡해짐
test("폰 이동 전략이 올바르게 작동한다") {
    val strategy = PawnMovementStrategy()
    val piece = Piece(Color.WHITE, PieceType.PAWN, strategy)  // 복잡한 생성
    
    strategy.isValidMove(Position('e', 2), Position('e', 3), emptyBoard()) shouldBe true
}

// 상속이 더 자연스러움
test("폰이 올바르게 이동한다") {
    val pawn = Pawn(Color.WHITE)  // 간단한 생성
    
    pawn.isValidMove(Position('e', 2), Position('e', 3)) shouldBe true
}
```

**TDD가 상속을 선택한 이유:**
1. **테스트 단순성**: 각 기물을 독립적으로 테스트
2. **도메인 모델 적합성**: 기물은 본질적으로 다른 존재
3. **성능**: 런타임 전략 교체 불필요

## 결론: 테스트가 좋은 설계를 이끌어내는데 도움을 준다

이 장에서 우리는 TDD가 어떻게 훌륭한 객체지향 설계를 **자연스럽게 이끌어내는지** 경험했다.
TDD는 개발자가 스스로 "어떻게 하면 테스트하기 쉬운 코드를 만들 수 있을까?" 라는 사고 과정을 자연스럽게 경험하게 한다.
따라서, 테스트하기 쉬운 코드를 작성하려고 노력하는 과정 자체가 이러한 설계 원칙을 자연스럽게 적용하게 만든다.

### 핵심 인사이트

1. **추상화의 자연스러운 등장**: 테스트 중복이 공통 인터페이스의 필요성을 알려줌
2. **SOLID 원칙의 자동 적용**: TDD 사이클이 좋은 설계 원칙을 자연스럽게 유도
3. **패턴의 필요에 의한 등장**: 테스트가 복잡해질 때 적절한 패턴이 필요해짐
4. **도메인 중심 설계**: 테스트가 도메인 전문가의 언어를 코드로 번역

### Kent Beck의 지혜 재조명

> "TDD doesn't create design. You do."

TDD는 설계를 만들어주지 않는다. 하지만 **좋은 설계로 향하는 길을 조명**해준다. 체스 기물 계층구조는 우리가 작성한 것이 아니라, **테스트가 요구해서 발견한 것**이다.

다음 장에서는 이런 설계 원칙들이 **복잡한 비즈니스 로직**에서 어떻게 적용되는지 살펴보겠다.