'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import type { EditorialAuditDiff } from '../lib/editorial-audit'

const display = (value: unknown) => value === null || value === undefined ? '(empty)'
  : typeof value === 'string' ? value : JSON.stringify(value, null, 2)

export const AuditDiffTable = ({ diffs }: { diffs: EditorialAuditDiff[] }) => <div className="field-type" style={{ minWidth: 0 }}>
  <h3 className="field-label">Changes</h3>
  {diffs.length ? <div style={{ overflowX: 'auto', width: '100%' }}>
    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
      <caption style={{ textAlign: 'left', paddingBottom: 12 }}>Recorded field changes</caption>
      <thead><tr>{['Field', 'Language scope', 'Before', 'After'].map(label => <th key={label} scope="col" style={{ textAlign: 'left', padding: 8 }}>{label}</th>)}</tr></thead>
      <tbody>{diffs.map(diff => <tr key={diff.path}>
        <th scope="row" style={{ textAlign: 'left', verticalAlign: 'top', padding: 8, overflowWrap: 'anywhere', borderTop: '1px solid var(--theme-elevation-150)' }}>
          {diff.label}<small style={{ display: 'block', fontWeight: 400, color: 'var(--theme-elevation-600)' }}>{diff.path}</small>
        </th>
        <td style={{ verticalAlign: 'top', padding: 8, overflowWrap: 'anywhere', borderTop: '1px solid var(--theme-elevation-150)' }}>{diff.scope === 'all' ? 'All languages' : diff.scope}</td>
        {[diff.before, diff.after].map((value, index) => <td key={index} style={{ verticalAlign: 'top', padding: 8, borderTop: '1px solid var(--theme-elevation-150)' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit' }}>{display(value)}</pre>
        </td>)}
      </tr>)}</tbody>
    </table>
  </div> : <p>No field-value changes.</p>}
</div>

export const AuditChanges: JSONFieldClientComponent = ({ path }) => {
  const { value } = useField<EditorialAuditDiff[]>({ path })
  return <AuditDiffTable diffs={Array.isArray(value) ? value : []} />
}
