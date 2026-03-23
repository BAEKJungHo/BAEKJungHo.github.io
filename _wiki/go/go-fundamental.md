---
layout  : wiki
title   : GO FUNDAMENTALS
summary : 
date    : 2026-03-22 12:54:32 +0900
updated : 2026-03-23 23:30:00 +0900
tag     : go goroutine concurrency channel csp gc hexagonal solid
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---

* TOC
{:toc}

# GO FUNDAMENTALS

## Design Philosophy

Go 는 Google 에서 2009 년에 공개한 시스템 프로그래밍 언어이다. Rob Pike, Ken Thompson, Robert Griesemer 가 설계했으며, 핵심 설계 철학은 ***simplicity*** 이다.

> "Less is exponentially more." — Rob Pike

Go 는 다음의 원칙 위에 설계되었다:

- ***Simplicity***: 언어 기능을 최소화하여 읽기 쉽고 유지보수 가능한 코드를 유도한다
- ***Composition over Inheritance***: 클래스 상속 없이 interface 와 struct embedding 으로 추상화를 달성한다
- ***Concurrency is not parallelism***: goroutine 과 channel 을 통해 동시성을 언어 수준에서 지원한다
- ***Explicit is better than implicit***: 에러 처리, 타입 변환 등에서 명시성을 강제한다
- ***Fast compilation***: 대규모 코드베이스에서도 빠른 컴파일을 보장한다

이 글에서는 Go 의 타입 시스템부터 동시성, 시스템 프로그래밍, 아키텍처 패턴까지 CS 수준의 깊이로 다룬다.

## Type System and Abstraction

Go 의 타입 시스템은 ***simplicity*** 를 극단적으로 추구한다. 클래스 계층 없이, interface 와 struct embedding 만으로 추상화의 전체 스펙트럼을 커버한다. 이 섹션에서는 Go 가 어떻게 최소한의 도구로 강력한 추상화를 달성하는지 살펴본다.

### Interface and Structural Typing

Go 의 interface 는 ***implicit implementation*** 방식이다. Java 처럼 `implements` 키워드를 명시하지 않는다. 어떤 타입이 interface 에 정의된 모든 메서드를 구현하고 있으면, 그 타입은 자동으로 해당 interface 를 만족한다.

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

// File 은 Read 메서드를 가지므로 Reader 를 암묵적으로 구현한다
type File struct {
    name string
}

func (f *File) Read(p []byte) (n int, err error) {
    // 파일에서 데이터를 읽는 구현
    return len(p), nil
}

// Reader 를 만족하는지 컴파일 타임에 검증
var _ Reader = (*File)(nil)
```

이 방식을 ***Structural Typing*** 이라 한다. 타입의 이름이 아니라 __구조(structure)__ 에 의해 호환성이 결정된다.

__Nominal Typing vs Structural Typing__:

| 구분 | Nominal Typing | Structural Typing |
|------|---------------|-------------------|
| 대표 언어 | Java, C#, Kotlin | Go, TypeScript |
| 호환 기준 | 타입 이름과 명시적 선언 | 메서드/필드 구조 일치 |
| 의존성 방향 | 구현체 → interface (구현체가 interface 를 알아야 함) | interface → 사용처 (구현체는 interface 를 모른다) |
| 결합도 | 컴파일 타임 의존성 발생 | 디커플링 극대화 |

***Duck Typing*** 과의 관계도 정리할 필요가 있다. Duck Typing 은 "어떤 새가 오리처럼 걷고, 오리처럼 꽥꽥 울면, 그것은 오리이다"라는 원칙이다. Python, Ruby 같은 동적 언어에서 런타임에 메서드 존재 여부를 확인하는 방식이다. Go 의 structural typing 은 이와 유사하지만, __컴파일 타임에 검증__ 된다는 점에서 결정적으로 다르다. 
타입 안전성을 보장하면서도 Duck Typing 의 유연성을 취하는 것이다.

__빈 interface `interface{}` (any)__:

Go 1.18 이전에는 `interface{}` 가 모든 타입을 수용하는 "any" 역할을 했다. Go 1.18 부터는 `any` 라는 별칭이 도입되었다.

```go
// Go 1.18 이전
func Print(v interface{}) {
    fmt.Println(v)
}

// Go 1.18 이후
func Print(v any) {
    fmt.Println(v)
}
```

`any` 를 사용하면 타입 정보가 소실된다. type assertion 이나 type switch 로 원래 타입을 복원해야 하며, 이는 런타임 오류의 원인이 된다. <mark><em><strong>any 는 "타입 시스템의 탈출구"이지, 설계의 기본값이 아니다. 제네릭이 도입된 이후에는 any 의 사용을 최소화해야 한다.</strong></em></mark>

### Struct Embedding

Go 에는 상속이 없다. 이것은 의도적인 설계 결정이다. Go 의 창시자들은 상속이 가져오는 문제들 — fragile base class problem, 깊은 클래스 계층, 불필요한 결합 — 을 피하고자 했다. 대신 ***Composition over Inheritance*** 원칙을 언어 차원에서 강제한다.

***Struct Embedding*** 은 Go 가 코드 재사용을 달성하는 핵심 메커니즘이다. 한 struct 를 다른 struct 에 필드 이름 없이 포함시키면, 내부 struct 의 메서드가 외부 struct 로 __forwarding__ 된다.

```go
type Logger struct {
    prefix string
}

func (l *Logger) Log(msg string) {
    fmt.Printf("[%s] %s\n", l.prefix, msg)
}

type Server struct {
    Logger          // embedding — 필드 이름 없이 타입만 명시
    host   string
    port   int
}

func main() {
    s := Server{
        Logger: Logger{prefix: "SERVER"},
        host:   "localhost",
        port:   8080,
    }
    // Server 에 Log 메서드가 직접 정의된 것처럼 호출 가능
    s.Log("started") // [SERVER] started
}
```

이것은 상속이 아니다. `Server` 는 `Logger` 가 아니다(is-a 관계가 아니다). `Server` 가 `Logger` 를 __포함__ 하고 있을 뿐이다(has-a 관계). embedding 을 통한 method forwarding 은 편의 기능일 뿐, 타입 계층을 형성하지 않는다.

```
[ 상속 (Java) ]                     [ Composition (Go) ]

  Animal                              type Animal struct { ... }
    ↑
    Dog (is-a Animal)                 type Dog struct {
                                          Animal   // has-a
                                          breed string
                                      }
```

외부 struct 에서 같은 이름의 메서드를 정의하면 __shadowing__ 이 발생한다. 이는 상속의 override 와 달리 다형성을 제공하지 않는다.

```go
func (s *Server) Log(msg string) {
    // Logger.Log 를 shadowing
    fmt.Printf("[%s:%d] %s\n", s.host, s.port, msg)
}
```

### Generics

Go 1.18 에서 도입된 ***Generics*** 는 Go 타입 시스템의 가장 큰 변화이다. 제네릭 이전에는 `interface{}` 로 범용 코드를 작성해야 했고, 이는 타입 안전성과 성능 모두에서 비용을 지불해야 했다.

__Type Parameters__:

```go
// 제네릭 이전: 타입 안전성 없음
func ContainsOld(slice []interface{}, target interface{}) bool {
    for _, v := range slice {
        if v == target {
            return true
        }
    }
    return false
}

// 제네릭 이후: 컴파일 타임 타입 검증
func Contains[T comparable](slice []T, target T) bool {
    for _, v := range slice {
        if v == target {
            return true
        }
    }
    return false
}
```

`[T comparable]` 에서 `T` 는 ***Type Parameter*** 이고, `comparable` 은 ***Type Constraint*** 이다. Type Constraint 는 interface 로 정의된다.

__Type Constraints__:

```go
// 커스텀 constraint 정의
type Number interface {
    ~int | ~int32 | ~int64 | ~float32 | ~float64
}

func Sum[T Number](numbers []T) T {
    var total T
    for _, n := range numbers {
        total += n
    }
    return total
}

// ~ (tilde) 는 underlying type 을 의미
// type Score int 같은 커스텀 타입도 ~int 에 포함된다
```

__실무 활용 — 제네릭 데이터 구조__:

```go
// 제네릭 스택
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}
```

---

## Error Handling Philosophy

Go 의 에러 처리 철학은 다른 주류 언어와 근본적으로 다르다. 예외(exception)를 사용하지 않고, __에러를 값으로__ 다룬다. 이 선택은 Go 의 명시적이고 단순한 설계 철학의 연장선에 있다.

### Errors as Values

Rob Pike 는 "***Errors are values***" 라고 선언했다. Go 에서 에러는 특별한 제어 흐름이 아니라, 함수의 반환값으로 전달되는 일반적인 값이다.

```go
// error 는 단순한 interface 이다
type error interface {
    Error() string
}
```

<mark><em><strong>Go 에서 error 는 interface 이다. Error() string 메서드를 구현하는 모든 타입이 error 가 될 수 있다.</strong></em></mark>

모든 에러 처리는 `if err != nil` 패턴으로 이루어진다:

```go
file, err := os.Open("config.yaml")
if err != nil {
    return fmt.Errorf("failed to open config: %w", err)
}
defer file.Close()

data, err := io.ReadAll(file)
if err != nil {
    return fmt.Errorf("failed to read config: %w", err)
}
```

이 패턴이 반복적이라는 비판이 있다. 그러나 이것이 Go 의 의도이다. 에러를 __무시할 수 없게__ 만드는 것이다.

__Java 의 try-catch 와의 철학적 차이__:

| 구분 | Java (Exception) | Go (Error as Value) |
|------|------------------|---------------------|
| 에러 전파 | 암묵적 (throw/catch) | 명시적 (return) |
| 제어 흐름 | 비선형 (점프) | 선형 (순차) |
| 무시 가능성 | 높음 (unchecked exception) | 낮음 (반환값 무시 시 경고) |
| 에러 발생 위치 | catch 블록에서 파악 어려움 | 발생 즉시 확인 가능 |
| 스택 트레이스 | 자동 제공 | 수동으로 컨텍스트 추가 |

### Error Wrapping

Go 1.13 에서 도입된 ***error wrapping*** 은 에러에 컨텍스트를 추가하면서 원본 에러를 보존하는 메커니즘이다.

```go
// %w 로 에러를 감싼다 (wrapping)
func LoadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("load config from %s: %w", path, err)
    }

    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("parse config %s: %w", path, err)
    }
    return &cfg, nil
}
```

__errors.Is()__ 는 에러 체인에서 특정 에러 값을 찾는다:

```go
err := LoadConfig("missing.yaml")
if errors.Is(err, os.ErrNotExist) {
    // 파일이 없는 경우 기본 설정 사용
    return defaultConfig(), nil
}
```

__errors.As()__ 는 에러 체인에서 특정 에러 타입을 찾는다:

```go
var pathErr *os.PathError
if errors.As(err, &pathErr) {
    fmt.Printf("operation: %s, path: %s\n", pathErr.Op, pathErr.Path)
}
```

__Error Chain__ 의 구조:

```
fmt.Errorf("load config from missing.yaml: %w", originalErr)

