---
layout  : wiki
title   : Concurrency
summary : Concurrency Issue
date    : 2022-04-17 00:02:32 +0900
updated : 2022-04-17 00:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## 동시성 이슈란?

동시성 이슈란 여러 스레드가 동시에 같은 인스턴스의 필드 값을 `변경`하면서 발생하는 문제를 의미합니다. 핵심은 멀티 스레드와 변경 입니다.

이번 주제는 내용이 많습니다 :) 

![]( /resource/wiki/spring-concurrency/events.png)

## WAS 와 멀티 스레드

Tomcat 과 같은 서블릿을 지원하는 WAS 는 `Servlet Container` 이며, 멀티 스레드와 관련된 처리를 지원합니다. 따라서, 개발자는 멀티 스레드 관련 코드를 신경 쓰지 않고, Single Thread Programming 을 하듯 코드를 작성하면 됩니다.

하지만, 멀티 스레드 환경에서 주의 하면서 코딩해야하는 부분이 있는데 그 중 하나가 `동시성 이슈`에 관한 부분입니다.

## Singleton

스프링 Bean Scope 는 기본적으로 Singleton 입니다. 즉, 스프링 DI Container 당 하나의 인스턴스만 사용 됩니다.

```java
@Service
public class UserService {

    private UserId userId; // 상태 값

    public void createUser(User user) {
        // 여기서 userId 값을 변경하는 코드가 존재
    }
}
```

### 문제 : 위 코드는 올바르게 작성된 코드일까요?

- 싱글톤 객체를 사용할 때는 동시성 이슈가 발생하지 않도록 조심히 사용해야 합니다.
- 아래에서 계속 배워보겠습니다.

## 프로세스 메모리 영역

프로세스 메모리 영역은 크게 4가지로 구성되어 있습니다.

- Stack: 매개변수, 지역변수 등 임시적인 자료
- Heap: 동적으로 할당되는 메모리
- Data: 전역 변수
- Text: Program 의 코드

조금 더 디테일하게 들어가보면 아래와 같이 구성되어 있습니다.

- __Data__
  - BSS: 초기화되지 않은 데이터가 저장됨
  - GVAR: 초기화된 데이터가 저장됨

> Data 영역이 이렇게 두개로 분리된 이유는 초기화된 데이터는 초기화되지 않은 변수와 다르게, 해당 값을 프로그램에 저장하고 있어야 합니다. BSS 영역은 초기화되지 않은 데이터가 저장되기 때문에, 프로그램이 실행될때 영역만 차지하고 그 값을 프로그램에 저장하고 있을 필요가 없기 때문입니다.

## 스레드는 프로세스의 어떤 영역을 공유하지 않을까?

> 동시성 이슈를 이해하는데 중요한 포인트 입니다.

- WAS 는 요청당 하나의 스레드를 생성합니다. 그리고 스레드는 별도의 Stack 영역을 갖고 있으며, Stack 영역을 제외한 프로세스 메모리 영역을 공유합니다.
- 따라서, 싱글톤 객체에서 상태값을 갖도록 설계한다면, 해당 상태 값은 프로세스의 Data 영역에 들어갈테고, 모든 스레드가 공유하기 때문에 동시성 이슈가 발생할 수 있습니다.
- 동시성 이슈는 값을 읽기만 해서는 발생하지 않으며, 변경이 일어나야만 발생하는 문제입니다.

스레드는 별도의 Stack 영역을 갖기 때문에, 인스턴스를 갖도록 설계하지 않고 지역변수나, 매개변수등으로 객체를 넘겨서 사용하게 되면 적은 노력으로 동시성 이슈를 피할 수 있습니다.

## 싱글톤 객체에서 상태값을 갖도록 설계할 수 없을까?

싱글톤 객체를 만들면서 상태값을 갖도록 해야하는 경우가 있을 수 있습니다.

이러한 경우에는 `ThreadLocal` 을 활용하면 됩니다.

```java
@Service
public class UserService {

    private ThreadLocal<UserId> userIdStore = new ThreadLocal<>(); 

    public void createUser(User user) {
        userIdStore.set(user.createUserId());
        UserId userId = userIdStore.get();
    }
}
```

위 처럼 ThreadLocal 을 적용하여 사용하면, 각 쓰레드는 UserId 를 가져오기 위해 `자신만의 별도의 내부 저장소`에서 꺼내기 때문에 동시성 이슈로부터 안전합니다.

## ThreadLocal 을 사용할 때도 주의점이 있는데

ThreadLocal 사용 시, 주의해야하는 점이 있습니다. 바로 ThreadLocal 을 모두 사용하고 나면 `ThreadLocal.remove()` 를 호출해서 스레드 로컬에 저장된 값을 제거해주어야 합니다.

> ThreadLocal 은 Spring Security 의 SecurityContextHolder 에서 사용되는 전략 입니다.

만약, 제거하지 않으면 WAS 처럼 Thread Pool 을 사용하는 경우에 심각한 문제가 발생할 수 있습니다.

아래 시나리오를 보겠습니다.

