import React from 'react';
import styles from './styles.scss';
import { determineIfAllocationIsMade, getGroupIDForStateIDAndDelegateIndex, getStateAllocations } from '../../../utils';
import { STATES_LABELS } from '../data';
import { Focus, FOCUSES } from '../../../constants';

export function TilegramLabels({ data, allocations, focuses }) {
  const { STATES_DELEGATE_HEXES } = data;
  return (
    <>
      {Object.entries(STATES_DELEGATE_HEXES).map(([state, paths]) => {
        const stateAllocations = allocations && getStateAllocations(state, allocations);
        const hasAllocation = stateAllocations && stateAllocations.some(determineIfAllocationIsMade);
        const stateMainAllocation = stateAllocations && stateAllocations[0];

        const [labelX, labelY, hasOutlineOnMobile] = STATES_LABELS[state];
        return (
          <React.Fragment>
            <text
              className={[
                styles.labelOutline,
                hasOutlineOnMobile && styles.mobileAlways,
                styles['label-outline--' + stateMainAllocation]
              ]
                .filter(Boolean)
                .join(' ')}
              x={labelX}
              y={labelY}
            >
              {state}
            </text>
            <text
              className={[
                styles.label,
                focuses && focuses[state] === Focus.No && styles.hidden,
                styles['label--' + stateMainAllocation]
              ]
                .filter(Boolean)
                .join(' ')}
              x={labelX}
              y={labelY}
            >
              {state}
            </text>
          </React.Fragment>
        );
      })}
    </>
  );
}