에러 체인:
"load config from missing.yaml: open missing.yaml: no such file or directory"
         ↓ Unwrap()
"open missing.yaml: no such file or directory"  (os.PathError)
         ↓ Unwrap()
"no such file or directory"  (syscall.ENOENT)
```

### Sentinel Errors vs Custom Error Types

Go 에서 에러를 정의하는 방식은 크게 세 가지이다.

__1. Sentinel Errors__:

***Sentinel error*** 는 패키지 수준에서 미리 정의된 에러 값이다. 특정 상태를 나타내는 신호로 사용된다.

```go
// 표준 라이브러리의 sentinel error 예시
// io.EOF, sql.ErrNoRows, os.ErrNotExist 등

// 커스텀 sentinel error
var ErrNotFound = errors.New("not found")
var ErrAlreadyExists = errors.New("already exists")

func FindUser(id string) (*User, error) {
    user, ok := users[id]
    if !ok {
        return nil, ErrNotFound
    }
    return user, nil
}

// 호출자
user, err := FindUser("123")
if errors.Is(err, ErrNotFound) {
    // 사용자 없음 처리
}
```

__2. Custom Error Types__:

추가 컨텍스트가 필요할 때 커스텀 에러 타입을 사용한다.

```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed: %s - %s", e.Field, e.Message)
}

func ValidateAge(age int) error {
    if age < 0 || age > 150 {
        return &ValidationError{
            Field:   "age",
            Message: "must be between 0 and 150",
        }
    }
    return nil
}

// 호출자
err := ValidateAge(-1)
var valErr *ValidationError
if errors.As(err, &valErr) {
    fmt.Printf("Field: %s, Message: %s\n", valErr.Field, valErr.Message)
}
```

__3. 언제 무엇을 사용하는가__:

| 방식 | 사용 시점 | 예시 |
|------|----------|------|
| Sentinel error | 특정 상태를 신호로 전달할 때 | `io.EOF`, `ErrNotFound` |
| Custom error type | 에러에 구조화된 컨텍스트가 필요할 때 | `ValidationError`, `HTTPError` |
| `fmt.Errorf("%w")` | 에러에 설명을 추가하며 전파할 때 | `fmt.Errorf("save user: %w", err)` |

Dave Cheney 의 에러 처리 철학은 다음과 같다:

> "에러를 처리하거나(handle), 상위로 전파하거나(return), 둘 중 하나만 해라. 절대 둘 다 하지 마라."

```go
// 나쁜 예: 로그를 남기고 또 에러를 반환 (중복 처리)
func bad() error {
    err := doSomething()
    if err != nil {
        log.Printf("error: %v", err) // 처리 1: 로깅
        return err                     // 처리 2: 전파 → 중복
    }
    return nil
}

// 좋은 예: 처리하거나 전파하거나
func good() error {
    err := doSomething()
    if err != nil {
        return fmt.Errorf("do something: %w", err) // 전파만
    }
    return nil
}
```

## Functional Programming in Go

Go 는 순수 함수형 언어가 아니다. 그러나 ***first-class functions***, ***closures***, ***higher-order functions*** 를 지원하며, 함수형 프로그래밍의 핵심 패턴을 활용할 수 있다.

### First-class Functions

Go 에서 함수는 ***first-class citizen*** 이다. 변수에 할당하고, 함수의 인자로 전달하고, 함수의 반환값으로 사용할 수 있다.

```go
// 함수를 변수에 할당
var add func(int, int) int = func(a, b int) int {
    return a + b
}

fmt.Println(add(3, 5)) // 8

// 함수를 인자로 전달
func Apply(a, b int, op func(int, int) int) int {
    return op(a, b)
}

result := Apply(10, 3, func(a, b int) int {
    return a * b
})
fmt.Println(result) // 30

// 함수를 반환값으로 사용
func Multiplier(factor int) func(int) int {
    return func(n int) int {
        return n * factor
    }
}

double := Multiplier(2)
triple := Multiplier(3)
fmt.Println(double(5))  // 10
fmt.Println(triple(5))  // 15
```

### Closures

***Closure*** 는 자신이 정의된 환경의 변수를 캡처(capture)하는 함수이다. 함수가 선언된 스코프 외부에서 실행되더라도, 캡처된 변수에 계속 접근할 수 있다.

```go
func Counter() func() int {
    count := 0
    return func() int {
        count++  // 외부 변수 count 를 캡처
        return count
    }
}

c := Counter()
fmt.Println(c()) // 1
fmt.Println(c()) // 2
fmt.Println(c()) // 3
```

__실무 활용 — Middleware__:

```go
type Middleware func(http.Handler) http.Handler

func Logging(logger *log.Logger) Middleware {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()
            next.ServeHTTP(w, r)
            logger.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
        })
    }
}

func Auth(tokenValidator func(string) bool) Middleware {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            token := r.Header.Get("Authorization")
            if !tokenValidator(token) {
                http.Error(w, "unauthorized", http.StatusUnauthorized)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}
```

이 패턴에서 `Logging` 과 `Auth` 는 각각 `logger`, `tokenValidator` 를 closure 로 캡처한다. middleware 가 실행될 때마다 캡처된 의존성을 사용하므로, 별도의 struct 나 DI 프레임워크 없이도 의존성 주입이 가능하다.

### Higher-order Functions

***Higher-order function*** 은 함수를 인자로 받거나 함수를 반환하는 함수이다. 제네릭이 도입된 이후, Go 에서도 `Map`, `Filter`, `Reduce` 패턴을 타입 안전하게 작성할 수 있다.

```go
func Map[T, U any](slice []T, fn func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = fn(v)
    }
    return result
}

func Filter[T any](slice []T, fn func(T) bool) []T {
    var result []T
    for _, v := range slice {
        if fn(v) {
            result = append(result, v)
        }
    }
    return result
}

func Reduce[T, U any](slice []T, initial U, fn func(U, T) U) U {
    acc := initial
    for _, v := range slice {
        acc = fn(acc, v)
    }
    return acc
}

// 사용 예시
numbers := []int{1, 2, 3, 4, 5}

doubled := Map(numbers, func(n int) int { return n * 2 })
// [2, 4, 6, 8, 10]

evens := Filter(numbers, func(n int) bool { return n%2 == 0 })
// [2, 4]

sum := Reduce(numbers, 0, func(acc, n int) int { return acc + n })
// 15
```

__Function Composition__:

```go
func Compose[T any](fns ...func(T) T) func(T) T {
    return func(val T) T {
        for _, fn := range fns {
            val = fn(val)
        }
        return val
    }
}

transform := Compose(
    func(s string) string { return strings.TrimSpace(s) },
    func(s string) string { return strings.ToLower(s) },
    func(s string) string { return strings.ReplaceAll(s, " ", "-") },
)

fmt.Println(transform("  Hello World  ")) // "hello-world"
```

__Go 에서 FP 의 한계와 장점__:

Go 는 순수 함수형 언어가 아니므로 다음의 한계가 있다:
- immutability 가 언어 수준에서 강제되지 않는다 (const 는 기본 타입에만 적용)
- tail call optimization 이 없다
- pattern matching 이 없다 (type switch 가 부분적으로 대체)
- 모나드, 펑터 같은 고급 타입 클래스가 없다

그러나 Go 의 FP 는 다음의 장점을 제공한다:
- 함수 시그니처가 명확하여 읽기 쉽다
- closure 를 통한 간결한 상태 캡슐화
- 제네릭 이후 타입 안전한 고차 함수 작성 가능
- middleware, handler factory 등 실무 패턴에 즉시 적용 가능

## Concurrency

Go 의 동시성 모델은 ***[CSP(Communicating Sequential Processes)](https://en.wikipedia.org/wiki/Communicating_sequential_processes)*** 에 기반한다. Rob Pike 의 유명한 격언이 이를 잘 표현한다:

> "Do not communicate by sharing memory; instead, share memory by communicating." — [Effective Go](https://go.dev/doc/effective_go#concurrency)

이 섹션에서는 goroutine, scheduler, channel 의 내부 동작부터 실무 패턴까지 깊이 있게 다룬다. 기존 블로그의 ***[Explained Concurrency](https://klarciel.net/wiki/go/go-concurrency/)*** 에서 CSP 와 channel 의 기초를 다룬 바 있으며, 여기서는 더 깊은 수준의 내용을 포함한다.

### Thread vs Goroutine

***OS Thread*** 와 ***Goroutine*** 은 근본적으로 다른 실행 단위이다.

__OS Thread__:
- Kernel 이 관리하는 실행 단위이다
- 기본 stack 크기가 1~8MB (Linux 기본값 8MB, 일부 시스템에서 1~2MB)
- 생성 시 kernel 호출(`clone` syscall on Linux)이 필요하다
- Context switching 시 kernel mode 전환이 발생한다
- 하나의 프로세스에서 수천 개 이상의 thread 를 생성하면 메모리와 scheduling overhead 가 급격히 증가한다

__Goroutine__:
- Go runtime 이 관리하는 ***user-space 실행 단위*** 이다
- 초기 stack 크기가 ***2KB*** (Go 1.4+)로 극히 작다
- 생성 비용이 수 마이크로초 수준이다 (OS thread 생성은 수십~수백 마이크로초)
- Context switching 이 user-space 에서 일어나므로 kernel 전환이 없다
- 수십만~수백만 개의 goroutine 을 하나의 프로세스에서 실행할 수 있다

정량적 비교 (실제 수치는 OS, 하드웨어, 워크로드에 따라 다르다):

| 항목 | OS Thread | Goroutine |
|------|-----------|-----------|
| 초기 Stack 크기 | 1~8 MB | ~2 KB |
| 생성 비용 | 수십~수백 μs | ~수 μs |
| Context Switch 비용 | ~1-10 μs (kernel) | ~100-300 ns (user-space) |
| 동시 실행 가능 수 (4GB RAM 기준) | ~1,000 (8MB stack) | ~2,000,000 (2KB stack) |
| 관리 주체 | OS Kernel | Go Runtime |

### Go Scheduler (M:N Scheduler)

Go runtime 은 ***M:N scheduling*** 을 구현한다. M 개의 goroutine 을 N 개의 OS thread 에 멀티플렉싱하는 방식이다. 이 스케줄러의 핵심은 ***GMP 모델*** 이다.

#### GMP Model

- ***G (Goroutine)***: 실행할 코드, stack, instruction pointer 등을 포함하는 구조체 (`runtime.g`)
- ***M (Machine)***: OS thread 를 나타내는 구조체 (`runtime.m`). 실제 코드를 실행하는 물리적 단위이다
- ***P (Processor)***: 논리적 프로세서 (`runtime.p`). G 를 M 에서 실행하기 위한 컨텍스트를 제공한다. P 의 개수는 `GOMAXPROCS` 로 결정된다

```
               ┌─────────────────────────────────────────────┐
               │              Go Runtime Scheduler           │
               │                                             │
               │   ┌───────── Global Run Queue ──────────┐   │
               │   │  G7   G8   G9   G10  ...           │   │
               │   └─────────────────────────────────────┘   │
               │                                             │
               │  ┌─── P0 ───┐        ┌─── P1 ───┐         │
               │  │ Local Q:  │        │ Local Q:  │         │
               │  │ G1  G2   │        │ G4  G5   │         │
               │  │           │        │           │         │
               │  │ Running:  │        │ Running:  │         │
               │  │  [G3]     │        │  [G6]     │         │
               │  └─────┬─────┘        └─────┬─────┘         │
               │        │                    │               │
               └────────┼────────────────────┼───────────────┘
                        │                    │
                   ┌────┴────┐          ┌────┴────┐
                   │   M0    │          │   M1    │
                   │(Thread) │          │(Thread) │
                   └─────────┘          └─────────┘
                        │                    │
               ─────────┴────────────────────┴──────────
                          OS Kernel Scheduler
