---
layout  : wiki
title   : Unix Signal Handling
summary : 
date    : 2023-10-11 12:54:32 +0900
updated : 2023-10-11 13:15:24 +0900
tag     : go
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Unix Signal Handling

Go 에서 [Unix signal](https://en.wikipedia.org/wiki/Signal_(IPC)) 을 처리하기 위해선 [os/signal](https://pkg.go.dev/os/signal) package 를 사용해야 한다.

The signals SIGKILL and SIGSTOP may not be caught by a program, and therefore cannot be affected by this package.

__[Signals](https://mingrammer.com/gobyexample/signals/)__:
- SIGTERM 을 받았을 때 적절하게 서버를 종료하는 경우
- 커맨드라인 도구에서 SIGINT 를 받았을 때 프로세스를 멈추는 경우

__[Examples by Mochi MQTT](https://github.com/mochi-mqtt/server)__:

```go
func main() {
  // Create signals channel to run server until interrupted
  sigs := make(chan os.Signal, 1)
  done := make(chan bool, 1)
  signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
  go func() {
    <-sigs
    done <- true
  }()

  // Create the new MQTT Server.
  server := mqtt.New(nil)
  
  // Allow all connections.
  _ = server.AddHook(new(auth.AllowHook), nil)
  
  // Create a TCP listener on a standard port.
  tcp := listeners.NewTCP("t1", ":1883", nil)
  err := server.AddListener(tcp)
  if err != nil {
    log.Fatal(err)
  }
  

  go func() {
    err := server.Serve()
    if err != nil {
      log.Fatal(err)
    }
  }()

  // Run server until interrupted
  <-done

  // Cleanup
}
```