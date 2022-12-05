---
layout  : wiki
title   : Intercepting Filter Pattern
summary : Core J2EE Patterns - Intercepting Filter
date    : 2022-11-29 15:54:32 +0900
updated : 2022-11-29 20:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Intercepting Filter

### Problem

Preprocessing and post-processing of a client Web request and response are required.
- Has the client been authenticated? 
- Does the client have a valid session? 
- Is the client's IP address from a trusted network? 
- Does the request path violate any constraints? 
- What encoding does the client use to send the data? 
- Do we support the browser type of the client?

### Solution

Create pluggable filters to process common services in a standard manner without requiring changes to core request processing code. The filters intercept incoming requests and outgoing responses, allowing preprocessing and post-processing. We are able to add and remove these filters unobtrusively, without requiring changes to our existing code.

## Intercepting Filter pattern class diagram

![]( /resource/wiki/designpattern-intercepting-filter/structure.png)

### FilterManager

The FilterManager manages filter processing. It creates the FilterChain with the appropriate filters, in the correct order, and initiates processing.

### FilterChain

The FilterChain is an ordered collection of independent filters.

- __FilterOne, FilterTwo, FilterThree__
  - These are the individual filters that are mapped to a target. The FilterChain coordinates their processing.

### Target

The Target is the resource requested by the client.

## Intercepting Filter sequence diagram

![](/resource/wiki/designpattern-intercepting-filter/pattern.png)

## Intercepting Filter, Template Filter Strategy sequence diagram

![](/resource/wiki/designpattern-intercepting-filter/strategy.png)

- The template filter imposes a structure to each filter's processing, as well as providing a place for encapsulating code that is common to every filter.

```java
public abstract class TemplateFilter implements javax.servlet.Filter {
  private FilterConfig filterConfig;

  public void setFilterConfig(FilterConfig fc) { 
    filterConfig=fc; 
  }

  public FilterConfig getFilterConfig() { 
    return filterConfig; 
  }

  public void doFilter(ServletRequest request, 
    ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    // Common processing for all filters can go here 
    doPreProcessing(request, response, chain);

    // Common processing for all filters can go here
    doMainProcessing(request, response, chain);

    // Common processing for all filters can go here 
    doPostProcessing(request, response, chain);

    // Common processing for all filters can go here

    // Pass control to the next filter in the chain or 
    // to the target resource
    chain.doFilter(request, response);
  }
  public void doPreProcessing(ServletRequest request,   
    ServletResponse response, FilterChain chain) {
  }

  public void doPostProcessing(ServletRequest request, 
    ServletResponse response, FilterChain chain) {
  }

  public abstract void doMainProcessing(ServletRequest 
   request, ServletResponse response, FilterChain 
   chain);
}
```

## Links

- [Core J2EE Patterns - Intercepting Filter](https://www.oracle.com/java/technologies/intercepting-filter.html)
