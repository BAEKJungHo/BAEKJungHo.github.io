---
layout  : wiki
title   : Reduce Complexity and Cognitive Load
summary : How to keep clean code
date    : 2023-12-03 16:01:32 +0900
updated : 2023-12-03 16:05:24 +0900
tag     : cleancode
toc     : true
comment : true
public  : true
parent  : [[/cleancode]]
latex   : true
---
* TOC
{:toc}

## Reduce Complexity and Cognitive Load

__[Congnitive Load](https://en.wikipedia.org/wiki/Cognitive_load)__ refers to the amount of mental effort required to complete a task.
__Cognitive load increases as code becomes more complex.__ __“[Too complex](https://google.github.io/eng-practices/review/reviewer/looking-for.html#complexity)”__ usually means “can’t be understood quickly by code readers.” It can also mean “developers are likely to introduce bugs when they try to call or modify this code.”

Cognitive load is often higher for other people reading code you wrote than it is for yourself, since readers need to understand your intentions. One of the reasons for code reviews is to allow reviewers to check if the changes to the code cause too much cognitive load.

__The key to reducing cognitive load is to make code simpler__:
- [Keep functions small](https://martinfowler.com/bliki/FunctionLength.html)
- [Single Responsibility Principle](https://baekjungho.github.io/wiki/driven/oop-solid/)
- Create abstractions to hide implementation details
  - You should also consider the cost of abstraction
- [Simplify control flow](https://testing.googleblog.com/2023/10/simplify-your-control-flows.html) & [Reduce Nesting](https://testing.googleblog.com/2017/06/code-health-reduce-nesting-reduce.html)
- Minimize mutable state
- [Include only relevant details in tests](https://testing.googleblog.com/2023/10/include-only-relevant-details-in-tests.html)
  - A good test should include only details relevant to the test, while hiding noise.
  - ```
    def test_get_balance():
    account = _create_account(BALANCE)
    self.assertEqual(account.GetBalance(), BALANCE)
    ```
- [Don’t overuse mocks in tests](https://testing.googleblog.com/2013/05/testing-on-toilet-dont-overuse-mocks.html)

## Links

- [Write Clean Code to Reduce Cognitive Load](https://testing.googleblog.com/2023/11/write-clean-code-to-reduce-cognitive.html)