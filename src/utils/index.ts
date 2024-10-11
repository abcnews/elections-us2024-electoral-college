import type { PartyId } from 'elections-us2020-results-data';
import acto from '@abcnews/alternating-case-to-object';
import {
  Allocation,
  Allocations,
  ALLOCATIONS,
  Group,
  GROUP_IDS,
  GROUPS,
  STATE_IDS,
  Focus,
  Focuses,
  FOCUSES,
  INITIAL_ALLOCATIONS,
  DEFAULT_ELECTION_YEAR,
  DEFAULT_RELATIVE_ELECTION_YEAR
} from '../constants';
import { GraphicProps } from '../components/Graphic';
import { decode, encode } from '@abcnews/base-36-text';

/** Turn a state and a hexagon index into a split state. e.g. ME + 1 = ME_1, or NY + 2 = NY */
export const getGroupIdForStateIdAndDelegateIndex = (stateId: string, delegateIndex: number) => {
  const isSplitState = !GROUP_IDS.includes(stateId);
  if (isSplitState) {
    return `${stateId}_${Math.max(0, delegateIndex - 1)}`;
  }
  return stateId;
};

export const getGroupIdsForStateId = (stateId: string) => {
  return GROUP_IDS.filter(groupId => groupId.indexOf(stateId) === 0);
};

export const getVoteCountsForAllocations = (
  allocations: Allocations,
  year: number = 2024
): { [key: string]: number } => {
  return ALLOCATIONS.reduce((memo, allocation) => {
    memo[allocation] = GROUPS.filter(({ id }) => allocations[id] === allocation).reduce((memo, current) => {
      const count = current.count[year <= 2020 ? 2020 : 2024];
      return memo + count;
    }, 0);

    return memo;
  }, {});
};

export const getStateAllocations = (stateId: string, allocations: Allocations) => {
  const stateGroupIds = getGroupIdsForStateId(stateId);

  return stateGroupIds.map(groupId => allocations[groupId]);
};

export const determineIfAllocationIsMade = (allocation: Allocation) => allocation !== Allocation.None;

export const determineIfAllocationIsDefinitive = (allocation: Allocation) =>
  allocation === Allocation.Dem || allocation === Allocation.GOP;

export const determineIfProportionOfStateAllocationsMeetCondition = (
  proportion: number,
  stateId: string,
  allocations: Allocations,
  condition: (allocation: Allocation) => boolean
) => {
  proportion = Math.max(0, Math.min(proportion, 1));

  const stateAllocations = getStateAllocations(stateId, allocations);
  const stateAllocationsThatMeetCondition = stateAllocations.filter(condition);

  return stateAllocationsThatMeetCondition.length / stateAllocations.length > proportion;
};

export const determineIfAnyStateAllocationsAreMade = (stateId: string, allocations: Allocations) =>
  determineIfProportionOfStateAllocationsMeetCondition(0, stateId, allocations, determineIfAllocationIsMade);

export const determineIfMostStateAllocationsAreMade = (stateId: string, allocations: Allocations) =>
  determineIfProportionOfStateAllocationsMeetCondition(0.5, stateId, allocations, determineIfAllocationIsMade);

function _decode<Dict>(code: string, keys: string[], possibleValues: string[], defaultValue: string): Dict {
  code = typeof code === 'string' ? code.replace(/(\w)(\d+)/g, (_, char, repeated) => char.repeat(+repeated)) : code;
  code = code && code.length === keys.length ? code : defaultValue.repeat(keys.length);

  return keys.reduce((dict, key, index) => {
    const value = code[index];

    dict[key] = possibleValues.indexOf(value) > -1 ? value : defaultValue;

    return dict;
  }, {} as Dict);
}

function _encode<Dict>(dict: Dict, keys: string[], possibleValues: string[], defaultValue: string): string {
  return keys
    .reduce((memo: [string, number][], key, index) => {
      const value = possibleValues.indexOf(dict[key]) > -1 ? dict[key] : defaultValue;

      if (index === 0 || value !== memo[memo.length - 1][0]) {
        memo.push([value, 1]);
      } else {
        memo[memo.length - 1][1]++;
      }

      return memo;
    }, [])
    .reduce((memo, [char, repeated]) => {
      return (memo += repeated === 1 ? char : char + String(repeated));
    }, '');
}

export const decodeAllocations = (code: string): Allocations =>
  _decode<Allocations>(code, GROUP_IDS, ALLOCATIONS, Allocation.None);

export const encodeAllocations = (allocations: Allocations): string =>
  _encode<Allocations>(allocations, GROUP_IDS, ALLOCATIONS, Allocation.None);

export const decodeFocuses = (code: string): Focuses => _decode<Focuses>(code, STATE_IDS, FOCUSES, Focus.No);

export const encodeFocuses = (focuses: Focuses): string => _encode<Focuses>(focuses, STATE_IDS, FOCUSES, Focus.No);

