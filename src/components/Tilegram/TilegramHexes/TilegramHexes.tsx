import React from 'react';
import styles from './styles.scss';
import { getGroupIDForStateIDAndDelegateIndex, getStateAllocations } from '../../../utils';
import { Focus } from '../../../constants';
import { TilegramHex } from '../TilegramHex/TilegramHex';

export function TilegramHexes({ data, allocations, focuses, hexBorders, hexflip, isVisible }) {
  const { STATES_DELEGATE_HEXES, STATES_SHAPES } = data;
  const allocationHash = Object.values(allocations).join('');
  return (
    <g className={[styles.root, !isVisible && styles.rootHidden].filter(Boolean).join(' ')}>
      {Object.entries(STATES_DELEGATE_HEXES).map(([state, paths]) => {
        return (
          <g key={state} data-state={state} className={styles.root}>
            {
              //@ts-ignore
              paths.map((coords, i) => (
                <TilegramHex
                  key={coords.join()}
                  coords={coords}
                  state={state}
                  index={i}
                  allocationHash={allocationHash}
                  allocations={allocations}
                  focus={focuses[state]}
                  hexBorders={hexBorders}
                  hexflip={hexflip}
                />
              ))
            }
          </g>
        );
      })}
      {Object.entries(STATES_SHAPES).map(([state, paths]) =>
        //@ts-ignore
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
    </g>
  );
}
