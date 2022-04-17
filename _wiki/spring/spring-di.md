---
layout  : wiki
title   : Dependency Injection
summary : 
date    : 2022-04-17 15:05:32 +0900
updated : 2022-04-17 15:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

# Dependency Injection

## Inversion Of Control

IoC(Inversion Of Control)는 `제어의 역전`이라고 한다. 제어의 역전이란 __프로그램의 흐름을 직접 제어하는 것이 아니라 외부에서 관리하는 것__ 을 의미한다.

```java
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.stereotype.Controller;
import com.techvu.team.TeamService;

@RequiredArgsConstructor
@RequestMapping("/team")
@Controller
public class TeamController {
  
  /**
   * @Resource(name = "teamService")
   * private TeamService teamService;
   *
   * @Autowired
   * private TeamService teamService;
   */
  private final TeamService teamService;
  
  public String join(User user) {
    
    teamService.join(user);
  }
}
```

TeamController 는 teamService 에 어떤 구현체가 들어와서 의존성이 주입되는지 신경쓰지 않고 자신이 할 일을 할 뿐이다. 즉, 프로그램의 제어 흐름을 직접 제어하는 것이 아니라 외부에서 관리하는 것을 제어의 역전(IoC) 라고한다.

스프링은 `DI Container` 를 통해 의존 관계 주입과 관련된 프로그램의 제어 흐름 관리한다.

## DI(Dependency Injection)

의존 관계 주입(DI, Dependency Injection) 이란, 원어 그대로 해석하면 "`의존 관계를 주입한다`"라고 볼 수 있다.

의존 관계는 두 가지로 나누어 생각해야한다.

- __정적인 의존 관계__
    - import 문을 통해 알 수 있는 의존 관계
    - 컴파일 시점에 확인 가능한 의존 관계
- __동적인 의존 관계__
    - 런타임 시점에 확인 가능한 의존 관계
        - 런타임에 외부에서 실제 구현 객체를 생성하고 클라이언트에 전달해서 클라이언트와 서버의 실제 의존관계가 연결 되는 것을 의존관계 주입이라 한다.
            - 클라이언트 : TeamController
            - 서버 : TeamService
    - 의존 관계 주입을 사용하면, 클라이언트 코드를 변경하지 않고 클라이언트가 호출하는 대상(서버)의 타입 인스턴스를 변경할 수 있다.
    - 의존 관계 주입을 사용하면, 정적인 의존 관계를 변경하지 않고 클라이언트가 호출하는 대상(서버)의 타입 인스턴스를 변경할 수 있다.

위 코드를 다시 보자.

TeamController 에서 import 문을 통해 `정적인 의존 관계`를 확인할 수 있다. 하지만 동적인 의존 관계는 런타임 시점에 확인할 수 있다. 지금까지 설명한 내용을 보면
`관계(RelationShip)`라는 말이 많이 등장한다. 설명과 함께 코드를 다시 보면 __객체들은 서로 관계를 맺고, 의사소통을 하는 것을 알 수있다.__

이 말을 조금 더 OOP 스럽게 설명하면 __객체들은 서로 관계를 맺고, 메시지를 주고 받는다.__ 라고 표현할 수 있다.

> 메시지(Message)는 객체들이 서로 의사소통 하는 것을 의미한다.

DI 는 의존성 주입이라고도 많이 부르지만, OOP 관점으로 바라보면 `의존 관계`라는 말이 더 어울리는 것을 알 수 있다.

## DI Container

DI Container(IoC Container) 는 객체를 생성하고 의존 관계를 관리해주는 컨테이너이다. ObjectFactory 라고 부르기도 한다.

스프링에서는 `ApplicationContext` 라는 컨테이너가 존재한다. 얘가 바로 DI Container 라고 생각하면 된다.

ApplicationContext 는 Interface 이다. 따라서 다양한 구현체를 만들 수 있도록 되어있는데 크게 다음과 같다.

- __애노테이션 기반으로 스프링 컨테이너 만들기__
    - `AnnotationConfigApplicationContext`
- __XML 기반으로 스프링 컨테이너 만들기__
    - `GenericXmlApplicationContext`

빈으로 등록된 클래스들을 스프링 컨테이너가 관리한다. 애노테이션 기반 스프링 컨테이너를 사용하는 방법을 배워보자.

- __AppConfig__

```java
/**
 * AppConfig.java
 * 애플리케이션에 대한 전반적인 동작 방식(환경 설정)
 * 구현 객체 생성 담당 및 생성자를 통한 주입
 */
@Configuration
public class AppConfig {

    /**
     * @Bean 어노테이션은 name 속성을 따로 지정하지 않으면
     * Ex) @Bean(name="memberService2")
     * default 로 메서드명을 name 으로 지정한다.
     */
    @Bean
    public MemberService memberService() {
        return new MemberServiceImpl(memberRepository());
    }
}
```

- __스프링 컨테이너를 통해서 빈으로 등록된 객체 꺼내서 사용하기__

```java
// AppConfig 에 Bean 으로 등록되어있는 애들을 스프링 컨테이너에 넣어서 관리해준다.
// 스프링 컨테이너는 파라미터로 넘어온 설정 클래스 정보를 사용해서 스프링 빈을 등록한다.
ApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);
MemberService memberService = ac.getBean("memberService", MemberService.class); // memberService 는 Bean 으로 등록된 메서드 이름
```

