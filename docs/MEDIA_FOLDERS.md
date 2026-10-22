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

**New folder** is available beside the library/picker Folder selector and on new
upload forms. Choose a parent and enter a name; nested paths such as
`technology/durr-dental-mylunos` are supported. Spaces become hyphens and Latin
accents are normalized in new paths only. The new folder is selected immediately.
Creating or cancelling a folder never submits the enclosing page or upload form.

Empty folders persist in the append-only, tenant-scoped `media-directories`
collection. They are merged into the existing hierarchy at read time; creating
one does not create a placeholder image or move any R2 objects. Empty-folder
filters match only that folder, never the entire library. Folder changes are
shared across languages, and successful creation is recorded in Editorial audit.

`GET /api/media/folders` requires a signed-in user, honors media read access,
scopes to one authorized tenant, and additionally constrains tenant-host requests
to that workspace. `POST /api/media/folders` creates a folder, with the same tenant
boundary, staff permissions and a browser-origin check. Repeated/concurrent
creation returns the existing path without rewriting it. Responses are private
and uncached. Migration `20261022_040000_media_directories` adds only the new folder
table; it retains every existing schema definition and requires no media/content
backfill or changes to page references or versions. Renaming, moving and deleting
folders are intentionally not part of this feature.
