/*
Produces production builds and stitches together d.ts files.

To specify the package to build, simply pass its name and the desired build
formats to output (defaults to `buildOptions.formats` specified in that package,
or "esm,cjs"):

```
# name supports fuzzy match. will build all packages with name containing "dom":
yarn build dom

# specify the format to output
yarn build core --formats cjs
```
*/

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
const { gzipSync } = require('zlib')
const { compress } = require('brotli')
const { targets: allTargets, fuzzyMatchTarget } = require('./utils')

const args = require('minimist')(process.argv.slice(2))
const targets = args._
const formats = args.formats || args.f
const devOnly = args.devOnly || args.d
const prodOnly = !devOnly && (args.prodOnly || args.p)
const sourceMap = args.sourcemap || args.s
const isRelease = args.release
const buildTypes = args.t || args.types || isRelease
const buildAllMatching = args.all || args.a
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

let shouldEmitDeclarations = buildTypes

class ApiExtractor {
  static entryPoints = []
  static apiExtractorTempPath = path.resolve(__dirname, '../api-extractor-temp')
  static compilerState
  static compilerStateTarget
  static runQueue = []

  static async make() {
    if (!buildTypes) return
    if (!ApiExtractor.compilerStateTarget) {
      console.warn('not find compilerStateTarget')
      return
    }
    const target = ApiExtractor.compilerStateTarget
    const pkgDir = path.resolve(`packages/${target}`)
    const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`)

    await fs.remove(ApiExtractor.apiExtractorTempPath)
    await fs.move(
      `${pkgDir}/dist/packages`,
      path.resolve(ApiExtractor.apiExtractorTempPath, 'packages')
    )
    const {
      CompilerState,
      ExtractorConfig
    } = require('@microsoft/api-extractor')
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(
      extractorConfigPath
    )
    ApiExtractor.compilerState = CompilerState.create(extractorConfig, {
      additionalEntryPoints: ApiExtractor.entryPoints
    })

    const promises = ApiExtractor.runQueue.map(runner => runner())
    return await Promise.all(promises)
  }

  static async use(target, pkgDir, pkg) {
    if (!buildTypes || !pkg.types) return
    ApiExtractor.runQueue.push(async () => {
      const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`)
      console.log()
      console.log(
        chalk.bold(chalk.yellow(`Rolling up type definitions for ${target}...`))
      )
      const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')
      const extractorConfig = ExtractorConfig.loadFileAndPrepare(
        extractorConfigPath
      )
      const extractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: true,
        compilerState: ApiExtractor.compilerState
      })

      if (extractorResult.succeeded) {
        // concat additional d.ts to rolled-up dts
        const typesDir = path.resolve(pkgDir, 'types')
        if (await fs.exists(typesDir)) {
          const dtsPath = path.resolve(pkgDir, pkg.types)
          const existing = await fs.readFile(dtsPath, 'utf-8')
          const typeFiles = await fs.readdir(typesDir)
          const toAdd = await Promise.all(
            typeFiles.map(file => {
              return fs.readFile(path.resolve(typesDir, file), 'utf-8')
            })
          )
          await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'))
        }
        console.log(
          chalk.bold(chalk.green(`API Extractor completed successfully.`))
        )
      } else {
        console.error(
          `API Extractor completed with ${extractorResult.errorCount} errors` +
            ` and ${extractorResult.warningCount} warnings`
        )
        process.exitCode = 1
      }

      await fs.remove(`${pkgDir}/dist/packages`)
    })
  }

  static makeEntryPoints(targets) {
    if (!buildTypes) return
    for (const target of targets) {
      const entryPoint = path.resolve(
        ApiExtractor.apiExtractorTempPath,
        `packages/${target}/src/index.d.ts`
      )
      ApiExtractor.entryPoints.push(entryPoint)
    }
  }
}

run()

async function run() {
  if (isRelease) {
    // remove build cache for release builds to avoid outdated enum values
    await fs.remove(path.resolve(__dirname, '../node_modules/.rts2_cache'))
  }
  if (!targets.length) {
    await buildAll(allTargets)
    checkAllSizes(allTargets)
  } else {
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching))
    checkAllSizes(fuzzyMatchTarget(targets, buildAllMatching))
  }
}

async function buildAll(targets) {
  ApiExtractor.makeEntryPoints(targets)
  await runParallel(require('os').cpus().length, targets, build)
  await ApiExtractor.make()
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = []
  const executing = []
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source))
    ret.push(p)

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing)
      }
    }
  }
  return Promise.all(ret)
}

async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`)
  const pkg = require(`${pkgDir}/package.json`)

  // only build published packages for release
  if (isRelease && pkg.private) {
    return
  }

  // if building a specific format, do not remove dist.
  if (!formats) {
    await fs.remove(`${pkgDir}/dist`)
  }

  const env =
    (pkg.buildOptions && pkg.buildOptions.env) ||
    (devOnly ? 'development' : 'production')

  let emitDeclarations = ''
  if (shouldEmitDeclarations) {
    emitDeclarations = 'EMIT_DECLARATIONS:true'
    shouldEmitDeclarations = false
    ApiExtractor.compilerStateTarget = target
  }

  await execa(
    'npx',
    [
      'rollup',
      '-c',
      '--environment',
      [
        `COMMIT:${commit}`,
        `NODE_ENV:${env}`,
        `TARGET:${target}`,
        formats ? `FORMATS:${formats}` : ``,
        buildTypes ? `TYPES:true` : ``,
        prodOnly ? `PROD_ONLY:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``,
        emitDeclarations
      ]
        .filter(Boolean)
        .join(',')
    ],
    { stdio: 'inherit' }
  )

  await ApiExtractor.use(target, pkgDir, pkg)
}

function checkAllSizes(targets) {
  if (devOnly) {
    return
  }
  console.log()
  for (const target of targets) {
    checkSize(target)
  }
  console.log()
}

function checkSize(target) {
  const pkgDir = path.resolve(`packages/${target}`)
  checkFileSize(`${pkgDir}/dist/${target}.global.prod.js`)
  checkFileSize(`${pkgDir}/dist/${target}.runtime.global.prod.js`)
}

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }
  const file = fs.readFileSync(filePath)
  const minSize = (file.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(file)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = compress(file)
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
  console.log(
    `${chalk.gray(
      chalk.bold(path.basename(filePath))
    )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
  )
}
