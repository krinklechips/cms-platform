import type { CollectionBeforeOperationHook } from 'payload'

export const disableEditorialWriteFallback: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation !== 'create' && operation !== 'update') return
  const locale = 'publishSpecificLocale' in args && args.publishSpecificLocale
    ? args.publishSpecificLocale : req.locale
  const localization = req.payload.config.localization
  if (localization && typeof locale === 'string' && localization.localeCodes.includes(locale)) {
    // Payload captures fallback after beforeOperation; the response becomes the editor's next form data.
    req.fallbackLocale = false
  }
}
