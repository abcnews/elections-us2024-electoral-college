import mapData from '../data/generated__mapdata.json';
import { getStateIdForGroupId } from './utils';

export const GROUPS = mapData.groupCounts as Group[];

export const GROUP_IDS = GROUPS.map(group => group.id);

export type Group = {
  id: string;
  name: string;
  count: {
    2020: number;
    2024: number;
  };
};

export enum Allocation {
  None = 'n',
  Dem = 'd',
  LikelyDem = 's',
  LikelyGOP = 'e',
  GOP = 'r',
  Unallocated = 'u'
}

export const ALLOCATIONS: string[] = Object.keys(Allocation).map(x => Allocation[x]);

export type Allocations = {
  [key: string]: Allocation;
};

export const INITIAL_ALLOCATIONS = GROUP_IDS.reduce((allocations, groupId) => {
  allocations[groupId] = Allocation.None;

  return allocations;
}, {});

export enum StateId {
  AK,
  AL,
  AR,
  AZ,
  CA,
  CO,
  CT,
  DC,
  DE,
  FL,
  GA,
  HI,
  IA,
  ID,
  IL,
  IN,
  KS,
  KY,
  LA,
  MA,
  MD,
  ME,
  MI,
  MN,
  MO,
  MS,
  MT,
  NC,
  ND,
  NE,
  NH,
  NJ,
  NM,
  NV,
  NY,
  OH,
  OK,
  OR,
  PA,
  RI,
  SC,
  SD,
  TN,
  TX,
  UT,
  VA,
  VT,
  WA,
  WI,
  WV,
  WY
}

export const STATE_IDS = Object.keys(StateId).filter(key => typeof StateId[key] === 'number');

export type State = {
  id: StateId;
  name: string;
};

export const STATES: State[] = GROUPS.filter(({ id }) => {
  const [, index] = id.split('_');

  return index == null || index === '0';
}).map(({ id, name }) => {
  const stateId = StateId[getStateIdForGroupId(id)] as unknown;

  return {
    id: stateId as StateId,
    name: name.split(' (')[0]
  };
});

export enum Focus {
  No = 'n',
  Yes = 'y'
}

export const FOCUSES: string[] = Object.keys(Focus).map(x => Focus[x]);

export type Focuses = {
  [key: string]: Focus;
};

export const INITIAL_FOCUSES = STATE_IDS.reduce((focuses, stateId) => {
  focuses[stateId] = Focus.No;

  return focuses;
}, {});

export type Preset = {
  name?: string;
  allocations: Allocations;
  focuses: Focuses;
  year?: number;
};

export type Presets = {
  [key: string]: Preset;
};

export const MIXINS: Presets = {
  safedem: {
    name: 'Safe Dem.',
    allocations: {
      CA: Allocation.Dem,
      CT: Allocation.Dem,
      DE: Allocation.Dem,
      DC: Allocation.Dem,
      HI: Allocation.Dem,
      IL: Allocation.Dem,
      ME_1: Allocation.Dem,
      MD: Allocation.Dem,
      MA: Allocation.Dem,
      NM: Allocation.Dem,
      NJ: Allocation.Dem,
      NY: Allocation.Dem,
      OR: Allocation.Dem,
      RI: Allocation.Dem,
      VT: Allocation.Dem,
      WA: Allocation.Dem
    },
    focuses: {}
  },
  safegop: {
    name: 'Safe GOP',
    allocations: {
      AL: Allocation.GOP,
      AK: Allocation.GOP,
      AR: Allocation.GOP,
      ID: Allocation.GOP,
      KS: Allocation.GOP,
      KY: Allocation.GOP,
      LA: Allocation.GOP,
      MS: Allocation.GOP,
      MT: Allocation.GOP,
      NE_0: Allocation.GOP,
      NE_1: Allocation.GOP,
      NE_3: Allocation.GOP,
      ND: Allocation.GOP,
      OK: Allocation.GOP,
      SC: Allocation.GOP,
      SD: Allocation.GOP,
      TN: Allocation.GOP,
      TX: Allocation.GOP,
      WV: Allocation.GOP,
      WY: Allocation.GOP
    },
    focuses: {}
  },
  nofocus: {
    name: 'No states focused',
    allocations: {},
    focuses: { ...INITIAL_FOCUSES }
  }
};

