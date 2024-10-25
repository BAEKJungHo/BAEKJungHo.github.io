---
layout  : wiki
title   : Debounce with Options - Leading, Trailing
summary : 
date    : 2024-10-22 17:54:32 +0900
updated : 2024-10-22 20:15:24 +0900
tag     : api debouncing
toc     : true
comment : true
public  : true
parent  : [[/api]]
latex   : true
---
* TOC
{:toc}

## Debouncing

If ___trailing___ is enabled, the debounce will invoke after the delay just like classic implementation. If ___leading___ is enabled, it will invoke at the beginning. If ___both___ are enabled then it will invoke twice at the beginning and after the delay.

```kotlin
import kotlinx.coroutines.*

class Debouncer {
    private var job: Job? = null
    private var lastCall: Long = 0
    
    /**
     * @param delay 지연 시간 (밀리초)
     * @param leading 선행 호출 여부
     * @param trailing 후행 호출 여부
     * @param scope 코루틴 스코프
     * @param function 실행할 함수
     */
    fun debounce(
        delay: Long,
        leading: Boolean = false,
        trailing: Boolean = true,
        scope: CoroutineScope,
        function: suspend () -> Unit
    ) {
        val now = System.currentTimeMillis()
        val isFirstCall = lastCall == 0L
        
        // 이전 작업 취소
        job?.cancel()
        
        // leading이 true이고 첫 호출이거나 마지막 호출로부터 충분한 시간이 지났을 경우
        if (leading && (isFirstCall || now - lastCall >= delay)) {
            scope.launch {
                function()
            }
        }
        
        lastCall = now
        
        // trailing이 true일 경우 지연 후 실행
        if (trailing) {
            job = scope.launch {
                delay(delay)
                function()
            }
        }
    }
    
    fun cancel() {
        job?.cancel()
        job = null
        lastCall = 0
    }
}

// 사용 예시 
class ExampleUsage {
    private val scope = CoroutineScope(Dispatchers.Main)
    private val debouncer = Debouncer()
    
    fun example() {
        // 트레일링만 활성화 (기본값)
        debouncer.debounce(
            delay = 1000L,
            scope = scope
        ) {
            println("트레일링 디바운스 실행")
        }
        
        // 리딩만 활성화
        debouncer.debounce(
            delay = 1000L,
            leading = true,
            trailing = false,
            scope = scope
        ) {
            println("리딩 디바운스 실행")
        }
        
        // 리딩과 트레일링 모두 활성화
        debouncer.debounce(
            delay = 1000L,
            leading = true,
            trailing = true,
            scope = scope
        ) {
            println("리딩과 트레일링 모두 실행")
        }
    }
    
    fun cleanup() {
        debouncer.cancel()
        scope.cancel()
    }
}
```