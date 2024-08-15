import React from 'react';
import styles from './styles.scss';
import { getStateAllocations } from '../../../utils';
import { STATES_LABELS } from '../data';
import { Focus } from '../../../constants';
import { getStyleDelays } from '../util';

export function TilegramLabels({ data, allocations, focuses }) {
  const { STATES_DELEGATE_HEXES } = data;
  return (
    <>
      {Object.entries(STATES_DELEGATE_HEXES).map(([state, paths]) => {
        const stateAllocations = allocations && getStateAllocations(state, allocations);
        const stateMainAllocation = stateAllocations && stateAllocations[0];
        const [labelX, labelY, hasOutlineOnMobile] = STATES_LABELS[state];
        const style = getStyleDelays(labelX, labelY);

        return (
          <React.Fragment key={STATES_LABELS[state].join()}>
            <text
              className={[
                styles.labelOutline,
                hasOutlineOnMobile && styles.mobileAlways,
                focuses && focuses[state] === Focus.No && styles.hidden,
                styles['label-outline--' + stateMainAllocation]
              ]
                .filter(Boolean)
                .join(' ')}
              x={labelX}
              y={labelY}
              style={style}
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
              style={style}
            >
              {state}
            </text>
          </React.Fragment>
        );
      })}
    </>
  );
}