### Scenario

- 사용자 A 가 회원가입 요청을 한다.
- WAS 는 Thread Pool 에서 놀고 있는 Thread-A 를 꺼내서 할당한다.
- Thread-A 가 사용자 A 의 데이터를 ThreadLocal 자신의 전용 보관소인 storage-a 에 저장한다.
- A 의 요청이 끝나고 사용했던 Thread-A 를 Thread Pool 에 반납한다.
  - Thread-A 가 제거되지 않았으므로, storage-a 도 살아있게 된다.
- B 사용자가 자신의 정보 조회 요청을 한다.
- WAS 가 다시 스레드를 할당하기 위해서 Thread Pool 에서 꺼내는데, (이때 어떤 스레드가 할당될 지는 모른다.) Thread-A 가 할당되었다.
- 따라서, B 사용자가 사용자 A 의 정보를 조회해서 볼 수 있게 된다.

이러한 이유 때문에 ThreadLocal 을 사용하면 꼭 remove 를 해줘야 합니다.

## Thread Safe 하게 설계하는 방법

- __java.util.concurrent 패키지 하위의 클래스사용하기__
  - Ex. ConcurrentHashMap 등
- __상태 값 두지 않기__
- __LazyHolder 방식의 Singleton 패턴을 사용__
  - 인스턴스가 1개만 생성되는 특징을 가진 싱글턴 패턴을 이용하면, 하나의 인스턴스를 메모리에 등록해서 여러 스레드가 동시에 해당 인스턴스를 공유하여 사용하게끔 할 수 있으므로, 요청이 많은 곳에서 사용하면 효율을 높일 수 있다.
  - 보통은 LazyHolder 방식을 주로 사용한다.
    - JVM 의 Class loader 매커니즘을 이용한 방법
- __동기화 블럭(synchronized) 지정__

여기까지 읽으셨다면 동시성 이슈와 이를 피하기 위한 방법에 대해서 감이 잡히셨을 것입니다. 👍 그러면 아래의 문제를 한번 읽어보고 풀어보시죠!

## Questions

> Q. 빈으로 등록된 서비스에서 하나의 파일을 공유하여 읽고 쓰는 경우 동시성 이슈가 발생할까?

- 빈(Bean)으로 등록되어있는 Service 에서 파일 쓰기 읽기 작업(writeAndRead())을 하는 메서드(파일을 먼저 쓰고 -> 읽는 작업을 수행 하는 메서드)를 제공하고 있으며,
- 여러 Thread 가 하나의 파일(Ex. file.txt)을 가지고 읽기 쓰기 작업을 수행 중이라고 할 때
  - 파일 쓰기 작업을 하기 위해서 Writer 객체의 write 를 사용
  - 읽기 작업은 Files.readAllLines 를 사용
- Thread 는 A, B, C 3개가 존재하며 각 스레드 이름별로 A, B, C 문자열을 파일에 기록하고 싶어함.
- 즉, Thread-A 는 문자열 A 가 적힌 파일을 원하며, Thread-B 는 문자열 B 가 적힌 파일을 원한다.

아래의 두 가지 질문에 대해서 답변을 해보세요 😁

1. 동시성 이슈가 발생할지, 발생하지 않을지에 대해서 이유를 설명하시오.
2. 읽기 작업에 대해서 일관성이 보장이 되는지, 되지 않는지에 대해서 이유를 설명하시오.

![]( /resource/wiki/spring-concurrency/doit.png)

아래의 코드와 저의 생각이 담긴 답변을 보기 전, 먼저 생각해보시는 것을 추천드립니다.

## Test Case 1: Writer 를 상태로 두고, 공유해서 사용하는 경우

저는 두 가지 케이스를 분리하여 테스트 하였습니다.

첫 번째는 Writer 를 상태로 두는 경우, 다른 하나는 매개변수로 넘겨서 파일을 쓰는 경우입니다. 아래의 코드들을 읽고 결과를 예측해 보세요.

### Server

