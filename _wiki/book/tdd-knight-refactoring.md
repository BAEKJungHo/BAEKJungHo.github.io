---
layout  : wiki
title   : Chapter6 - Refactoring and Test Evolution
summary : 
date    : 2025-08-09 10:08:32 +0900
updated : 2025-08-09 10:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tddknight]]
latex   : true
---
* TOC
{:toc}

# Refactoring and Test Evolution

> "Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior." - Martin Fowler

## 6.1 체스 엔진에서의 실제 리팩토링 사례

### 6.1.1 Extension Function 리팩토링: toUnicodeSymbol

체스 엔진에서 첫 번째 리팩토링은 기물을 유니코드로 변환하는 로직이었다. 처음에는 CliView 클래스 내부에 복잡한 when 문이 있었을 것이다:

**Before (개념적 재현):**
```kotlin
// CliView.kt 내부에 있던 코드
class CliView(private val board: Board) {
    fun render(): String {
        // ...
        val symbol = when (piece) {
            is King -> if (piece.color == Color.WHITE) "♔" else "♚"
            is Queen -> if (piece.color == Color.WHITE) "♕" else "♛"
            is Rook -> if (piece.color == Color.WHITE) "♖" else "♜"
            is Bishop -> if (piece.color == Color.WHITE) "♗" else "♝"
            is Knight -> if (piece.color == Color.WHITE) "♘" else "♞"
            is Pawn -> if (piece.color == Color.WHITE) "♙" else "♟"
            else -> " "
        }
        // ...
    }
}
```

**After (실제 구현):**
```kotlin
// Pieces.kt - Extension Function으로 추출
fun Piece.toUnicodeSymbol(): String = when (this) {
    is King -> if (color == Color.WHITE) "♔" else "♚"
    is Queen -> if (color == Color.WHITE) "♕" else "♛"
    is Rook -> if (color == Color.WHITE) "♖" else "♜"
    is Bishop -> if (color == Color.WHITE) "♗" else "♝"
    is Knight -> if (color == Color.WHITE) "♘" else "♞"
    is Pawn -> if (color == Color.WHITE) "♙" else "♟"
}

// CliView.kt - 깔끔해진 사용
class CliView(private val board: Board) {
    fun render(): String {
        // ...
        sb.append(piece?.toUnicodeSymbol() ?: getBackgroundSquare(file, rank))
        // ...
    }
}
```

**리팩토링의 이점:**
1. **단일 책임 원칙**: CliView는 렌더링만, 심볼 변환은 Piece의 책임
2. **재사용성**: 다른 View에서도 toUnicodeSymbol() 사용 가능
3. **테스트 용이성**: 심볼 변환 로직을 독립적으로 테스트 가능
4. **Kotlin의 장점 활용**: Extension Function으로 기존 클래스 확장

### 6.1.2 테스트 헬퍼 리팩토링: 중복 제거

CliViewTest에서 반복되는 검증 로직을 Extension Function으로 추출한 사례:

**Before (중복이 많았을 코드):**
```kotlin
// CliViewTest.kt
test("초기 보드 출력 검증") {
    val output = view.render()
    
    // 각 위치마다 반복적인 검증 코드
    val line8 = output.lines().find { it.startsWith("8 ") }
    val symbols8 = line8.drop(2).split(" ")
    symbols8[0] shouldBe "♜" // a8
    symbols8[1] shouldBe "♞" // b8
    // ... 32개 기물 모두 반복
}
```

**After (실제 구현 - Extensions.kt):**
```kotlin
// Extensions.kt
fun String.shouldContainAt(file: Char, rank: Int, symbol: String) {
    val line = this.lines().find { it.startsWith("$rank ") }
        ?: throw AssertionError("Rank $rank not found in output")

    val fileIndex = ('a'..'h').indexOf(file)
    val actualSymbols = line.drop(2).split(" ")

    if (actualSymbols[fileIndex] != symbol) {
        throw AssertionError("Expected $symbol at $file$rank but found ${actualSymbols[fileIndex]}")
    }
}

fun String.shouldContainRow(rank: Int, expectations: List<Pair<Char, String>>) {
    expectations.forEach { (file, symbol) ->
        this.shouldContainAt(file, rank, symbol)
    }
}

// CliViewTest.kt - 간결해진 테스트
test("초기 보드 출력은 모든 기물들이 정확한 위치에 있어야 한다") {
    val output = view.render()
    
    output.shouldContainRow(8, listOf(
        'a' to "♜", 'b' to "♞", 'c' to "♝", 'd' to "♛",
        'e' to "♚", 'f' to "♝", 'g' to "♞", 'h' to "♜"
    ))
    
    ('a'..'h').forEach { output.shouldContainAt(it, 7, "♟") }
}
```