export const alternatingCaseToGraphicProps = (alternatingCase: string): GraphicProps => {
  const graphicProps = acto(alternatingCase) as any;

  graphicProps.allocations = decodeAllocations(graphicProps.allocations);
  graphicProps.focuses = decodeFocuses(graphicProps.focuses);

  // Support deprecated marker prop values
  if (graphicProps.relative === 'null') {
    graphicProps.relative = null;
  }
  graphicProps.hexborders = !!graphicProps.hexborders;
  graphicProps.hexflip = graphicProps.hexflip;
  graphicProps.hexani = graphicProps.hexani;
  graphicProps.addremoves = graphicProps.addremoves ? JSON.parse(decode(graphicProps.addremoves)) : {};

  return graphicProps as GraphicProps;
};

export const graphicPropsToAlternatingCase = (graphicProps, defaultGraphicProps?): string =>
  Object.keys(graphicProps).reduce((alternatingCase, key) => {
    // We never export tappableLayer
    if (key === 'tappableLayer') {
      return alternatingCase;
    }

    const value = graphicProps[key];
    if (typeof value === 'undefined' || value === null) {
      return alternatingCase;
    }

    // We never export defaults
    if (defaultGraphicProps && defaultGraphicProps[key] === value) {
      return alternatingCase;
    }

    alternatingCase += key.toUpperCase();

    if (key === 'allocations') {
      alternatingCase += encodeAllocations(value);
    } else if (key === 'focuses') {
      alternatingCase += encodeFocuses(value);
    } else if (typeof value === 'boolean') {
      alternatingCase += value ? 'true' : 'false';
    } else if (value === null) {
      alternatingCase += 'null';
    } else if (typeof value === 'object') {
      alternatingCase += encode(JSON.stringify(value));
    } else {
      alternatingCase += value;
    }

    return alternatingCase;
  }, '');

/** This was used to save snapshots, but has been replaced by the ACTO string */
export const legactyUrlQueryToGraphicProps = (urlQuery: string) => {
  if (urlQuery.length < 2) {
    return null;
  }

  const graphicProps = JSON.parse(
    '{"' + urlQuery.substring(1).replace(/&/g, '","').replace(/=/g, '":"') + '"}',
    (key, value) => (key === '' ? value : decodeURIComponent(value))
  );

  graphicProps.allocations = decodeAllocations(graphicProps.allocations);
  graphicProps.focuses = decodeFocuses(graphicProps.focuses);

  if (typeof graphicProps.year === 'string') {
    graphicProps.year = +graphicProps.year;
  }

  if (typeof graphicProps.relative === 'string') {
    graphicProps.relative = graphicProps.relative === 'null' ? null : +graphicProps.relative;
  }

  if (typeof graphicProps.counting === 'string') {
    graphicProps.counting = graphicProps.counting === 'true';
  }

  if (typeof graphicProps.hexborders === 'string') {
    graphicProps.hexborders = graphicProps.hexborders === 'true';
  }

  if (typeof graphicProps.tappableLayer === 'string') {
    graphicProps.tappableLayer = +graphicProps.tappableLayer;
  }
  if (typeof graphicProps.addremoves === 'string') {
    graphicProps.addremoves = JSON.stringify(graphicProps.addremoves);
  }
  return graphicProps;
};

export const getPartyIdForAllocation = (allocation: Allocation): PartyId =>
  allocation === Allocation.Dem ? 'dem' : allocation === Allocation.GOP ? 'gop' : 'oth';

export const getAllocationForPartyID = (partyID: PartyId): Allocation =>
  partyID === 'dem' ? Allocation.Dem : partyID === 'gop' ? Allocation.GOP : Allocation.None;

export const liveResultsToGraphicProps = data =>
  Object.keys(data.s).reduce(
    (memo, stateId) => {
      const result = data.s[stateId];
      const stateWinningPartyID = result.w;
      const stateAllocation = getAllocationForPartyID(stateWinningPartyID);

      if (stateAllocation !== Allocation.None) {
        switch (stateId) {
          case 'ME':
          case 'NE':
            const allocations = new Array(result.e - 1).fill(Allocation.None);

            new Array(result[stateWinningPartyID].e - 1).fill(0).forEach((_, index) => {
              allocations[index] = stateAllocation === Allocation.Dem ? Allocation.Dem : Allocation.GOP;
            });

            new Array(result[stateWinningPartyID === 'gop' ? 'dem' : 'gop'].e).fill(0).forEach((_, index) => {
              allocations[allocations.length - (1 + index)] =
                stateAllocation === Allocation.Dem ? Allocation.GOP : Allocation.Dem;
            });

            allocations.forEach((allocation, index) => {
              memo.allocations[`${stateId}_${index}`] = allocation;
            });
            break;
          case 'NE':
            break;
          default:
            memo.allocations[stateId] = stateAllocation;
            break;
        }
      }

      return memo;
    },
    {
      allocations: { ...INITIAL_ALLOCATIONS },
      year: DEFAULT_ELECTION_YEAR,
      relative: DEFAULT_RELATIVE_ELECTION_YEAR
    }
  );
