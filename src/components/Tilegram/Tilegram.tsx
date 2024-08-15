import React from 'react';
import mapData from './generated__mapdata.json';
import styles from './styles.scss';
import { Allocations, ElectionYear, Focus, Focuses } from '../../constants';
import { TilegramHexes } from './TilegramHexes/TilegramHexes';
import { TilegramLabels } from './TilegramLabels/TilegramLabels';
const { us2020, us2024 } = mapData;

export type TilegramProps = {
  allocations?: Allocations;
  focuses?: Focuses;
  year?: ElectionYear;
  relative?: ElectionYear | null;
  hexborders?: boolean;
  hexflip?: boolean;
  onClick?: (props: { groupId: string; stateId: string }) => void;
};

export default function Tilegram(props: TilegramProps) {
  const { allocations, focuses, onClick, hexborders, hexflip } = props;
  const year = props.year === 2024 ? 2024 : 2020;

  const hasFocuses = focuses && Object.values(focuses).some(value => value === Focus.Yes);

  function clickHandler({ target }) {
    if (!onClick || target.nodeName !== 'path') {
      return;
    }
    const parent = target.parentNode;
    const stateId = parent.dataset.state;
    const groupId = target.dataset.delegate;
    onClick({ groupId, stateId });
  }
  return (
    <>
      <div className={styles.root} onClick={clickHandler} data-year={year}>
        <svg viewBox="0 0 1043 759">
          <g className={styles.tiles2024}>
            <TilegramHexes
              data={us2024}
              allocations={allocations}
              focuses={hasFocuses && focuses}
              hexBorders={hexborders}
              hexflip={hexflip}
              isVisible={year === 2024}
            />
          </g>
          <g className={styles.tiles2020}>
            <TilegramHexes
              data={us2020}
              allocations={allocations}
              focuses={hasFocuses && focuses}
              hexBorders={hexborders}
              hexflip={hexflip}
              isVisible={year !== 2024}
            />
          </g>
          <TilegramLabels data={us2024} allocations={allocations} focuses={hasFocuses && focuses} />
        </svg>
      </div>
    </>
  );
}
