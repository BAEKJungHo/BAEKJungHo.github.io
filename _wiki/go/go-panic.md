---
layout  : wiki
title   : Panic
summary : 
date    : 2023-10-20 12:54:32 +0900
updated : 2023-10-20 13:15:24 +0900
tag     : go
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Panic

__[Panic](https://gobyexample.com/panic)__ means something went unexpectedly wrong. Mostly we use it to fail fast on errors that shouldn’t occur during normal operation, or that we aren’t prepared to handle gracefully.

```go
func main() {
    _, err := config.LoadFile("../conf/dev.yaml")
    if err != nil {
        panic(err)
    }

    // When first panic in main fires, the program exits without reaching the rest of the code.
    // Somethings
}
```

__[Recover, Defer](https://gobyexample.com/defer)__ 를 사용하여 Panic 을 복구 시킬 수 있다. __panic 을 catch 하고 프로그램을 재개__ 하는 거라고 이해하면 도움이 된다.

```go
package main

import "fmt"

func main() {
    f()
    fmt.Println("Returned normally from f.")
}

func f() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered in f", r)
        }
    }()
    fmt.Println("Calling g.")
    g(0)
    fmt.Println("Returned normally from g.")
}

func g(i int) {
    if i > 3 {
        fmt.Println("Panicking!")
        panic(fmt.Sprintf("%v", i))
    }
    defer fmt.Println("Defer in g", i)
    fmt.Println("Printing in g", i)
    g(i + 1)
}
```

__Output__:

```
Calling g.
Printing in g 0
Printing in g 1
Printing in g 2
Printing in g 3
Panicking!
Defer in g 3
Defer in g 2
Defer in g 1
Defer in g 0
Recovered in f 4
Returned normally from f.
```