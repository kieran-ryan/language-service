import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { readFile } from 'fs/promises'
import glob from 'glob'
import path from 'path'

import { ExpressionBuilder, LanguageName } from '../../src/index.js'
import { NodeParserAdapter } from '../../src/tree-sitter/NodeParserAdapter.js'
import { ParserAdapter } from '../../src/tree-sitter/types'
import { WasmParserAdapter, WasmUrls } from '../../src/tree-sitter/WasmParserAdapter.js'

function defineContract(makeParserAdapter: () => Promise<ParserAdapter>) {
  let expressionBuilder: ExpressionBuilder
  beforeEach(async () => {
    const parserAdpater = await makeParserAdapter()
    expressionBuilder = new ExpressionBuilder(parserAdpater)
  })

  for (const dir of glob.sync(`test/tree-sitter/testdata/*`)) {
    const language = path.basename(dir) as LanguageName
    it(`builds parameter types and expressions from ${language} source`, async () => {
      const contents = await Promise.all(glob.sync(`${dir}/**/*`).map((f) => readFile(f, 'utf-8')))
      const sources = contents.map((content) => ({
        language,
        content,
      }))
      const expressions = expressionBuilder.build(sources, [])
      assert.deepStrictEqual(
        expressions.map((e) =>
          e instanceof CucumberExpression ? e.source : (e as RegularExpression).regexp
        ),
        ['a {uuid}', 'a {date}', /^a regexp$/]
      )
    })
  }
}

describe('ExpressionBuilder', () => {
  context('with NodeParserAdapter', () => {
    defineContract(() => Promise.resolve(new NodeParserAdapter()))
  })

  context('with WasmParserAdapter', () => {
    const WASM_URLS: WasmUrls = {
      java: './parsers/java.wasm',
      typescript: './parsers/typescript.wasm',
    }

    // @ts-ignore
    defineContract(async () => {
      const wasmParserAdapter = new WasmParserAdapter()
      await wasmParserAdapter.init(WASM_URLS)
      return wasmParserAdapter
    })
  })
})
