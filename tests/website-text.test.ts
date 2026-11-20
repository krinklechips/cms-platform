import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'
const available = existsSync(new URL('../src/lib/website-text.ts', import.meta.url))
test('the approved website-text validation interface exists', () => assert.ok(available))
test('the registry covers reviewed page copy and shared Navigation/Footer without native-editor keys', { skip: !available }, async () => {
  const { websiteTextPages, websiteTextPage } = await import('../src/lib/website-text')
  assert.equal(websiteTextPages.filter(p => !['navigation','footer'].includes(p.page)).reduce((n,p) => n+p.fields.length,0),171)
  assert.equal(websiteTextPage('footer')?.path,'#site-footer')
  assert.ok(websiteTextPage('navigation')?.fields.some(f => f.key === 'nav.cosmeticDentistry'))
  assert.equal(websiteTextPage('__proto__'), undefined)
  assert.ok(websiteTextPages.flatMap(p => p.fields).every(f => !/^(homeServices|homeHero|homeStats|aboutTimeline)\./.test(f.key)))
})
test('copy validation permits only that page strings and preserves required message arguments', { skip: !available }, async () => {
  const { validateWebsiteCopy } = await import('../src/lib/website-text')
  assert.equal(validateWebsiteCopy('footer',{'footer.tagline':'ពាក្យថ្មី','footer.copyright':'© {year} Roomchang'}),true)
  assert.equal(validateWebsiteCopy('footer',{'footer.tagline':''}),true)
  assert.equal(validateWebsiteCopy('footer',{'footer.copyright':''}),true)
  for(const [page,copy] of [['missing',{}],['footer',[]],['footer',{'nav.services':'Wrong page'}],['footer',{'footer.tagline':12}],['footer',{'footer.tagline':'Broken {argument'}],['footer',{'footer.copyright':'Missing year'}],['footer',JSON.parse('{"__proto__":"unsafe"}')],['footer',{'footer.tagline':'<script>bad</script>'}]]) {
    assert.equal(typeof validateWebsiteCopy(page,copy),'string',JSON.stringify(copy))
  }
})
