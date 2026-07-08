import * as migration_20260708_061931_initial from './20260708_061931_initial';

export const migrations = [
  {
    up: migration_20260708_061931_initial.up,
    down: migration_20260708_061931_initial.down,
    name: '20260708_061931_initial'
  },
];