스프링 컨테이너 구현체 `AnnotationConfigApplicationContext` 에서 파라미터로 `클래스 객체`를 받는 것을 볼 수 있다.

우리가 [Reflection](https://github.com/BAEKJungHo/deepdiveinreflection/blob/main/contents/03.%20Java%20Reflection.md) 에서 배웠듯이, 리플렉션의 시작은 클래스 객체로부터 시작된다고 배웠다.

즉, AnnotationConfigApplicationContext 내부에서는 `Class<AppConfig>` 클래스 객체를 사용하여 어노테이션 정보를 읽어서 빈들을 등록한다는 것을 알 수 있다.

세부적인 동작 과정을 살펴보자.

### Reflection 을 활용한 빈 등록 및 의존 관계 설정

- AppConfig.class 와 Reflection 을 사용하여 스프링 컨테이너에 빈들을 등록
- 스프링 컨테이너 내부에 있는 `스프링 빈 저장소`는 `Key, Value` 형태로 이루어져 있음
    - Ex. Key : 빈 이름(memberService), Value : 빈 객체(MemberService@x01)
- 빈들을 등록하고 나면, `의존 관계`를 설정한다.
    - 의존 관계 설정도 내부적으로 Reflection 을 활용한다.

## BeanFactory

우리가 일반적으로 스프링 컨테이너라고 부르는 ApplicationContext Interface 는 `BeanFactory Interface` 를 상속 받고 있다.

- __BeanFactory__
    - 스프링 컨테이너의 최상위 인터페이스이다.
    - 스프링 빈을 관리하고 조회하는 역할을 담당한다.
    - getBean() 을 제공한다.
- __ApplicationContext__
    - BeanFactory 기능을 모두 상속받아서 제공한다.
    - BeanFactory 에서 제공하는 기능 이외에도, 애플리케이션을 개발할 때 필요한 여러가지 부가기능을 제공한다.
    - 여러가지 부가기능
        - MessageSource 를 활용한 국제화 기능
            - 한국에서 들어오면 한국어로, 영어권에서 들어오면 영어로 출력
        - 환경 변수
            - 로컬, 개발, 운영등을 구분해서 처리
        - 애플리케이션 이벤트
            - 이벤트를 발행하고 구독하는 모델을 편리하게 지원
        - 편리한 리소스 조회
            - 파일, 클래스패스, 외부 등에서 리소스를 편리하게 조회

## BeanDefinition

실제로 리플렉션을 활용하여 빈을 등록할 때, `빈 설정 메타정보(BeanDefinition)`을 활용하여 이 메타정보를 기반으로 스프링 빈을 생성한다.

![](/resource/wiki/spring-di/beandefinition.png)

- ApplicationContext 는 여러 구현체가 있지만, BeanDefinition 이라는 추상회를 이용하기 때문에 어떤 코드로 작성된 것인지 몰라도 된다.
- `BeanClassName` : 생성할 빈의 클래스 명(자바 설정 처럼 팩토리 역할의 빈을 사용하면 없음)
- `factoryBeanName` : 팩토리 역할의 빈을 사용할 경우 이름. (Ex. appConfig)
- `factoryMethodName` : 빈을 생성할 팩토리 메서드 지정. (Ex. memberService)
- `Scope` : 싱글톤(기본값)
- `lazyInit` : 스프링 컨테이너를 생성할 때 빈을 생성하는 것이 아니라, 실제 빈을 사용할 때 까지 최대한 생성을 지연처리 하는지 여부
- `InitMethodName` : 빈을 생성하고, 의존 관계를 적용한 뒤에 호출되는 초기화 메서드 명
- `DestroyMethodName` : 빈의 생명주기가 끝나서 제거하기 직전에 호출되는 메서드 명
- `Constructor arguments, Properties` : 의존관계 주입에서 사용한다. (자바 설정 처럼 팩토리 역할의 빈을 사용하면 없음)

## 나만의 DI Container 만들기

DI 도 Reflection 을 통해 이루어진다.

```java
public class ContainerService2 {
  // 메서드로 넘겨주는 클래스 타입으로 리턴하기 위해서 제네릭 메서드 생성
  public static <T> T getObject(Class<T> classType) {
      T instance = createInstance(classType);
      Arrays.stream(classType.getDeclaredFields()).forEach(field -> {
          if(field.getAnnotation(Inject.class) != null) {
              Object fieldInstance = createInstance(field.getType());
              field.setAccessible(true); // 필드는 보통 private 으로 되어있어서(public 이면 안해줘도 된다.) accessible true 설정
              try {
                  field.set(instance, fieldInstance);
              } catch (IllegalAccessException e) {
                  throw new RuntimeException(e);
              }
          }
      });

      return instance;
  }

  private static <T> T createInstance(Class<T> classType) {
      try {
          return classType.getConstructor(null).newInstance();
      } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
          throw new RuntimeException(e);
      }
  }
}
```

## Links

- [Dependency Injection in Spring](https://dzone.com/articles/dependency-injection-in-spring)

## 참고 문헌

- 토비의 스프링 3 / 이일민 저 / 에이콘 출판사