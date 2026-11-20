import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getPayload } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'

process.env.PAYLOAD_SECRET = 'website-text-disposable-fixture-only'
process.env.DATABASE_URI = 'file:/tmp/website-text-unused-config.db'
process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true'
const locales = ['en','kh','cn'] as const

test('native Website Text preserves other locale drafts, old editorial records and audit history', { timeout:120000 }, async () => {
  const config = await loadPayloadConfig()
  assert.ok(config.collections.some(c => c.slug === 'website-text'), 'The new collection must exist')
  const dir = await mkdtemp(path.join(os.tmpdir(),'website-text-native-'))
  const payload = await getPayload({ key:randomUUID(),config:{ ...config,telemetry:false,
    typescript:{...config.typescript,autoGenerate:false}, admin:{...config.admin,importMap:{...config.admin.importMap,autoGenerate:false}},
    db:sqliteAdapter({client:{url:`file:${path.join(dir,'fixture.db')}`},transactionOptions:{}}) as typeof config.db } })
  try {
    const tenant = await payload.db.create({collection:'tenants',data:{name:'Text fixture',slug:'text-fixture',enabledCollections:['pages','homepage']}})
    const user = {id:1,collection:'users',roles:['editor'],tenants:[{tenant:tenant.id}]} as never
    const old = await payload.create({collection:'homepage',locale:'kh',user,overrideAccess:false,
      data:{tenant:tenant.id,heroPill:'Borin published wording',_status:'published'}})
    await payload.update({collection:'homepage',id:old.id,locale:'kh',user,overrideAccess:false,draft:true,
      data:{heroPill:'Borin latest private draft',_status:'draft',_editorialRevision:old._editorialRevision}})
    const oldSnapshot = async () => ({parent:await payload.db.findOne({collection:'homepage',where:{id:{equals:old.id}}}),
      versions:await payload.db.findVersions({collection:'homepage',pagination:false,sort:'id',where:{parent:{equals:old.id}}})})
    const beforeOld = await oldSnapshot()
    const initial = (locale:string) => ({'footer.tagline':`${locale} original`,'footer.copyright':'© {year} Roomchang'})
    const created = await payload.create({collection:'website-text',locale:'en',user,overrideAccess:false,
      data:{tenant:tenant.id,page:'footer',copy:initial('en'),_status:'published'}})
    const read = (locale:typeof locales[number],draft=false) => payload.findByID({collection:'website-text',id:created.id,
      locale,fallbackLocale:false,draft,depth:0,user,overrideAccess:false})
    const save = async(locale:typeof locales[number],draft:boolean,copy:unknown,revision?:string) => payload.update({
      collection:'website-text' as never,id:created.id,locale,user,overrideAccess:false,draft,publishAllLocales:false,
      publishSpecificLocale:draft?undefined:locale,data:{copy,_status:draft?'draft':'published',
        _editorialRevision:revision??(await read(locale,true))._editorialRevision} as never})
    for(const locale of ['kh','cn'] as const)await save(locale,false,initial(locale))
    for(const locale of locales)await save(locale,true,{...initial(locale),'footer.tagline':`${locale} private draft`})
    for(const locale of locales){
      const others=await Promise.all(locales.filter(l=>l!==locale).map(async l=>({locale:l,published:(await read(l)).copy,draft:(await read(l,true)).copy})))
      const stale=(await read(locale,true))._editorialRevision
      await save(locale,false,{...initial(locale),'footer.tagline':`${locale} tested publication`})
      assert.deepEqual((await read(locale)).copy,{...initial(locale),'footer.tagline':`${locale} tested publication`})
      for(const other of others){assert.deepEqual((await read(other.locale)).copy,other.published);assert.deepEqual((await read(other.locale,true)).copy,other.draft)}
      assert.ok(stale)
      await assert.rejects(()=>save(locale,true,initial(locale),stale))
      assert.deepEqual(await oldSnapshot(),beforeOld,'Unrelated Borin content and every version must be unchanged')
    }
    for (const draft of [true, false]) {
      for (const copy of [{'nav.services':'Wrong owner'}, {'footer.copyright':'Missing year'}, ['not a map']]) {
        const before = await read('kh', true)
        await assert.rejects(() => save('kh', draft, copy), 'Invalid copy must also be rejected in drafts')
        assert.deepEqual((await read('kh', true)).copy, before.copy)
      }
    }
    await assert.rejects(()=>payload.update({collection:'website-text' as never,id:created.id,locale:'en',user,overrideAccess:false,
      data:{page:'navigation',copy:{'nav.services':'Wrong identity'},_status:'draft',_editorialRevision:created._editorialRevision} as never}))
    await assert.rejects(()=>payload.create({collection:'website-text' as never,locale:'en',user,overrideAccess:false,
      data:{tenant:tenant.id,page:'footer',copy:initial('en'),_status:'draft'} as never}))
    const other=await payload.db.create({collection:'tenants',data:{name:'Other owner',slug:'other-text',enabledCollections:['pages']}})
    await assert.rejects(()=>payload.create({collection:'website-text' as never,locale:'en',user,overrideAccess:false,
      data:{tenant:other.id,page:'footer',copy:initial('en'),_status:'draft'} as never}))
    const audit=await payload.find({collection:'editorial-audit',pagination:false,overrideAccess:true,where:{docCollection:{equals:'website-text'}}})
    assert.ok(audit.docs.some(e=>Array.isArray(e.changedFields)&&e.changedFields.includes('copy.footer.tagline')),'Plain-text child diffs must be auditable')
    assert.ok(audit.docs.some(e=>e.action==='draft')&&audit.docs.some(e=>e.action==='publish'))
  }finally{await payload.destroy();await rm(dir,{recursive:true,force:true})}
})
