import { TenantField as TenantField_1d0591e3cf4f332c83a86da13a0de59a } from '@payloadcms/plugin-multi-tenant/client'
import { HeroImageUrlPreview as HeroImageUrlPreview_7462301dd20d90072f654d047389192b } from '../../../components/ImageUrlPreview'
import { PublishingStatus as PublishingStatus_4f170ac3e9a486a1c232ad658ebe9a1b } from '../../../components/PublishingStatus'
import { AssignTenantFieldTrigger as AssignTenantFieldTrigger_1d0591e3cf4f332c83a86da13a0de59a } from '@payloadcms/plugin-multi-tenant/client'
import { PreviewPublishButton as PreviewPublishButton_195e97763028237bdc82d1a53c4245fc } from '../../../components/PreviewPublishButton'
import { HomepageSingleRedirect as HomepageSingleRedirect_b28ab2a24502ab103566306601f21301 } from '../../../components/HomepageSingleRedirect'
import { ImageCell as ImageCell_686f17e722b2f5209effbf3003fe9a1e } from '../../../components/ImageCell'
import { ImageUrlPreview as ImageUrlPreview_7462301dd20d90072f654d047389192b } from '../../../components/ImageUrlPreview'
import { StatUsage as StatUsage_e76f63958c0e6f6da6b1741c5e710bba } from '../../../components/StatUsage'
import { StatNameCell as StatNameCell_e76f63958c0e6f6da6b1741c5e710bba } from '../../../components/StatUsage'
import { SectionImageUrlPreview as SectionImageUrlPreview_7462301dd20d90072f654d047389192b } from '../../../components/ImageUrlPreview'
import { WatchTenantCollection as WatchTenantCollection_1d0591e3cf4f332c83a86da13a0de59a } from '@payloadcms/plugin-multi-tenant/client'
import { AuditChanges as AuditChanges_7e9623af6577f0c39e521fa072d3a2d3 } from '../../../components/AuditChanges'
import { PlatformNav as PlatformNav_d93cd8bf9ab6123ede6430df10ac9859 } from '../../../components/PlatformNav'
import { SidebarControl as SidebarControl_6c1b9eb2d35079715d8e96016057ce39 } from '../../../components/SidebarControl'
import { CmsContentTypography as CmsContentTypography_bae71cde7ba653b314d0652b644d3b75 } from '../../../components/CmsContentTypography'
import { AdminIcon as AdminIcon_185d6ccbdba3821d35293b1570e8d361 } from '../../../components/AdminBrand'
import { AdminLogo as AdminLogo_185d6ccbdba3821d35293b1570e8d361 } from '../../../components/AdminBrand'
import { PlatformBackLink as PlatformBackLink_bbc30f84f987b4f69605dc932bf9e1ee } from '../../../components/PlatformBackLink'
import { TenantSelector as TenantSelector_d6d5f193a167989e2ee7d14202901e62 } from '@payloadcms/plugin-multi-tenant/rsc'
import { TenantNavBanner as TenantNavBanner_304bb971b02938ef7cdd47a194b274b2 } from '../../../components/TenantNavBanner'
import { TenantSelectionProvider as TenantSelectionProvider_d6d5f193a167989e2ee7d14202901e62 } from '@payloadcms/plugin-multi-tenant/rsc'
import { PlatformDashboardView as PlatformDashboardView_7bcd8dc9bedbbcca09e7d406703d991d } from '../../../components/PlatformDashboardView'
import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'
import { S3ClientUploadHandler as S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24 } from '@payloadcms/storage-s3/client'

/** @type import('payload').ImportMap */
export const importMap = {
  "@payloadcms/plugin-multi-tenant/client#TenantField": TenantField_1d0591e3cf4f332c83a86da13a0de59a,
  "/components/ImageUrlPreview#HeroImageUrlPreview": HeroImageUrlPreview_7462301dd20d90072f654d047389192b,
  "/components/PublishingStatus#PublishingStatus": PublishingStatus_4f170ac3e9a486a1c232ad658ebe9a1b,
  "@payloadcms/plugin-multi-tenant/client#AssignTenantFieldTrigger": AssignTenantFieldTrigger_1d0591e3cf4f332c83a86da13a0de59a,
  "/components/PreviewPublishButton#PreviewPublishButton": PreviewPublishButton_195e97763028237bdc82d1a53c4245fc,
  "/components/HomepageSingleRedirect#HomepageSingleRedirect": HomepageSingleRedirect_b28ab2a24502ab103566306601f21301,
  "/components/ImageCell#ImageCell": ImageCell_686f17e722b2f5209effbf3003fe9a1e,
  "/components/ImageUrlPreview#ImageUrlPreview": ImageUrlPreview_7462301dd20d90072f654d047389192b,
  "/components/StatUsage#StatUsage": StatUsage_e76f63958c0e6f6da6b1741c5e710bba,
  "/components/StatUsage#StatNameCell": StatNameCell_e76f63958c0e6f6da6b1741c5e710bba,
  "/components/ImageUrlPreview#SectionImageUrlPreview": SectionImageUrlPreview_7462301dd20d90072f654d047389192b,
  "@payloadcms/plugin-multi-tenant/client#WatchTenantCollection": WatchTenantCollection_1d0591e3cf4f332c83a86da13a0de59a,
  "/components/AuditChanges#AuditChanges": AuditChanges_7e9623af6577f0c39e521fa072d3a2d3,
  "/components/PlatformNav#PlatformNav": PlatformNav_d93cd8bf9ab6123ede6430df10ac9859,
  "/components/SidebarControl#SidebarControl": SidebarControl_6c1b9eb2d35079715d8e96016057ce39,
  "/components/CmsContentTypography#CmsContentTypography": CmsContentTypography_bae71cde7ba653b314d0652b644d3b75,
  "/components/AdminBrand#AdminIcon": AdminIcon_185d6ccbdba3821d35293b1570e8d361,
  "/components/AdminBrand#AdminLogo": AdminLogo_185d6ccbdba3821d35293b1570e8d361,
  "/components/PlatformBackLink#PlatformBackLink": PlatformBackLink_bbc30f84f987b4f69605dc932bf9e1ee,
  "@payloadcms/plugin-multi-tenant/rsc#TenantSelector": TenantSelector_d6d5f193a167989e2ee7d14202901e62,
  "/components/TenantNavBanner#TenantNavBanner": TenantNavBanner_304bb971b02938ef7cdd47a194b274b2,
  "@payloadcms/plugin-multi-tenant/rsc#TenantSelectionProvider": TenantSelectionProvider_d6d5f193a167989e2ee7d14202901e62,
  "/components/PlatformDashboardView#PlatformDashboardView": PlatformDashboardView_7bcd8dc9bedbbcca09e7d406703d991d,
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
  "@payloadcms/storage-s3/client#S3ClientUploadHandler": S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24
}
