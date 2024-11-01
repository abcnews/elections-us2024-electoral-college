import React, { useEffect, useMemo, useState } from 'react';
import {
  Allocation,
  Allocations,
  DEFAULT_ELECTION_YEAR,
  DEFAULT_RELATIVE_ELECTION_YEAR,
  Focus,
  getStateIdForGroupId,
  GROUPS,
  PRESETS
} from '../../constants';
import Graphic, { GraphicProps } from '../Graphic';
import styles from './styles.scss';
import '../../global.scss';
import DropdownRow from './DropdownRow/DropdownRow';
import Finger from './Finger/Finger';

export type BlanksProps = {
  isLive?: boolean;
  hasStatesResults?: boolean;
  initialGraphicProps?: GraphicProps;
};

const defaultGraphicProps = {
  year: DEFAULT_ELECTION_YEAR,
  relative: DEFAULT_RELATIVE_ELECTION_YEAR
};

function getClosestGroup({ fixedAllocations, groupId }) {
  const stateGroup = getStateIdForGroupId(groupId);
  if (stateGroup === groupId) {
    return groupId;
  }

  // filter through unallocated states & find ones taht have the same stateGroup
  // as we just clicked.
  const unallocatedGroups = Object.entries(fixedAllocations)
    .map(([thisGroupId, allocation]) => allocation === Allocation.None && thisGroupId)
    .filter(thisGroupId => thisGroupId && getStateIdForGroupId(thisGroupId) === stateGroup);

  // There are no unallocated groups in this state so there's not much we can do
  if (!unallocatedGroups.length) {
    return groupId;
  }

  // If there's more than one, this is a case we hadn't planned for. Just return
  // whatever we clicked.
  if (unallocatedGroups.length > 1) {
    return groupId;
  }

  // Otherwise this is the only unallocated group in the state, so clicking
  // anywhere in the state will toggle this one.
  return unallocatedGroups[0];
}

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
    const actualGroupId = getClosestGroup({
      fixedAllocations: fixedGraphicProps.allocations,
      groupId
    });
    if (!fixedGraphicProps || !fixedGraphicProps.allocations) {
      return console.error('No fixed results yet');
    }

    if (
      fixedGraphicProps.allocations[actualGroupId] === Allocation.Dem ||
      fixedGraphicProps.allocations[actualGroupId] === Allocation.GOP
    ) {
      return console.error(`${actualGroupId} is already called`);
    }

    const allocation = audienceAllocations[actualGroupId] || Allocation.None;
    const nextAudienceAllocations = {
      ...audienceAllocations
    };

    // Strategy 5)
    // Cycle between relative incumbent, challenger and Unallocated

    const allocationMap = {
      [Allocation.None]: Allocation.LikelyDem,
      [Allocation.LikelyDem]: Allocation.LikelyGOP,
      [Allocation.LikelyGOP]: Allocation.None
    };
    nextAudienceAllocations[actualGroupId] = allocationMap[allocation];

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
      <div className={styles.container}>
        <div className={styles.containerA}>
          <div className={styles.graphic} onMouseMove={updateResults} onTouchMove={updateResults}>
            <Graphic {...graphicProps} srAnnounce={true} showcheck={true}>
              <div className={[styles.description, styles.descriptionMobileInside, styles.mobileOnly].join(' ')}>
                <Finger />
                <p className={styles.instructions}>Tap undecided states to cycle through possible outcomes:</p>
              </div>
            </Graphic>
          </div>
        </div>

        <div className={styles.containerB}>
          <div className={[styles.description, styles.desktopOnly].join(' ')}>
            <Finger />
            <p className={styles.instructions}>
              Tap undecided states to cycle through possible outcomes, or select outcomes for each state from the
              dropdown menus:
            </p>
          </div>

          <p
            className={[styles.instructions, styles.instructionsMobileBottom, styles.mobileOnly, styles.centre].join(
              ' '
            )}
          >
            Or select outcomes for each state here:
          </p>
          <ul className={styles.semantic}>
            {GROUPS.map(group => {
              const isLocked = fixedGraphicProps?.allocations?.[group.id] !== Allocation.None;
              if (isLocked) {
                return null;
              }
              return (
                <li key={group.id}>
                  <DropdownRow
                    code={group.id}
                    year={graphicProps.year}
                    value={audienceAllocations[group.id]}
                    onChange={value =>
                      setAudienceAllocations({
                        ...audienceAllocations,
                        [group.id]: value
                      })
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Blanks;