```

__동작 방식__:

1. 새로운 goroutine(G)이 생성되면, 현재 P 의 ***Local Run Queue*** 에 추가된다
2. P 는 자신의 local queue 에서 G 를 꺼내 연결된 M(OS Thread)에서 실행한다
3. G 가 syscall 로 blocking 되면, M 은 P 를 반납하고 blocking 상태로 전환된다. P 는 유휴 M 을 찾거나 새 M 을 생성하여 다른 G 를 계속 실행한다
4. G 가 channel 통신이나 I/O 로 blocking 되면, G 는 대기 큐로 이동하고 P 는 다음 G 를 실행한다

#### Work Stealing

P 의 local queue 가 비면, 다음 순서로 실행할 G 를 탐색한다:

1. 자신의 local run queue 확인
2. Global run queue 확인
3. Network poller (netpoll) 확인
4. ***다른 P 의 local queue 에서 절반을 훔쳐온다 (Work Stealing)***

Work Stealing 알고리즘은 부하를 자동으로 분산시켜 CPU utilization 을 극대화한다. 이는 Java 의 `ForkJoinPool` 에서도 사용되는 알고리즘이다.

#### Preemptive Scheduling (Go 1.14+)

Go 1.13 이전에는 goroutine 이 ***cooperative scheduling*** 방식이었다. goroutine 이 function call 시점에만 선점(preemption)될 수 있었으므로, tight loop(`for {}`)을 실행하는 goroutine 이 P 를 독점하는 문제가 있었다.

Go 1.14 부터 ***asynchronous preemption*** 이 도입되었다. runtime 이 `SIGURG` signal 을 사용하여 실행 중인 goroutine 을 강제로 선점할 수 있다. 이로써 tight loop 이 다른 goroutine 의 실행을 방해하지 않게 되었다.

#### GOMAXPROCS

`GOMAXPROCS` 는 동시에 Go 코드를 실행할 수 있는 P(Processor)의 최대 개수를 결정한다. 기본값은 사용 가능한 ***논리 CPU 코어 수*** 이다.

```go
import "runtime"

// 현재 GOMAXPROCS 값 확인
fmt.Println(runtime.GOMAXPROCS(0))

// GOMAXPROCS 변경
runtime.GOMAXPROCS(4)
```

`GOMAXPROCS` 를 CPU 코어 수보다 크게 설정하더라도, I/O-bound 작업이 아닌 이상 성능이 향상되지 않는다. 오히려 context switching overhead 가 증가할 수 있다.

### Stack Size and Stack Growth

#### Why 2KB Initial Stack

goroutine 의 초기 stack 크기가 ***2KB*** 인 이유는 수백만 개의 goroutine 을 생성할 수 있도록 하기 위함이다. OS thread 의 기본 stack 이 1~8MB 라면, 10,000 개의 thread 만으로도 10~80GB 의 메모리가 필요하다. 반면 2KB stack 의 goroutine 은 10,000 개가 약 20MB 만 차지한다.

#### Contiguous Stack (Go 1.4+)

Go 1.3 이전에는 ***segmented stack*** 방식을 사용했다. stack 이 부족하면 새로운 segment 를 할당하고 연결하는 방식이었다. 그러나 이 방식에는 ***"hot split"*** 문제가 있었다. 함수가 stack 경계에서 반복 호출되면 segment 할당/해제가 빈번하게 발생하여 성능이 급격히 저하되었다.

Go 1.4 부터 ***contiguous stack*** 방식으로 전환되었다. stack 이 부족하면:

1. 현재 stack 의 ***2배 크기*** 의 새로운 연속 메모리 블록을 할당한다
2. 기존 stack 의 내용을 새 stack 으로 복사한다
3. stack 에 있는 ***모든 포인터를 조정*** 한다 (이것이 Go 가 unsafe.Pointer 사용을 제한하는 이유 중 하나이다)
4. 기존 stack 을 해제한다

역으로, GC 가 stack 사용량이 현재 크기의 약 1/4 미만임을 감지하면 stack 을 ***축소(shrink)*** 한다.

### Context Switching Cost Comparison

OS Thread 의 context switching 과 goroutine 의 context switching 은 비용이 크게 다르다.

__OS Thread Context Switching__:
1. User mode → Kernel mode 전환 (privilege level 변경)
2. CPU register 전체를 저장 (general purpose, floating point, SIMD registers)
3. ***TLB(Translation Lookaside Buffer) flush*** 발생 가능 (가상 메모리 주소 캐시 무효화)
4. Kernel scheduler 가 다음 실행할 thread 를 결정
5. 새 thread 의 register 를 복원
6. Kernel mode → User mode 전환
7. 비용: ***1~10 μs***

__Goroutine Context Switching__:
1. ***User-space 에서만 수행*** — kernel 호출이 없다
2. 저장할 register 가 적다 (PC, SP, 그리고 소수의 register)
3. TLB flush 가 발생하지 않는다 (동일 OS thread 내에서 전환)
4. Go runtime scheduler 가 다음 G 를 선택
5. 비용: ***수백 나노초 이내***

<mark><em><strong>goroutine context switching 이 OS thread 대비 수십 배 빠른 이유는 kernel mode 전환이 없고 TLB flush 가 불필요하기 때문이다.</strong></em></mark>

### Channel and CSP Model

#### CSP (Communicating Sequential Processes)

***[CSP](https://en.wikipedia.org/wiki/Communicating_sequential_processes)*** 는 1978 년 Tony Hoare 가 발표한 동시성 모델이다. 핵심 아이디어는 독립적인 프로세스들이 ***메시지 패싱(message passing)*** 을 통해 통신한다는 것이다.

Go 의 concurrency model 은 CSP 를 직접적으로 구현한다:
- ***goroutine*** = CSP 의 sequential process
- ***channel*** = CSP 의 communication primitive

이 모델에서는 공유 메모리에 대한 lock 기반 동기화 대신, channel 을 통한 데이터 전송으로 동시성을 제어한다. 이는 deadlock 과 race condition 의 가능성을 줄인다.

#### Channel Internal Structure

channel 의 내부 구조는 `runtime.hchan` struct 로 정의된다:

```go
// runtime/chan.go (simplified)
type hchan struct {
    qcount   uint           // current number of elements in buffer
    dataqsiz uint           // size of the circular buffer
    buf      unsafe.Pointer // pointer to circular buffer
    elemsize uint16         // size of each element
    closed   uint32         // whether the channel is closed
    sendx    uint           // next send index in buffer
    recvx    uint           // next receive index in buffer
    recvq    waitq          // queue of waiting receivers (sudog)
    sendq    waitq          // queue of waiting senders (sudog)
    lock     mutex          // protects all fields of hchan
}
```

```
         hchan struct
  ┌──────────────────────────┐
  │  lock (mutex)            │
  │  buf → [circular buffer] │──→ [ elem0 | elem1 | elem2 | ... ]
  │  sendx / recvx           │        ↑ recvx        ↑ sendx
  │  sendq (waiting senders) │──→ [G1] → [G2] → nil
  │  recvq (waiting recvrs)  │──→ [G3] → nil
  │  qcount / dataqsiz       │
  │  closed                  │
  └──────────────────────────┘
```

__동작 원리__:
- ***Send***: buffer 에 공간이 있으면 데이터를 복사하고 `sendx` 를 이동. buffer 가 가득 차면 sender goroutine 을 `sendq` 에 넣고 blocking
- ***Receive***: buffer 에 데이터가 있으면 복사하고 `recvx` 를 이동. buffer 가 비어 있으면 receiver goroutine 을 `recvq` 에 넣고 blocking
- ***Unbuffered channel***: `dataqsiz == 0` 이므로 sender 와 receiver 가 동시에 준비되어야 통신이 완료된다 (synchronous communication)

#### Unbuffered vs Buffered Channel

```go
// Unbuffered: sender 와 receiver 가 동시에 준비되어야 함
ch := make(chan int)

