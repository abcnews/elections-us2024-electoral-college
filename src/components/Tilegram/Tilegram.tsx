import React, { useMemo } from 'react';
import mapData from './generated__mapdata.json';
import styles from './styles.scss';
import { Allocation, ALLOCATIONS, Allocations, ElectionYear, Focus, Focuses } from '../../constants';
import { TilegramHexes } from './TilegramHexes/TilegramHexes';
import { TilegramLabels } from './TilegramLabels/TilegramLabels';
import { STATES_LABELS } from './data';
const { us2020, us2024 } = mapData;

export type TilegramProps = {
  allocations?: Allocations;
  focuses?: Focuses;
  year?: ElectionYear;
  relative?: ElectionYear | null;
  hexborders?: boolean;
  hexflip?: string;
  hexani?: string;
  onClick?: (props: { groupId: string; stateId: string }) => void;
};

export default function Tilegram(props: TilegramProps) {
  const { allocations, focuses, onClick, hexborders, hexflip, hexani } = props;

  const year = props.year === 2024 ? 2024 : 2020;

  const hasFocuses = focuses && Object.values(focuses).some(value => value === Focus.Yes);

  // When any state has been allocated, change the style from None to Unallocated.
  const hasAllocations =
    typeof allocations !== 'undefined' && Object.values(allocations).some(allocation => allocation !== 'n');
  const newAllocations = { ...allocations };
  if (hasAllocations) {
    Object.entries(newAllocations).forEach(([key, value]) => {
      newAllocations[key] = value === Allocation.None ? Allocation.Unallocated : value;
    });
  }

  function clickHandler({ target }) {
    if (!onClick || target.nodeName !== 'path') {
      return;
    }
    const stateId = target.parentNode.parentNode.dataset.state;
    const groupId = target.dataset.delegate;

    onClick({ groupId, stateId });
  }
  return (
    <>
      <div className={styles.root} onClick={clickHandler} data-year={year}>
        <svg viewBox="0 0 1043 759">
          <g id="hex-2024" className={styles.tiles2024}>
            <TilegramHexes
              id="2024"
              data={us2024}
              allocations={newAllocations}
              focuses={hasFocuses && focuses}
              hexBorders={hexborders}
              hexflip={hexflip}
              hexani={hexani}
              isVisible={year === 2024}
            />
          </g>
          <g id="hex-2020" className={styles.tiles2020}>
            <TilegramHexes
              id="2020"
              data={us2020}
              allocations={newAllocations}
              focuses={hasFocuses && focuses}
              hexBorders={hexborders}
              hexflip={hexflip}
              hexani={hexani}
              isVisible={year !== 2024}
            />
          </g>
          <g id="labels">
            <TilegramLabels
              data={us2024}
              labels={STATES_LABELS}
              allocations={allocations}
              focuses={hasFocuses && focuses}
              hexani={hexani}
            />
          </g>
        </svg>
      </div>
    </>
  );
}
