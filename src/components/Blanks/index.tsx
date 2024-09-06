import React, { useEffect, useMemo, useState } from 'react';
import {
  Allocation,
  Allocations,
  DEFAULT_ELECTION_YEAR,
  DEFAULT_RELATIVE_ELECTION_YEAR,
  Focus,
  PRESETS
} from '../../constants';
import { loadData } from '../../data';
import { getStateIDForGroupID, liveResultsToGraphicProps } from '../../utils';
import Graphic, { GraphicProps } from '../Graphic';
import Live from '../Live';
import styles from './styles.scss';

export type BlanksProps = {
  isLive?: boolean;
  hasStatesResults?: boolean;
  initialGraphicProps?: GraphicProps;
};

const defaultGraphicProps = {
  year: DEFAULT_ELECTION_YEAR,
  relative: DEFAULT_RELATIVE_ELECTION_YEAR
};

const Blanks: React.FC<BlanksProps> = ({ isLive, hasStatesResults, initialGraphicProps }) => {
  const [fixedGraphicProps, setFixedGraphicProps] = useState<GraphicProps>(defaultGraphicProps);
  const [audienceAllocations, setAudienceAllocations] = useState<Allocations>({});
  const [liveStateCode, setLiveStateCode] = useState('');

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

      const stateID = getStateIDForGroupID(groupId);

      if (!stateID) {
        return;
      }

      setLiveStateCode(stateID);
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

    // Strategy 1)
    // Cycle to the next Allocation in the enum (or the first if we don't recognise it)
    // const allocationIndex = ALLOCATIONS.indexOf(allocation);
    // nextAudienceAllocations[groupId] = ALLOCATIONS[
    //   allocationIndex === ALLOCATIONS.length - 1 ? 0 : allocationIndex + 1
    // ] as Allocation;

    // Strategy 2)
    // If not allocated to either party, allocate to the incumbent (if we have a relative year) or Dem.
    // If alloated to a party, allocate to the other.
    // const relativeAllocation = PRESETS[fixedGraphicProps.relative || DEFAULT_RELATIVE_ELECTION_YEAR].allocations[groupId] || Allocation.Dem
    // nextAudienceAllocations[groupId] =
    //   allocation === Allocation.Dem
    //     ? Allocation.GOP
    //     : allocation === Allocation.GOP
    //     ? Allocation.Dem
    //     : relativeAllocation;

    // Strategy 3)
    // Same as Strategy 2, but allocates Likely{X} instead
    // const relativeAllocation =
    //   PRESETS[fixedGraphicProps.relative || DEFAULT_RELATIVE_ELECTION_YEAR].allocations[groupId] || Allocation.Dem;
    // nextAudienceAllocations[groupId] =
    //   allocation === Allocation.LikelyDem
    //     ? Allocation.LikelyGOP
    //     : allocation === Allocation.LikelyGOP
    //     ? Allocation.LikelyDem
    //     : relativeAllocation === Allocation.Dem
    //     ? Allocation.LikelyDem
    //     : Allocation.LikelyGOP;

    // Strategy 4)
    // Cycle between relative incumbent, challenger and None
    // const relativeIncumbentAllocation =
    //   PRESETS[fixedGraphicProps.relative || DEFAULT_RELATIVE_ELECTION_YEAR].allocations[groupId] || Allocation.Dem;
    // const relativeChallengerAllocation =
    //   relativeIncumbentAllocation === Allocation.Dem ? Allocation.GOP : Allocation.Dem;
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

    // Strategy 5)
    // Cycle between relative incumbent, challenger and Unallocated
    const relativeIncumbentAllocation =
      PRESETS[fixedGraphicProps.relative || DEFAULT_RELATIVE_ELECTION_YEAR].allocations[groupId] || Allocation.Dem;
    const relativeChallengerAllocation =
      relativeIncumbentAllocation === Allocation.Dem ? Allocation.GOP : Allocation.Dem;
    switch (allocation) {
      case relativeIncumbentAllocation:
        nextAudienceAllocations[groupId] = relativeChallengerAllocation;
        break;
      case relativeChallengerAllocation:
        nextAudienceAllocations[groupId] = Allocation.Unallocated;
        break;
      default:
        nextAudienceAllocations[groupId] = relativeIncumbentAllocation;
        break;
    }

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
        const stateID = getStateIDForGroupID(groupId);

        allocations[groupId] =
          allocation === Allocation.Dem || allocation === Allocation.GOP ? allocation : Allocation.Unallocated;
        focuses[stateID] = allocation === Allocation.Dem || allocation === Allocation.GOP ? Focus.No : Focus.Yes;
      });

      setFixedGraphicProps({
        ...graphicProps,
        allocations,
        focuses
      });
    }

    if (initialGraphicProps) {
      registerFixedGraphicsProps(initialGraphicProps);
    } else if (isLive) {
      loadData({}).then(data => registerFixedGraphicsProps(liveResultsToGraphicProps(data)));
    } else {
      console.error('No graphic props to register');
    }
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.graphic} onMouseMove={updateResults} onTouchMove={updateResults}>
        <Graphic {...graphicProps} />
        {isLive && hasStatesResults && (
          <div className={styles.live}>
            <Live stateCode={liveStateCode} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Blanks;
