import React from 'react';
import styles from './styles.scss';
import { getStateAllocations } from '../../../utils';
import { Focus } from '../../../constants';
import { getStyleDelays } from '../util';

export function TilegramLabels({ data, allocations, focuses, hexani, hasAllocations }) {
  const { STATES_DELEGATE_HEXES, labels } = data;
  return (
    <>
      {Object.entries(STATES_DELEGATE_HEXES).map(([state, paths]) => {
        const stateAllocations = allocations && getStateAllocations(state, allocations);
        // 'default' doesn't exist, but the labels are black by default.
        const stateMainAllocation = !hasAllocations ? 'default' : (stateAllocations && stateAllocations[0]) || 'x';
        const [labelX, labelY] = labels[state];
        const style = {
          ...getStyleDelays(labelX, labelY, hexani),
          transform: `translate(${labelX}px, ${labelY}px)`
        };

        return (
          <React.Fragment key={state}>
            <text
              aria-hidden="true"
              className={[
                styles.labelOutline,
                focuses && focuses[state] === Focus.No && styles.hidden,
                styles['label-outline--' + stateMainAllocation]
              ]
                .filter(Boolean)
                .join(' ')}
              x="0"
              y="0"
              style={style}
            >
              {state}
            </text>
            <text
              aria-hidden="true"
              className={[
                styles.label,
                focuses && focuses[state] === Focus.No && styles.hidden,
                styles['label--' + stateMainAllocation]
              ]
                .filter(Boolean)
                .join(' ')}
              x="0"
              y="0"
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