// Buffered: capacity 만큼 non-blocking send 가능
ch := make(chan int, 100)
```

__Unbuffered Channel__:
- `dataqsiz` 가 0 이다
- send 는 receiver 가 준비될 때까지 blocking 된다
- ***동기화 지점(synchronization point)*** 으로 사용된다
- 두 goroutine 간의 ***handshake*** 보장

__Buffered Channel__:
- `dataqsiz > 0` 이다
- buffer 가 가득 차지 않으면 send 는 non-blocking 이다
- buffer 가 비어 있으면 receive 는 blocking 이다
- producer-consumer 패턴에 적합하다

#### select Statement and Multiplexing

`select` 는 여러 channel operation 을 동시에 대기할 수 있는 Go 의 ***multiplexing*** 구문이다.

```go
select {
case msg := <-ch1:
    fmt.Println("received from ch1:", msg)
case msg := <-ch2:
    fmt.Println("received from ch2:", msg)
case ch3 <- value:
    fmt.Println("sent to ch3")
case <-time.After(5 * time.Second):
    fmt.Println("timeout")
default:
    fmt.Println("no channel ready")
}
```

`select` 는 여러 case 중 준비된 것이 있으면 그 중 하나를 ***무작위(pseudo-random)*** 로 선택하여 실행한다. 모든 case 가 blocking 상태이면 `default` 가 있을 경우 `default` 를 실행하고, 없으면 하나가 준비될 때까지 blocking 된다.

### Worker Pool Pattern

***Worker Pool*** 은 고정된 수의 goroutine 이 task queue 에서 작업을 꺼내 처리하는 패턴이다. goroutine 생성 비용이 낮더라도, 무제한으로 생성하면 메모리 사용량이 증가하고 scheduling overhead 가 발생할 수 있다.

```go
func workerPool(numWorkers int, jobs <-chan Job, results chan<- Result) {
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(workerID int) {
            defer wg.Done()
            for job := range jobs {
                result, err := process(job)
                // 실무에서는 Result 타입에 error 필드를 포함하여 에러를 전파한다
                results <- Result{Value: result, Err: err}
            }
        }(i)
    }
    wg.Wait()
    close(results)
}
```

__사용 시점__:
- 외부 API 호출, DB 쿼리 등 I/O-bound 작업을 동시에 처리할 때
- 동시 실행 goroutine 수를 제한해야 할 때 (rate limiting, resource 보호)
- CPU-bound 작업을 병렬화할 때 (worker 수를 `GOMAXPROCS` 에 맞춤)

실무에서는 `golang.org/x/sync/errgroup` 을 사용하면 에러 전파와 goroutine 그룹 관리를 더 간결하게 처리할 수 있다.

### Fan-in / Fan-out Pattern

#### Fan-out (Work Distribution)

여러 goroutine 에 작업을 분배하는 패턴이다. 하나의 input channel 에서 여러 worker 가 경쟁적으로(competing consumers) 읽어 처리한다. 각 입력 값은 하나의 worker 에게만 전달된다.

```go
// Fan-out: 하나의 input channel 에서 여러 worker 가 경쟁적으로 읽음
// 각 입력 값은 정확히 하나의 worker 에게만 전달된다
func fanOut(input <-chan int, numWorkers int) []<-chan int {
    outputs := make([]<-chan int, numWorkers)
    for i := 0; i < numWorkers; i++ {
        out := make(chan int)
        outputs[i] = out
        go func(out chan<- int) {
            defer close(out)
            for val := range input {
                out <- val * val
            }
        }(out)
    }
    return outputs
}
```

#### Fan-in

여러 channel 의 결과를 하나의 channel 로 합치는 패턴이다.

```go
// Fan-in: 여러 input channel 을 하나의 output channel 로 합침
func fanIn(channels ...<-chan int) <-chan int {
    var wg sync.WaitGroup
    merged := make(chan int)

    output := func(ch <-chan int) {
        defer wg.Done()
        for val := range ch {
            merged <- val
        }
    }

    wg.Add(len(channels))
    for _, ch := range channels {
        go output(ch)
    }

    go func() {
        wg.Wait()
        close(merged)
    }()

    return merged
}
```

이 패턴은 [Go Concurrency Patterns: Pipelines and cancellation](https://go.dev/blog/pipelines) 에서 자세히 다루고 있다.

### Goroutine Leak in Practice

***Goroutine Leak*** 은 goroutine 이 종료되지 않고 계속 존재하는 현상이다. goroutine 은 GC 가 수거하지 않으므로, leak 이 발생하면 메모리가 지속적으로 증가한다.

#### Main Causes

__1. Blocked Channel (가장 흔한 원인)__:

```go
// LEAK: receiver 가 없는 channel 에 send 하면 영원히 blocking
func leak() {
    ch := make(chan int)
    go func() {
        val := <-ch // 아무도 send 하지 않으면 영원히 대기
        fmt.Println(val)
    }()
    // ch 에 send 하지 않고 함수 종료
    // goroutine 은 영원히 blocking 상태로 남음
}
```

__2. Missing Context Cancellation__:

```go
// LEAK: context 취소를 전달하지 않으면 goroutine 이 응답을 영원히 대기
func leak() {
    resp := make(chan string)
    go func() {
        data := callExternalAPI() // timeout 없으면 영원히 blocking 가능
        resp <- data
    }()
    // resp 를 읽지 않거나, timeout 없이 대기하면 leak
}
```

#### Detection

```go
// runtime.NumGoroutine() 으로 현재 goroutine 수 모니터링
fmt.Println("goroutines:", runtime.NumGoroutine())

// pprof 로 goroutine dump 확인
import _ "net/http/pprof"
go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
// http://localhost:6060/debug/pprof/goroutine?debug=1
```

[pprof](https://pkg.go.dev/runtime/pprof) 를 사용하면 blocking 상태의 goroutine stack trace 를 확인할 수 있다. production 환경에서도 `net/http/pprof` 를 활성화하여 goroutine 수 추이를 모니터링하는 것이 권장된다.

#### Prevention Patterns

__Pattern 1: context.WithCancel__:

```go
func worker(ctx context.Context, tasks <-chan Task) {
    for {
        select {
        case <-ctx.Done():
            return // context 가 취소되면 goroutine 종료
        case task, ok := <-tasks:
            if !ok {
                return // channel 이 닫히면 종료
            }
            processTask(task)
        }
    }
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())
    tasks := make(chan Task)
    go worker(ctx, tasks)

    time.Sleep(5 * time.Second)
    cancel() // goroutine 에 종료 신호 전달
}
```

__Pattern 2: context.WithTimeout__:

```go
func callWithTimeout() (string, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel() // 반드시 호출하여 resource leak 방지

    result := make(chan string, 1)
    go func() {
        data := callExternalAPI()
        result <- data
    }()

    select {
    case data := <-result:
        return data, nil
    case <-ctx.Done():
        return "", ctx.Err() // timeout 시 에러 반환
    }
}
```

### When NOT to Use Goroutines

goroutine 이 가볍다고 해서 모든 곳에 사용해야 하는 것은 아니다.

__1. CPU-bound 작업에서의 과도한 goroutine__:

CPU-bound 작업은 `GOMAXPROCS` 이상의 goroutine 을 사용해도 성능이 향상되지 않는다. 오히려 scheduling overhead 만 증가한다. CPU-bound 작업에서는 worker 수를 `runtime.NumCPU()` 에 맞추는 것이 적절하다.

__2. 짧은 동기 작업__:

goroutine 생성과 channel 통신에도 비용이 있다. 수 나노초 수준의 단순 연산을 goroutine 으로 분리하면 오히려 느려진다. overhead 가 실제 작업보다 클 수 있다.

__3. Shared State 가 많은 경우__:

여러 goroutine 이 동일한 데이터를 빈번하게 읽고 쓴다면, mutex 경합(contention)이 심해져 오히려 순차 실행보다 느려질 수 있다. 이 경우 CSP 모델로 설계를 재구성하거나, 데이터 파티셔닝을 고려해야 한다.

__4. Debugging Complexity__:

goroutine 은 stack trace 가 분산되고, 실행 순서가 비결정적(non-deterministic)이므로 디버깅이 어렵다. 단순한 요구사항에는 동기 코드가 더 이해하기 쉽고 유지보수하기 용이하다. race condition 디버깅에는 `go test -race` 플래그가 필수적이다.

#### Concurrency Decision Matrix

| 상황 | 추천 도구 |
|------|----------|
| 단순 동기화 | `sync.WaitGroup` |
| 데이터 전달 | channel |
| 공유 상태 보호 | `sync.Mutex` or `sync.RWMutex` |
| 에러와 함께 worker 관리 | `golang.org/x/sync/errgroup` |
| 취소 전파 | `context` |

### Comparison: Java Thread vs Kotlin Coroutine vs Go Goroutine

| 항목 | Java Thread | Java Virtual Thread (Loom) | Kotlin Coroutine | Go Goroutine |
|------|-------------|--------------------------|-------------------|--------------|
| Scheduling Model | 1:1 (OS thread) | M:N (carrier thread) | M:N (dispatcher) | M:N (GMP) |
| 초기 Stack 크기 | ~512 KB - 1 MB | 동적 (수 KB~) | stack 없음 (heap 기반 continuation) | ~2 KB |
| 생성 비용 | 수십~수백 μs | ~수 μs | ~수 μs | ~수 μs |
| 동시 실행 가능 수 | ~수천 | ~수백만 | ~수백만 | ~수백만 |
| Preemption | OS-level preemptive | OS-level + cooperative | Cooperative (suspension point) | Runtime preemptive (Go 1.14+) |
| 동시성 모델 | Shared memory + locks | Shared memory + locks | Structured concurrency + Flow | CSP (channel) |
| 언어 지원 수준 | 언어/JVM 기본 | JVM 21+ | 라이브러리 (kotlinx.coroutines) | 언어 내장 (`go` keyword) |

__핵심 차이점__:

***Java Thread***: OS thread 와 1:1 매핑되므로 생성 비용과 메모리 사용량이 크다. `synchronized`, `ReentrantLock` 등 shared memory 기반 동기화를 사용한다.

***Java Virtual Thread (Project Loom)***: Java 21 에서 정식 도입. JVM 이 virtual thread 를 소수의 carrier thread(OS thread) 위에 스케줄링한다. goroutine 과 유사한 M:N 모델이지만, 동시성 모델은 여전히 shared memory + locks 이다.

***Kotlin Coroutine***: suspend function 과 continuation 을 사용한 cooperative multitasking 이다. 컴파일러가 suspend function 을 ***state machine*** 으로 변환하여 구현된다. stackless coroutine 이므로 별도의 stack 을 할당하지 않고 heap 에 continuation 객체를 저장한다. `Dispatchers.Default`, `Dispatchers.IO` 등을 통해 실행 thread pool 을 선택한다.

***Go Goroutine***: 언어 수준에서 `go` keyword 로 생성. ***stackful coroutine*** 으로 자체 stack 을 가진다. CSP 모델의 channel 을 일급 시민으로 지원하며, runtime scheduler 가 preemptive scheduling 을 수행한다.

<mark><em><strong>Go 는 Erlang 과 함께 동시성을 언어 수준에서 직접 지원하는 대표적 언어이다. goroutine + channel 의 조합은 CSP 모델을 가장 직관적으로 구현한 형태이다.</strong></em></mark>

## Systems Programming in Go

### Netpoll

***netpoll*** 은 Go runtime 에 내장된 네트워크 폴러이다. goroutine 이 I/O 를 수행할 때, OS 의 blocking I/O 를 사용하면 해당 goroutine 이 연결된 M(OS thread)이 blocking 되어 다른 goroutine 을 실행할 수 없다.

netpoll 은 이 문제를 해결한다. goroutine 이 network I/O 를 수행하면:

1. Go runtime 은 해당 file descriptor 를 ***비동기 I/O 감시 큐*** 에 등록한다
2. goroutine 은 park(suspend) 된다 — M 을 blocking 하지 않는다
3. I/O 가 준비되면 netpoll 이 goroutine 을 깨워 run queue 에 다시 넣는다
4. goroutine 은 마치 blocking I/O 를 한 것처럼 동기적으로 코드를 작성할 수 있다

```
  Goroutine (G)
       │
  [conn.Read()]
       │
  ┌────┴────────────────────┐
  │ Go Runtime              │
  │                         │
  │ fd 를 netpoll 에 등록    │
  │ G 를 park (suspend)      │
  │                         │
  │ netpoll loop:           │
  │   epoll_wait / kqueue   │
  │   ↓                     │
  │ I/O ready → G 를 깨움    │
  └─────────────────────────┘
       │
  G 가 run queue 에 복귀
       │
  [Read 결과 반환]
