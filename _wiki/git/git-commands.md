---
layout  : wiki
title   : Git command Cheat Sheets
summary : 깃 명령어 모음집
date    : 2022-07-17 15:54:32 +0900
updated : 2022-07-17 20:15:24 +0900
tag     : git
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## Creating Snapshot

### Initializing a repository

| Command | Description  |
|---------|--------------|
|git init | - |


### Viewing the status

| Command | Description  |
|---------|--------------|
|git status | Full Status |
|git status -s| Short Status|

### Committing the staged files

| Command | Description  |
|---------|--------------|
|git commit -m "Message" | Commits with a one-line message |
|git commit| Opens the default editor to type a long message|

### Skipping the staging area

| Command | Description  |
|---------|--------------|
|git commit -am "Message" | - |

### Removing files

| Command | Description  |
|---------|--------------|
|git rm file1.js | Removes from working directory and staging area |
|git rm --cached file1.js| Removes from staging area only|

### Renaming or moving files

| Command | Description  |
|---------|--------------|
|git mv file1.js file1.txt | - |

### Viewing the staged/unstaged changes

| Command | Description  |
|---------|--------------|
|git diff | Shows unstaged changes |
|git diff -staged | Shows staged changes|
|git diff -cached | Same as the above |

### Viewing the history

| Command | Description  |
|---------|--------------|
|git log| Full history |
|git log --online| Summary|
|git log --reverse| Lists the commits from the oldest to the newest|

### Viewing a commit

| Command | Description  |
|---------|--------------|
|git show 829a2fz| Shows the given commit |
|git show HEAD| Shows the last commit |
|git show HEAD~2| Two steps before the last commit |
|git show HEAD:file.js| Shows the version of file.js stored in the last commit|

### Unstaging files(undoing git add)

| Command | Description  |
|---------|--------------|
|git restore --staged file.js| Copies the last version of file.js from repo to index |

### Discarding local changes

| Command | Description  |
|---------|--------------|
|git restore file.js| Copies file.js from index to working directory |
|git restore file1.js file2.js| Restores multiple files in working directory |
|git restore .| Discard all local changes (except untracked files) |

### Restoring an earlier version of a file

| Command | Description  |
|---------|--------------|
|git restore --source=HEAD~2 file.js| - |

## Browsing History

### Viewing the history

| Command | Description  |
|---------|--------------|
|git log -stat| Shows the list of modified files |
|git log -patch| Shows the actual changes (patches) |

### Filtering the history

| Command | Description  |
|---------|--------------|
|git log -3| Shows the last 3 entries |
|git log --author="BAEK"| - |
|git log --before="yyyy-MM-dd"| - |
|git log --after="one week ago"| - |
|git log --grep="Kotlin"| Commits with "Kotlin" in their message |
|git log -S"Kotlin"| Commits with "Kotlin" in their patches|
|git log hash1..hashN| Range of commits|
|git log file.txt| Commits that touched file.txt|

### Formatting the log output

| Command | Description  |
|---------|--------------|
|git log --pretty=format:"%an committed %H"| - |

### Creating an alias

| Command | Description  |
|---------|--------------|
|git config --global alias.lg "log --oneline"| - |

### Viewing a commit

| Command | Description  |
|---------|--------------|
|git show HEAD~2| - |
|git show HEAD~2:file1.txt| Shows the version of file stored in this commit |

### Comparing commits

| Command | Description  |
|---------|--------------|
|git diff HEAD~2 HEAD| Shows the changes between two commits |
|git diff HEAD~2 HEAD file.txt| Changes to file.txt only |

### Checking out a commit

| Command | Description  |
|---------|--------------|
|git checkout acb8a27| Checks out the given commit |
|git checkout master|  Checks out the master branch

### Finding a bad commit

| Command | Description  |
|---------|--------------|
|git bisect start| - |
|git bisect bad| Marks the current commit as a bad commit |
|git bisect good acb8a27| Marks the given commit as a good commit |
|git bisect reset| Terminates the bisect session|

### Finding  contributors

| Command | Description  |
|---------|--------------|
|git shortlog| - |

### Viewing the history of a file

| Command | Description  |
|---------|--------------|
|git log file.txt| Shows the commits that touched file.txt |
|git log --stat file.txt| Shows statistics (the number of changes) for file.txt |
|git log --patch file.txt| Shows the patches (changes) applied to file.txt |

