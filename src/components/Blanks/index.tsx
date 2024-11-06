import React, { useEffect, useMemo, useState } from 'react';
import {
  Allocation,
  Allocations,
  DEFAULT_ELECTION_YEAR,
  DEFAULT_RELATIVE_ELECTION_YEAR,
  Focus,
  getStateIdForGroupId,
  GROUPS,
  INITIAL_ALLOCATIONS,
  PRESETS
} from '../../constants';
import Graphic, { GraphicProps } from '../Graphic';
import styles from './styles.scss';
import '../../global.scss';
import DropdownRow from './DropdownRow/DropdownRow';
import Finger from './Finger/Finger';
import { loadData } from '../../data';
import { getHasAllocations } from '../../utils';

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
  const [status, setStatus] = useState('loading');

  const onClick = ({ groupId }) => {
    if (status === 'loading') {
      return;
    }
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
  }, [fixedGraphicProps, audienceAllocations, status]);

  useEffect(() => {
    function registerFixedGraphicsProps(allocations) {
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

    const allocations = initialGraphicProps?.allocations || {};
    const hasAllocations = getHasAllocations(allocations);

    if (hasAllocations) {
      registerFixedGraphicsProps(allocations);
      setStatus('loaded');
    } else {
      loadData().then(({ results }) => {
        registerFixedGraphicsProps({ ...INITIAL_ALLOCATIONS, ...results });
        setStatus('loaded');
      });
    }
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.containerA}>
          <div className={styles.graphic}>
            <Graphic {...graphicProps} srAnnounce={true} showcheck={true}>
              <div className={[styles.description, styles.descriptionMobileInside, styles.mobileOnly].join(' ')}>
                <Finger />
                <p className={styles.instructions}>Tap undecided states to cycle through possible outcomes:</p>
              </div>
            </Graphic>
          </div>
          <button
            className={[
              styles.resetButton,
              Object.keys(audienceAllocations).length > 0 ? styles.resetButtonVisible : styles.resetButtonHidden
            ].join(' ')}
            aria-hidden={Object.keys(audienceAllocations).length === 0}
            onClick={() => setAudienceAllocations({})}
          >
            Reset{' '}
            <svg
              className={styles.mobileOnly}
              width="18"
              height="19"
              viewBox="0 0 18 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6.43774 6.15869L1.38511 6.15869L1.38511 1.10606" stroke="#7A7A7A" stroke-width="2" />
              <path
                d="M1.38507 9.52719C1.38507 13.7129 4.77828 17.1061 8.96402 17.1061C13.1498 17.1061 16.543 13.7129 16.543 9.52719C16.543 5.34145 13.1498 1.94824 8.96402 1.94824C6.86752 1.94824 4.96983 2.79949 3.59775 4.17522L1.80613 6.15877"
                stroke="#7A7A7A"
                stroke-width="2"
              />
            </svg>
            <svg
              className={styles.desktopOnly}
              width="23"
              height="23"
              viewBox="0 0 23 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8.70081 7.73413L2.38502 7.73413L2.38502 1.41834" stroke="#7A7A7A" stroke-width="2" />
              <path
                d="M2.38497 11.9448C2.38497 17.1769 6.62648 21.4184 11.8587 21.4184C17.0908 21.4184 21.3323 17.1769 21.3323 11.9448C21.3323 6.71258 17.0908 2.47107 11.8587 2.47107C9.23802 2.47107 6.86592 3.53513 5.15082 5.25479L2.91128 7.73423"
                stroke="#7A7A7A"
                stroke-width="3"
              />
            </svg>
          </button>
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
            Or select outcomes for each state&nbsp;here:
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
