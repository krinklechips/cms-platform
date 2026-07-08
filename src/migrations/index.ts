import * as migration_20260708_061931_initial from './20260708_061931_initial';
import * as migration_20260708_071008_media_r2_prefix from './20260708_071008_media_r2_prefix';

export const migrations = [
  {
    up: migration_20260708_061931_initial.up,
    down: migration_20260708_061931_initial.down,
    name: '20260708_061931_initial',
  },
  {
    up: migration_20260708_071008_media_r2_prefix.up,
    down: migration_20260708_071008_media_r2_prefix.down,
    name: '20260708_071008_media_r2_prefix'
  },
];