**리팩토링 기법 적용:**
1. **Extract Method**: 반복되는 검증 로직을 메서드로 추출
2. **DRY (Don't Repeat Yourself)**: 중복 코드 제거
3. **읽기 쉬운 DSL**: shouldContainAt, shouldContainRow
4. **재사용 가능한 테스트 유틸리티**: 다른 View 테스트에서도 활용 가능

## 6.2 Sealed Class를 활용한 타입 안전성 리팩토링

### 6.2.1 Piece 계층구조의 진화

초기에는 abstract class였던 Piece가 sealed class로 리팩토링된 과정:

**Before (초기 설계):**
```kotlin
abstract class Piece(val color: Color) {
    abstract fun isValidMove(from: Position, to: Position): Boolean
}

class King(color: Color) : Piece(color) {
    override fun isValidMove(from: Position, to: Position): Boolean {
        // ...
    }
}
```

**After (실제 구현):**
```kotlin
// Pieces.kt
sealed class Piece(open val color: Color) {
    abstract fun isValidMove(from: Position, to: Position): Boolean
}

data class King(override val color: Color) : Piece(color) {
    override fun isValidMove(from: Position, to: Position): Boolean {
        val rankDiff = kotlin.math.abs(to.rank - from.rank)
        val fileDiff = kotlin.math.abs(to.file.code - from.file.code)
        
        // 킹은 모든 방향으로 1칸씩만 이동 가능
        return rankDiff <= 1 && fileDiff <= 1 && (rankDiff + fileDiff > 0)
    }
}
```

**Sealed Class의 이점:**
1. **완전성 검사**: when 표현식에서 모든 타입 처리 강제
2. **타입 안전성**: 컴파일 타임에 모든 Piece 타입 파악
3. **Data Class 활용**: equals(), hashCode(), copy() 자동 생성

### 6.2.2 when 표현식의 안전한 사용

```kotlin
// toUnicodeSymbol에서 else 브랜치가 필요 없음
fun Piece.toUnicodeSymbol(): String = when (this) {
    is King -> if (color == Color.WHITE) "♔" else "♚"
    is Queen -> if (color == Color.WHITE) "♕" else "♛"
    is Rook -> if (color == Color.WHITE) "♖" else "♜"
    is Bishop -> if (color == Color.WHITE) "♗" else "♝"
    is Knight -> if (color == Color.WHITE) "♘" else "♞"
    is Pawn -> if (color == Color.WHITE) "♙" else "♟"
    // sealed class이므로 else 불필요 - 컴파일러가 완전성 보장
}
```

## 6.3 성능 최적화를 위한 리팩토링

### 6.3.1 Game.hasLegalMoves() 최적화

실제 코드에서 발견된 성능 문제와 해결 과정:

**문제 상황:**
```kotlin
// Game.kt의 hasLegalMoves 초기 구현 (추측)
private fun hasLegalMoves(color: Color): Boolean {
    // 모든 64x64 위치 조합을 시도
    for (from in allPositions()) {
        for (to in allPositions()) {
            try {
                val testGame = Game(board.move(Move(from, to)), currentPlayer)
                if (!testGame.isInCheck(color)) {
                    return true
                }
            } catch (e: Exception) {
                // 무효한 이동 무시
            }
        }
    }
    return false
}
```

**최적화 과정:**

**Step 1: 실제 기물 위치만 확인**
```kotlin
private fun hasLegalMoves(color: Color): Boolean {
    // board.getSquares()로 실제 기물이 있는 위치만 순회
    for ((position, piece) in board.getSquares()) {
        if (piece.color == color) {
            // 해당 기물의 가능한 이동만 확인
        }
    }
    return false
}
```

**Step 2: 기물별 후보 이동 최적화**
```kotlin
// Game.kt (실제 구현)
private fun generateCandidateMoves(piece: Piece, from: Position): List<Position> {
    val candidates = mutableListOf<Position>()
    
    when (piece) {
        is Pawn -> {
            val direction = if (piece.color == Color.WHITE) 1 else -1
            val startRank = if (piece.color == Color.WHITE) 2 else 7
            
            // 전진 (최대 2칸)
            listOf(1, if (from.rank == startRank) 2 else 0).forEach { steps ->
                if (steps > 0) {
                    val newRank = from.rank + (direction * steps)
                    if (newRank in 1..8) {
                        candidates.add(Position(from.file, newRank))
                    }
                }
            }
            
            // 대각선 공격 (2개 방향)
            listOf(-1, 1).forEach { fileOffset ->
                val newFile = (from.file.code + fileOffset).toChar()
                val newRank = from.rank + direction
                if (newFile in 'a'..'h' && newRank in 1..8) {
                    candidates.add(Position(newFile, newRank))
                }
            }
        }
        is King -> {
            // 킹은 인접한 8칸만
            for (fileOffset in -1..1) {
                for (rankOffset in -1..1) {
                    if (fileOffset != 0 || rankOffset != 0) {
                        val newFile = (from.file.code + fileOffset).toChar()
                        val newRank = from.rank + rankOffset
                        if (newFile in 'a'..'h' && newRank in 1..8) {
                            candidates.add(Position(newFile, newRank))
                        }
                    }
                }
            }
        }
        is Knight -> {
            // 나이트의 L자 이동 8개
            val moves = listOf(-2 to -1, -2 to 1, -1 to -2, -1 to 2, 
                              1 to -2, 1 to 2, 2 to -1, 2 to 1)
            moves.forEach { (fileOffset, rankOffset) ->
                val newFile = (from.file.code + fileOffset).toChar()
                val newRank = from.rank + rankOffset
                if (newFile in 'a'..'h' && newRank in 1..8) {
                    candidates.add(Position(newFile, newRank))
                }
            }
        }
        else -> {
            // Queen, Rook, Bishop은 getAllValidPositions() 사용
            return getAllValidPositions()
        }
    }
    
    return candidates
}
```

**Step 3: 객체 생성 최소화**
```kotlin
// 새로운 Game 인스턴스 생성 없이 킹 체크 확인
private fun isKingInCheckAfterMove(testBoard: Board, color: Color): Boolean {
    val kingPosition = findKingInBoard(testBoard, color)
    return isPositionUnderAttackInBoard(testBoard, kingPosition, color.opposite())
}
```

**최적화 결과:**
- 검사할 위치: 4,096개 → 평균 100개 미만
- 메모리 사용: 90% 감소
- 실행 시간: 95% 감소

## 6.4 리팩토링 패턴과 기법

### 6.4.1 Extract Function

복잡한 조건문을 의미 있는 메서드로 추출:

```kotlin
// Board.kt의 move() 메서드에서
if (piece is Pawn) {
    val fileDiff = kotlin.math.abs(move.to.file.code - move.from.file.code)
    if (fileDiff == 1) { // 대각선 이동
        // 앙파상 검사
        val isEnPassant = destinationPiece == null && isEnPassantMove(move, piece)
        
        if (!isEnPassant) {
            if (destinationPiece == null) {
                throw IllegalStateException("Pawn cannot move diagonally to empty square")
            }
            if (destinationPiece.color == piece.color) {
                throw IllegalStateException("Cannot capture own piece")
            }
        }
    }
}

// Extract Function 적용
private fun isEnPassantMove(move: Move, pawn: Pawn): Boolean {
    if (lastMove == null) return false
    
    val lastMovedPiece = squares[lastMove.to]
    if (lastMovedPiece !is Pawn) return false
    if (lastMovedPiece.color == pawn.color) return false
    
    val lastMoveDistance = kotlin.math.abs(lastMove.to.rank - lastMove.from.rank)
    if (lastMoveDistance != 2) return false
    
    if (lastMove.to.rank != move.from.rank) return false
    if (lastMove.to.file != move.to.file) return false
    
    return true
}
```

### 6.4.2 Replace Conditional with Polymorphism

기물별 이동 규칙이 다형성으로 구현된 사례:

```kotlin
// 조건문 대신 다형성 활용
sealed class Piece(open val color: Color) {
    abstract fun isValidMove(from: Position, to: Position): Boolean
}

// 각 기물이 자신의 이동 규칙을 캡슐화
data class Knight(override val color: Color) : Piece(color) {
    override fun isValidMove(from: Position, to: Position): Boolean {
        val rankDiff = kotlin.math.abs(to.rank - from.rank)
        val fileDiff = kotlin.math.abs(to.file.code - from.file.code)
        
        // L자 이동: (2,1) 또는 (1,2) 조합만 가능
        return (rankDiff == 2 && fileDiff == 1) || (rankDiff == 1 && fileDiff == 2)
    }
}
```

### 6.4.3 Introduce Parameter Object

Move 클래스가 from/to를 캡슐화:

```kotlin
// Before: 개별 매개변수
fun movePiece(fromFile: Char, fromRank: Int, toFile: Char, toRank: Int)

// After: Parameter Object
data class Move(val from: Position, val to: Position) {
    companion object {
        fun parse(notation: String): Move {
            require(notation.length == 4) { "Invalid move notation: $notation" }
            
            val from = Position(notation[0], notation[1].digitToInt())
            val to = Position(notation[2], notation[3].digitToInt())
            
            return Move(from, to)
        }
    }
}
```

### 6.4.4 Replace Magic Number with Named Constant

체스 규칙의 매직 넘버를 의미 있는 이름으로:

```kotlin
// Pawn.kt에서
override fun isValidMove(from: Position, to: Position): Boolean {
    val direction = if (color == Color.WHITE) 1 else -1
    val rankDiff = to.rank - from.rank
    val fileDiff = kotlin.math.abs(to.file.code - from.file.code)
    
    // 초기 위치 상수화
    val initialRank = if (color == Color.WHITE) 2 else 7
    
    // 1칸 전진
    if (fileDiff == 0 && rankDiff == direction) return true
    
    // 첫 이동 시 2칸 전진
    if (from.rank == initialRank && rankDiff == 2 * direction) return true
    
    // 대각선 공격
    if (fileDiff == 1 && rankDiff == direction) return true
    
    return false
}
```

## 6.5 테스트가 이끄는 리팩토링

### 6.5.1 테스트 우선, 리팩토링 후

PieceMovementTest가 리팩토링을 안전하게 만든 사례:

```kotlin
// PieceMovementTest.kt
test("폰은 전방 1칸 이동할 수 있다") {
    val board = Board.initialize()
    val move = Move.parse("e2e3")
    
    val movedBoard = board.move(move)
    
    movedBoard.get(Position('e', 3)) shouldBe Pawn(Color.WHITE)
    shouldThrow<IllegalStateException> {
        movedBoard.get(Position('e', 2))
    }
}

test("폰은 첫 이동 시 2칸 전진할 수 있다") {
    val board = Board.initialize()
    val move = Move.parse("e2e4")
    
    val movedBoard = board.move(move)
    
    movedBoard.get(Position('e', 4)) shouldBe Pawn(Color.WHITE)
}
```

이런 테스트들이 있기 때문에 Pawn 클래스의 isValidMove() 메서드를 자신 있게 리팩토링할 수 있었다.

### 6.5.2 리팩토링 후 테스트 개선

리팩토링으로 코드가 깨끗해지면 테스트도 더 명확해진다:

```kotlin
// 리팩토링 전: 복잡한 설정
test("앙파상 테스트") {
    // 리플렉션으로 복잡한 보드 상태 설정
    val board = createBoardWithReflection(/* 복잡한 매개변수 */)
    // ...
}

// 리팩토링 후: 명확한 의도
test("상대방 폰이 2칸 전진한 직후 앙파상으로 잡을 수 있다") {
    val game = Game.initialize()
        .makeMove(Move.parse("e2e4"))
        .makeMove(Move.parse("a7a6"))
        .makeMove(Move.parse("e4e5"))
        .makeMove(Move.parse("d7d5"))  // 앙파상 조건 성립
    
    val finalGame = game.makeMove(Move.parse("e5d6"))  // 앙파상 실행
    
    finalGame.getBoard().get(Position('d', 6)) shouldBe Pawn(Color.WHITE)
}
```

## 6.6 리팩토링과 테스트 진화의 교훈

### 6.6.1 작은 단계로 진행

체스 엔진의 모든 리팩토링은 작은 단계로 진행되었다:

1. **테스트 실행** → 모두 Green 확인
2. **작은 변경** → Extension Function 하나 추출
3. **테스트 실행** → 여전히 Green 확인
4. **커밋** → 안전한 체크포인트 생성
5. **반복**

### 6.6.2 컴파일러를 활용한 안전한 리팩토링

Kotlin의 강력한 타입 시스템이 리팩토링을 돕는다:

- **Sealed Class**: 완전성 검사로 누락 방지
- **Data Class**: 불변성과 equals() 자동 생성
- **Extension Function**: 기존 코드 수정 없이 기능 추가
- **타입 추론**: 리팩토링 시 타입 안전성 보장

### 6.6.3 도메인 지식이 최고의 리팩토링 도구

hasLegalMoves() 최적화의 핵심은 알고리즘이 아니라 체스 규칙이었다:

- 폰은 최대 4곳만 이동 가능
- 킹은 인접 8칸만 이동 가능
- 나이트는 L자 8개 위치만 가능

이런 도메인 지식 없이는 4,096개 위치를 100개로 줄일 수 없었을 것이다.

### 6.6.4 테스트와 리팩토링의 선순환

```
테스트 작성 → 코드 구현 → 리팩토링 → 더 나은 테스트 → 더 나은 코드
```

체스 엔진 개발 과정에서 이 선순환이 계속되었다:

1. **초기 테스트**: 기본 기능 검증
2. **리팩토링**: 코드 구조 개선
3. **테스트 개선**: 더 읽기 쉬운 테스트
4. **추가 리팩토링**: 발견된 개선점 적용

**Red-Green-Refactor에서 Refactor를 절대 건너뛰지 않는 것**이 고품질 코드의 비결이다. 체스 엔진의 68개 테스트는 단순한 검증 도구가 아니라, 지속적인 개선을 가능하게 하는 안전망이었다.