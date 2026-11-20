'use client'

import React, { useEffect, useRef } from 'react'
import { TextareaInput, useDocumentInfo, useField, useFormFields, useLocale } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import registry from '../lib/website-text-registry.json'

export const WebsiteTextFields: JSONFieldClientComponent = ({path,readOnly}) => {
  const page = useFormFields(([fields])=>fields.page?.value)
  const { id } = useDocumentInfo()
  const locale = useLocale()
  const {value,setValue,disabled,formInitializing,formProcessing,showError,errorMessage} = useField<Record<string,string>>({path})
  const previousPage = useRef(page)
  useEffect(() => {
    if (!id && !formInitializing && previousPage.current !== undefined && previousPage.current !== page) setValue({})
    previousPage.current = page
  }, [page, id, formInitializing, setValue])
  const definition = registry.find(record=>record.page===page)
  if (!definition) return null
  return <div className="field-type">
    {showError && <p role="alert">{errorMessage}</p>}
    {definition.fields.map(field=><TextareaInput key={field.key}
      path={`${path}-${field.key.replaceAll('.','-')}`} label={`${field.label} — ${locale?.label ?? locale?.code ?? 'English'}`}
      value={value?.[field.key]??''} rows={field.english.length>160?5:2}
      readOnly={Boolean(readOnly||disabled||formInitializing||formProcessing)}
      description={locale?.code==='en'?undefined:field.english}
      onChange={event=>setValue({...value,[field.key]:event.target.value})} />)}
  </div>
}
