---
layout  : wiki
title   : Atlassian JIRA APIs
summary : 
date    : 2024-04-01 15:54:32 +0900
updated : 2024-04-01 20:15:24 +0900
tag     : etc
toc     : true
comment : true
public  : true
parent  : [[/etc]]
latex   : true
---
* TOC
{:toc}

## Atlassian JIRA APIs

Atlassian no longer supports Jira REST Java Client library. If you have any questions about it, post them in the Atlassian Community.

__Dependency__:
com.atlassian.jira:jira-rest-java-client-core

__IssueJsonParser.java__

```java
// TODO: JRJC-122
// we should use fieldParser here (some new version as the old one probably won't work)
// enable IssueJsonParserTest#testParseIssueWithUserPickerCustomFieldFilledOut after fixing this
final Object value = json.opt(key);
fields.add(new IssueField(
  key,
  namesMap.get(key),
  typesMap.get("key"), // 이 부분 하드코딩이 문제임.
  value == JSONObject.NULL || value == JSONObject.EXPLICIT_NULL ? null : value));
```

참고로 [baeldung Jira Rest API](https://www.baeldung.com/jira-rest-api) 내용을 참고하여 getIssue 코드를 사용하면 에러가 발생한다.

위 코드 부분에서 typesMap.get("key") 이 부분이 문제인것 같지만, no longer supports 상태라.. Jira Rest Java Client Core 는 사용하지 않는것이 좋아보인다.
대신 아래 두 API 를 사용하는 것이 좋다.

- v3: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get
- v2: https://developer.atlassian.com/server/jira/platform/jira-rest-api-example-add-comment-8946422/