### Finding the author of lines

| Command | Description  |
|---------|--------------|
|git blame file.txt| Shows the author of each line in file.txt|

### Tagging

| Command | Description  |
|---------|--------------|
|git tag v1.0| Tags the last commit as v1.0|
|git tag v1.0 acb8a27| Tags an earlier commit|
|git tag| Lists all the tags|
|git tag -d v1.0| Deletes the given tag|

## Branching and Merging

### Managing branches

| Command | Description  |
|---------|--------------|
|git branch bugfix| Creates a new branch called bugfix |
|git checkout bugfix| Switches to the bugfix branch |
|git switch bugfix| Same as the above |
|git switch -C bugfix| Creates and switches |
|git branch -d bugfix| Deletes the bugfix branch |

### Comparing branches

| Command | Description  |
|---------|--------------|
|git log master..bugfix| Lists the commits in the bugfix branch not in master |
|git diff master..bugfix| Shows the summary of changes|

### Stashing

| Command | Description  |
|---------|--------------|
|git stash push -m "New tax rules"| Creates a new stash |
|git stash list| Lists all the stashes |
|git stash show stash@{1}| Shows the given stash |
|git stash show 1| shortcut for stash@{1} |
|git stash apply 1| Applies the given stash to the working dir |
|git stash drop 1| Deletes the given stash |
|git stash clear| Deletes all the stashes |

### Merging

| Command | Description  |
|---------|--------------|
|git merge bugfix| Merges the bugfix branch into the current branch |
|git merge --no-ff bugfix| Creates a merge commit even if FF is possible |
|git merge --squash bugfix| Performs a squash merge  |
|git merge --abort| Aborts the merge |

- [Fast-forward merge and other options](https://blog.naver.com/PostView.nhn?blogId=parkjy76&logNo=220308638231&categoryNo=73&parentCategoryNo=0&viewDate=&currentPage=1&postListTopCurrentPage=1&from=postView)

### Viewing the merged branches

| Command | Description  |
|---------|--------------|
|git branch --merged| Shows the merged branches |
|git branch --no-merged| Shows the unmerged branches |

### Rebasing

| Command | Description  |
|---------|--------------|
|git rebase master| Changes the base of the current branch |

### Cherry picking

| Command | Description  |
|---------|--------------|
|git cherry-pick acb8a27| Applies the given commit on the current branch |

## Collaboration

### Cloning a repository

| Command | Description  |
|---------|--------------|
|git clone url| - |

### Syncing with remotes

| Command | Description  |
|---------|--------------|
|git fetch origin master| Fetches master from origin |
|git fetch origin| Fetches all objects from origin |
|git fetch| Shortcut for "git fetch origin" |
|git pull| fetch + merge |
|git push origin master| Pushes master to origin |
|git push| Shortcut for "git push origin master" |

### Sharing tags

| Command | Description  |
|---------|--------------|
|git push origin v1.0| Pushes tag v1.0 to origin |
|git push origin --delete v1.0| - |

### Sharing branches

| Command | Description  |
|---------|--------------|
|git branch -r| Shows remote tracking branches |
|git branch -vv| Shows local&remote tracking branches |
|git push -u origin master| Pushes master to origin |
|git push -d origin master| Removes master from origin |

### Managing remotes

| Command | Description  |
|---------|--------------|
|git remote| Shows remote repos |
|git remote add upstream url| Adds a new remote called upstream |
|git remote rm upstream| Remotes upstream |

## Rewriting History

### Undoing commits

| Command | Description  |
|---------|--------------|
|git reset --soft HEAD^| Removes the last commit, keeps changes staged |
|git reset --mixed HEAD^| Unstages the changes as well |
|git reset --hard HEAD^| Discards local changes |

### Reverting commits

| Command | Description  |
|---------|--------------|
|git revert acb8a27| Reverts the given commit |
|git revert HEAD~3| Reverts the last three commits |
|git revert --no-commit HEAD~3| - |

### Recovering lost commits

| Command | Description  |
|---------|--------------|
|git reflog| Shows the history of HEAD |
|git reflog show master| Shows the history of master pointer |

### Amending the last commit

| Command | Description  |
|---------|--------------|
|git commit --amend| - |

### Interactive rebasing

| Command | Description  |
|---------|--------------|
|git rebase -i HEAD~5| - |