```

이 설계 덕분에 Go 개발자는 동기적인 코드 스타일로 작성하면서도, runtime 내부에서는 비동기 I/O 의 효율성을 얻는다. callback 이나 async/await 없이도 높은 동시성을 달성하는 것이 가능한 이유이다.

### Epoll / Kqueue

Go runtime 의 netpoll 은 OS 별로 다른 I/O multiplexing mechanism 을 사용한다:

- ***Linux***: `epoll`
- ***macOS / BSD***: `kqueue`
- ***Windows***: `IOCP (I/O Completion Ports)`

#### epoll (Linux)

***epoll*** 은 Linux 의 고성능 I/O event notification mechanism 이다.

```
  ┌──────────────────────────────────────────┐
  │            epoll workflow                 │
  │                                          │
  │  epoll_create()  → epoll instance 생성    │
  │       ↓                                  │
  │  epoll_ctl()     → fd 등록/수정/삭제       │
  │       ↓                                  │
  │  epoll_wait()    → ready event 대기       │
  │       ↓                                  │
  │  ready events[]  → 처리                   │
  └──────────────────────────────────────────┘
```

`epoll_create`: epoll instance 를 생성한다. 내부적으로 red-black tree 와 ready list 를 유지한다.

`epoll_ctl`: file descriptor 를 epoll instance 에 등록(`EPOLL_CTL_ADD`), 수정(`EPOLL_CTL_MOD`), 삭제(`EPOLL_CTL_DEL`)한다.

`epoll_wait`: 등록된 fd 들 중 이벤트가 발생한 것들을 반환한다. ready 상태의 fd 가 없으면 blocking 한다.

`select()` 나 `poll()` 이 매 호출마다 모든 fd 를 순회(O(n))하는 것과 달리, epoll 은 등록된 전체 fd 수와 무관하게 ***ready 상태인 fd 수(O(k))*** 에 비례하는 비용으로 이벤트를 반환한다.

__Level-Triggered vs Edge-Triggered__:

| 모드 | 동작 |
|------|------|
| ***Level-Triggered (LT)*** | fd 가 ready 상태인 한 계속 알림 (기본값) |
| ***Edge-Triggered (ET)*** | fd 상태가 변경될 때만 알림 |

Go runtime 의 netpoll 은 ***edge-triggered*** 모드를 사용한다. 이는 불필요한 wakeup 을 줄여 성능을 높이지만, 모든 데이터를 한 번에 읽어야 하는 제약이 있다. Go runtime 이 이를 내부적으로 처리하므로 개발자가 직접 관리할 필요는 없다.

#### kqueue (macOS / BSD)

***kqueue*** 는 BSD 계열 OS 의 event notification mechanism 이다. `kqueue()` 로 큐를 생성하고, `kevent()` 로 이벤트를 등록하고 대기한다.

```c
int kq = kqueue();
struct kevent ev;
EV_SET(&ev, fd, EVFILT_READ, EV_ADD, 0, 0, NULL);
kevent(kq, &ev, 1, NULL, 0, NULL); // 등록
kevent(kq, NULL, 0, events, maxevents, timeout); // 대기
```

kqueue 는 epoll 과 달리 파일 시스템 이벤트, 프로세스 이벤트, signal 등 다양한 이벤트 타입을 단일 인터페이스로 감시할 수 있다.

#### Go Runtime Abstraction

Go runtime 은 `runtime/netpoll_epoll.go`, `runtime/netpoll_kqueue.go` 등 OS 별 파일로 netpoll 을 구현하며, 상위 레이어에서는 동일한 인터페이스를 통해 접근한다. 개발자는 OS 에 따른 I/O multiplexing 의 차이를 신경 쓸 필요 없이 `net.Conn.Read()`, `net.Conn.Write()` 같은 동기적 API 를 사용하면 된다.

### Go HTTP Server Internals

`net/http` 패키지의 HTTP server 는 ***goroutine-per-connection*** 모델을 사용한다.

```go
// net/http/server.go (simplified)
func (srv *Server) Serve(l net.Listener) error {
    for {
        rw, err := l.Accept() // 새 연결 대기
        if err != nil {
            // handle error
            continue
        }
        c := srv.newConn(rw)
        go c.serve(connCtx) // 연결마다 goroutine 생성
    }
}
```

__Request Lifecycle__:

```
  Client
    │
    ├──→ TCP Connect
    │
  Server
    │
  [1] net.Listener.Accept()
    │    → 새 TCP 연결 수락
    │
  [2] go conn.serve(ctx)
    │    → 연결마다 goroutine 생성
    │
  [3] conn.readRequest(ctx)
    │    → HTTP request 파싱
    │
  [4] serverHandler.ServeHTTP(w, r)
    │    → 등록된 handler 호출
    │    → Router(ServeMux) 가 URL 패턴 매칭
    │
  [5] Response 작성 및 전송
    │
  [6] Keep-Alive 이면 [3] 으로 복귀
    │   아니면 연결 종료
```

이 goroutine-per-connection 모델은 HTTP/1.1 에 해당한다. HTTP/2 의 경우 하나의 TCP 연결 위에 여러 stream 이 multiplexing 되며, 각 stream(request) 마다 goroutine 이 할당된다.

goroutine 이 가볍기 때문에 수만 개의 동시 연결을 처리할 수 있다. C10K 문제를 해결하기 위해 epoll/kqueue 기반의 event loop 를 직접 구현할 필요 없이, 직관적인 goroutine-per-connection 모델로 높은 동시성을 달성한다.

### gRPC in Go

***[gRPC](https://grpc.io/)*** 는 Google 이 개발한 고성능 RPC 프레임워크이다. HTTP/2 기반 전송과 Protocol Buffers 직렬화를 사용한다.

__핵심 특성__:
- ***HTTP/2***: multiplexing, header compression, bidirectional streaming 지원
- ***Protocol Buffers***: 언어 중립적, 효율적인 바이너리 직렬화
- ***Code Generation***: `.proto` 파일에서 서버/클라이언트 코드를 자동 생성

__4가지 통신 패턴__:

```protobuf
syntax = "proto3";

service UserService {
  // Unary: 단일 요청 → 단일 응답
  rpc GetUser (GetUserRequest) returns (User);

  // Server Streaming: 단일 요청 → 스트림 응답
  rpc ListUsers (ListUsersRequest) returns (stream User);

  // Client Streaming: 스트림 요청 → 단일 응답
  rpc UploadUsers (stream User) returns (UploadResponse);

  // Bidirectional Streaming: 스트림 요청 ↔ 스트림 응답
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);
}
```

__Unary RPC 구현 예제__:

```go
// server
type userServer struct {
    pb.UnimplementedUserServiceServer
}

func (s *userServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.db.FindByID(ctx, req.GetId())
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "user not found: %v", err)
    }
    return &pb.User{Id: user.ID, Name: user.Name}, nil
}

func main() {
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }
    s := grpc.NewServer()
    pb.RegisterUserServiceServer(s, &userServer{})
    log.Fatal(s.Serve(lis))
}
```

```go
// client
conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
if err != nil {
    log.Fatalf("failed to connect: %v", err)
}
defer conn.Close()

client := pb.NewUserServiceClient(conn)
user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: "123"})
```

gRPC 는 Go 의 goroutine-per-stream 모델과 잘 어울린다. 각 RPC call 이 독립된 goroutine 에서 처리되며, HTTP/2 의 multiplexing 덕분에 하나의 TCP 연결 위에서 여러 RPC call 을 동시에 처리할 수 있다.

### WebSocket Server in Go

***WebSocket*** 은 HTTP Upgrade handshake 를 통해 설정되는 양방향 전이중(full-duplex) 통신 프로토콜이다.

```go
// nhooyr.io/websocket 사용 예제
import "nhooyr.io/websocket"

func wsHandler(w http.ResponseWriter, r *http.Request) {
    conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
        OriginPatterns: []string{"*"},
    })
    if err != nil {
        log.Println("accept error:", err)
        return
    }
    defer conn.Close(websocket.StatusNormalClosure, "")

    ctx := r.Context()

    for {
        msgType, data, err := conn.Read(ctx)
        if err != nil {
            log.Println("read error:", err)
            return
        }

        if err := conn.Write(ctx, msgType, data); err != nil {
            log.Println("write error:", err)
            return
        }
    }
}
```

WebSocket 연결은 goroutine-per-connection 모델로 처리된다. 각 WebSocket 연결에 대해 읽기와 쓰기를 담당하는 goroutine 을 분리하는 패턴이 일반적이다:

```go
func handleWS(conn *websocket.Conn) {
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    outgoing := make(chan []byte, 256)

    // 쓰기 goroutine
    go func() {
        defer cancel()
        for {
            select {
            case msg := <-outgoing:
                if err := conn.Write(ctx, websocket.MessageText, msg); err != nil {
                    return
                }
            case <-ctx.Done():
                return
            }
        }
    }()

    // 읽기 loop (현재 goroutine)
    for {
        _, data, err := conn.Read(ctx)
        if err != nil {
            return
        }
        outgoing <- processMessage(data)
    }
}
```

### High Performance Server Architecture

#### Goroutine-per-Connection: Pros and Cons

__장점__:
- 코드가 직관적이고 디버깅이 용이하다 (동기적 코드 스타일)
- goroutine 이 가볍기 때문에 수만 개의 동시 연결을 처리할 수 있다
- Go runtime 의 netpoll 이 비동기 I/O 를 추상화한다

__단점__:
- 연결당 goroutine 이므로, 매우 많은 동시 연결(수십만 이상)에서는 goroutine 수가 과도해질 수 있다
- 각 goroutine 의 stack 이 grow 할 수 있으므로 메모리 사용량이 예측하기 어렵다
- 유휴 연결이 많은 경우 goroutine 자원이 낭비된다

#### Connection Pooling

데이터베이스, Redis 등 외부 서비스와의 연결은 ***connection pool*** 로 관리해야 한다. 매 요청마다 연결을 생성/해제하면 TCP handshake 비용과 리소스 낭비가 발생한다.

```go
// database/sql 의 connection pool 설정
db, err := sql.Open("postgres", connStr)
if err != nil {
    log.Fatal(err)
}
db.SetMaxOpenConns(25)                // 최대 동시 연결 수
db.SetMaxIdleConns(10)                // 최대 유휴 연결 수
db.SetConnMaxLifetime(5 * time.Minute) // 연결 최대 수명
```

#### Rate Limiting

```go
// golang.org/x/time/rate 사용
var limiter = rate.NewLimiter(rate.Every(time.Second/100), 10) // 초당 100 요청, burst 10

