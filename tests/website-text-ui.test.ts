import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, test } from 'node:test'
import React, { act } from 'react'
import ts from 'typescript'

const { Window } = await import('happy-dom')
const window = new Window({ url:'https://cms.example.test/admin' })
Object.assign(globalThis, {window,document:window.document,HTMLElement:window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})
const { createRoot } = await import('react-dom/client')
const container = document.createElement('div')
document.body.append(container)
const root = createRoot(container)
after(async () => { await act(() => root.unmount()); window.happyDOM.abort() })

let page: string | undefined, id: number | undefined, initializing=false, locale='en'
let value: Record<string,string> = {}
const writes: Record<string,string>[] = []
const output: { WebsiteTextFields?: React.ComponentType<{path:string}> } = {}
const source = new URL('../src/components/WebsiteTextFields.tsx',import.meta.url)
const require = createRequire(source)
const compiled = ts.transpileModule(readFileSync(source,'utf8'), {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
const ui = {
  useFormFields: () => page,
  useDocumentInfo: () => ({id}),
  useLocale: () => ({code:locale,label:locale}),
  useField: () => ({value,setValue:(next:Record<string,string>) => {value=next;writes.push(next)},formInitializing:initializing}),
  TextareaInput: ({path,label,value,onChange}: {path:string;label:string;value:string;onChange:React.ChangeEventHandler<HTMLTextAreaElement>}) =>
    React.createElement('label',null,label,React.createElement('textarea',{id:path,value,onChange})),
}
new Function('require','module','exports',compiled)((name:string) => name==='@payloadcms/ui'?ui:require(name),{exports:output},output)
const render = () => act(() => root.render(React.createElement(output.WebsiteTextFields!,{path:'copy'})))
const reset = async () => {
  await act(() => root.render(null))
  page=undefined;id=undefined;initializing=false;locale='en';value={};writes.length=0
}

test('changing the unsaved page clears only that new form, not a saved record or locale switch',async () => {
  await reset()
  page='about';value={'about.hero.heading':'Unsaved About'}
  await render()
  assert.equal(writes.length,0)
  page='footer';await render()
  assert.deepEqual(value,{})
  assert.equal(writes.length,1)
  value={'footer.tagline':'Khmer draft'};locale='kh';await render()
  assert.equal(value['footer.tagline'],'Khmer draft')
  assert.equal(writes.length,1)
  await reset()
  id=42;initializing=true;await render()
  page='footer';value={'footer.tagline':'Existing Borin wording'};initializing=false;await render()
  assert.equal(value['footer.tagline'],'Existing Borin wording')
  assert.equal(writes.length,0)
})

test('initializing a new record never discards its loaded draft values',async () => {
  await reset()
  initializing=true;await render()
  page='footer';value={'footer.tagline':'Loaded initial text'};await render()
  initializing=false;await render()
  assert.equal(value['footer.tagline'],'Loaded initial text')
  assert.equal(writes.length,0)
})
