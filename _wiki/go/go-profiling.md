---
layout  : wiki
title   : Profiling Benchmarks
summary : 
date    : 2023-10-21 12:54:32 +0900
updated : 2023-10-21 13:15:24 +0900
tag     : go
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Profiling Benchmarks

__Go Profiling__:
- [Diagonistic](https://go.dev/doc/diagnostics)
- [The Busy Developer's Guide to Go Profiling, Tracing and Observability](https://github.com/DataDog/go-profiler-notes/blob/main/guide/README.md#cpu-profiler)
- [A Guide to the Go Garbage Collector Optimization Guide](https://go.dev/doc/gc-guide#Optimization_guide)
- [pprof](https://github.com/google/pprof)
    - [Support for profiling benchmarks](https://pkg.go.dev/runtime/pprof#hdr-Profiling_a_Go_program)
- [Profile-guided optimization in Go 1.21](https://go.dev/blog/pgo)

__What other profilers can I use to profile Go programs ?__
- On Linux, [perf tools](https://perf.wiki.kernel.org/index.php/Tutorial) can be used for profiling Go programs. Perf can profile and unwind cgo/SWIG code and kernel, so it can be useful to get insights into native/kernel performance bottlenecks. On macOS, [Instruments](https://developer.apple.com/library/content/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/) suite can be used profile Go programs.