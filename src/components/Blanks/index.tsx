import React, { useEffect, useMemo, useState } from 'react';
import {
  Allocation,
  Allocations,
  DEFAULT_ELECTION_YEAR,
  DEFAULT_RELATIVE_ELECTION_YEAR,
  Focus,
  getStateIdForGroupId,
  PRESETS
} from '../../constants';
import Graphic, { GraphicProps } from '../Graphic';
import styles from './styles.scss';
import '../../global.scss';

export type BlanksProps = {
  isLive?: boolean;
  hasStatesResults?: boolean;
  initialGraphicProps?: GraphicProps;
};

const defaultGraphicProps = {
  year: DEFAULT_ELECTION_YEAR,
  relative: DEFAULT_RELATIVE_ELECTION_YEAR
};

const Blanks: React.FC<BlanksProps> = ({ hasStatesResults, initialGraphicProps }) => {
  const [fixedGraphicProps, setFixedGraphicProps] = useState<GraphicProps>(defaultGraphicProps);
  const [audienceAllocations, setAudienceAllocations] = useState<Allocations>({});

  const updateResults = useMemo(
    () => event => {
      if (!fixedGraphicProps || !fixedGraphicProps.allocations) {
        return;
      }

      const groupId = event.target.getAttribute('data-group');

      if (!groupId) {
        return;
      }

      if (
        fixedGraphicProps.allocations[groupId] === Allocation.Dem ||
        fixedGraphicProps.allocations[groupId] === Allocation.GOP
      ) {
        return;
      }
    },
    [hasStatesResults, fixedGraphicProps]
  );

  const onClick = ({ groupId }) => {
    if (!fixedGraphicProps || !fixedGraphicProps.allocations) {
      return console.error('No fixed results yet');
    }

    if (
      fixedGraphicProps.allocations[groupId] === Allocation.Dem ||
      fixedGraphicProps.allocations[groupId] === Allocation.GOP
    ) {
      return console.error(`${groupId} is already called`);
    }

    const allocation = audienceAllocations[groupId] || Allocation.None;
    const nextAudienceAllocations = {
      ...audienceAllocations
    };

    // Strategy 5)
    // Cycle between relative incumbent, challenger and Unallocated
    const relativeIncumbentAllocation =
      PRESETS[fixedGraphicProps.relative || DEFAULT_RELATIVE_ELECTION_YEAR].allocations[groupId] || Allocation.Dem;

    const allocationMap = {
      [Allocation.None]: Allocation.LikelyDem,
      [Allocation.LikelyDem]: Allocation.LikelyGOP,
      [Allocation.LikelyGOP]: Allocation.None
    };
    nextAudienceAllocations[groupId] = allocationMap[allocation];
    if (!nextAudienceAllocations[groupId]) throw new Error('ohno');

    // const relativeChallengerAllocation =
    //   relativeIncumbentAllocation === Allocation.LikelyDem ? Allocation.LikelyGOP : Allocation.LikelyDem;

    // switch (allocation) {
    //   case relativeIncumbentAllocation:
    //     nextAudienceAllocations[groupId] = relativeChallengerAllocation;
    //     break;
    //   case relativeChallengerAllocation:
    //     nextAudienceAllocations[groupId] = Allocation.None;
    //     break;
    //   default:
    //     nextAudienceAllocations[groupId] = relativeIncumbentAllocation;
    //     break;
    // }

    setAudienceAllocations(nextAudienceAllocations);
  };

  const graphicProps = useMemo(() => {
    return {
      ...defaultGraphicProps,
      ...fixedGraphicProps,
      allocations: {
        ...fixedGraphicProps.allocations,
        ...audienceAllocations
      },
      relative: undefined,
      onClick
    };
  }, [fixedGraphicProps, audienceAllocations]);

  useEffect(() => {
    function registerFixedGraphicsProps(graphicProps) {
      const allocations = graphicProps.allocations || {};
      const focuses = {};

      Object.keys(allocations).forEach(groupId => {
        const allocation = allocations[groupId];
        const stateId = getStateIdForGroupId(groupId);

        allocations[groupId] =
          allocation === Allocation.Dem || allocation === Allocation.GOP ? allocation : Allocation.None;
        focuses[stateId] = Focus.No;
      });

      setFixedGraphicProps({
        ...graphicProps,
        allocations,
        focuses
      });
    }

    if (initialGraphicProps) {
      registerFixedGraphicsProps(initialGraphicProps);
    }
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.graphic} onMouseMove={updateResults} onTouchMove={updateResults}>
        <Graphic {...graphicProps} />
      </div>
    </div>
  );
};

export default Blanks;
