import React from 'react'

/**
 * List-view cell for `published` checkboxes: editors scan these columns
 * constantly and Payload's default renders developer-speak `true` / `false`
 * chips (UX audit). A check or a quiet dash reads instantly.
 */
export const PublishedCell: React.FC<{ cellData?: unknown }> = ({ cellData }) =>
  cellData ? (
    <span style={{ color: 'var(--theme-success-600, #2e7d4f)', fontWeight: 700 }} title="Published">
      ✓
    </span>
  ) : (
    <span style={{ color: 'var(--theme-elevation-400)' }} title="Not published">
      —
    </span>
  )
