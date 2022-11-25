---
layout  : wiki
title   : Message and Internationalization 
summary : 국제화
date    : 2022-11-02 15:02:32 +0900
updated : 2022-11-02 15:12:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Localization

Localization is sometimes written in English as l10n, where 10 is the number of letters in the English word between l and n. 
Localization refers to the adaptation of a product, application or document content to meet the language, cultural and other requirements of a specific target market (a locale).

- __Related Articles__
  - [Everything You Need To Know About Localization Testing](https://thesolitarywriter.com/2016/06/everything-localization-testing.html/)
  - [What is Localization Testing? Example Test Cases & Checklist](https://www.guru99.com/localization-testing.html)

Localization also may take into account differences in culture, such as:
- [Local holidays](https://en.wikipedia.org/wiki/Personal_name)
- [and so on](https://en.wikipedia.org/wiki/Internationalization_and_localization)

## Internationalization

Internationalization is often written i18n, where 18 is the number of letters between i and n in the English word. 
Internationalization (i18n) is the process of preparing software so that it can support local languages and cultural settings. __Internationalization significantly affects the ease of the product's localization.__

- __Related Articles__
  - [국제화 시 고려해야 할 49가지](https://www.abctech.software/2012/09/19/i18n-49/)

### Business process for internationalizing software

Typical software internationalization tasks include:

- Developing software to be independent from a specific language or limiting character set, and independent from cultural conventions (e.g., date display, time display)
- Locale Frameworks 
- Achieving Unicode compliance 
- Elimination of hard-coded text (strings) in the code 
- Removal and reworking of concatenated strings 
- Support for collation of data 
- Support for bi-directional languages, such as Hebrew and Arabic 
- Plus more, including issues that may be application and market specific

In order to internationalize a product, it is important to look at a variety of markets that the product will foreseeably enter.

Details such as field length for street addresses, unique format for the address, ability to make the postal code field optional to address countries that do not have postal codes or the state field for countries that do not have states, plus the introduction of new registration flows that adhere to local laws are just some of the examples that make internationalization a complex project.

### National conventions

[National conventions](https://en.wikipedia.org/wiki/Internationalization_and_localization) 를 고려해야 한다:
- [National conventions for writing telephone numbers](https://en.wikipedia.org/wiki/National_conventions_for_writing_telephone_numbers)
- [Address](https://en.wikipedia.org/wiki/Address#Mailing_address_format_by_country), [Postal code](https://en.wikipedia.org/wiki/Postal_code)
- [Currency](https://en.wikipedia.org/wiki/Currency)
- [System of measurement](https://en.wikipedia.org/wiki/System_of_measurement)
- [and so on](https://en.wikipedia.org/wiki/Internationalization_and_localization)

Currency 와 같이 특정 포맷에 맞춰 Conversion 해야하는 경우 [Formatter](https://baekjungho.github.io/wiki/spring/spring-converter/#formatter) 를 사용하여 구현할 수 있다.

## Globalization

Some companies, like IBM and Oracle, use the term globalization, g11n, for the combination of internationalization and localization.

## Implementation Internationalization 

국제화를 구현하기 위해서는 메시지를 어떤식으로 관리할 것인지가 중요하다:
- [Java, Spring 국제화(MessageSource) 적용관련 질문](https://www.slipp.net/questions/530)

크게 `DB` 를 사용하는 방식과 `json` 을 사용하는 방식, 그리고 `properties` 파일을 사용하는 방식이 있다.

### Internationalization in Spring Boot

다양한 나라에서 서비스를 제공 하기 위해서는 __메시지 파일(message.properties)__ 을 나라별로 관리하여 국제화 기능을 제공할 수 있다. 스프링은 MessageSource 를 사용하여 기본적인 메시지와 국제화 기능을 모두 제공한다.

국제화를 위한 메시지 파일은 __resources/config/i18n/messages__ 디렉터리를 만들어서 관리하면 편하다.

- __message_ko.properties__

```properties
# Error page
error.title=요청을 처리할 수 없습니다.
error.subtitle=에러가 발생하였습니다.
```

- __message_en.properties__

```properties
# Error page
error.title=Your request cannot be processed
error.subtitle=Sorry, an error has occurred.
error.status=Status:
error.message=Message:

# Activation e-mail
email.activation.title=baeldung account activation
email.activation.greeting=Dear {0}
email.activation.text1=Your baeldung account has been created, please click on the URL below to activate it:
email.activation.text2=Regards,
email.signature=baeldung Team.

# Creation email
email.creation.text1=Your baeldung account has been created, please click on the URL below to access it:

# Reset e-mail
email.reset.title=baeldung password reset
email.reset.greeting=Dear {0}
email.reset.text1=For your baeldung account a password reset was requested, please click on the URL below to reset it:
email.reset.text2=Regards,
```

한국에서 접근한 것인지 영어에서 접근한 것인지는 인식하는 방법은 __HTTP accept-language__ 헤더 값을 사용하거나 사용자가 직접 언어를 선택하도록 하고, 쿠키 등을 사용해서 처리하면 된다.

> JDK 에서 language 설정에 따라 자동으로 해당 properties 파일을 결정하기 때문에 유용하다.

#### Register Bean: in Spring

스프링에서는 아래와 같이 MessageSource 를 빈으로 등록해서 사용하면 된다.

```java
@Bean
public MessageSource messageSource() {
	ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
	messageSource.setBasenames("messages", "error"); 
	messageSource.setDefaultEncoding("utf-8");
	return messageSource;
}
```

위 코드에서는 message.properties 파일을 읽어 사용한다. 파일 경로는 /resources/message.properties 이다. 여러 파일을 한번에 지정할 수 있다. 여기서는 messages , errors 둘을 지정했다. defaultEncoding 은 인코딩 정보를 지정한다. utf-8 을 사용하면 된다.

#### Auto Registration: in Spring Boot

스프링 부트는 MessageSource 를 자동으로 스프링 빈으로 등록한다.

- `spring.messages.basename=messages,config.i18n.messages`
- 기본 값: `spring.messages.basename=messages`
- MessageSource 를 스프링 빈으로 등록하지 않고, 스프링 부트와 관련된 별도의 설정을 하지 않으면 messages 라는 이름으로 기본 등록된다.

- __국제화 파일 선택__
  - locale 정보를 기반으로 국제화 파일을 선택한다. 
  - Locale 이 en_US 의 경우 messages_en_US, messages_en, messages 순서로 찾는다. 
  - Locale 에 맞추어 구체적인 것이 있으면 구체적인 것을 찾고, 없으면 디폴트를 찾는다고 이해하면 된다.

#### LocaleResolver

스프링은 Locale 선택 방식을 변경할 수 있도록 LocaleResolver 라는 인터페이스를 제공하는데, 스프링 부트는 기본으로 Accept-Language 를 활용하는 AcceptHeaderLocaleResolver 를 사용한다.

```java
public interface LocaleResolver {
  Locale resolveLocale(HttpServletRequest request);
  void setLocale(HttpServletRequest request, @Nullable HttpServletResponse response, @Nullable Locale locale);
}
```

- [Interface LocaleResolver - Spring Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/LocaleResolver.html)

## Other Considerations

- 사용자가 특정 언어로 사용하겠다고 결정하면 기록해 두었다가 지속적으로 해당 서비스로 제공하는 방식을 고려할 수 있다.
- 이미지의 경우도 각 언어별 이미지를 만들고 경로 정보를 메시지와 똑같이 관리해야 한다. 
- DB 에 날짜 데이터를 관리할 때 특히 주의해야 한다. 날짜 데이터를 특정 기준 시간으로 일관되게 저장하고, 각 locale 설정에 따라 다르게 처리해야 한다. 
- 화폐와 관련된 부분도 고려해야한다.

## Links

- [Localization vs. Internationalization](https://web.archive.org/web/20160403134943/http://www.w3.org/International/questions/qa-i18n/)
- [What is i18n](https://lingoport.com/what-is-i18n/)
- [i18n next](https://www.i18next.com/)
- [Internationalization with Spring Boot](https://springframework.guru/internationalization-with-spring-boot/)