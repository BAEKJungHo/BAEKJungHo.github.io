---
layout  : wiki
title   : Reactor Timeout Fallback
summary : 
date    : 2023-06-08 21:28:32 +0900
updated : 2023-06-08 22:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Reactor Timeout Fallback

__[Reactor code with timeout and fallback](https://projectreactor.io/docs/core/release/reference/):__

What if you want to ensure the favorite IDs are retrieved in less than 800ms or, if it takes longer, get them from a cache?

```
userService.getFavorites(userId)
           .timeout(Duration.ofMillis(800)) // 	If the part above emits nothing for more than 800ms, propagate an error.
           .onErrorResume(cacheService.cachedFavoritesFor(userId)) // In case of an error, fallback to the cacheService. 
           .flatMap(favoriteService::getDetails)
           .switchIfEmpty(suggestionService.getSuggestions())
           .take(5)
           .publishOn(UiUtils.uiThreadScheduler())
           .subscribe(uiList::show, UiUtils::errorPopup);
 ```