import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Allocation,
  Allocations,
  INITIAL_ALLOCATIONS,
  Focus,
  Focuses,
  INITIAL_FOCUSES,
  MIXINS,
  PRESETS,
  ELECTION_YEARS,
  HEX_ANIMATIONS,
  HEX_ANIMATION_STYLES,
  GROUPS,
  candidatesForYear
} from '../../constants';
import CandidateDropdown from './CandidateDropdown/CandidateDropdown';
import { loadData } from '../../data';
import {
  alternatingCaseToGraphicProps,
  graphicPropsToAlternatingCase,
  legactyUrlQueryToGraphicProps,
  liveResultsToGraphicProps
} from '../../utils';
import type { GraphicProps } from '../Graphic';
import Graphic, { DEFAULT_PROPS as DEFAULT_GRAPHIC_PROPS } from '../Graphic';
import Icon from '../Icon';
import styles from './styles.scss';
import { Dialog, DialogDivider, DialogHeader, DialogLabel } from './Dialog/dialog';
import { AddRemoves } from '../Tilegram/Tilegram';
import NewVersionCheck from './NewVersionCheck';

type LastTapped = {
  stateId: string;
  groupId: string;
  hexId: number;
  clientX: number;
  clientY: number;
};

const INITIAL_GRAPHIC_PROPS = {
  allocations: { ...INITIAL_ALLOCATIONS },
  focuses: { ...INITIAL_FOCUSES },
  addremoves: {}
};

const STORY_MARKERS = [
  { label: 'Standalone graphic', prefix: 'ecgraphic' },
  { label: 'Fill-in-the-blanks graphic', prefix: 'ecblanks' },
  {
    label: 'Scrollyteller opener',
    note: `If you're placing multiple scrollytellers in a single story, each must have a unique NAME.`,
    prefix: 'scrollytellerNAMEecblock'
  },
  { label: 'Scrollyteller mark', prefix: 'mark' }
];

const SNAPSHOTS_LOCALSTORAGE_KEY = 'eceditorsnapshots';

function getSnapshots() {
  const snapshots = JSON.parse(localStorage.getItem(SNAPSHOTS_LOCALSTORAGE_KEY) || '{}');
  Object.keys(snapshots).forEach(name => {
    if (snapshots[name].startsWith('?')) {
      console.info('- migrating legacy snapshot', name);
      snapshots[name] = graphicPropsToAlternatingCase(legactyUrlQueryToGraphicProps(snapshots[name]));
    }
  });
  return snapshots;
}

