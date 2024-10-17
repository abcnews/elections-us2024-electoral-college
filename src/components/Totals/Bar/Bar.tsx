import React, { useEffect, useMemo, useRef } from 'react';
import styles from './styles.scss';
import { Allocation, ALLOCATIONS } from '../../../constants';
const MAX_VOTES = 538;
const WIN_VOTES = Math.ceil((MAX_VOTES + 1) / 2);

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function Bar({ sides, voteCounts }) {
  const incumbent = useMemo(() => Object.keys(sides)[0], [sides]);
  const previousIncumbent = usePrevious(incumbent);

  const bars = [
    [Allocation.Dem, 'Democrat'],
    [Allocation.LikelyDem, 'Likely Democrat'],
    [Allocation.Unallocated, 'Unallocated'],
    [Allocation.LikelyGOP, 'Likely GOP'],
    [Allocation.GOP, 'GOP']
  ].map(([allocation, altText], i) => {
    const count = voteCounts[allocation];
    const width = allocation === Allocation.Unallocated ? 'auto' : Math.round((count / MAX_VOTES) * 100) + '%';
    const fullAltText = `${altText}: ${count} votes/${width}`;
    return (
      // We key these by index (i) because when we reverse them, we don't want
      // to rerender everything.
      <div key={i} className={styles.bar} style={{ width }} data-allocation={allocation}>
        <span className={styles.accessibleHide}>{fullAltText}</span>
      </div>
    );
  });

  if (Object.keys(sides)[0] === 'r') {
    bars.reverse();
  }

  return (
    <div
      className={styles.root}
      data-incumbent={incumbent}
      data-consistent-incumbent={incumbent === previousIncumbent ? '' : undefined}
    >
      <div className={styles.barText}>{`${WIN_VOTES} to win`}</div>
      <div className={styles.trackRoot}>
        <div className={styles.midpoint}></div>
        <div className={styles.track}>{bars}</div>
      </div>
    </div>
  );
}
