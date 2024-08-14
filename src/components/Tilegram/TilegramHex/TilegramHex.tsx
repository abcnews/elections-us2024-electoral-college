import React from 'react';
import styles from './styles.scss';
import { getGroupIDForStateIDAndDelegateIndex, getStateAllocations } from '../../../utils';
import { Focus } from '../../../constants';

export function TilegramHex({ data, allocations, focuses, hexBorders }) {
  const { STATES_DELEGATE_HEXES, STATES_SHAPES } = data;
  return (
    <>
      {Object.entries(STATES_DELEGATE_HEXES).map(([state, paths]) => {
        return (
          <g key={state} data-state={state} className={styles.root}>
            {paths.map((d, i) => {
              const delegate = getGroupIDForStateIDAndDelegateIndex(state, i);
              const allocation = allocations[delegate];
              return (
                <path
                  className={[
                    styles.hex,
                    styles['allocation-' + allocation],
                    hexBorders && styles.hexBorders,
                    focuses && focuses[state] === Focus.No && styles.defocused
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={d}
                  data-delegate={delegate}
                  d={`M${d}z`}
                />
              );
            })}
          </g>
        );
      })}
      {Object.entries(STATES_SHAPES).map(([state, paths]) =>
        paths.map(d => (
          <path
            key={d}
            data-foo={'state-allocation-' + getStateAllocations(state, allocations)[0] || 'n'}
            className={[
              styles.state,
              styles['state-allocation-' + getStateAllocations(state, allocations)[0] || 'n'],
              focuses && focuses[state] === Focus.No && styles.stateHidden,
              focuses && focuses[state] === Focus.Yes && styles.stateFocused
            ]
              .filter(Boolean)
              .join(' ')}
            data-state={state}
            d={`M${d}z`}
          />
        ))
      )}
    </>
  );
}
