import * as migration_20260708_061931_initial from './20260708_061931_initial';
import * as migration_20260708_071008_media_r2_prefix from './20260708_071008_media_r2_prefix';
import * as migration_20260708_071914_modules_billing_branding from './20260708_071914_modules_billing_branding';
import * as migration_20260708_073232_wave1_content from './20260708_073232_wave1_content';
import * as migration_20260708_081120_wave2_content from './20260708_081120_wave2_content';
import * as migration_20260708_085547_module_gating_cockpit from './20260708_085547_module_gating_cockpit';
import * as migration_20260708_092032_wave3_inbox_publishing from './20260708_092032_wave3_inbox_publishing';
import * as migration_20260708_154601_homepage_hero_editor from './20260708_154601_homepage_hero_editor';
import * as migration_20260709_032646_homepage_not_global from './20260709_032646_homepage_not_global';
import * as migration_20260818_085206_sections_blocks from './20260818_085206_sections_blocks';
import * as migration_20260818_090817_sections_optional from './20260818_090817_sections_optional';

export const migrations = [
  {
    up: migration_20260708_061931_initial.up,
    down: migration_20260708_061931_initial.down,
    name: '20260708_061931_initial',
  },
  {
    up: migration_20260708_071008_media_r2_prefix.up,
    down: migration_20260708_071008_media_r2_prefix.down,
    name: '20260708_071008_media_r2_prefix',
  },
  {
    up: migration_20260708_071914_modules_billing_branding.up,
    down: migration_20260708_071914_modules_billing_branding.down,
    name: '20260708_071914_modules_billing_branding',
  },
  {
    up: migration_20260708_073232_wave1_content.up,
    down: migration_20260708_073232_wave1_content.down,
    name: '20260708_073232_wave1_content',
  },
  {
    up: migration_20260708_081120_wave2_content.up,
    down: migration_20260708_081120_wave2_content.down,
    name: '20260708_081120_wave2_content',
  },
  {
    up: migration_20260708_085547_module_gating_cockpit.up,
    down: migration_20260708_085547_module_gating_cockpit.down,
    name: '20260708_085547_module_gating_cockpit',
  },
  {
    up: migration_20260708_092032_wave3_inbox_publishing.up,
    down: migration_20260708_092032_wave3_inbox_publishing.down,
    name: '20260708_092032_wave3_inbox_publishing',
  },
  {
    up: migration_20260708_154601_homepage_hero_editor.up,
    down: migration_20260708_154601_homepage_hero_editor.down,
    name: '20260708_154601_homepage_hero_editor',
  },
  {
    up: migration_20260709_032646_homepage_not_global.up,
    down: migration_20260709_032646_homepage_not_global.down,
    name: '20260709_032646_homepage_not_global',
  },
  {
    up: migration_20260818_085206_sections_blocks.up,
    down: migration_20260818_085206_sections_blocks.down,
    name: '20260818_085206_sections_blocks',
  },
  {
    up: migration_20260818_090817_sections_optional.up,
    down: migration_20260818_090817_sections_optional.down,
    name: '20260818_090817_sections_optional'
  },
];