```java
public class FileService {

    private final BufferedWriter writer;

    public FileService(BufferedWriter writer) throws Exception {
        this.writer = writer;
    }

    public void write(String contents) {
        File file = new File("D:\\file.txt");
        try {
            writer.write(contents);
            writer.flush();
            List<String> lines = Files.readAllLines(Paths.get("D:\\file.txt"));
            System.out.println(lines);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### Client

```java 
@Bean
public ApplicationRunner appRunner() throws Exception {
    // FileService 를 싱글톤 처럼 객체 하나를 생성한 다음, 각 스레드에서 공유하여 사용
    FileService fileService = new FileService(new BufferedWriter(new FileWriter("D:\\file.txt")));
    
    return args -> {
        Thread threadA = new Thread(() -> {
            try {
                System.out.println("A call");
                fileService.write("A");
                System.out.println("A End");
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        threadA.start();
        Thread threadB = new Thread(() -> {
            try {
                System.out.println("B call");
                fileService.write("B");
                System.out.println("B End");
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        threadB.start();
        Thread threadC = new Thread(() -> {
            try {
                System.out.println("C call");
                fileService.write("C");
                System.out.println("C End");
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        threadC.start();
    };
}
```

## Test Case 2: 별도의 Stack Area 로 사용하는 경우

### Server

```java
public class FileService {

    public void write(String contents, BufferedWriter writer) {
        File file = new File("D:\\file.txt");
        try {
            writer.write(contents);
            writer.flush();
            List<String> lines = Files.readAllLines(Paths.get("D:\\file.txt"));
            System.out.println(lines);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### Client

```java 
@Bean
public ApplicationRunner appRunner() throws Exception {
    FileService fileService = new FileService();
    return args -> {
        Thread threadA = new Thread(() -> {
            try {
                System.out.println("A call");
                fileService.write("A", new BufferedWriter(new FileWriter("D:\\file.txt")));
                System.out.println("A End");
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        threadA.start();
        Thread threadB = new Thread(() -> {
            try {
                System.out.println("B call");
                fileService.write("B", new BufferedWriter(new FileWriter("D:\\file.txt")));
                System.out.println("B End");
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        threadB.start();
        Thread threadC = new Thread(() -> {
            try {
                System.out.println("C call");
                fileService.write("C", new BufferedWriter(new FileWriter("D:\\file.txt")));
                System.out.println("C End");
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        threadC.start();
    };
}
```

## 해설

저는 먼저 쓰기와, 읽기 작업을 제공하는 메서드를 까봤습니다. write() 메서드의 경우 내부에적으로 synchronized lock 을 구현하고 있고, 읽기의 경우 별도로 lock 을 제공하고 있지 않습니다.

저희는 지금 까지 동시성 이슈를 피하기 위해서 가급적 상태를 갖도록 설계하면 안된다는 것과, 상태를 가지면 동시성 이슈가 발생할 수도 있다고 했습니다. 하지만 write() 메서 내부에서 synchronized lock 을
제공하고 있는데 그러면 동시성 이슈가 발생하지 않을까요?

![]( /resource/wiki/spring-concurrency/giphy.gif)

### Case 1

- Client 의 Thread-A 입장에서는 파일을 쓰고 읽을때, A 가 찍히길 기대할테지만 원하는 읽기 일관성을 얻지 못한다.
  - 그 이유는 Files.readAllLines 에서는 `synchronized` 가 없으므로 읽기 일관성을 얻지 못한다.
- __Writer 를 상태로 관리하더라도 write 메서드에서는 synchronized lock 을 제공하고 있기 때문에 동시성 이슈가 발생하지 않을 것만 같다.__
  - 이에 대한 답은 가장 마지막에 공유하겠습니다.
- 출력 결과는 Writer 를 공유하고 있어서 파일에는 작업이 먼저 끝난 Thread 순서대로 ABC, ACB 등의 문자열이 찍혀있을 것이다.

### Case 2

- __매개변수로 넘겨서 사용하면 각 스레드마다 별도의 Stack area 가 생기므로, 동시성 이슈가 발생하지 않을 것만 같다.__
- 출력 결과는 마지막에 작업이 끝난 Thread 를 기준으로 해당 문자열만 파일에 적혀있을 것이다.
- 읽기 일관성은 보장하지 못한다.
- __만약에 FileService 의 write 메서드에 synchronzied 를 적어주면 어떻게 될까?__
  - 동시성 이슈가 발생하지 않을 것만 같다.
  - 읽기 일관성이 보장이 된다.
  - 별도의 writer 객체를 사용하기 때문에, Thread A - C - B 순서대로 작업을 하게되면 마지막에 끝난 Thread-B 를 기준으로 해당 문자열만 파일에 적혀있다.

## 결론

> 지금 같은 문제처럼 실제로 코딩할 일은 거의 없을 것입니다. 하지만 동시성 이슈에 관한 생각을 조금 더 깊게 할 수 있는 좋은 예제라고 생각했습니다. 이 질문은 [OKKY](https://okky.kr/article/1182177?note=2718116)에 올라온 질문이며, 해당 질문에 답변을 해주다가 아티클까지 쓰게 되었습니다.

동시성 이슈는 상태 값을 변경하기 때문에 발생하는 것이라고 했습니다. 따라서 이 문제에서 `상태`를 어떤 것으로 볼 것이냐가 중요하다고 생각했으며, 저는 아래와 같이 생각했습니다.

__모든 스레드가 공유하고 있는 하나의 파일안의 내용을 인스턴스 필드 값(상태)이라고 가정하면__

Writer 객체를 메서드 내부에서 생성해서 쓰던, 필드로 관리하던, 파일을 쓰고/읽는 메서드를 호출하는 클라이언트의 입장에서는 동시성 이슈가 발생한 것처럼 보일 것입니다.

## Next

- [Concurrency resolution](https://baekjungho.github.io/wiki/spring/spring-concurrency-resolve/)

## Links

- [Process and Thread](https://github.com/NKLCWDT/cs/blob/main/Operating%20System/%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4%EC%99%80%20%EC%93%B0%EB%A0%88%EB%93%9C.md)
