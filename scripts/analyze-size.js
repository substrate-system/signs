#!/usr/bin/env node
// @ts-check
import { readFile, stat } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { gzip as _gzip } from 'node:zlib'
import { promisify } from 'node:util'
const gzip = promisify(_gzip)

async function analyzeSize () {
    const inputFile = 'example/index.ts'
    const outputFile = 'example/dist/bundle.min.js'

    // Build the bundle
    execSync(`npx esbuild ${inputFile} --bundle --minify --format=esm --outfile=${outputFile}`, {
        stdio: 'inherit'
    })

    // Get file sizes
    const minifiedSize = (await stat(outputFile)).size
    const minifiedContent = await readFile(outputFile)
    const gzippedContent = await gzip(minifiedContent)
    const gzippedSize = gzippedContent.length

    console.log('\n Size Analysis:')
    console.log('================')
    console.log(`Minified:  ${minifiedSize.toLocaleString()} bytes (${(minifiedSize / 1024).toFixed(2)} KB)`)
    console.log(`Gzipped:   ${gzippedSize.toLocaleString()} bytes (${(gzippedSize / 1024).toFixed(2)} KB)`)
    console.log(`Compression: ${((1 - gzippedSize / minifiedSize) * 100).toFixed(1)}%`)

    // Also show breakdown
    console.log('\n Bundle Analysis:')
    execSync(`npx esbuild ${inputFile} --bundle --minify --format=esm --outfile=${outputFile} --analyze`, {
        stdio: 'inherit'
    })
}

analyzeSize().catch(console.error)
