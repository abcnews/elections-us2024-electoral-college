import React, { useMemo } from 'react';
import type { Allocations } from '../../constants';
import {
  Allocation,
  CANDIDATES,
  candidatesForYear,
  DEFAULT_ELECTION_YEAR,
  ELECTION_YEARS_ALLOCATIONS_CANDIDATES,
  GROUPS_BY_ID,
  VOTES_TO_WIN
} from '../../constants';
import styles from './styles.scss';
import Bar from './Bar/Bar';

export type TotalsProps = {
  candidatesoverride?: string;
  year?: number;
  allocations?: Allocations;
  showcheck?: boolean;
};

function getVoteCountsForAllocations(
  allocations: Allocations,
  year: number = DEFAULT_ELECTION_YEAR,
  allocationMap
): { [key: string]: number } {
  return Object.entries(allocations).reduce((summedAllocations, [state, allocation]) => {
    const count = GROUPS_BY_ID[state].count[year <= 2020 ? 2020 : 2024];
    const summedAllocation = allocationMap[allocation] || allocation;
    summedAllocations[summedAllocation] = (summedAllocations[summedAllocation] || 0) + count;
    return summedAllocations;
  }, {});
}

const Totals: React.FC<TotalsProps> = props => {
  const { candidatesoverride, allocations, year, showcheck } = props;
  const voteCountsTotals = getVoteCountsForAllocations(allocations || {}, year, {
    [Allocation.LikelyDem]: Allocation.Dem,
    [Allocation.LikelyGOP]: Allocation.GOP
  });
  const voteCountsGranular = getVoteCountsForAllocations(allocations || {}, year, {});
  const _candidatesoverride = candidatesoverride ? candidatesoverride.split('') : candidatesForYear(year);
  const sides = ELECTION_YEARS_ALLOCATIONS_CANDIDATES[year || DEFAULT_ELECTION_YEAR];
  const candidates = Object.keys(sides).map((allocation, i) => ({
    allocation,
    label: CANDIDATES[_candidatesoverride[i]],
    count: voteCountsTotals[allocation],
    showWinnerCheck: voteCountsTotals[allocation] >= VOTES_TO_WIN && showcheck
  }));

  return (
    <div className={styles.root}>
      <div className={styles.text}>
        {candidates.map(({ allocation, showWinnerCheck, label, count }) => (
          <div key={allocation} className={styles.side} data-allocation={allocation}>
            {showWinnerCheck && (
              <span className={styles.winnerCheck}>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <circle cx="13" cy="13.1538" r="12.75" fill="#F5D989" />
                  <path d="M19.3748 8.19547L10.1665 17.4038L5.9165 13.1538" stroke="black" strokeWidth="2.83333" />
                </svg>
              </span>
            )}
            <span className={styles.sideLabel}>
              {label}
              {showcheck && (
                <span
                  className={[styles.winnerText, !showWinnerCheck && styles.WinnerTextInactive]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {showWinnerCheck && <>&nbsp;wins</>}
                </span>
              )}
            </span>
            &nbsp;
            <span className={styles.sideValue}>{count}</span>
          </div>
        ))}
      </div>

      <Bar sides={sides} voteCounts={voteCountsGranular} />
    </div>
  );
};

export default Totals;
