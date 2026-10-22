# Media folders

The Images & Files list and Payload image-selection drawers share the same folder
browser. Folder counts come from the selected tenant's Media records, not from a
public bucket listing. Search and existing image/tenant filters stay active when
navigating folders. Selecting a parent includes its subfolders.

Categories mirror stored R2 paths. For example, `roomchang/brands/logos` and newer
`serviette-media/roomchang/brands/logos` both appear under `brands / logos`.
This is a read-time grouping only: neither object key nor stored prefix changes.
Unexpected legacy paths remain accessible under their original stored path.

New uploads offer an Upload folder selector, including in document drawers and
bulk-upload forms. The virtual `_uploadFolder` input selects a category under the
explicit, authorized document tenant. The existing S3 adapter continues to contain
new objects under its configured `serviette-media` root. General uploads use the
tenant's root category. Existing categories come from the current media catalogue.
Existing files show their original R2 folder read-only; moving or replacing a
shared file remains prohibited.

`GET /api/media/folders` requires a signed-in user, honors media read access,
scopes to one authorized tenant, and additionally constrains tenant-host requests
to that workspace. Responses are private and uncached. No migration, backfill,
content import, or change to page references or versions is required.
