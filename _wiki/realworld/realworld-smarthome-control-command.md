---
layout  : wiki
title   : Smart Home Control Command APIs Designs with Sealed Interface
summary : Designing kotlinx serializable hierarchy
date    : 2024-02-28 20:54:32 +0900
updated : 2024-02-28 21:15:24 +0900
tag     : realworld kotlin
toc     : true
comment : true
public  : true
parent  : [[/realworld]]
latex   : true
---
* TOC
{:toc}

## Smart Home Control Command APIs Designs with Sealed Interface

스마트 홈(Smart home)은 네트워크로 통제하는 집 단위의 통신 환경이다. 주택 소유자가 가정 내에서 다양한 시스템과 가전 제품을 제어하고 자동화할 수 있다.

이 처럼, 앱으로 이러한 다양한 기기, 가전제품 등을 __명령(command)__ 으로 __제어(control)__ 할 수 있어야 한다. 

처음에는 앱의 요구사항들을 분석해서 API Request/Response Spec 을 정해야 할 것이다.

이때, API 를 명령별로 세분화 하고 Request(DTO) 또한 API 개수 만큼 만들 수 있다. 하지만 Presentation DTO 의 개수가 많아지고, 만약 Clean Architecture 를 적용했다면 ModelMapper or MapStruct 와 같은 Mapper Library 는 필수 일 것이다.

이러한 __Layer 간 Object Converting(Mapping) 과정의 번거로움__ 을 줄 일 수 있다면 좋을 것이다.

이때 sealed interface/class 를 사용하여 하나의 DTO 로 모든 명령 API 들을 처리할 수 있다.

우리가 구현해야할 API 목록은 다음과 같다.

- 에어컨 켜기/끄기
- 난방 켜기/끄기
- 난방 온도 조절(0 ~ 100)
- 티비 켜기/끄기

위 명령의 유형(command type)을 [sealed interface](https://baekjungho.github.io/wiki/kotlin/kotlin-sealed/) 를 사용하여 구현할 것이다.

```kotlin
@Serializable
@SerialName("Command")
sealed interface Command

@Serializable
@SerialName("TypeCommand")
sealed interface TypeCommand: Command

@Serializable
@SerialName("ValueCommand")
sealed interface ValueCommand: Command

@Serializable
@SerialName("IntValueCommand")
sealed interface IntValueCommand: ValueCommand {
    val value: Int
}

@Serializable
@SerialName("OnOffCommand")
data class OnOffCommand(
    val value: OnOffType
): TypeCommand

enum class OnOffType {
    ON, OFF
}

@Serializable
@SerialName("LimitCommand")
data class LimitCommand(
    override val value: Int
): IntValueCommand
```

그리고 DTO 는 아래와 같이 설계할 수 있다.

```kotlin
@Serializable
data class CommandRequest(
    val deviceId: String,
    val commands: List<Command>
)
```

이때, RequestBody 형식은 다음과 같다.

```json
{
  "deviceId": "UUID",
  "commands": [
    {
      "type": "OnOffCommand" // @SerialName 에 설정한 값을 적으면 된다.
      "value": "ON"
    },
    {
      "type": "LimitCommand",
      "value": 28
    }
  ]
}
```

[Designing serializable hierarchy](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/polymorphism.md#designing-serializable-hierarchy) 를 참고하면 kotlinx serialization 관련 내용을 얻을 수 있다.

"/v1/commands/heat" (난방 제어) API 로 위 RequestBody 를 담아서 보내면 된다. 위 RequestBody 가 의미하는 바는 OnOffCommand 를 처리하면서, 온도 제어를 28도로 설정한다라는 명령이다.

## Links

- [Using an Interface as a Type](https://docs.oracle.com/javase/tutorial/java/IandI/interfaceAsType.html)



