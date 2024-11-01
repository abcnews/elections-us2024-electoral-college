import React from 'react';
import styles from './styles.scss';
import parentStyles from '../styles.scss';
import {
  Allocation,
  DEFAULT_ELECTION_YEAR,
  ELECTION_YEARS_ALLOCATIONS_CANDIDATES,
  getStateIdForGroupId,
  GROUPS_BY_ID
} from '../../../constants';
export default function DropdownRow({ code, year, value = Allocation.None, onChange }) {
  const codeName = GROUPS_BY_ID[code].name;
  const candidates = ELECTION_YEARS_ALLOCATIONS_CANDIDATES[year || DEFAULT_ELECTION_YEAR];
  const candidatesLikely = Object.entries(candidates).reduce((newCandidates, [allocation, name]) => {
    newCandidates[allocation === Allocation.Dem ? Allocation.LikelyDem : Allocation.LikelyGOP] = name;
    return newCandidates;
  }, {});

  const values = Object.entries({ ...candidatesLikely, [Allocation.None]: 'Undecided' });
  const valueName = candidatesLikely[value] || 'Undecided';

  const id = `us24-dropdown-${code}`;

  console.log({ codeName });

  let segments = codeName.split('District');
  if (segments.length > 1) {
    segments = [
      segments[0],
      <>
        Dist<span className={parentStyles.desktopOnly}>rict</span>
        <span className={parentStyles.mobileOnly}>.</span>
      </>,
      segments[1]
    ];
  }

  return (
    <div className={styles['dropdown']}>
      <label htmlFor={id} className="us24-accessible-hide">
        {codeName}
      </label>
      <select id={id} className={styles['dropdown__select']} value={value} onChange={e => onChange(e.target.value)}>
        <optgroup label={codeName}>
          {values.map(([thisValue, displayName]) => (
            <option key={thisValue} value={thisValue}>
              {displayName}
            </option>
          ))}
        </optgroup>
      </select>
      <div className={styles['dropdown__row']} aria-hidden={true}>
        <div className={styles['dropdown__code']} data-allocation={value}>
          {getStateIdForGroupId(code)}
        </div>
        <div className={styles['dropdown__name']}>
          <span className={styles['dropdown__name-truncate']}>{segments}</span>
        </div>
        <div className={styles['dropdown__value']} data-allocation={value}>
          {valueName}
        </div>
        <div className={styles['dropdown__chevron']}>
          <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1394_14447)">
              <path d="M0 0.455322H10L5 5.45532L0 0.455322Z" fill="black" />
            </g>
            <defs>
              <clipPath id="clip0_1394_14447">
                <rect width="10" height="6" fill="white" transform="translate(0 0.227661)" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