export const PRESETS: Presets = {
  2012: {
    allocations: {
      AK: Allocation.GOP,
      AL: Allocation.GOP,
      AR: Allocation.GOP,
      AZ: Allocation.GOP,
      CA: Allocation.Dem,
      CO: Allocation.Dem,
      CT: Allocation.Dem,
      DC: Allocation.Dem,
      DE: Allocation.Dem,
      FL: Allocation.Dem,
      GA: Allocation.GOP,
      HI: Allocation.Dem,
      IA: Allocation.Dem,
      ID: Allocation.GOP,
      IL: Allocation.Dem,
      IN: Allocation.GOP,
      KS: Allocation.GOP,
      KY: Allocation.GOP,
      LA: Allocation.GOP,
      MA: Allocation.Dem,
      MD: Allocation.Dem,
      ME_0: Allocation.Dem,
      ME_1: Allocation.Dem,
      ME_2: Allocation.Dem,
      MI: Allocation.Dem,
      MN: Allocation.Dem,
      MO: Allocation.GOP,
      MS: Allocation.GOP,
      MT: Allocation.GOP,
      NC: Allocation.GOP,
      ND: Allocation.GOP,
      NE_0: Allocation.GOP,
      NE_1: Allocation.GOP,
      NE_2: Allocation.GOP,
      NE_3: Allocation.GOP,
      NH: Allocation.Dem,
      NJ: Allocation.Dem,
      NM: Allocation.Dem,
      NV: Allocation.Dem,
      NY: Allocation.Dem,
      OH: Allocation.Dem,
      OK: Allocation.GOP,
      OR: Allocation.Dem,
      PA: Allocation.Dem,
      RI: Allocation.Dem,
      SC: Allocation.GOP,
      SD: Allocation.GOP,
      TN: Allocation.GOP,
      TX: Allocation.GOP,
      UT: Allocation.GOP,
      VA: Allocation.Dem,
      VT: Allocation.Dem,
      WA: Allocation.Dem,
      WI: Allocation.Dem,
      WV: Allocation.GOP,
      WY: Allocation.GOP
    },
    focuses: {},
    year: 2012
  },
  2016: {
    allocations: {
      AK: Allocation.GOP,
      AL: Allocation.GOP,
      AR: Allocation.GOP,
      AZ: Allocation.GOP,
      CA: Allocation.Dem,
      CO: Allocation.Dem,
      CT: Allocation.Dem,
      DC: Allocation.Dem,
      DE: Allocation.Dem,
      FL: Allocation.GOP,
      GA: Allocation.GOP,
      HI: Allocation.Dem,
      IA: Allocation.GOP,
      ID: Allocation.GOP,
      IL: Allocation.Dem,
      IN: Allocation.GOP,
      KS: Allocation.GOP,
      KY: Allocation.GOP,
      LA: Allocation.GOP,
      MA: Allocation.Dem,
      MD: Allocation.Dem,
      ME_0: Allocation.Dem,
      ME_1: Allocation.Dem,
      ME_2: Allocation.GOP,
      MI: Allocation.GOP,
      MN: Allocation.Dem,
      MO: Allocation.GOP,
      MS: Allocation.GOP,
      MT: Allocation.GOP,
      NC: Allocation.GOP,
      ND: Allocation.GOP,
      NE_0: Allocation.GOP,
      NE_1: Allocation.GOP,
      NE_2: Allocation.GOP,
      NE_3: Allocation.GOP,
      NH: Allocation.Dem,
      NJ: Allocation.Dem,
      NM: Allocation.Dem,
      NV: Allocation.Dem,
      NY: Allocation.Dem,
      OH: Allocation.GOP,
      OK: Allocation.GOP,
      OR: Allocation.Dem,
      PA: Allocation.GOP,
      RI: Allocation.Dem,
      SC: Allocation.GOP,
      SD: Allocation.GOP,
      TN: Allocation.GOP,
      TX: Allocation.GOP,
      UT: Allocation.GOP,
      VA: Allocation.Dem,
      VT: Allocation.Dem,
      WA: Allocation.Dem,
      WI: Allocation.GOP,
      WV: Allocation.GOP,
      WY: Allocation.GOP
    },
    focuses: {},
    year: 2016
  },
  2020: {
    allocations: {
      AK: Allocation.GOP,
      AL: Allocation.GOP,
      AR: Allocation.GOP,
      AZ: Allocation.Dem,
      CA: Allocation.Dem,
      CO: Allocation.Dem,
      CT: Allocation.Dem,
      DC: Allocation.Dem,
      DE: Allocation.Dem,
      FL: Allocation.GOP,
      GA: Allocation.Dem,
      HI: Allocation.Dem,
      IA: Allocation.GOP,
      ID: Allocation.GOP,
      IL: Allocation.Dem,
      IN: Allocation.GOP,
      KS: Allocation.GOP,
      KY: Allocation.GOP,
      LA: Allocation.GOP,
      MA: Allocation.Dem,
      MD: Allocation.Dem,
      ME_0: Allocation.Dem,
      ME_1: Allocation.Dem,
      ME_2: Allocation.GOP,
      MI: Allocation.Dem,
      MN: Allocation.Dem,
      MO: Allocation.GOP,
      MS: Allocation.GOP,
      MT: Allocation.GOP,
      NC: Allocation.GOP,
      ND: Allocation.GOP,
      NE_0: Allocation.GOP,
      NE_1: Allocation.GOP,
      NE_2: Allocation.Dem,
      NE_3: Allocation.GOP,
      NH: Allocation.Dem,
      NJ: Allocation.Dem,
      NM: Allocation.Dem,
      NV: Allocation.Dem,
      NY: Allocation.Dem,
      OH: Allocation.GOP,
      OK: Allocation.GOP,
      OR: Allocation.Dem,
      PA: Allocation.Dem,
      RI: Allocation.Dem,
      SC: Allocation.GOP,
      SD: Allocation.GOP,
      TN: Allocation.GOP,
      TX: Allocation.GOP,
      UT: Allocation.GOP,
      VA: Allocation.Dem,
      VT: Allocation.Dem,
      WA: Allocation.Dem,
      WI: Allocation.Dem,
      WV: Allocation.GOP,
      WY: Allocation.GOP
    },
    focuses: {},
    year: 2020
  },
  2024: {
    allocations: {},
    focuses: {},
    year: 2024
  },
  safe: {
    name: 'Safe',
    allocations: {
      ...MIXINS.safedem.allocations,
      ...MIXINS.safegop.allocations
    },
    focuses: {}
  },
  Unallocated: {
    name: 'Unallocated',
    allocations: GROUP_IDS.reduce((allocations, groupId) => {
      allocations[groupId] = Allocation.Unallocated;

      return allocations;
    }, {}),
    focuses: {}
  }
};

export const ELECTION_YEARS_ALLOCATIONS_CANDIDATES = {
  2024: {
    [Allocation.Dem]: 'Harris',
    [Allocation.GOP]: 'Trump'
  },
  2020: {
    [Allocation.GOP]: 'Trump',
    [Allocation.Dem]: 'Biden'
  },
  2016: {
    [Allocation.Dem]: 'Clinton',
    [Allocation.GOP]: 'Trump'
  },
  2012: {
    [Allocation.Dem]: 'Obama',
    [Allocation.GOP]: 'Romney'
  },
  2008: {
    [Allocation.GOP]: 'McCain',
    [Allocation.Dem]: 'Obama'
  }
};

export const ELECTION_YEARS = Object.keys(ELECTION_YEARS_ALLOCATIONS_CANDIDATES)
  .reverse()
  .map(x => +x);

export const [DEFAULT_ELECTION_YEAR, DEFAULT_RELATIVE_ELECTION_YEAR] = ELECTION_YEARS;

export const HEX_ANIMATIONS = ['fade', 'flip', 'telegraph'];
export const HEX_ANIMATION_STYLES = ['wipe', 'twinkle', 'none'];
