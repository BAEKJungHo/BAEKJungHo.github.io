---
layout  : wiki
title   : DEFLATE
summary : 
date    : 2023-04-18 15:54:32 +0900
updated : 2023-04-18 20:15:24 +0900
tag     : algorithm
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Deflate

Deflate is Industrial Standards in Compression Algorithms.

__Run-Length Encoding, Huffman Code, LZ77, LZ78, LZW, Deflate:__

<script defer class="speakerdeck-embed" data-id="6c7c60ef4d6d4c7b811eb3b67e885f71" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

[RFC 1951 - DEFLATE Compressed Data Format Specification version 1.3](https://datatracker.ietf.org/doc/html/rfc1951)

[zlib](http://www.zlib.net/) 과 deflate 의 차이점은, deflate 는 압축 알고리즘이고, zlib 는 이걸 실제 프로그래밍 언어로 구현한 구현체라는 것이다.

Java 에서는 java.util.zip 에서 [Deflater](https://docs.oracle.com/javase/8/docs/api/java/util/zip/Deflater.html) 와 Infalter 를 제공하고 있다.

__[ZLIB compression and decompression in Kotlin / Android](https://gist.github.com/marcouberti/40dbbd836562b35ace7fb2c627b0f34f)__

```kotlin
import java.io.ByteArrayOutputStream
import java.util.zip.Deflater
import java.util.zip.Inflater

/**
 * Compress a string using ZLIB.
 *
 * @return an UTF-8 encoded byte array.
 */
fun String.zlibCompress(): ByteArray {
    val input = this.toByteArray(charset("UTF-8"))

    // Compress the bytes
    // 1 to 4 bytes/char for UTF-8
    val output = ByteArray(input.size * 4)
    val compressor = Deflater().apply {
        setInput(input)
        finish()
    }
    val compressedDataLength: Int = compressor.deflate(output)
    return output.copyOfRange(0, compressedDataLength)
}

/**
 * Decompress a byte array using ZLIB.
 *
 * @return an UTF-8 encoded string.
 */
fun ByteArray.zlibDecompress(): String {
    val inflater = Inflater()
    val outputStream = ByteArrayOutputStream()

    return outputStream.use {
        val buffer = ByteArray(1024)

        inflater.setInput(this)

        var count = -1
        while (count != 0) {
            count = inflater.inflate(buffer)
            outputStream.write(buffer, 0, count)
        }

        inflater.end()
        outputStream.toString("UTF-8")
    }
}
```