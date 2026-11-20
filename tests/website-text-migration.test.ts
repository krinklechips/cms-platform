import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync,readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { mkdtemp,rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import pg from 'pg'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload, type Payload } from 'payload'
import { migrations } from '../src/migrations'
import { loadPayloadConfig } from './helpers/load-payload-config'

const name='20261120_110000_website_text',file=new URL(`../src/migrations/${name}.json`,import.meta.url)
test('the Website Text migration exists and retains all predecessor snapshot definitions',()=>{
  assert.ok(existsSync(file),'New additive snapshot must exist')
  const previous=JSON.parse(readFileSync(new URL('../src/migrations/20261108_030000_service_section_spacing.json',import.meta.url),'utf8'))
  const current=JSON.parse(readFileSync(file,'utf8'))
  assert.equal(current.prevId,previous.id)
  const added=Object.keys(current.tables).filter(k=>/^public\._?website_text(?:_|$)/.test(k));assert.equal(added.length,4)
  for(const table of added){assert.equal(current.tables[table].isRLSEnabled,true);delete current.tables[table]}
  for(const key of Object.keys(current.enums))if(/^public\.enum__?website_text_/.test(key))delete current.enums[key]
  const rel=current.tables['public.payload_locked_documents_rels']
  for(const group of ['columns','indexes','foreignKeys'])for(const key of Object.keys(rel[group]))if(key.includes('website_text'))delete rel[group][key]
  assert.deepEqual({...current,id:previous.id,prevId:previous.prevId},previous)
})

