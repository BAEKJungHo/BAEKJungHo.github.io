---
layout  : wiki
title   : Validation
summary : 
date    : 2022-10-23 15:02:32 +0900
updated : 2022-10-23 15:12:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Validation

검증은 Infrastructure, Domain, Application, Interfaces 계층 어느곳에서나 존재할 수 있다. 컨트롤러에서는 요청 파라미터가 적절한지 검증할 수 있으며, 도메인 레이어에서는 비지니스 업무 규칙에 적합한지 검증할 수 있고, 인프라스트럭쳐 레이어에서는 외부 통신의 결과가 적절한지 검증할 수 있다. __검증(Validation)__ 을 한 마디로 정의하자면 __제약 조건에 위배되는지 확인하는 과정__ 이라고 할 수있다.

- __클라이언트 검증 vs 서버 검증__
  - 프론트에서의 검증은 조작할 수 있으므로 보안에 취약
  - 서버에서만 검증을 하면, 즉각적인 고객 사용성이 부족해짐
  - 둘을 적절히 섞어서 사용하되, 최종적으로 서버 검증은 필수 
  - API 방식을 사용하면 API 스펙을 잘 정의해서 검증 오류를 API 응답 결과에 잘 남겨주어야 함

컨트롤러의 중요한 역할 중 하나는 __HTTP 요청이 정상인지를 검증__ 하는 것이다. 대표적으로 요청 파라미터가 올바른지 검사를 실시한다. 컨트롤러에서 검증이 필요한 이뉴는 HTTP 요청이 비정상적일때 잘못된 값이 DB 까지 전달되는 경우 SQL Injection 이 발생할 수도 있고, 앞단에서 발견되었어야 할 검증이 DB 조회까지 실행되어야 발견되기 때문이다. 또한 앞단에서 미리 검증을 한다면 QA(Quality Assurance) 에 드는 시간(cost)이 줄어들게 되는 이점도 있다.

스프링에서는 `BindingResult` 를 사용하여 검증 오류를 보관한다. BindingResult 는 검증할 객체 바로 뒤에 와야하며, 검증 객체 앞에 `@ModelAttribute` 가 있으면 데이터 바인딩 시 오류가 발생해도 컨트롤러가 호출된다. 

```kotlin
@PostMappping
fun save(
  @ModelAttribute request: SaveRequest,
  bindingResult: BindingResult
) {
  // ...
}
```

BindingResult 는 인터페이스이고, Errors 인터페이스를 상속받고 있다. 실제로 넘어오는 구현체는 `BeanPropertyBindingResult ` 이다.

```java
// 검증 로직
if (!StringUtils.hasText(item.getItemName())) {
    bindingResult.addError(new FieldError("item", "itemName", item.getItemName(), false, null, null, "상품 이름은 필수 입니다."));
}
if (item.getPrice() == null || item.getPrice() < 1000 || item.getPrice() > 1000000) {
    bindingResult.addError(new FieldError("item", "price", item.getPrice(), false, null, null, "가격은 1,000 ~ 1,000,000 까지 허용합니다."));
}
if (item.getQuantity() == null || item.getQuantity() >= 9999) {
    bindingResult.addError(new FieldError("item", "quantity", item.getQuantity(), false, null ,null, "수량은 최대 9,999 까지 허용합니다."));
}

// 특정 필드가 아닌 복합 룰 검증
if (item.getPrice() != null && item.getQuantity() != null) {
    int resultPrice = item.getPrice() * item.getQuantity();
    if (resultPrice < 10000) {
        bindingResult.addError(new ObjectError("item",null ,null, "가격 * 수량의 합은 10,000원 이상이어야 합니다. 현재 값 = " + resultPrice));
    }
}
```

ValidationUtils 를 사용해서 한 줄로 처리할 수 있다. 

```java
ValidationUtils.rejectIfEmptyOrWhitespace(bindingResult, "itemName", "required");
```

컨트롤러에서 처리해야하는 검증 로직이 많은 경우에는 `Validator` 클래스를 만들어서 처리한다.

## @ModelAttribute vs @RequestBody

HTTP 요청 파리미터를 처리하는 @ModelAttribute 는 각각의 필드 단위로 세밀하게 적용된다. 그래서 특정 필드에 타입이 맞지 않는 오류가 발생해도 나머지 필드는 정상 처리할 수 있었다.

HttpMessageConverter 는 @ModelAttribute 와 다르게 각각의 필드 단위로 적용되는 것이 아니라, 전체 객체 단위로 적용된다. 따라서 메시지 컨버터의 작동이 성공해서 Item 객체를 만들어야 @Valid , @Validated 가 적용된다.

