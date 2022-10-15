---
layout  : wiki
title   : Open Authorization
summary : OAuth
date    : 2022-10-12 15:54:32 +0900
updated : 2022-10-12 20:15:24 +0900
tag     : auth
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## What is OAuth 

> OAuth is an HTTP-based authorization protocol. It gives third-party applications scoped access to a protected resource on behalf of the resource owner. It gives users the ability to share their private resources between sites without providing user names and passwords.

## Concepts

The following concepts are common for both OAuth 1.0 and OAuth 2.0.

### Resource Owner

An entity capable of authorizing access to a protected resource. When the resource owner is a person, it is called an end user.

### OAuth client

A third-party application that wants access to the private resources of the resource owner. The OAuth client can make protected resource requests on behalf of the resource owner after the resource owner grants it authorization.

### OAuth Server

Known as the Authorization server in OAuth 2.0. The server that gives OAuth clients scoped access to a protected resource on behalf of the resource owner.

### Access token

A string that represents authorization granted to the OAuth client by the resource owner. This string represents specific scopes and durations of access. It is granted by the resource owner and enforced by the OAuth server.

### Protected resource

A restricted resource that can be accessed from the OAuth server using authenticated requests.

### OAuth 2.0 concepts

OAuth 2.0 protocol. These new concepts are as follows:

#### Resource server

The server that hosts the protected resources. It can use access tokens to accept and respond to protected resource requests. The resource server might be the same server as the authorization server.

#### Authorization grant

A grant that represents the resource owner authorization to access its protected resources. OAuth clients use an authorization grant to obtain an access token. There are four authorization grant types: authorization code, implicit, resource owner password credentials, and client credentials.

#### Authorization code

A code that the Authorization server generates when the resource owner authorizes a request.

#### Refresh token

A string that is used to obtain a new access token.
A refresh token is optionally issued by the authorization server to the OAuth client together with an access token. The OAuth client can use the refresh token to request another access token based on the same authorization, without involving the resource owner again.

## The OAuth 1.0 Protocol

> ![](/resource/wiki/auth-oauth/oauth1.png)
> 
> The OAuth 1.0 protocol runtime workflow diagram involves the following steps:
> 
> 1. The OAuth client requests a set of temporary credentials from the OAuth server to start the authentication process. Temporary credentials distinguish individual OAuth client requests to the OAuth server.
> 2. The OAuth server validates the request and returns a set of temporary credentials to the OAuth client.
> 3. The OAuth client redirects the resource owner to the authorized URI to obtain the approval to access the protected resource.
> 4. The resource owner authenticates with the OAuth server using its client credentials and authorizes the request from the OAuth client.
> 5. The OAuth server validates the temporary credentials and after the resource owner authorizes the OAuth client, a verification code is generated.
> 6. The resource owner is redirected to the callback URI provided by the OAuth client in the previous request.
> 7. The OAuth client requests the access token using the temporary credentials and verification code.
> 8. The OAuth server validates the request and returns an access token to the OAuth client to access the protected resource.
> - [OAuth 1.0 Workflow](https://www.ibm.com/docs/en/tfim/6.2.2.7?topic=overview-oauth-10-workflow)

## How is OAuth2 different from OAuth 1

> [How is OAuth 2 different from OAuth 1](https://stackoverflow.com/questions/4113934/how-is-oauth-2-different-from-oauth-1)

## Links

- [OAuth - Docs](https://oauth.net/2/)
- [OAuth Concepts - IBM](https://www.ibm.com/docs/en/tfim/6.2.2.7?topic=overview-oauth-10-oauth-20-concepts)
- [OAuth 2.0 and the Road to Hell](https://web.archive.org/web/20120731155632/http://hueniverse.com/2012/07/oauth-2-0-and-the-road-to-hell/)
- [OAuth Framework - RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)
- [OAuth 1.0 - RFC 5849](https://www.rfc-editor.org/rfc/rfc5849)
- [Differences Between OAuth 1 and 2](https://www.oauth.com/oauth2-servers/differences-between-oauth-1-2/)
- [OAuth2 승인 방식의 종류](https://cheese10yun.github.io/oauth2/)
- [Resource Owner Password Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow)