---
layout  : wiki
title   : Chapter5 - Complex business logic TDD improved
summary : 
date    : 2025-08-08 10:08:32 +0900
updated : 2025-08-08 10:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tddknight]]
latex   : true
---
* TOC
{:toc}

# Complex business logic TDD improved

> "복잡성을 다루는 가장 좋은 방법은 점진적으로 이해를 넓혀가는 것이다."

## 5.1 도메인 복잡성과의 첫 만남

체스 엔진 개발 초기, 단순한 기물 이동은 쉽게 구현할 수 있었다. 하지만 체스의 특수 규칙들을 마주하면서 진정한 도전이 시작되었다.

### 5.1.1 앙파상(En Passant): 숨겨진 복잡성의 발견

앙파상은 체스에서 가장 이해하기 어려운 규칙 중 하나다. "상대방 폰이 2칸 전진한 직후에만 대각선으로 빈 칸에 이동하면서 지나친 폰을 잡을 수 있다"는 이 규칙은 여러 조건이 복합적으로 얽혀 있다.

**첫 번째 시도: 순진한 접근**

```kotlin
// SpecialRulesTest.kt
test("폰이 대각선으로 이동할 수 있다") {
    val pawn = Pawn(Color.WHITE)
    pawn.isValidMove(Position('e', 5), Position('d', 6)) shouldBe true
}
```

이 테스트는 통과했지만, 실제로는 앙파상이 아닌 일반적인 대각선 공격을 구현하게 되었다. **도메인을 제대로 이해하지 못한 채 테스트를 작성하면 잘못된 구현으로 이어진다는 교훈을 얻었다.**

**두 번째 시도: 도메인 이해 후 정확한 테스트**

앙파상 규칙을 정확히 이해한 후, 실제 시나리오를 재현하는 테스트를 작성했다:

```kotlin
// SpecialRulesTest.kt (실제 코드)
test("상대방 폰이 2칸 전진한 직후 앙파상으로 잡을 수 있다") {
    val board = Board.initialize()
    
    // 백색 폰을 5행까지 이동
    val board1 = board.move(Move.parse("e2e4"))
    val board2 = board1.move(Move.parse("a7a6")) // 흑색 다른 수
    val board3 = board2.move(Move.parse("e4e5"))
    
    // 흑색 폰이 2칸 전진하여 백색 폰 옆에 위치
    val board4 = board3.move(Move.parse("d7d5"))
    
    // 백색 폰이 앙파상으로 흑색 폰 잡기
    val finalBoard = board4.move(Move.parse("e5d6"))
    
    // 검증: 흑색 폰이 제거되고 백색 폰이 d6에 위치
    finalBoard.get(Position('d', 6)) shouldBe Pawn(Color.WHITE)
    shouldThrow<IllegalStateException> {
        finalBoard.get(Position('d', 5)) // 잡힌 흑색 폰
    }
}
```

**이 테스트가 보여주는 TDD의 가치:**
1. **시나리오 기반 테스트**: 실제 게임 상황을 재현
2. **명확한 검증**: 기대하는 보드 상태를 정확히 확인
3. **예외 상황 검증**: 잡힌 기물이 실제로 제거되었는지 확인

### 5.1.2 앙파상 구현: 복잡성의 단계적 해결

앙파상 구현은 Board 클래스에 여러 책임이 추가되는 복잡한 작업이었다:

```kotlin
// Board.kt (실제 구현)
private fun isEnPassantMove(move: Move, pawn: Pawn): Boolean {
    // 앙파상 조건 검사
    if (lastMove == null) return false
    
    val lastMovedPiece = squares[lastMove.to]
    if (lastMovedPiece !is Pawn) return false
    if (lastMovedPiece.color == pawn.color) return false
    
    // 마지막 이동이 2칸 전진인지 확인
    val lastMoveDistance = kotlin.math.abs(lastMove.to.rank - lastMove.from.rank)
    if (lastMoveDistance != 2) return false
    
    // 마지막 이동한 폰이 현재 폰과 같은 행에 있는지 확인
    if (lastMove.to.rank != move.from.rank) return false
    
    // 마지막 이동한 폰이 현재 이동하려는 파일에 있는지 확인
    if (lastMove.to.file != move.to.file) return false
    
    return true
}
```

**이 구현에서 배운 설계 인사이트:**

1. **상태 추적의 필요성**: Board가 `lastMove`를 기억해야 함
2. **불변성 유지**: 새로운 Board 인스턴스를 생성하면서 상태 전달
3. **복잡한 조건의 분해**: 각 조건을 명확히 분리하여 가독성 향상

실제로 앙파상을 처리하는 부분:

```kotlin
// Board.kt move() 메서드 내부
if (piece is Pawn && destinationPiece == null && 
    kotlin.math.abs(move.to.file.code - move.from.file.code) == 1) {
    if (isEnPassantMove(move, piece)) {
        val capturedPawnRank = move.from.rank
        val capturedPawnFile = move.to.file
        updatedSquares.remove(Position(capturedPawnFile, capturedPawnRank))
    }
}
```

### 5.1.3 캐슬링: 여러 기물이 연관된 복잡한 이동

