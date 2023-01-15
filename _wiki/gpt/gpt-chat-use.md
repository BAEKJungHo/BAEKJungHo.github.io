---
layout  : wiki
title   : Generative Pre-trained Transformer
summary : ChatGPT
date    : 2023-01-12 15:54:32 +0900
updated : 2023-01-12 20:15:24 +0900
tag     : gpt
toc     : true
comment : true
public  : true
parent  : [[/gpt]]
latex   : true
---
* TOC
{:toc}

## ChatGPT

ChatGPT 는 OpenAI 가 개발한 프로토타입 대화형 인공지능 챗봇이다.

- [ChatGPT: Optimizing Language Models for Dialogue](https://openai.com/blog/chatgpt/)

사용 해본 결과... 정말 엄청나다.. 

"Dependency Injection 을 위해서 Reflection 을 사용한 자바 코드를 작성해줘" 이렇게 명령을 입력한 결과

```java
//An interface for the dependency
public interface MyDependency {
    void doSomething();
}

//A concrete implementation of the dependency
public class MyDependencyImpl implements MyDependency {
    public void doSomething() {
        System.out.println("I am doing something");
    }
}

//A class that uses the dependency
public class MyComponent {
    private MyDependency dependency;

    public MyComponent(MyDependency dependency) {
        this.dependency = dependency;
    }

    public void doWork() {
        dependency.doSomething();
    }
}

//A class that uses reflection to inject the dependency
public class MyComponentFactory {
    public static MyComponent create() {
        try {
            Class<?> dependencyClass = Class.forName("MyDependencyImpl");
            MyDependency dependency = (MyDependency) dependencyClass.newInstance();
            return new MyComponent(dependency);
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
            e.printStackTrace();
            return null;
        }
    }
}
```

You can then use the factory to create instances of MyComponent without having to know the implementation of the dependency:

```java
MyComponent myComponent = MyComponentFactory.create();
myComponent.doWork();
```

이런 코드와 답변들이 만들어진다.

이외에도 내가 작성한 코드에 대한 리팩토링도 가능하다.

## Links

- [ChatGPT](https://ko.wikipedia.org/wiki/ChatGPT)
- [ChatGPT scores 80% on SAT reading/writing with collective chain of thought](https://www.reddit.com/gallery/10bpzjb)
- [ChatGPT vs 구글 검색, 누가 이길까?](https://techneedle.com/archives/42660)
