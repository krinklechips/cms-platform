type PublishingState = {
  modified: boolean
  processing: boolean
  hasPublishedDoc: boolean
  unpublishedVersionCount: number
}

export const publishingState = (state: PublishingState): string => {
  if (state.processing) return 'Saving changes'
  if (state.modified) return 'Unsaved changes'
  if (state.unpublishedVersionCount > 0) return 'Draft saved'
  return state.hasPublishedDoc ? 'Published in CMS' : 'Not published'
}
