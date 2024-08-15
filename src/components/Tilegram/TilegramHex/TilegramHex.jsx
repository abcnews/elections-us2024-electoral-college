import React, { useCallback, useEffect, useState } from 'react';
import styles from './styles.scss';
import { Allocation, ALLOCATIONS, Focus } from '../../../constants';
import { getGroupIDForStateIDAndDelegateIndex } from '../../../utils';
import { getStyleDelays } from '../util';
const HEX_SHAPE =
  'M14.722431864335457,-8.5 14.722431864335457,8.5 0,17 -14.722431864335457,8.5 -14.722431864335457,-8.5 0,-17z';

function getSimplifiedAllocation(allocation) {
  if ([Allocation.None, Allocation.Tossup].includes(allocation)) return Allocation.None;
  if ([Allocation.GOP, Allocation.LikelyGOP].includes(allocation)) return Allocation.GOP;
  if ([Allocation.Dem, Allocation.LikelyDem].includes(allocation)) return Allocation.Dem;
  return null;
}

function _TilegramHexInner({ coords, hexBorders, hexflip, allocation, focus, state, groupId }) {
  const [transitionFrom, setTransitionFrom] = useState(allocation);
  const [oldAllocation, setOldAllocation] = useState(allocation);
  const [isAnimating, setIsAnimating] = useState(true);
  useEffect(() => {
    const isSame = getSimplifiedAllocation(oldAllocation) === getSimplifiedAllocation(allocation);
    const isUncertain =
      getSimplifiedAllocation(oldAllocation) === Allocation.None ||
      getSimplifiedAllocation(allocation) === Allocation.None;
    if (hexflip && !isSame && !isUncertain) {
      setTransitionFrom(oldAllocation);
      setIsAnimating(true);
    }
    setOldAllocation(allocation);
  }, [allocation]);

  const stopAnimating = useCallback(() => setIsAnimating(false));
  const svgCoord = coords.join();
  return (
    <g className={styles.root} transform={`translate(${svgCoord})`} onAnimationEnd={stopAnimating}>
      <path
        className={[
          styles.hex,
          hexBorders && styles.hexBorders,
          focus && focus === Focus.No && styles.defocused,
          isAnimating && styles.hexAnimating
        ]
          .filter(Boolean)
          .join(' ')}
        data-state={state}
        data-delegate={groupId}
        style={{
          '--from': `var(--allocation-${transitionFrom})`,
          '--to': `var(--allocation-${allocation})`,
          ...getStyleDelays(...coords)
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