캐슬링은 킹과 룩이 동시에 이동하는 유일한 규칙이다. 이는 단일 책임 원칙에 도전하는 흥미로운 케이스였다.

**테스트 우선 접근:**

```kotlin
// SpecialRulesTest.kt (실제 코드)
test("킹사이드 캐슬링을 할 수 있다") {
    // 리플렉션을 사용한 테스트 보드 설정
    val board = Board.initialize()
    val squares = board.getSquares().toMutableMap()
    squares.remove(Position('f', 1)) // 비숍 제거
    squares.remove(Position('g', 1)) // 나이트 제거
    
    val testBoard = Board::class.java.getDeclaredConstructor(
        Map::class.java, Move::class.java, Set::class.java
    ).let { constructor ->
        constructor.isAccessible = true
        constructor.newInstance(squares, null, emptySet<Position>())
    } as Board
    
    // 킹사이드 캐슬링 수행
    val castledBoard = testBoard.move(Move.parseCastling("O-O"))
    
    // 킹이 g1에, 룩이 f1에 위치해야 함
    castledBoard.get(Position('g', 1)) shouldBe King(Color.WHITE)
    castledBoard.get(Position('f', 1)) shouldBe Rook(Color.WHITE)
}
```

**리플렉션 사용의 트레이드오프:**
- **장점**: 복잡한 보드 상태를 쉽게 설정
- **단점**: 내부 구현에 의존적인 깨지기 쉬운 테스트
- **교훈**: 때로는 테스트 용이성을 위해 프로덕션 코드를 개선하는 것이 더 나은 선택

**캐슬링 구현의 복잡성:**

```kotlin
// Board.kt (실제 구현)
private fun performCastling(move: Move): Board {
    val king = get(move.from)
    if (king !is King) {
        throw IllegalStateException("Castling can only be performed by a king")
    }
    
    // 킹이나 룩이 이동했는지 확인
    if (movedPieces.contains(move.from)) {
        throw IllegalStateException("King has already moved, cannot castle")
    }
    
    val updatedSquares = getSquares().toMutableMap()
    val updatedMovedPieces = movedPieces.toMutableSet()
    
    when (move.to.file) {
        'g' -> { // 킹사이드 캐슬링
            val rookPosition = Position('h', 1)
            if (movedPieces.contains(rookPosition)) {
                throw IllegalStateException("Rook has already moved, cannot castle")
            }
            
            // 경로가 비어있는지 확인
            if (squares[Position('f', 1)] != null || squares[Position('g', 1)] != null) {
                throw IllegalStateException("Path is not clear for castling")
            }
            
            // 킹과 룩 이동
            updatedSquares.remove(move.from)
            updatedSquares.remove(rookPosition)
            updatedSquares[move.to] = king
            updatedSquares[Position('f', 1)] = rook
            
            updatedMovedPieces.add(move.from)
            updatedMovedPieces.add(rookPosition)
        }
        // ... 퀸사이드 캐슬링 로직
    }
    
    return Board(updatedSquares, move, updatedMovedPieces)
}
```

**캐슬링 구현에서의 설계 결정:**
1. **이동 기록 추적**: `movedPieces` Set으로 이동한 기물 기록
2. **특수 이동 구분**: `Move.isCastling` 플래그로 일반 이동과 구분
3. **원자성 보장**: 킹과 룩의 이동이 하나의 트랜잭션으로 처리

## 5.2 메모리 최적화: 성능 문제와의 싸움

### 5.2.1 OutOfMemoryError의 발견

체스 엔진이 완성되어 가던 중, 실제 게임을 실행하니 OutOfMemoryError가 발생했다. 문제는 `hasLegalMoves()` 메서드에 있었다:

**문제가 된 초기 구현 (개념적 재현):**

```kotlin
// 초기 구현: 모든 가능한 이동을 시뮬레이션
private fun hasLegalMoves(color: Color): Boolean {
    for (from in getAllPositions()) {
        for (to in getAllPositions()) {
            try {
                val testGame = Game(board.move(Move(from, to)), color)
                if (!testGame.isInCheck(color)) {
                    return true
                }
            } catch (e: Exception) {
                // 불가능한 이동 무시
            }
        }
    }
    return false
}
```

이 코드는 64×64 = 4,096번의 이동을 시도하고, 각각에 대해 새로운 Game 인스턴스를 생성했다. **매 턴마다 수천 개의 객체가 생성되어 메모리가 폭발했다.**

### 5.2.2 TDD를 통한 최적화

성능 테스트를 추가하여 문제를 명확히 정의했다:

```kotlin
test("hasLegalMoves는 1초 내에 실행되어야 한다") {
    val complexPosition = createComplexPosition() // 복잡한 중반 상황
    val game = Game(complexPosition, Color.WHITE)
    
    val startTime = System.currentTimeMillis()
    game.hasLegalMoves(Color.WHITE)
    val duration = System.currentTimeMillis() - startTime
    
    duration shouldBeLessThan 1000
}
```

**최적화된 구현 (실제 코드):**