@ModelAttribute 는 필드 단위로 정교하게 바인딩이 적용된다. 특정 필드가 바인딩 되지 않아도 나머지 필드는 정상 바인딩 되고, Validator 를 사용한 검증도 적용할 수 있다.

@RequestBody 는 HttpMessageConverter 단계에서 JSON 데이터를 객체로 변경하지 못하면 이후 단계 자체가 진행되지 않고 예외가 발생한다. 컨트롤러도 호출되지 않고, Validator 도 적용할 수 없다.

## Validator

Validator 를 만드는 방식은 크게 두가지가 있다.

1. 스프링에서 제공하는 Validator 인터페이스를 구현
2. 별도 인터페이스 없이 Custom Validator 를 빈으로 등록해서 사용
- 컨트롤러에서 validator.validate 형식으로 호출하여 사용

### Spring Validator Interface

스프링은 검증을 체계적으로 제공하기 위해 아래 인터페이스를 제공한다.

```java
public interface Validator {
    // 해당 검증기를 지원하는 지 확인 
    boolean supports(Class<?> clazz);
    
    // target: 검증 대상 객체, errors: BindingResult
    void validate(Object target, Errors errors);
}
```

Validator 인터페이스를 사용해서 검증기를 만들면 `WebDataBinder` 를 사용하여 스프링의 추가적인 도움을 받을 수 있다. 아래처럼 WebDataBinder 에 검증기를 추가하면 해당 컨트롤러에서는 검증기를 자동으로 적용할 수 있다.

```java
@InitBinder
public void init(WebDataBinder dataBinder) {
 log.info("init binder {}", dataBinder);
 dataBinder.addValidators(itemValidator);
}
```

`@InitBindder` 는 해당 컨트롤러 안에서만 영향을 준다. WebDataBinder 에 검증기를 추가하면 각 핸들러 메서드마다 validator.validate 같은 코드를 제거할 수 있다.

```java
PostMapping("/add")
public String addItem(
      @Validated @ModelAttribute Item item,
      BindingResult bindingResult
) {
   if (bindingResult.hasErrors()) {
     log.info("errors={}", bindingResult);
     return "validation/v2/addForm";
   }
   //...
}
```

@Validated 는 검증기를 실행하라는 애노테이션이다. 이 애노테이션이 붙으면 앞서 WebDataBinder 에 등록한 검증기를 찾아서 실행한다. 그런데 여러 검증기를 등록한다면 그 중에 어떤 검증기가 실행되어야 할지 구분이 필요하다. 이때 supports() 가 사용된다.

```java
@Component
public class ItemValidator implements Validator {
   @Override
   public boolean supports(Class<?> clazz) {
    return Item.class.isAssignableFrom(clazz);
   }
   @Override
   public void validate(Object target, Errors errors) { //... }
}
```

isAssignableFrom() 을 쓰는 이유는 자식 클래스 까지 검증이 가능하기 때문이다. 검증시 @Validated @Valid 둘다 사용가능하다. 

@InitBinder 를 사용하여 여러 객체를 대상으로 검증기를 적용할 수 있다.

```java
@InitBinder("targetObject")
public void initTargetObject(WebDataBinder webDataBinder) {
    log.info("webDataBinder={}, target={}", webDataBinder, webDataBinder.getTarget());
    webDataBinder.addValidators(/*TargetObject 관련 검증기*/);
}

@InitBinder("sameObject")
public void initSameObject(WebDataBinder webDataBinder) {
    log.info("webDataBinder={}, target={}", webDataBinder, webDataBinder.getTarget());
    webDataBinder.addValidators(/*SameObject 관련 검증기*/);
}
```

### BeanValidator

Custom Validator 를 Bean 으로 등록하여 사용할 수 있다. 이 경우의 장점은 하나의 Validator 안에서 여러 validate 메서드를 가질 수 있다는 점이다.

```java
@Component
public class CardValidator {
    
    public void registerValidate(CardDto.RegisterRequest request, Errors e) {}
    public void updateValidate(CardDto.RegisterRequest request, Errors e) {}
}
```

- __추천하는 전략__
  - 컨트롤러 내에서 Global 하게 적용되어야 하는 검증의 경우에는 Spring Validator Interface 를 구현하여 사용
  - 그 외에는 직접 BeanValidator 를 만들어서 사용

## Message

spring 의 message.properties 파일에 정의되어있는 값을 아래처럼 사용할 수 있다.

