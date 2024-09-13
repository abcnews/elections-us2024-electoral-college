import React from 'react';
import styles from './styles.scss';
import { getStateAllocations } from '../../../utils';
import { Focus } from '../../../constants';
import { getStyleDelays } from '../util';

export function TilegramLabels({ data, allocations, focuses, hexani }) {
  const { STATES_DELEGATE_HEXES, labels } = data;
  return (
    <>
      {Object.entries(STATES_DELEGATE_HEXES).map(([state, paths]) => {
        const stateAllocations = allocations && getStateAllocations(state, allocations);
        const stateMainAllocation = stateAllocations && stateAllocations[0];
        const [labelX, labelY] = labels[state];
        const style = {
          ...getStyleDelays(labelX, labelY, hexani),
          transform: `translate(${labelX}px, ${labelY}px)`
        };
        console.log({ style });

        return (
          <React.Fragment key={state}>
            <text
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