```kotlin
// Game.kt
private fun hasLegalMoves(color: Color): Boolean {
    // 메모리 최적화: 기물별로 실제 가능한 이동만 확인
    for ((position, piece) in board.getSquares()) {
        if (piece.color == color) {
            // 기물 타입별로 효율적인 이동 후보 생성
            val candidateMoves = generateCandidateMoves(piece, position)
            
            for (targetPosition in candidateMoves) {
                if (piece.isValidMove(position, targetPosition)) {
                    try {
                        val testBoard = board.move(Move(position, targetPosition))
                        
                        // 새 Game 인스턴스 생성 없이 직접 확인
                        if (!isKingInCheckAfterMove(testBoard, color)) {
                            return true
                        }
                    } catch (e: Exception) {
                        // 불가능한 이동 무시
                    }
                }
            }
        }
    }
    return false
}

// 기물별 효율적인 이동 후보 생성
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
            
            // 대각선 공격 (2개 방향만)
            listOf(-1, 1).forEach { fileOffset ->
                val newFile = (from.file.code + fileOffset).toChar()
                val newRank = from.rank + direction
                if (newFile in 'a'..'h' && newRank in 1..8) {
                    candidates.add(Position(newFile, newRank))
                }
            }
        }
        is King -> {
            // 킹은 인접한 8칸만 확인
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
            // 나이트의 L자 이동 (8개 방향)
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
            // 룩, 비숍, 퀸은 여전히 많은 칸을 확인해야 함
            return getAllValidPositions()
        }
    }
    
    return candidates
}
```

**최적화 결과:**
- 폰: 4,096 → 최대 4개 위치만 확인
- 킹: 4,096 → 최대 8개 위치만 확인
- 나이트: 4,096 → 최대 8개 위치만 확인
- **전체적으로 약 90% 이상의 연산 감소**

### 5.2.3 최적화에서 얻은 교훈

1. **성능도 요구사항이다**: 성능 목표를 테스트로 명시
2. **측정 후 최적화**: 추측이 아닌 실제 병목 지점 파악
3. **도메인 지식 활용**: 체스 규칙을 활용한 스마트한 최적화
4. **점진적 개선**: 한 번에 모든 것을 최적화하려 하지 않음

## 5.3 복잡한 비즈니스 로직 TDD의 핵심 원칙

### 5.3.1 도메인 이해가 우선이다

앙파상 규칙을 잘못 이해하고 테스트를 작성했던 경험에서 배웠듯이, **정확한 도메인 이해 없이는 올바른 테스트를 작성할 수 없다.**

**도메인 이해를 위한 체크리스트:**
- □ 비즈니스 전문가와의 대화
- □ 실제 시나리오 시뮬레이션
- □ 엣지 케이스 목록 작성
- □ 용어 정의 명확화

### 5.3.2 복잡성을 점진적으로 다루기

캐슬링처럼 여러 조건이 얽힌 규칙도 한 번에 모든 것을 구현하려 하지 않았다:

1. **기본 이동 구현**
2. **경로 확인 추가**
3. **이동 기록 확인 추가**
4. **체크 상태 확인 추가**

각 단계마다 테스트를 추가하고 구현을 확장했다.

### 5.3.3 성능을 고려한 설계

hasLegalMoves 최적화 경험에서 배운 것:

1. **초기에는 단순하게**: 동작하는 코드를 먼저 작성
2. **성능 문제 발견 시 테스트 추가**: 성능 목표를 명시
3. **도메인 지식을 활용한 최적화**: 무작정 최적화하지 않기
4. **리팩토링 안전망 확보**: 기존 테스트가 깨지지 않도록

### 5.3.4 테스트 가능한 설계의 중요성

리플렉션을 사용해야 했던 SpecialRulesTest는 설계 개선의 필요성을 보여준다:

```kotlin
// 더 나은 설계 예시 (제안)
class BoardBuilder {
    private val pieces = mutableMapOf<Position, Piece>()
    
    fun withPiece(position: Position, piece: Piece): BoardBuilder {
        pieces[position] = piece
        return this
    }
    
    fun build(): Board = Board.from(pieces)
}

// 테스트가 더 읽기 쉬워짐
test("캐슬링 테스트") {
    val board = BoardBuilder()
        .withPiece(Position('e', 1), King(Color.WHITE))
        .withPiece(Position('h', 1), Rook(Color.WHITE))
        .build()
}
```

## 5.4 실전 교훈: 복잡한 도메인과 TDD

체스 엔진의 특수 규칙 구현을 통해 얻은 실전 교훈:

1. **완벽한 이해 후 테스트 작성**: 도메인을 정확히 이해하지 못하면 잘못된 테스트로 이어진다
2. **복잡성의 분해**: 복잡한 규칙도 작은 단위로 나누면 다룰 수 있다
3. **성능은 기능의 일부**: 동작하는 것만으로는 부족하다
4. **설계는 진화한다**: 테스트하기 어렵다면 설계를 개선할 신호

복잡한 비즈니스 로직일수록 TDD의 가치는 더욱 빛난다. 작은 단계로 나누어 점진적으로 이해를 넓혀가는 과정이 복잡성을 정복하는 열쇠다.