```java
public class MemberDto {

  @NotEmpty(message = "{email.notempty}")
  private String email;

  // standard getter and setters
}
```
```java
@Constraint(validatedBy = EmailValidator.class)
@Target(ElementType.FIELD)
@Retention(value = RetentionPolicy.RUNTIME)
@Documented
public @interface AdvisorEmail {
    String message() default "{com.dope.pro.validator.ValidEmail.message}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

- message file name: __ValidationMessage_언어코드_국가코드__
  - e.g ValidationMessage_ko_KR

## Bean Validation

Bean Validation 은 [JSR-380](https://beanvalidation.org/2.0-jsr380/spec/) 이라는 기술 표준이다. 마치 JPA 가 표준 기술이고 그 구현체로 하이버네이트가 있는 것과 같다.

Bean Validation 을 구현한 기술중에 일반적으로 사용하는 구현체는 하이버네이트 Validator 이다. __javax.validation__ 으로 시작하면 특정 구현에 관계없이 제공되는 표준 인터페이스이고, __org.hibernate.validator__ 로 시작하면 하이버네이트 validator 구현체를 사용할 때만 제공되는 검증 기능이다.

Bean Validation 을 사용하기 위해서는 의존 관계를 추가해야 한다.

```
implementation 'org.springframework.boot:spring-boot-starter-validation'
```

스프링 부트가 spring-boot-starter-validation 라이브러리를 넣으면 자동으로 Bean Validator 를 인지하고 스프링에 통합한다. 또한 스프링 부트는 자동으로 LocalValidatorFactoryBean 를 글로벌 Validator 로 등록하기 때문에 @Valid, @Validated 만 적용하면 @NotNull 같은 어노테이션을 보고 검증을 수행할 수 있다.

@Validated 는 스프링 전용 검증 애노테이션이고, @Valid 는 자바 표준 검증 애노테이션이다. 둘중 아무거나 사용해도 동일하게 작동하지만, @Validated 는 내부에 groups 라는 기능을 포함하고 있다.

## Container Validation

Bean Validation 2.0 부터 가능하다.

```java
public class DeleteContacts {
    @Min(1)
    private Collection<@Length(max = 64) @NotBlank String> uids;
}
```

## Custom Constraint Validation

### Annotation

- __Java__

```java
@Constraint(validatedBy = EmailValidator.class)
@Target(ElementType.FIELD)
@Retention(value = RetentionPolicy.RUNTIME)
@Documented
public @interface AdvisorEmail {
    String message() default "{com.dope.pro.validator.ValidEmail.message}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

- __Kotlin__

```kotlin
@Target(AnnotationTarget.FIELD)
@Retention
@Constraint(validatedBy = [PasswordValidator::class])
annotation class Password(
    val message: String = "",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = []
)
```

### Validator

- __Java__

```java
@Component
public class AdvisorEmailValidator implements ConstraintValidator<AdvisorEmail, String> {
    private final List<String> HOSTS = List.of("dope.com");

    @Override
    public void initialize(AdvisorEmail constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Do Something
    }
}
```

- __Kotlin__

```kotlin
@Component
class PasswordValidator: ConstraintValidator<Password, String> {

    companion object {
        private const val MIN_SIZE = 12
        private const val MAX_SIZE = 20
        private const val pattern = "^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@!%*#?&])[A-Za-z0-9$@!%*#?&]{$MIN_SIZE,$MAX_SIZE}$"
    }

    override fun isValid(value: String, context: ConstraintValidatorContext): Boolean {
        val isValidPassword = value.matches(Regex(pattern))

        if (!isValidPassword) {
            context.disableDefaultConstraintViolation()
            context.buildConstraintViolationWithTemplate(
                MessageFormat.format("{0}자 이상의 {1}자 이하의 숫자, 영문자, 특수문자를 포함하여야 합니다.", MIN_SIZE, MAX_SIZE)
            ).addConstraintViolation()
        }

        return isValidPassword
    }
}
```

### DTO

```kotlin
class AdvisorDto {
    data class Request(@AdvisorEmail email: String)
}
```

## Grouping

### Single Group

- __Validation Group__

```java
public interface ItemValidationGroup {
    interface Create {}
    interface Update {}
}


public interface UpdateCheck {
}
```

- __DTO__

```java
@Data
@NoArgsConstructor
public class Item {

    @NotNull(groups = ItemValidationGroup.Update.class) 
    private Long id;

    @NotBlank(groups = {ItemValidationGroup.Create.class, ItemValidationGroup.Update.class})
    private String itemName;
}
```

- __Controller__

```java
@PostMapping
public String create(
        @Validated(ItemValidationGroup.Create.class) @ModelAttribute Item item, 
        BindingResult bindingResult, 
) {}
```

@Validated 는 클래스 바로 위에 선언할 수도 있다.

### GroupSequence

- __Validation Group__

```java
@GroupSequence({
        CardValidationSequence.ExpireMonth.class,
        CardValidationSequence.ExpireYear.class,
        CardValidationSequence.CardNumber.class,
})
public interface CardValidationGroup {
    interface ExpireMonth {
    }

    interface ExpireYear {
    }

    interface CardNumber {
    }
}
```

## MethodArgumentNotValidException

javax.validation.ConstraintValidator 를 구현한 구현체를 만들어 사용하는 경우 ConstraintViolationException 이 발생할 수 있다.

그러나 Spring 은 ConstraintViolationException 을 MethodArgumentNotValidException 으로 Wrapping 하여 최종적으로는 MethodArgumentNotValidException 가 발생하게 된다.

@Valid 를 쓰던 @Validated 를 쓰던 MethodArgumentNotValidException 이 발생한다.

- [https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-exception-handlers](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-exception-handlers)

> You can use @RequestPart in combination with jakarta.validation.Valid or use Spring’s @Validated annotation, both of which cause Standard Bean Validation to be applied. By default, validation errors cause a MethodArgumentNotValidException, which is turned into a 400 (BAD_REQUEST) response. Alternatively, you can handle validation errors locally within the controller through an Errors or BindingResult argument, as the following example shows:

## ExceptionHandler

```kotlin
@RestControllerAdvice
class ExceptionHandlerAdvice {

    @ExceptionHandler(MethodArgumentNotValidException ::class)
    fun methodArgumentNotValidException(e: MethodArgumentNotValidException ) {
      // Do Something
    }
    
    @ExceptionHandler(ConstraintViolationException::class)
    fun constraintViolationException(e: ConstraintViolationException) {
        // Do Something
    }
}
```

## ValidationErrorExtractor

- [Validation - NHN](https://meetup.toast.com/posts/223)

```java
@UtilityClass
public class ValidationErrorExtractor {

  public static String getResultMessage(MethodArgumentNotValidException e) {
    BindingResult bindingResult = e.getBindingResult();

    final StringBuilder resultMessageBuilder = new StringBuilder();
    final Iterator<FieldError> fieldErrorIterator = bindingResult.getFieldErrors().iterator();

    while (fieldErrorIterator.hasNext()) {
      final FieldError fieldError = fieldErrorIterator.next();
      resultMessageBuilder
              .append("[")
              .append(fieldError.getField())
              .append("' is '")
              .append(fieldError.getRejectedValue())
              .append("'. ")
              .append(fieldError.getDefaultMessage())
              .append("]");

      if (fieldErrorIterator.hasNext()) {
        resultMessageBuilder.append(", ");
      }
    }

    return resultMessageBuilder.toString();
  }  
    
  public String getResultMessage(ConstraintViolationException e) {
    final Iterator<ConstraintViolation<?>> violationIterator = e.getConstraintViolations().iterator();
    final StringBuilder resultMessageBuilder = new StringBuilder();
    
    while (violationIterator.hasNext() == true) {
      final ConstraintViolation<?> constraintViolation = violationIterator.next();
      resultMessageBuilder
              .append("['")
              .append(getPopertyName(constraintViolation.getPropertyPath().toString()))
              .append("' is '")
              .append(constraintViolation.getInvalidValue())
              .append("'. ")
              .append(constraintViolation.getMessage())
              .append("]");

      if (violationIterator.hasNext() == true) {
        resultMessageBuilder.append(", ");
      }
    }

    return resultMessageBuilder.toString();
  }

  private String getPropertyName(String propertyPath) {
    return propertyPath.substring(propertyPath.lastIndexOf('.') + 1);
  }
}
```

## Links

- [Validation, Data Binding, and Type Conversion](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/validation.html)
- [JSR 303: Bean Validation](https://beanvalidation.org/1.0/spec/)
- [Bean Validation and JSR 303 - DZone](https://dzone.com/articles/bean-validation-and-jsr-303)
- [Bean Validation 2.0 - you’ve put your annotations everywhere! by Gunnar Morling](https://www.youtube.com/watch?v=GdKuxmtA65I)
- [Hibernate Validator](https://docs.jboss.org/hibernate/validator/6.2/reference/en-US/html_single/)
- [Spring Boot 2.3, Web-starter doesn't bring Validation-starter anymore](https://www.youtube.com/watch?v=cP8TwMV4LjE)