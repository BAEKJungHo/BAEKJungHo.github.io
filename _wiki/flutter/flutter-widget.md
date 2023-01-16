---
layout  : wiki
title   : Widget
summary : 
date    : 2023-01-14 15:54:32 +0900
updated : 2023-01-14 20:15:24 +0900
tag     : flutter
toc     : true
comment : true
public  : true
parent  : [[/flutter]]
latex   : true
---
* TOC
{:toc}

## Flutter

- 플러터는 모든 사람이 아름답고, 좋은 성능을 가진 모바일 앱을 만들 수 있도록 제공하는 모바일 SDK 이며 다트(dart)로 구현되어있다.
- 다트는 구글이 만든 언어로 자바스크립트로 컴파일할 수 있다.
- 플러터는 네이티브 디바이스 코드로 컴파일되므로 다른 크로스 플랫폼 기술보다 성능이 뛰어나다. 또한 다트의 JIT, 플러터의 핫 리로드 덕분에 최상의 경험을 제공한다.
- 플러터는 훌륭한 성능의 크로스 플랫폼 앱을 빨리 만들어야 하는 사람에게 적합하다.

## Widget

Flutter 의 핵심 개념은 모든 것이 __위젯(widget)__ 이라는 점이다. 다른 객체가 없다는 것은 아니다. 앱 개발자 입장에서 위젯 외의 객체는 크게 신경 쓸 필요가 없다.

- __Layout__: Row, Column, Scaffold, Stack
- __Structure__: Button, Toast, MenuDrawer
- __Style__: TextStyle, Color
- __Animation__: FadeInPhoto, Transform
- __Location and Sort__: Center, Padding

## Composition

플러터는 상속보다 __조합(composition)__ 을 사용한다.

```
class AddToCartButton extends StatelessWidget {
  // ... class members
  
  @override
  build() {
    return Center(
      child: Button(
        child: Text('Add to Cart'),
      ),
    );
  }
}
```

build() 메서드는 가장 중요한 메서드 중 하나이며, 모든 플러터 위젯은 build() 메서드를 반드시 정의해야 한다.

## State

대부분의 위젯은 __StatefulWidget__ 과 __StatelessWidget__ 둘 중 하나에 속한다. 

StatelessWidget 은 언제 파괴되어도 괜찮은 위젯이다. 상태가 없기 때문에 언제 사라져도 아무 이상이 없다. StatelessWidget 은 프레임워크가 위젯을 언제 리빌드해야 하는지 알려준다. AddToCart(StatelessWidget) 은 사용자가 버튼을 클릭했을 때 지정된 함수를 실행하는 것이 전부이다. 또한 다른 텍스트로 표시하도록 정보를 전달하면 그에 __반응(react)__ 한다.

StatefulWidget 은 QuantityCounter 처럼 상태를 추적해야 한다. 따라서 State 객체를 항상 갖고 있으며 State 객체는 setState 라는 메서드를 제공한다. 이는 위젯을 다시 그려야 함을 플러터에게 알린다. 또한 상태를 갖는 위젯이 욉 영향으로 다시 그려질 수 있는 것도 알린다. `+`, `-` 버튼을 클릭하면 setState 가 호출된다.

```
setState(() {
  this.quantity--;
});
```

## Lifecycle

![](/resource/wiki/flutter-widget/lifecycle.png)

e.g StatefulWidget Lifecycle

1. 페이지로 이동하면 플러터가 객체를 만들고 이 객체는 위젯과 관련된 State 객체를 만든다.
2. 위젯이 마운트되면 플러터가 initState 를 호출한다.
3. 상태를 초기화하면 플러터가 위젯을 빌드한다. 그 결과 화면에 위젯을 그린다. 다음 과정을 참고하자.
4. 수량 위젯(QuantityWidget)은 다음 세 가지 이벤트 중 하나를 기다린다.
- 사용자가 앱의 다른 화면으로 이동하면서 폐기(dispose) 상태일 때
- 트리의 다른 위젯이 갱신되면서 수량 위젯이 의존하는 설정이 바뀜. 위젯의 상태는 didUpdateWidget 을 호출하며 필요하다면 위젯을 다시 그림. 예를 들어 제품이 품절되어 트리의 상위 위젯에서 해당 제품을 장바구니에 추가할 수 없도록 상태 위젯을 비활성화하는 상황인 경우
- 사용자가 버튼을 눌러 setState 를 호출해 위젯의 내부 상태가 갱신되어 플러터가 위젯을 다시 빌드하고 그리는 상황인 경우

## Links

- [Flutter in Action](https://livebook.manning.com/book/flutter-in-action/about-this-meap/v-7/)

## References

- Flutter in Action / Eric Windmill 저 / MANNING