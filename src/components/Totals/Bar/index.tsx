import React, { useEffect, useMemo, useRef } from 'react';
import styles from './styles.scss';
import { Allocation } from '../../../constants';
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

  const tX = (votes: number, side:) =>
    side === incumbent ? (votes / MAX_VOTES) * 100 - 100 : (votes / MAX_VOTES) * -100 + 100;
  
  return (
    <div
      className={styles.root}
      data-incumbent={incumbent}
      data-consistent-incumbent={incumbent === previousIncumbent ? '' : undefined}
    >
      <div className={styles.midpointLabel}>{`${WIN_VOTES} to win`}</div>
      <div className={styles.trackRoot}>
        <div className={styles.midpoint}></div>
        <div className={styles.track}>
          <div
            className={styles.bar}
            title={`Likely Dem.: ${voteCounts[Allocation.LikelyDem]}`}
            data-allocation={Allocation.LikelyDem}
            style={{
              transform: `translate(${tX(
                voteCounts[Allocation.Dem] + voteCounts[Allocation.LikelyDem],
                Allocation.Dem
              )}%, 0)`
            }}
          ></div>
          <div
            className={styles.bar}
            title={`Likely GOP: ${voteCounts[Allocation.LikelyGOP]}`}
            data-allocation={Allocation.LikelyGOP}
            style={{
              transform: `translate(${tX(
                voteCounts[Allocation.GOP] + voteCounts[Allocation.LikelyGOP],
                Allocation.GOP
              )}%, 0)`
            }}
          ></div>
          <div
            className={styles.bar}
            title={`Dem.: ${voteCounts[Allocation.Dem]}`}
            data-allocation={Allocation.Dem}
            style={{ transform: `translate(${tX(voteCounts[Allocation.Dem], Allocation.Dem)}%, 0)` }}
          ></div>
          <div
            className={styles.bar}
            title={`GOP: ${voteCounts[Allocation.GOP]}`}
            data-allocation={Allocation.GOP}
            style={{ transform: `translate(${tX(voteCounts[Allocation.GOP], Allocation.GOP)}%, 0)` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
