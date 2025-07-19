#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, statSync } from 'fs'
import { gzip } from 'zlib'
import { promisify } from 'util'

const gzipAsync = promisify(gzip)

async function analyzeSize () {
    const inputFile = 'example/index.ts'
    const outputFile = 'example/dist/bundle.min.js'

    console.log('🔧 Building bundle...')

    // Build the bundle
    execSync(`npx esbuild ${inputFile} --bundle --minify --format=esm --outfile=${outputFile}`, {
        stdio: 'inherit'
    })

    // Get file sizes
    const minifiedSize = statSync(outputFile).size
    const minifiedContent = readFileSync(outputFile)
    const gzippedContent = await gzipAsync(minifiedContent)
    const gzippedSize = gzippedContent.length

    console.log('\n📊 Size Analysis:')
    console.log('================')
    console.log(`📄 Minified:  ${minifiedSize.toLocaleString()} bytes (${(minifiedSize / 1024).toFixed(2)} KB)`)
    console.log(`🗜️  Gzipped:   ${gzippedSize.toLocaleString()} bytes (${(gzippedSize / 1024).toFixed(2)} KB)`)
    console.log(`📉 Compression: ${((1 - gzippedSize / minifiedSize) * 100).toFixed(1)}%`)

    // Also show breakdown
    console.log('\n🔍 Bundle Analysis:')
    execSync(`npx esbuild ${inputFile} --bundle --minify --format=esm --outfile=${outputFile} --analyze`, {
        stdio: 'inherit'
    })
}

analyzeSize().catch(console.error)
