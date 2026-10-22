# Website Editor Preview

The 27 website-content collections share the same native Payload inline preview.
The existing `getPreviewUrl` resolver selects the relevant page and current CMS
language (English/en, Khmer/kh, Chinese/cn). The website uses those URL segments
and the corresponding en/km/zh HTML language tags.
Media, enquiries, audit logs and platform administration are not page previews.
Unmapped records and new unsaved records do not offer a misleading homepage preview.

On desktop, opening an eligible editor opens the right-hand preview even if an old
collection preference had hidden it. **Hide preview** and **Show preview** change
only panel state. Saving or rerendering the same editor does not reopen a hidden
panel. Opening another document starts with the same default layout.

At 1024px or narrower, the form is shown first. **Show preview** switches to a
full-width preview; **Hide preview** returns to the existing form. Fields remain
mounted, so the switch does not discard entered text or submit the form.

The panel renders the test website's **saved draft**, refreshed after saving. It
does not promise per-keystroke updates. Publishing in the selected language is
still a separate action; showing or hiding preview never saves or publishes.

No content migration, import or reconciliation is part of this change. It does
not update production, existing content, drafts, versions or media relationships.