const bin='/opt/homebrew/opt/postgresql@18/bin'
test('PostgreSQL adds only new text storage and retains old published, locale and version rows',{
  timeout:120000,skip:!existsSync(path.join(bin,'initdb'))?'Owned PostgreSQL fixture unavailable':false,
},async()=>{
  const migration=migrations.find(m=>m.name===name);assert.ok(migration,'Migration must be registered')
  const dir=await mkdtemp(path.join(os.tmpdir(),'website-text-migration-')),server=net.createServer()
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const port=(server.address() as net.AddressInfo).port
  await new Promise<void>(resolve=>server.close(()=>resolve()))
  const run=(command:string,args:string[])=>execFileSync(path.join(bin,command),args,{encoding:'utf8',env:{PATH:process.env.PATH,HOME:dir,LC_ALL:'C',NODE_ENV:'test'}})
  let running=false,pool:pg.Pool|undefined,cms:Payload|undefined,nativePool:pg.Pool|undefined
  try{
    run('initdb',['-D',path.join(dir,'cluster'),'-U','text_fixture','-A','trust','--no-locale'])
    run('pg_ctl',['-D',path.join(dir,'cluster'),'-l',path.join(dir,'pg.log'),'-o',`-h 127.0.0.1 -p ${port} -k ${dir}`,'-w','start']);running=true
    pool=new pg.Pool({host:'127.0.0.1',port,user:'text_fixture',database:'postgres'});const args={db:drizzle(pool)} as never
    for(const old of migrations.slice(0,migrations.indexOf(migration)))await old.up(args)
    const tenant=(await pool.query("INSERT INTO tenants (name,slug) VALUES ('Text fixture','text-fixture') RETURNING id")).rows[0].id
    const hero=(await pool.query("INSERT INTO homepage (tenant_id,_status) VALUES ($1,'published') RETURNING id",[tenant])).rows[0].id
    const version=(await pool.query("INSERT INTO _homepage_v (parent_id,version_tenant_id,version__status,latest) VALUES ($1,$2,'draft',true) RETURNING id",[hero,tenant])).rows[0].id
    for(const locale of ['en','kh','cn']){
      await pool.query('INSERT INTO homepage_locales (_parent_id,_locale,hero_pill) VALUES ($1,$2,$3)',[hero,locale,locale+' original'])
      await pool.query('INSERT INTO _homepage_v_locales (_parent_id,_locale,version_hero_pill) VALUES ($1,$2,$3)',[version,locale,locale+' Borin private draft'])
    }
    const quote=(s:string)=>'"'+s.replaceAll('"','""')+'"',saved=new Map<string,{columns:string[];rows:unknown[]}>()
    const tables=(await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(r=>r.tablename)
    for(const table of tables){const columns=(await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",[table])).rows.map(r=>r.column_name);saved.set(table,{columns,rows:(await pool.query(`SELECT * FROM ${quote(table)} ORDER BY id`)).rows})}
    await migration.up(args)
    for(const[table,old]of saved)assert.deepEqual((await pool.query(`SELECT ${old.columns.map(quote).join(',')} FROM ${quote(table)} ORDER BY id`)).rows,old.rows,table)
    assert.equal((await pool.query("SELECT count(*)::int n FROM pg_tables WHERE schemaname='public'")).rows[0].n,tables.length+4)
    const secure=(await pool.query("SELECT relname,relrowsecurity FROM pg_class WHERE relname IN ('website_text','website_text_locales','_website_text_v','_website_text_v_locales')")).rows
    assert.equal(secure.length,4);assert.ok(secure.every(r=>r.relrowsecurity))
    await pool.query("INSERT INTO website_text (tenant_id,page) VALUES ($1,'footer')",[tenant])
    await assert.rejects(()=>pool!.query("INSERT INTO website_text (tenant_id,page) VALUES ($1,'footer')",[tenant]),/unique|duplicate/i)
    await pool.query("INSERT INTO website_text (tenant_id,page) VALUES ($1,'navigation')",[tenant])
    await assert.rejects(()=>migration.down(args),/retained|Roll back/i)
    const config=await loadPayloadConfig()
    cms=await getPayload({key:randomUUID(),config:{...config,secret:'website-text-owned-pg-only',telemetry:false,
      db:postgresAdapter({pool:{},push:false}) as typeof config.db,typescript:{...config.typescript,autoGenerate:false},
      admin:{...config.admin,importMap:{...config.admin.importMap,autoGenerate:false}}},disableDBConnect:true,disableOnInit:true,cron:false})
    nativePool=new pg.Pool({host:'127.0.0.1',port,user:'text_fixture',database:'postgres'})
    const db=cms.db as unknown as PostgresAdapter
    db.pool=nativePool;db.drizzle=drizzle({client:nativePool,schema:db.schema});db.resolveInitializing?.()
    const user={id:1,collection:'users',roles:['super-admin']} as never
    const record=await cms.create({collection:'website-text',locale:'en',user,data:{tenant,page:'about',copy:{'about.hero.heading':'EN original'},_status:'published'}})
    for(const locale of ['kh','cn'] as const){
      const opened=await cms.findByID({collection:'website-text',id:record.id,locale,draft:true,user})
      await cms.update({collection:'website-text',id:record.id,locale,draft:true,user,
        data:{copy:{'about.hero.heading':locale+' private draft'},_editorialRevision:opened._editorialRevision} as never})
    }
    const opened=await cms.findByID({collection:'website-text',id:record.id,locale:'en',draft:true,user})
    await cms.update({collection:'website-text',id:record.id,locale:'en',publishSpecificLocale:'en',user,
      data:{copy:{'about.hero.heading':'EN changed'},_status:'published',_editorialRevision:opened._editorialRevision} as never})
    assert.deepEqual((await cms.findByID({collection:'website-text',id:record.id,locale:'en',user})).copy,{'about.hero.heading':'EN changed'})
    for(const locale of ['kh','cn'] as const){
      assert.deepEqual((await cms.findByID({collection:'website-text',id:record.id,locale,fallbackLocale:false,draft:true,user})).copy,{'about.hero.heading':locale+' private draft'})
      assert.deepEqual((await cms.findByID({collection:'website-text',id:record.id,locale,fallbackLocale:false,user})).copy,{})
    }
    for(const table of ['homepage','homepage_locales','_homepage_v','_homepage_v_locales']) {
      const old=saved.get(table)!
      assert.deepEqual((await pool.query(`SELECT * FROM ${quote(table)} ORDER BY id`)).rows,old.rows,table)
    }
  }finally{await cms?.destroy();await nativePool?.end();await pool?.end();if(running)run('pg_ctl',['-D',path.join(dir,'cluster'),'-m','immediate','-w','stop']);await rm(dir,{recursive:true,force:true})}
})