func rateLimitedHandler(w http.ResponseWriter, r *http.Request) {
    if !limiter.Allow() {
        http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
        return
    }
    // 실제 요청 처리
}
```

#### Graceful Shutdown

서버 종료 시 진행 중인 요청을 완료한 후 종료해야 한다:

```go
func main() {
    srv := &http.Server{Addr: ":8080", Handler: mux}

    go func() {
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatalf("ListenAndServe: %v", err)
        }
    }()

    // OS signal 대기
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("Server Shutdown: %v", err)
    }
    log.Println("Server stopped gracefully")
}
```

`srv.Shutdown(ctx)` 는 새로운 연결을 거부하고, 기존 연결의 요청이 완료되거나 context 가 만료될 때까지 대기한다.

## Garbage Collection and Performance

### Go GC Algorithm

Go 는 ***Tri-color Mark and Sweep*** 알고리즘을 사용하는 ***concurrent garbage collector*** 를 가지고 있다.

#### Tri-color Mark and Sweep

GC 는 객체를 세 가지 색으로 분류한다:

- ***White***: 아직 방문하지 않은 객체 (GC 후 회수 대상)
- ***Gray***: 방문했지만, 참조하는 객체를 아직 모두 확인하지 않은 객체
- ***Black***: 방문 완료되고, 참조하는 모든 객체도 확인된 객체 (유지)

```
  [1] 초기: 모든 객체가 White

  [2] Root 에서 시작: root 에서 직접 참조하는 객체를 Gray 로 표시
      Roots: goroutine stacks, global variables, registers

  [3] Mark Phase:
      Gray 큐에서 객체를 꺼냄 → 참조하는 객체를 Gray 로 표시 → 자신은 Black
      Gray 큐가 빌 때까지 반복

  [4] Sweep Phase:
      White 로 남은 객체를 회수 (unreachable)
```

#### Concurrent GC

Go GC 의 핵심은 ***STW(Stop-The-World) 시간을 최소화*** 하는 것이다. GC 의 대부분의 작업(marking)은 application goroutine 과 ***동시에(concurrently)*** 수행된다.

STW 가 발생하는 시점:
1. ***Mark Setup***: GC 시작 시 write barrier 활성화 (~수십 μs)
2. ***Mark Termination***: marking 완료 확인 (~수십 μs)

이 두 단계를 제외한 나머지 marking 과 sweeping 은 application 과 동시에 수행된다.

#### Write Barrier

concurrent GC 에서는 application 이 GC 와 동시에 포인터를 수정할 수 있다. ***Write Barrier*** 는 이 문제를 해결한다. 포인터가 수정될 때 write barrier 가 개입하여 GC 에 변경 사항을 알린다.

Go 는 ***hybrid write barrier*** (Go 1.8+)를 사용한다. 이는 Dijkstra 의 insertion barrier 와 Yuasa 의 deletion barrier 를 결합한 것으로, stack 에 대한 re-scan 을 불필요하게 만들어 STW 시간을 줄였다.

#### GC Tuning (GOGC)

***GOGC*** 환경 변수는 GC 트리거 비율을 제어한다. 기본값은 `100` 으로, heap 이 이전 GC 후 크기의 100%(즉 2배) 에 도달하면 GC 가 트리거된다.

```bash
# heap 이 이전 GC 후의 50% 증가 시 GC 트리거 (더 자주)
GOGC=50 ./myapp

# heap 이 이전 GC 후의 200% 증가 시 GC 트리거 (더 적게)
GOGC=200 ./myapp

# GC 비활성화 (memory-critical application 에서만)
GOGC=off ./myapp
```

Go 1.19 부터 ***GOMEMLIMIT*** 이 도입되었다. 이는 Go runtime 이 사용하는 총 메모리의 soft limit 을 설정한다. `GOGC=off` 와 `GOMEMLIMIT` 을 함께 사용하면, 메모리 사용량이 limit 에 근접할 때만 GC 가 수행되어 GC overhead 를 최소화할 수 있다.

### Memory Optimization

#### Escape Analysis

Go 컴파일러는 ***escape analysis*** 를 통해 변수를 stack 에 할당할지 heap 에 할당할지 결정한다.

```go
// stack 에 할당됨 (함수 내에서만 사용)
func stackAlloc() int {
    x := 42
    return x
}

// heap 에 할당됨 (포인터가 함수 밖으로 escape)
func heapAlloc() *int {
    x := 42
    return &x // x 의 주소가 함수 밖으로 반환 → heap escape
}
```

escape analysis 결과를 확인하는 방법:

```bash
go build -gcflags="-m" ./...
# ./main.go:10:2: moved to heap: x
```

__Stack 할당이 선호되는 이유__:
- stack 은 goroutine 종료 시 자동으로 해제된다 (GC 불필요)
- stack 접근은 CPU cache 친화적이다
- stack 할당/해제는 SP(stack pointer)만 이동시키면 되므로 O(1) 이다

#### sync.Pool

***sync.Pool*** 은 임시 객체를 재사용하여 GC 압력을 줄이는 메커니즘이다.

```go
var bufPool = sync.Pool{
    New: func() any {
        return new(bytes.Buffer)
    },
}

func processRequest(data []byte) {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufPool.Put(buf) // pool 에 반환
    }()

    buf.Write(data)
    // buf 사용
}
```

`sync.Pool` 의 객체는 GC cycle 마다 초기화될 수 있으므로, 장기 캐시로 사용해서는 안 된다. 빈번하게 생성/해제되는 임시 객체(buffer, 중간 결과 구조체 등)에 적합하다.

### Benchmarking

Go 의 `testing` 패키지는 벤치마크를 위한 `testing.B` 를 제공한다.

```go
// fib_test.go
func BenchmarkFib10(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Fib(10)
    }
}

// 메모리 할당 벤치마크
func BenchmarkConcat(b *testing.B) {
    b.ReportAllocs() // 메모리 할당 통계 출력
    for i := 0; i < b.N; i++ {
        s := ""
        for j := 0; j < 100; j++ {
            s += "a"
        }
    }
}

// Sub-benchmarks: in-place 변경이 있는 경우 매 iteration 마다 데이터를 복사해야 한다
func BenchmarkSort(b *testing.B) {
    sizes := []int{100, 1000, 10000}
    for _, size := range sizes {
        b.Run(fmt.Sprintf("size=%d", size), func(b *testing.B) {
            data := generateData(size)
            b.ResetTimer()
            for i := 0; i < b.N; i++ {
                b.StopTimer()
                d := make([]int, len(data))
                copy(d, data)
                b.StartTimer()
                sort.Ints(d) // 복사본을 정렬해야 매 iteration 동일한 조건
            }
        })
    }
}
```

```bash
# 벤치마크 실행
go test -bench=. -benchmem ./...

# 특정 벤치마크만 실행
go test -bench=BenchmarkFib10 -count=5 ./...

# CPU profile 과 함께 벤치마크
go test -bench=. -cpuprofile=cpu.prof ./...
go tool pprof cpu.prof
```

__benchstat__ 으로 벤치마크 결과를 통계적으로 비교할 수 있다:

```bash
# 변경 전 벤치마크
go test -bench=. -count=10 ./... > old.txt

# 코드 변경 후 벤치마크
go test -bench=. -count=10 ./... > new.txt

# 비교
benchstat old.txt new.txt
```

benchstat 은 p-value 를 계산하여 성능 차이가 통계적으로 유의미한지 판단해준다. 벤치마크는 반드시 여러 번(`-count=N`) 실행하여 통계적으로 의미 있는 결과를 얻어야 한다.

## SOLID Principles in Go

Go 의 언어 설계 자체가 SOLID 원칙을 자연스럽게 유도한다. 특히 implicit interface 와 composition 기반 설계는, 클래스 기반 OOP 에서 의식적으로 노력해야 하는 SOLID 패턴을 Go 에서는 관용적(idiomatic)으로 만든다.

### Single Responsibility Principle

> 모듈은 변경의 이유가 하나만 있어야 한다.

Go 에서 SRP 는 두 가지 차원에서 적용된다.

__1. 작은 interface__:

Go 의 표준 라이브러리는 1~2개의 메서드를 가진 작은 interface 를 선호한다. `io.Reader`, `io.Writer`, `fmt.Stringer` 가 대표적이다. 각 interface 는 단 하나의 책임만 기술한다.

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}
```

__2. 패키지 단위 책임 분리__:

Go 는 패키지가 모듈의 기본 단위이다. 하나의 패키지는 하나의 책임을 져야 한다.

```
// 좋은 구조: 패키지별 단일 책임
auth/           → 인증 로직
user/           → 사용자 도메인
notification/   → 알림 발송

// 나쁜 구조: 하나의 패키지에 여러 책임
utils/          → 이것저것 모아놓은 패키지
helpers/        → 범용 유틸리티 (무엇의 helper 인지 불분명)
```

### Open/Closed Principle

> 확장에는 열려 있고, 수정에는 닫혀 있어야 한다.

Go 에서는 interface 를 통해 기존 코드를 수정하지 않고 동작을 확장한다.

```go
type Notifier interface {
    Notify(message string) error
}

type EmailNotifier struct {
    address string
}

func (e *EmailNotifier) Notify(message string) error {
    fmt.Printf("Email to %s: %s\n", e.address, message)
    return nil
}

type SlackNotifier struct {
    webhookURL string
}

func (s *SlackNotifier) Notify(message string) error {
    fmt.Printf("Slack to %s: %s\n", s.webhookURL, message)
    return nil
}

// 새로운 알림 수단이 추가되어도 이 함수는 수정할 필요 없다
func SendAlert(n Notifier, msg string) error {
    return n.Notify(msg)
}
```

<mark><em><strong>implicit interface 가 OCP 를 극대화한다 — 확장의 방향이 기존 코드로부터 완전히 디커플링된다.</strong></em></mark>

### Liskov Substitution Principle

> 부모 타입의 자리에 자식 타입을 넣어도 프로그램의 정확성이 유지되어야 한다.

