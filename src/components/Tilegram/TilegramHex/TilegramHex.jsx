import React from 'react';
import styles from './styles.scss';
import { Focus } from '../../../constants';
import { getGroupIDForStateIDAndDelegateIndex } from '../../../utils';
const HEX_SHAPE =
  'M14.722431864335457,-8.5 14.722431864335457,8.5 0,17 -14.722431864335457,8.5 -14.722431864335457,-8.5 0,-17z';

function _TilegramHexInner({ coords, hexBorders, allocation, focus, state, groupId }) {
  const svgCoord = coords.join();
  return (
    <g transform={`translate(${svgCoord})`}>
      <path
        className={[
          styles.hex,
          styles['allocation-' + allocation],
          hexBorders && styles.hexBorders,
          focus && focus === Focus.No && styles.defocused
        ]
          .filter(Boolean)
          .join(' ')}
        data-state={state}
        data-delegate={groupId}
        style={{
          animationDelay: `${svgCoord[0] / 10}s`
        }}
        d={HEX_SHAPE}
      />
    </g>
  );
}

export const TilegramHexInner = React.memo(_TilegramHexInner, function arePropsEqual(oldProps, newProps) {
  const comparisons = ['coords', 'hexBorders', 'allocation', 'focus', 'state', 'groupId'];
  const doesMatch = comparisons.every(comparison => oldProps[comparison] === newProps[comparison]);
  return doesMatch;
});

export function TilegramHex({ allocations, ...props }) {
  const groupId = getGroupIDForStateIDAndDelegateIndex(props.state, props.index);
  const allocation = allocations[groupId];
  return <TilegramHexInner {...props} groupId={groupId} allocation={allocation} />;
}
