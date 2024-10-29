import React from 'react';
import mapData from '../../../data/generated__mapdata.json';
import styles from './styles.scss';
import { Allocation, Allocations, Focuses, getStateIdForGroupId } from '../../constants';
import { TilegramHexes } from './TilegramHexes/TilegramHexes';
import { TilegramLabels } from './TilegramLabels/TilegramLabels';
import AddRemoves from './AddRemoves/AddRemoves';
import { getHasAllocations, getHasFocuses } from '../../utils';
const { us2020, us2024 } = mapData;

export type AddRemoves = {
  [key: string]: string | undefined;
};
export type TilegramProps = {
  allocations?: Allocations;
  focuses?: Focuses;
  year?: number;
  relative?: number | null;
  hexborders?: boolean;
  hexflip?: string;
  hexani?: string;
  addremoves?: AddRemoves;
  candidatesoverride?: string;
  onClick?: (props: { groupId: string; stateId: string; clientX: number; clientY: number; hexId: string }) => void;
};

export default function Tilegram(props: TilegramProps) {
  const { allocations, focuses, onClick, hexborders, hexflip, hexani, addremoves } = props;
  if (typeof focuses === 'undefined' || typeof allocations === 'undefined') return null;
  const year = props.year === 2024 ? 2024 : 2020;

  const hasFocuses = getHasFocuses(focuses);

  // When any state has been allocated, change the style from None to Unallocated.
  const hasAllocations = getHasAllocations(allocations);
  const newAllocations = { ...allocations };
  if (hasAllocations) {
    Object.entries(newAllocations).forEach(([key, value]) => {
      // If focused, leave the original style/don't turn unallocated states grey
      const isFocused = focuses[getStateIdForGroupId(key)] !== 'n';
      if (isFocused) return;
      if (value === Allocation.None) {
        newAllocations[key] = Allocation.Unallocated;
      }
    });
  }

  function clickHandler({ target, clientX, clientY }) {
    if (!onClick || target.nodeName !== 'path') {
      return;
    }
    const stateId = target.parentNode.parentNode.dataset.state;
    const groupId = target.dataset.delegate;
    const hexId = target.dataset.index;

    onClick({ groupId, stateId, clientX, clientY, hexId });
  }
  return (
    <>
      <div className={styles.root} onClick={clickHandler} data-year={year}>
        <svg viewBox="-2 0 1043 759">
          <g id="hex-2024" className={styles.tiles2024}>
            <TilegramHexes
              id="2024"
              data={us2024}
              allocations={newAllocations}
              focuses={hasFocuses && focuses}
              hexBorders={!hasAllocations && !hasFocuses && hexborders}
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
              hexBorders={!hasAllocations && !hasFocuses && hexborders}
              hexflip={hexflip}
              hexani={hexani}
              isVisible={year !== 2024}
            />
          </g>
          <g id="addremoves">
            <AddRemoves addremoves={addremoves} data={year === 2024 ? us2024 : us2020} />
          </g>
          <g id="labels">
            <TilegramLabels
              data={year === 2024 ? us2024 : us2020}
              allocations={allocations}
              focuses={hasFocuses && focuses}
              hexani={hexani}
              hasAllocations={hasAllocations}
            />
          </g>
        </svg>
      </div>
    </>
  );
}