Go 에는 상속이 없으므로, LSP 는 ***interface satisfaction*** 의 관점에서 적용된다. interface 를 만족하는 모든 타입은 해당 interface 를 기대하는 곳에서 교체 가능해야 한다. 이는 ***behavioral contract*** 의 문제이다.

```go
type Storage interface {
    Save(key string, value []byte) error
    Load(key string) ([]byte, error)
}

// MemoryStorage 와 DiskStorage 는 모두 Storage 를 만족한다
// 어디서 Storage 를 사용하든, 두 구현체 모두 동일한 동작 계약을 지켜야 한다
```

LSP 위반의 전형적 예시: `Save` 를 호출했는데 특정 구현체에서만 조용히 무시하거나, `Load` 에서 기대와 다른 에러 타입을 반환하는 경우이다. Go 의 interface 는 메서드 시그니처만 강제하므로, behavioral contract 는 개발자의 책임이다.

### Interface Segregation Principle

> 클라이언트가 사용하지 않는 메서드에 의존하면 안 된다.

Go 는 언어 철학 자체가 ISP 를 체현한다. Go Proverb 에 "***The bigger the interface, the weaker the abstraction***" 이라는 격언이 있다.

```go
// 나쁜 설계: 거대한 interface
type Repository interface {
    FindByID(id string) (*User, error)
    FindAll() ([]*User, error)
    Save(user *User) error
    Delete(id string) error
    Count() (int, error)
    FindByEmail(email string) (*User, error)
    UpdatePassword(id string, pw string) error
}

// 좋은 설계: 역할별로 분리
type UserReader interface {
    FindByID(id string) (*User, error)
}

type UserWriter interface {
    Save(user *User) error
}
```

Go 에서는 필요한 메서드만 interface 로 선언하면 된다. `io.Reader` 만 필요하면 `io.Reader` 만 받고, `io.ReadWriter` 가 필요하면 그때 사용하면 된다.

### Dependency Inversion Principle

> 고수준 모듈은 저수준 모듈에 의존하면 안 된다. 둘 다 추상화에 의존해야 한다.

Go 에서 DIP 는 interface 를 통한 의존성 역전과 ***constructor injection*** 패턴으로 구현된다.

```go
// Port (interface) 정의 — 고수준에서 정의
type OrderRepository interface {
    Save(order *Order) error
    FindByID(id string) (*Order, error)
}

// 고수준 모듈: 비즈니스 로직
type OrderService struct {
    repo OrderRepository  // interface 에 의존
}

// Constructor injection
func NewOrderService(repo OrderRepository) *OrderService {
    return &OrderService{repo: repo}
}
```

```
[ 의존성 방향 ]

OrderService  ──→  OrderRepository (interface)
                        ↑
PostgresOrderRepository ┘  (구현)

고수준(비즈니스 로직)과 저수준(DB 접근) 모두 추상화(interface)에 의존한다.
```

Java 에서는 Spring 같은 DI 프레임워크가 필요하지만, Go 에서는 constructor 에 interface 를 전달하는 것만으로 충분하다. 프레임워크 없이도 DIP 를 간결하게 달성할 수 있다.

## Hexagonal Architecture in Go

***Hexagonal Architecture*** (또는 ***Ports and Adapters***) 는 Alistair Cockburn 이 제안한 아키텍처 패턴이다. 핵심 비즈니스 로직을 외부 세계(DB, HTTP, 메시지 큐 등)로부터 격리하는 것이 목표이다. Go 의 implicit interface 는 이 아키텍처를 구현하는 데 이상적인 도구이다.

### Layered Architecture vs Hexagonal Architecture

__전통적 Layered Architecture 의 문제점__:

```
┌──────────────────────────┐
│     Presentation Layer   │
├──────────────────────────┤
│     Business Logic Layer │
├──────────────────────────┤
│     Data Access Layer    │
├──────────────────────────┤
│     Database             │
└──────────────────────────┘
         ↓ 의존성 방향 (위에서 아래로)
```

Layered Architecture 에서는 의존성이 위에서 아래로 흐른다. Business Logic Layer 가 Data Access Layer 에 직접 의존하게 되어, DB 교체나 테스트 시 비즈니스 로직까지 영향을 받는다.

__Hexagonal Architecture 의 핵심 아이디어__:

```
                    ┌─────────────────────────────────────────┐
                    │            Adapter (HTTP)                │
                    │  (REST Handler, gRPC Server)            │
                    └─────────┬───────────────────────────────┘
                              │ calls
                              ▼
                    ┌───────────────────┐
                    │   Inbound Port    │
                    │   (Use Case IF)   │
                    └────────┬──────────┘
                             │ implements
                             ▼
        ┌────────────────────────────────────────┐
        │              Domain Core               │
        │                                        │
        │   - Entities                           │
        │   - Value Objects                      │
        │   - Business Rules                     │
        │   - Use Case (Service) Implementation  │
        │                                        │
        └────────────────────┬───────────────────┘
                             │ depends on
                             ▼
                    ┌───────────────────┐
                    │   Outbound Port   │
                    │  (Repository IF)  │
                    └────────┬──────────┘
                             │ implements
                             ▼
                    ┌─────────────────────────────────────────┐
                    │          Adapter (Infrastructure)        │
                    │  (PostgreSQL, Redis, External API)       │
                    └─────────────────────────────────────────┘
```

<mark><em><strong>Hexagonal Architecture 의 핵심 규칙: 의존성은 항상 바깥에서 안쪽으로 향한다. Domain Core 는 어떤 외부 기술에도 의존하지 않는다.</strong></em></mark>

### Domain / Port / Adapter Structure

__Domain Layer__ — 순수 비즈니스 로직:

```go
// domain/order.go
package domain

import (
    "errors"
    "time"
)

type OrderStatus string

const (
    OrderStatusPending   OrderStatus = "pending"
    OrderStatusConfirmed OrderStatus = "confirmed"
    OrderStatusShipped   OrderStatus = "shipped"
    OrderStatusCancelled OrderStatus = "cancelled"
)

type Order struct {
    ID         string
    CustomerID string
    Items      []OrderItem
    Status     OrderStatus
    TotalPrice int
    CreatedAt  time.Time
}

type OrderItem struct {
    ProductID string
    Name      string
    Price     int
    Quantity  int
}

func (o *Order) CalculateTotal() {
    total := 0
    for _, item := range o.Items {
        total += item.Price * item.Quantity
    }
    o.TotalPrice = total
}

func (o *Order) Cancel() error {
    if o.Status == OrderStatusShipped {
        return ErrCannotCancelShippedOrder
    }
    o.Status = OrderStatusCancelled
    return nil
}

var (
    ErrCannotCancelShippedOrder = errors.New("cannot cancel shipped order")
    ErrNotFound                 = errors.New("not found")
)
```

Domain Layer 에는 `database/sql`, `net/http` 같은 외부 의존성이 없다. 순수한 Go 코드와 비즈니스 규칙만 존재한다.

__Port__ — Interface 정의:

```go
// port/inbound.go
package port

import "myapp/domain"

type OrderUseCase interface {
    PlaceOrder(customerID string, items []domain.OrderItem) (*domain.Order, error)
    CancelOrder(orderID string) error
    GetOrder(orderID string) (*domain.Order, error)
}
```

```go
// port/outbound.go
package port

import "myapp/domain"

type OrderRepository interface {
    Save(order *domain.Order) error
    FindByID(id string) (*domain.Order, error)
    Update(order *domain.Order) error
}

type PaymentGateway interface {
    Charge(customerID string, amount int) (transactionID string, err error)
    Refund(transactionID string) error
}
```

__의존성 규칙__:

```
Domain   → 아무것에도 의존하지 않는다
Port     → Domain 에만 의존한다
Adapter  → Port 와 Domain 에 의존한다
```

### Interface as Port

Go 의 interface 가 Port 로 적합한 이유:

1. ***Implicit implementation*** — Adapter 가 Port interface 를 import 할 필요 없다
2. ***Small interface*** — 필요한 메서드만 Port 로 정의 (ISP 자연 준수)
3. ***Consumer-side definition*** — Port 를 사용하는 측(Domain)에서 필요한 interface 를 정의

__Inbound Port (Use Case) 구현__:

```go
// service/order_service.go
package service

import (
    "fmt"
    "time"

    "myapp/domain"
    "myapp/port"

    "github.com/google/uuid"
)

type OrderService struct {
    repo    port.OrderRepository
    payment port.PaymentGateway
}

func NewOrderService(repo port.OrderRepository, payment port.PaymentGateway) *OrderService {
    return &OrderService{repo: repo, payment: payment}
}

func (s *OrderService) PlaceOrder(customerID string, items []domain.OrderItem) (*domain.Order, error) {
    order := &domain.Order{
        ID:         uuid.New().String(),
        CustomerID: customerID,
        Items:      items,
        Status:     domain.OrderStatusPending,
        CreatedAt:  time.Now(),
    }
    order.CalculateTotal()

    _, err := s.payment.Charge(customerID, order.TotalPrice)
    if err != nil {
        return nil, fmt.Errorf("charge payment: %w", err)
    }

    order.Status = domain.OrderStatusConfirmed

    if err := s.repo.Save(order); err != nil {
        return nil, fmt.Errorf("save order: %w", err)
    }

    return order, nil
}

func (s *OrderService) CancelOrder(orderID string) error {
    order, err := s.repo.FindByID(orderID)
    if err != nil {
        return fmt.Errorf("find order: %w", err)
    }
    if err := order.Cancel(); err != nil {
        return err
    }
    return s.repo.Update(order)
}

func (s *OrderService) GetOrder(orderID string) (*domain.Order, error) {
    return s.repo.FindByID(orderID)
}
```

### Test Structure

Port 를 mock 으로 대체하면, 외부 의존성 없이 비즈니스 로직을 테스트할 수 있다.

