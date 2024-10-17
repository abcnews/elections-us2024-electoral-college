import React, { useMemo } from 'react';
import type { Allocations } from '../../constants';
import {
  CANDIDATES,
  candidatesForYear,
  DEFAULT_ELECTION_YEAR,
  ELECTION_YEARS_ALLOCATIONS_CANDIDATES,
  VOTES_TO_WIN
} from '../../constants';
import { getVoteCountsForAllocations } from '../../utils';
import styles from './styles.scss';
import Bar from './Bar/Bar';

export type TotalsProps = {
  candidatesoverride?: string;
  year?: number;
  allocations?: Allocations;
  showcheck?: boolean;
};

const Totals: React.FC<TotalsProps> = props => {
  const { candidatesoverride, allocations, year, showcheck } = props;
  const voteCounts = useMemo(() => getVoteCountsForAllocations(allocations || {}, year), [allocations, year]);
  const sides = useMemo(() => ELECTION_YEARS_ALLOCATIONS_CANDIDATES[year || DEFAULT_ELECTION_YEAR], [year]);

  const _candidatesoverride = candidatesoverride ? candidatesoverride.split('') : candidatesForYear(year);
  console.log({ sides });

  return (
    <div className={styles.root}>
      <div className={styles.text}>
        {Object.keys(sides).map((allocation, i) => (
          <div key={allocation} className={styles.side} data-allocation={allocation}>
            {voteCounts[allocation] >= VOTES_TO_WIN && showcheck && (
              <span className={styles.winnerCheck}>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <circle cx="13" cy="13.1538" r="12.75" fill="#F5D989" />
                  <path d="M19.3748 8.19547L10.1665 17.4038L5.9165 13.1538" stroke="black" stroke-width="2.83333" />
                </svg>
              </span>
            )}
            <span className={styles.sideLabel}>{CANDIDATES[_candidatesoverride[i]]}</span>&nbsp;
            <span className={styles.sideValue}>{voteCounts[allocation]}</span>
          </div>
        ))}
      </div>

      <Bar sides={sides} voteCounts={voteCounts} />
    </div>
  );
};

export default Totals;
