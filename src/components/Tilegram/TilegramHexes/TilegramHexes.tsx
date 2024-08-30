import React from 'react';
import styles from './styles.scss';
import { getGroupIDForStateIDAndDelegateIndex, getStateAllocations } from '../../../utils';
import { Focus } from '../../../constants';
import { TilegramHex } from '../TilegramHex/TilegramHex';

export function TilegramHexes({ id, data, allocations, focuses, hexBorders, hexflip, hexani, isVisible, labels }) {
  const { STATES_DELEGATE_HEXES, STATES_SHAPES } = data;
  const allocationHash = Object.values(allocations).join('');

  const sortedStateBorders = Object.entries(STATES_SHAPES).map(([state, paths]) => ({
    state,
    paths,
    allocation: getStateAllocations(state, allocations)[0] || 'n',
    defocused: focuses && focuses[state] === Focus.No,
    focused: focuses && focuses[state] === Focus.Yes
  }));

  // pre-sort state borders because we can't use z-index in SVG. Focused borders to the top
  if (focuses) {
    sortedStateBorders.sort((a, b) => {
      if (a.focused && b.defocused) return 1;
      if (a.defocused && b.focused) return -1;
      return 0;
    });
  }

  return (
    <g className={[styles.root, !isVisible && styles.rootHidden].filter(Boolean).join(' ')}>
      <g id="state-hexes">
        {Object.entries(STATES_DELEGATE_HEXES).map(([state, paths]) => {
          return (
            <g id={`state-hexes-${state}-${id}`} key={state} data-state={state} className={styles.root}>
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
                    hexani={hexani}
                  />
                ))
              }
            </g>
          );
        })}
      </g>

      <g id="state-borders">
        {sortedStateBorders.map(({ state, paths, allocation, focused, defocused }) =>
          //@ts-ignore
          paths.map(d => (
            <path
              id={`state-border-${state}-${id}`}
              key={d}
              className={[
                styles.state,
                styles['state-allocation-' + allocation],
                defocused && styles.stateDefocused,
                focused && styles.stateFocused
              ]
                .filter(Boolean)
                .join(' ')}
              data-state={state}
              fill="none"
              stroke="black"
              d={`M${d}z`}
            />
          ))
        )}
      </g>
    </g>
  );
}