```go
// service/order_service_test.go
package service_test

import (
    "myapp/domain"
    "myapp/service"
    "testing"
)

// Mock 구현체
type mockOrderRepo struct {
    orders map[string]*domain.Order
}

func newMockOrderRepo() *mockOrderRepo {
    return &mockOrderRepo{orders: make(map[string]*domain.Order)}
}

func (m *mockOrderRepo) Save(order *domain.Order) error {
    m.orders[order.ID] = order
    return nil
}

func (m *mockOrderRepo) FindByID(id string) (*domain.Order, error) {
    order, ok := m.orders[id]
    if !ok {
        return nil, domain.ErrNotFound
    }
    return order, nil
}

func (m *mockOrderRepo) Update(order *domain.Order) error {
    m.orders[order.ID] = order
    return nil
}

type mockPayment struct{ shouldFail bool }

func (m *mockPayment) Charge(customerID string, amount int) (string, error) {
    if m.shouldFail {
        return "", fmt.Errorf("payment failed")
    }
    return "txn-mock-123", nil
}

func (m *mockPayment) Refund(transactionID string) error { return nil }

func TestPlaceOrder_Success(t *testing.T) {
    repo := newMockOrderRepo()
    payment := &mockPayment{}
    svc := service.NewOrderService(repo, payment)

    items := []domain.OrderItem{
        {ProductID: "p1", Name: "Widget", Price: 1000, Quantity: 2},
    }

    order, err := svc.PlaceOrder("customer-1", items)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }

    if order.Status != domain.OrderStatusConfirmed {
        t.Errorf("expected status %s, got %s", domain.OrderStatusConfirmed, order.Status)
    }

    if order.TotalPrice != 2000 {
        t.Errorf("expected total 2000, got %d", order.TotalPrice)
    }
}
```

### Project Directory Structure Example

```
myapp/
├── cmd/
│   └── server/
│       └── main.go              # 진입점, 의존성 조립 (wire-up)
│
├── domain/                       # Domain Core (순수 비즈니스 로직)
│   ├── order.go                  # Entity, Value Object, 비즈니스 규칙
│   ├── customer.go
│   └── errors.go                 # 도메인 에러 정의
│
├── port/                         # Port (Interface 정의)
│   ├── inbound.go                # Use Case interface (OrderUseCase)
│   └── outbound.go               # Repository, External API interface
│
├── service/                      # Use Case 구현 (Inbound Port 구현체)
│   ├── order_service.go
│   └── order_service_test.go     # 단위 테스트
│
├── adapter/
│   ├── inbound/                  # Inbound Adapter (외부 → 도메인)
│   │   ├── http/
│   │   │   ├── handler.go        # REST API handler
│   │   │   ├── router.go         # 라우팅 설정
│   │   │   └── dto.go            # Request/Response DTO
│   │   └── grpc/
│   │       └── server.go         # gRPC server
│   │
│   └── outbound/                 # Outbound Adapter (도메인 → 외부)
│       ├── postgres_order_repository.go
│       ├── redis_cache.go
│       └── stripe_payment_gateway.go
│
├── test/
│   ├── mock/                     # Mock 구현체
│   └── integration/              # 통합 테스트
│
├── go.mod
└── go.sum
```

| 디렉토리 | 역할 | 의존성 |
|----------|------|--------|
| `domain/` | Entity, Value Object, 비즈니스 규칙 | 없음 (순수 Go) |
| `port/` | 경계 Interface 정의 | `domain/` 만 |
| `service/` | Use Case 구현 (비즈니스 오케스트레이션) | `domain/`, `port/` |
| `adapter/inbound/` | HTTP, gRPC 등 외부 요청 수신 | `port/`, `domain/` |
| `adapter/outbound/` | DB, 외부 API 등 외부 시스템 접근 | `port/`, `domain/` |
| `cmd/` | 진입점, 의존성 조립 | 모든 패키지 (조립만) |

## Build System and Toolchain

### Compilation and Linking

Go 는 ***Compiled Language*** 이다. `go build` 명령은 소스 코드를 ***정적 링크된 단일 바이너리(statically linked single binary)*** 로 컴파일한다. 이는 C/C++ 처럼 별도의 런타임 설치가 필요 없다는 것을 의미한다.

```
Source (.go files)
       ↓
  [1] Parsing (AST 생성)
       ↓
  [2] Type Checking
       ↓
  [3] SSA (Static Single Assignment) IR 생성
       ↓
  [4] SSA Optimization Passes
       ↓
  [5] Machine Code Generation (architecture-specific)
       ↓
  [6] Linking (runtime + packages → single binary)
       ↓
  Final Binary (ELF / Mach-O / PE)
```

__Step 1-2__: Go compiler(`cmd/compile`)가 소스 파일을 파싱하여 AST(Abstract Syntax Tree)를 생성하고, type checking 을 수행한다.

__Step 3-4__: AST 를 SSA(Static Single Assignment) 형태의 중간 표현(IR)으로 변환한 뒤, dead code elimination, inlining, escape analysis 등의 최적화 pass 를 수행한다.

__Step 5__: 타겟 아키텍처에 맞는 machine code 를 생성한다. Go 는 자체 어셈블러(`cmd/asm`)를 사용하며, GCC 나 LLVM 에 의존하지 않는다.

__Step 6__: linker(`cmd/link`)가 컴파일된 패키지 객체 파일들과 Go runtime 을 하나의 바이너리로 결합한다. 기본적으로 ***static linking*** 이 적용되므로, 생성된 바이너리는 외부 의존성 없이 독립적으로 실행 가능하다.

### go mod and Dependency Management

Go 1.11 부터 도입된 ***Go Modules*** 는 패키지 의존성 관리의 표준이다. `go.mod` 파일이 모듈의 루트 디렉토리에 위치하며, 모듈 경로와 의존성 버전을 선언한다.

```go
module github.com/example/myproject

go 1.22

require (
    github.com/gin-gonic/gin v1.9.1
    google.golang.org/grpc v1.60.0
)
```

`go.sum` 파일은 각 의존성의 ***cryptographic hash*** 를 저장하여 ***supply chain attack*** 을 방지한다.

***Minimum Version Selection(MVS)*** 는 Go 의 의존성 해석 알고리즘이다. 다른 언어의 패키지 매니저(npm, pip 등)가 SAT solver 를 사용하는 것과 달리, Go 는 요구 조건을 만족하는 가장 낮은 버전을 선택한다. 이는 결정론적(deterministic)이고 재현 가능한 빌드를 보장한다.

### Essential Commands

| 명령어 | 역할 |
|--------|------|
| `go mod init` | 새 모듈 초기화 |
| `go mod tidy` | 사용하지 않는 의존성 제거, 누락된 의존성 추가 |
| `go vet` | 정적 분석으로 의심스러운 코드 패턴 탐지 |
| `go fmt` | 표준 코드 포맷팅 적용 (gofmt) |
| `go test` | 테스트 실행 |
| `go test -race` | race detector 활성화하여 테스트 |
| `go generate` | 코드 생성 지시자(`//go:generate`) 실행 |
| `go build -gcflags="-m"` | escape analysis 결과 출력 |

### Cross-Compilation

Go 의 cross-compilation 은 환경 변수 `GOOS` 와 `GOARCH` 를 설정하는 것만으로 가능하다. 별도의 크로스 컴파일 툴체인 설치가 필요 없다.

```bash
# Linux AMD64 바이너리 생성 (macOS 에서)
GOOS=linux GOARCH=amd64 go build -o myapp-linux

# Windows ARM64 바이너리 생성
GOOS=windows GOARCH=arm64 go build -o myapp.exe

# 지원 플랫폼 목록 확인
go tool dist list
```

단, ***CGO*** 를 사용하는 경우(`CGO_ENABLED=1`) 에는 해당 타겟 플랫폼의 C 컴파일러가 필요하다. 순수 Go 코드만 사용하는 경우 `CGO_ENABLED=0` 으로 설정하면 완전한 정적 바이너리를 생성할 수 있다.

## Comparison with Java

Go 와 Java 는 모두 정적 타입 언어이지만, 철학과 접근 방식에서 근본적인 차이가 있다.

| 구분 | Go | Java |
|------|-----|------|
| **Type System** | Structural typing (구조 기반) | Nominal typing (이름 기반) |
| **상속** | 없음 (Composition only) | 클래스 상속 + interface 구현 |
| **Interface 구현** | Implicit (암묵적) | Explicit (`implements` 키워드) |
| **Error Handling** | Error as value (`if err != nil`) | Exception (try-catch-finally) |
| **Concurrency** | Goroutine + Channel (CSP 모델) | Thread + synchronized (공유 메모리) |
| **Memory Management** | Go GC (저지연, 단순) | JVM GC (다양한 GC 선택 가능) |
| **Build & Deployment** | Static binary (단일 실행 파일) | JVM 위에서 실행 (JAR/WAR) |
| **패키지 관리** | Go Modules (`go.mod`) | Maven / Gradle |
| **Generics** | Go 1.18+ (2022) | Java 5+ (2004, type erasure) |
| **Null Safety** | nil (zero value 개념) | null (NullPointerException 위험) |
| **함수** | First-class function | 메서드 중심 (람다는 Java 8+) |
| **바이너리 크기** | 수 MB (정적 링킹) | JRE 포함 시 수백 MB |
| **시작 시간** | 수 ms | 수 초 (JVM warm-up) |

__언제 Go 를 선택하는가__:
- 고성능 네트워크 서버, 마이크로서비스
- CLI 도구, DevOps 도구
- 컨테이너 환경 (작은 바이너리, 빠른 시작)
- 동시성이 핵심인 시스템
- 단순하고 유지보수 가능한 코드가 중요할 때

__언제 Java 를 선택하는가__:
- 대규모 엔터프라이즈 시스템 (Spring 생태계)
- Android 개발
- 풍부한 라이브러리/프레임워크가 필요할 때
- 복잡한 도메인 모델링 (클래스 계층 활용)
- 성숙한 ORM, 트랜잭션 관리가 필요할 때

두 언어는 경쟁 관계라기보다 상호 보완적이다. 현대의 많은 시스템에서 Java 기반 백엔드와 Go 기반 인프라 도구가 공존한다. Kubernetes, Docker, Terraform 등 인프라 도구는 Go 로 작성되고, 그 위에서 실행되는 비즈니스 애플리케이션은 Java/Spring 으로 작성되는 조합이 대표적이다.

## Links

- [Effective Go](https://go.dev/doc/effective_go)
- [Go Proverbs](https://go-proverbs.github.io/)
- [The Go Memory Model](https://go.dev/ref/mem)
- [Go Concurrency Patterns: Pipelines and cancellation](https://go.dev/blog/pipelines)
- [Go Concurrency Patterns: Context](https://go.dev/blog/context)
- [Share by communicating](https://go.dev/blog/codelab-share)
- [Mechanical Sympathy](https://mechanical-sympathy.blogspot.com/2011/09/single-writer-principle.html)
- [Understanding Real-World Concurrency Bugs in Go](https://songlh.github.io/paper/go-study.pdf)
- [Coroutines for Go](https://research.swtch.com/coro)
- [Code Review: Go Concurrency](https://github.com/golang/go/wiki/CodeReviewConcurrency)

## References

- Concurrency in Go / Katherine Cox-Buday / O'REILLY
- The Go Programming Language / Alan Donovan, Brian Kernighan / Addison-Wesley
- [Effective Go](https://go.dev/doc/effective_go) / Go Team
