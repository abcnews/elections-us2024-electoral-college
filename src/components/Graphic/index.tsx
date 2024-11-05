import React from 'react';
import { DEFAULT_ELECTION_YEAR, DEFAULT_RELATIVE_ELECTION_YEAR } from '../../constants';
import type { TilegramProps } from '../Tilegram/Tilegram';
import Tilegram from '../Tilegram/Tilegram';
import type { TotalsProps } from '../Totals';
import Totals from '../Totals';
import styles from './styles.scss';

export type GraphicProps = {
  title?: string;
  counting?: boolean;
} & TilegramProps &
  TotalsProps;

export type PossiblyEncodedGraphicProps =
  | {
      allocations: string;
      focuses: string;
    }
  | GraphicProps;

export const DEFAULT_PROPS = {
  year: DEFAULT_ELECTION_YEAR,
  relative: null,
  counting: true,
  hexborders: false,
  showcheck: false,
  hexflip: 'fade',
  hexani: 'none',
  addremoves: {},
  candidatesoverride: undefined
};

const Graphic: React.FC<GraphicProps> = props => {
  const {
    candidatesoverride,
    title,
    counting,
    year = DEFAULT_ELECTION_YEAR,
    allocations,
    children,
    showcheck,
    srAnnounce,
    ...otherTilegramProps
  } = props;
  const isCounting = typeof counting !== 'boolean' || counting;

  return (
    <div
      className={styles.root}
      title={title}
      style={{
        aspectRatio: children ? undefined : '10/8.8'
      }}
      data-us24-root="true"
    >
      <header className={styles.header} data-is-counting={isCounting ? '' : undefined}>
        <Totals
          candidatesoverride={candidatesoverride}
          allocations={allocations}
          year={year}
          showcheck={showcheck}
          srAnnounce={srAnnounce}
        />
      </header>
      {children}
      <Tilegram allocations={allocations} year={year} {...otherTilegramProps}></Tilegram>
    </div>
  );
};

export default Graphic;