const Builder: React.FC = () => {
  const initialUrlParamProps = useMemo(
    () => ({
      ...INITIAL_GRAPHIC_PROPS,
      ...DEFAULT_GRAPHIC_PROPS,
      ...alternatingCaseToGraphicProps(window.location.hash.slice(1))
    }),
    []
  );

  const [allocations, setAllocations] = useState<Allocations>(initialUrlParamProps.allocations);
  const [focuses, setFocuses] = useState<Focuses>(initialUrlParamProps.focuses);
  const [addremoves, setAddremoves] = useState<AddRemoves>(initialUrlParamProps.addremoves);
  const [year, setYear] = useState<number>(initialUrlParamProps.year);
  const [relative, setRelative] = useState<number | null>(initialUrlParamProps.relative);
  const [counting, setCounting] = useState(initialUrlParamProps.counting);
  const [hexBorders, setHexBorders] = useState(initialUrlParamProps.hexborders);
  const [hexflip, setHexflip] = useState(initialUrlParamProps.hexflip);
  const [hexani, setHexani] = useState(initialUrlParamProps.hexani);
  const [candidatesoverride, setCandidatesoverride] = useState<string | undefined>(
    initialUrlParamProps.candidatesoverride
  );
  const _candidatesoverride = candidatesoverride ? candidatesoverride.split('') : candidatesForYear(year);

  const [snapshots, setSnapshots] = useState(getSnapshots());
  const [lastTapped, setLastTapped] = useState<LastTapped | null>(null);
  const lastTappedHexCode = [lastTapped?.groupId, lastTapped?.hexId].join();
  const lastTappedGroup = GROUPS.find(group => group.id === lastTapped?.groupId);

  const createSnapshot = (name: string, urlQuery: string) => {
    const nextSnapshots = {
      [name]: urlQuery,
      ...snapshots
    };

    localStorage.setItem(SNAPSHOTS_LOCALSTORAGE_KEY, JSON.stringify(nextSnapshots));
    setSnapshots(nextSnapshots);
  };

  const deleteSnapshot = (name: string) => {
    const nextSnapshots = { ...snapshots };

    delete nextSnapshots[name];

    localStorage.setItem(SNAPSHOTS_LOCALSTORAGE_KEY, JSON.stringify(nextSnapshots));
    setSnapshots(nextSnapshots);
  };

  const mixinGraphicProps = (mixin: GraphicProps) => {
    setAllocations({
      ...allocations,
      ...mixin.allocations
    });
    setFocuses({
      ...focuses,
      ...mixin.focuses
    });
    setYear(mixin.year || year);
  };

  const replaceGraphicProps = (replacement: GraphicProps) => {
    setAllocations({
      ...INITIAL_ALLOCATIONS,
      ...replacement.allocations
    });
    setFocuses({
      ...INITIAL_FOCUSES,
      ...replacement.focuses
    });
    setYear(replacement.year || DEFAULT_GRAPHIC_PROPS.year);
    setAddremoves(replacement.addremoves || DEFAULT_GRAPHIC_PROPS.addremoves);
  };

  const importMarker = (marker: string) => {
    const graphicProps = alternatingCaseToGraphicProps(marker);
    replaceGraphicProps(graphicProps);
    setRelative(Number(graphicProps.relative) || DEFAULT_GRAPHIC_PROPS.relative);
    setCounting(graphicProps.counting || DEFAULT_GRAPHIC_PROPS.counting);
    setHexBorders(graphicProps.hexborders || DEFAULT_GRAPHIC_PROPS.hexborders);
    setHexflip(graphicProps.hexflip || DEFAULT_GRAPHIC_PROPS.hexflip);
    setHexani(graphicProps.hexani || DEFAULT_GRAPHIC_PROPS.hexani);
    setAddremoves(graphicProps.addremoves || DEFAULT_GRAPHIC_PROPS.addremoves);
    setCandidatesoverride(graphicProps.candidatesoverride);
  };

  const loadLiveResults = () => {
    loadData({ forceRefresh: true }).then(data => {
      const graphicProps = liveResultsToGraphicProps(data);

      replaceGraphicProps(graphicProps);
      setRelative(graphicProps.relative || DEFAULT_GRAPHIC_PROPS.relative);
    });
  };

  function onClick(lastTapped) {
    setLastTapped(lastTapped);
  }

  const graphicProps = useMemo(
    () => ({
      ...initialUrlParamProps,
      allocations,
      focuses,
      year,
      relative: relative,
      counting,
      hexborders: hexBorders,
      hexflip,
      hexani,
      addremoves: Object.keys(addremoves).length > 0 ? addremoves : undefined,
      candidatesoverride: candidatesoverride
    }),
    [allocations, focuses, year, relative, counting, hexBorders, hexflip, hexani, addremoves, candidatesoverride]
  );

  const graphicPropsAsAlternatingCase = useMemo(
    () => graphicPropsToAlternatingCase(graphicProps, DEFAULT_GRAPHIC_PROPS),
    [graphicProps]
  );

  useEffect(() => {
    history.replaceState(graphicProps, document.title, `#${graphicPropsAsAlternatingCase}`);
  }, [graphicPropsAsAlternatingCase]);

  function closeDialog() {
    setLastTapped(null);
  }

  function closeDialogNextTick() {
    setTimeout(closeDialog, 100);
  }

  return (
    <div className={styles.root}>
      <NewVersionCheck />
      <div className={styles.graphic}>
        <div className={styles.graphicInner}>
          <Graphic onClick={onClick} {...graphicProps} />
        </div>
      </div>
      <div className={styles.controls}>
        <label>
          Current year <small>(set candidate names &amp; sides)</small>
        </label>
        <div className={styles.flexRow}>
          {ELECTION_YEARS.map(_year => (
            <span key={_year}>
              <label>
                <input
                  type="radio"
                  name="year"
                  value={_year}
                  checked={_year === year}
                  onChange={() => setYear(_year)}
                ></input>
                {_year}
              </label>
            </span>
          ))}
        </div>
        <label>Relative year</label>
        <div className={styles.flexRow}>
          <span key="none">
            <label>
              <input
                type="radio"
                name="relative"
                value={'none'}
                checked={null === relative}
                onChange={() => setRelative(null)}
              ></input>
              None
            </label>
          </span>
          {Object.keys(PRESETS)
            .map(key => parseInt(key, 10))
            .filter(key => !isNaN(key))
            .reverse()
            .map(year => (
              <span key={year}>
                <label>
                  <input
                    type="radio"
                    name="relative"
                    value={year}
                    checked={year === relative}
                    onChange={() => setRelative(year)}
                  ></input>
                  {year}
                </label>
              </span>
            ))}
        </div>
        <label>Override candidates</label>
        <div className={styles.flexRow}>
          <CandidateDropdown
            value={_candidatesoverride[0]}
            onChange={value => setCandidatesoverride([value, _candidatesoverride[1]].join(''))}
          />
          <CandidateDropdown
            value={_candidatesoverride[1]}
            onChange={value => setCandidatesoverride([_candidatesoverride[0], value].join(''))}
          />
          {candidatesoverride && (
            <>
              <span>Candidate names overridden:</span>
              <button onClick={() => setCandidatesoverride(undefined)}>Reset</button>
            </>
          )}
        </div>

        <label>Visual</label>
        <div className={styles.flexRow}>
          <span key="none">
            <label>
              <input
                type="checkbox"
                name="counting"
                value="counting"
                checked={counting}
                onChange={() => setCounting(!counting)}
              ></input>
              Show totals
            </label>
          </span>
        </div>
        <div className={styles.flexRow}>
          <span key="none">
            <label>
              <input
                type="checkbox"
                name="hexBorders"
                value="hexBorders"
                checked={hexBorders}
                onChange={() => setHexBorders(!hexBorders)}
              ></input>
              Show hexagon borders
            </label>
          </span>
        </div>
        <label>Hexagon animation</label>
        <div className={styles.flexRow}>
          {HEX_ANIMATIONS.map(animation => (
            <span key={animation}>
              <label>
                <input
                  type="radio"
                  name="hexflip"
                  value={animation}
                  checked={animation === hexflip}
                  onChange={() => setHexflip(animation)}
                ></input>
                {animation}
              </label>
            </span>
          ))}
        </div>
        <div className={styles.flexRow}>
          {HEX_ANIMATION_STYLES.map(animation => (
            <span key={animation}>
              <label>
                <input
                  type="radio"
                  name="hexani"
                  value={animation}
                  checked={animation === hexani}
                  onChange={() => setHexani(animation)}
                ></input>
                {animation}
              </label>
            </span>
          ))}
        </div>
        <label>
          Mix-ins <small>(added to the map)</small>
        </label>
        <div className={styles.flexRow}>
          {Object.keys(MIXINS).map(key => {
            const { name, ...graphicProps } = MIXINS[key];

            return (
              <button key={key} onClick={() => mixinGraphicProps(graphicProps)}>
                {name || key}
              </button>
            );
          })}
        </div>
        <label>
          Presets <small>(replace the whole map)</small>
        </label>
        <div className={styles.flexRow}>
          <button key="empty" onClick={() => replaceGraphicProps({})}>
            Empty (24)
          </button>
          <button key="empty" onClick={() => replaceGraphicProps({ year: 2020 })}>
            Empty (20)
          </button>
          {Object.keys(PRESETS).map(key => {
            const { name, ...graphicProps } = PRESETS[key];

            return (
              <button key={key} onClick={() => replaceGraphicProps(graphicProps)}>
                {name || key}
              </button>
            );
          })}
          <button key="live" onClick={loadLiveResults}>
            Live results
          </button>
        </div>
        <label>
          Story markers
          <button
            title="Load marker from clipboard"
            onClick={() => {
              const marker = prompt('Paste a marker here to import its configuration');

              if (!marker || !marker.length) {
                return alert('No marker was provided');
              }

              importMarker(marker);
            }}
          >
            <Icon name="edit" />
          </button>
        </label>
        {STORY_MARKERS.map(({ label, note, prefix }) => ({
          label,
          note,
          text: `#${prefix}${graphicPropsAsAlternatingCase}`
        })).map(({ label, note, text }) => (
          <details key={label}>
            <summary>
              {label}
              <button onClick={() => navigator.clipboard.writeText(text)} title="Copy marker">
                <Icon name="share" />
              </button>
            </summary>
            <pre>{text}</pre>
            {note && <small style={{ color: 'red' }}>{`Note: ${note}`}</small>}
          </details>
        ))}
        <label htmlFor="definitely-not-the-add-button">
          Snapshots
          <button
            onClick={() => {
              const name = prompt('What would you like to call this snapshot?');

              if (!name || !name.length) {
                return alert('No name was provided');
              } else if (snapshots[name]) {
                return alert(`Can't overwrite existing snapshot`);
              }

              createSnapshot(name, graphicPropsAsAlternatingCase);
            }}
          >
            <Icon name="add" />
          </button>
        </label>
        <ul>
          {Object.keys(snapshots).map(name => (
            <li key={name}>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(String(window.location.href).split('?')[0] + snapshots[name])
                }
              >
                <Icon name="share" />
              </button>
              <button onClick={() => deleteSnapshot(name)}>
                <Icon name="delete" />
              </button>{' '}
              <a
                href={snapshots[name]}
                onClick={event => {
                  event.preventDefault();
                  replaceGraphicProps(alternatingCaseToGraphicProps(snapshots[name]));
                }}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {lastTapped && (
        <Dialog onClose={closeDialog} position={[lastTapped.clientX, lastTapped.clientY]}>
          <DialogHeader>
            <strong>{lastTapped.groupId}</strong> - {lastTappedGroup?.name}&nbsp; ({lastTappedGroup?.count[year]} vote
            {lastTappedGroup?.count[year] > 1 ? 's' : ''})
          </DialogHeader>

          {Object.entries(Allocation)
            .slice(0, -1)
            .map(([name, value]) => (
              <DialogLabel>
                <input
                  type="radio"
                  name="menu-allocation"
                  value={value}
                  checked={allocations[lastTapped.groupId] === value}
                  onChange={() => {
                    setAllocations({ ...allocations, [lastTapped.groupId]: value });
                    closeDialogNextTick();
                  }}
                ></input>
                {name}
              </DialogLabel>
            ))}

          <DialogDivider />

          <DialogLabel>
            <input
              type="checkbox"
              checked={focuses[lastTapped.stateId] === Focus.Yes}
              onChange={e => {
                setFocuses({ ...focuses, [lastTapped.stateId]: e.target.checked ? Focus.Yes : Focus.No });
                closeDialogNextTick();
              }}
            ></input>{' '}
            Focused
          </DialogLabel>
          <DialogHeader>Added/removed hexes</DialogHeader>
          <DialogLabel>
            <input
              type="checkbox"
              checked={addremoves[lastTappedHexCode] === 'a'}
              onChange={e => {
                const checked = e.target.checked;
                if (checked) setFocuses({ ...focuses, [lastTapped.stateId]: Focus.Yes });
                setAddremoves({ ...addremoves, [lastTappedHexCode]: checked ? 'a' : undefined });
                closeDialogNextTick();
              }}
            ></input>
            Hex added
          </DialogLabel>
          <DialogLabel>
            <input
              type="checkbox"
              checked={addremoves[lastTappedHexCode] === 'r'}
              onChange={e => {
                const checked = e.target.checked;
                if (checked) setFocuses({ ...focuses, [lastTapped.stateId]: Focus.Yes });
                setAddremoves({ ...addremoves, [lastTappedHexCode]: checked ? 'r' : undefined });
                closeDialogNextTick();
              }}
            ></input>
            Hex removed
          </DialogLabel>
          <DialogDivider />
        </Dialog>
      )}
    </div>
  );
};

export default Builder;
