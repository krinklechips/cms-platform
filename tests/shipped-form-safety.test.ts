import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import * as qs from 'qs-esm'
import { formatAdminURL } from 'payload/shared'
import { nativeBundle, nativeCallback, nativeFunction } from './helpers/native-ui-bundle'

test('shipped Form keeps unsaved changes dirty after a rejected save', () => {
  const form = nativeFunction('Error submitting form')
  let conditional: ts.ConditionalExpression | undefined
  function visit(node: ts.Node) {
    if (ts.isConditionalExpression(node) && node.getText(nativeBundle).includes('$e.current') && node.getText(nativeBundle).includes('Y(!1)')) conditional = node
    ts.forEachChild(node, visit)
  }
  visit(form)
  assert.ok(conditional)
  for (const ok of [false, true]) for (const editedDuringSave of [false, true]) {
    let modified = true
    const pending = { current: editedDuringSave }
    new Function('Io', '$e', 'Y', `return (${conditional.getText(nativeBundle)})`)({ ok }, pending, (value: boolean) => { modified = value })
    assert.equal(modified, !ok || editedDuringSave)
    if (!ok || editedDuringSave) assert.equal(pending.current, false)
  }
})

for (const protectedCollection of [false, true]) for (const localizedStatus of [false, true]) {
  test(`shipped Publish preserves explicit all-language intent (protected=${protectedCollection}, localized status=${localizedStatus})`, async () => {
    const callback = nativeCallback(nativeFunction('version:publishChanges'), 'j')
    const calls: { action: string }[] = []
    const scope = { Bg: qs, Mg: formatAdminURL, u: 'idle', g: 'cn', w: '/api', r: undefined, o: 'pages', e: 22,
      N: localizedStatus, cmsProtected: protectedCollection, m: async (args: { action: string }) => { calls.push(args); return true },
      a: () => undefined, l: () => undefined, i: () => undefined }
    await new Function(...Object.keys(scope), `return (${callback.getText(nativeBundle)})`)(...Object.values(scope))()
    assert.equal(calls.length, 1)
    const query = new URL(calls[0].action, 'https://cms.example.test').searchParams
    assert.equal(query.get('locale'), 'cn')
    assert.equal(query.get('publishAllLocales'), protectedCollection || localizedStatus ? 'true' : null)
  })
}
