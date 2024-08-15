import React, { useEffect, useMemo, useState } from 'react';
import {
  Allocation,
  Allocations,
  ALLOCATIONS,
  INITIAL_ALLOCATIONS,
  Focus,
  Focuses,
  FOCUSES,
  INITIAL_FOCUSES,
  MIXINS,
  PRESETS,
  ElectionYear,
  ELECTION_YEARS,
  HEX_ANIMATIONS
} from '../../constants';
import { loadData } from '../../data';
import {
  alternatingCaseToGraphicProps,
  graphicPropsToAlternatingCase,
  urlQueryToGraphicProps,
  graphicPropsToUrlQuery,
  liveResultsToGraphicProps
} from '../../utils';
import type { GraphicProps } from '../Graphic';
import Graphic, { DEFAULT_PROPS as DEFAULT_GRAPHIC_PROPS } from '../Graphic';
import graphicStyles from '../Graphic/styles.scss';
import Icon from '../Icon';
import tilegramStyles from '../Tilegram/styles.scss';
import totalsStyles from '../Totals/styles.scss';
import styles from './styles.scss';

export enum TappableLayer {
  Delegates,
  States
}

const COMPONENTS_STYLES = {
  Graphic: graphicStyles,
  Totals: totalsStyles,
  Tilegram: tilegramStyles
};

const INITIAL_GRAPHIC_PROPS = {
  allocations: { ...INITIAL_ALLOCATIONS },
  focuses: { ...INITIAL_FOCUSES }
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

const Editor: React.FC = () => {
  const initialUrlParamProps = useMemo(
    () => ({
      ...INITIAL_GRAPHIC_PROPS,
      ...DEFAULT_GRAPHIC_PROPS,
      ...urlQueryToGraphicProps(String(window.location.search))
    }),
    []
  );
  const [allocations, setAllocations] = useState<Allocations>(initialUrlParamProps.allocations);
  const [focuses, setFocuses] = useState<Focuses>(initialUrlParamProps.focuses);
  const [year, setYear] = useState<ElectionYear>(initialUrlParamProps.year);
  const [relative, setRelative] = useState<number | null>(initialUrlParamProps.relative);
  const [counting, setCounting] = useState(initialUrlParamProps.counting);
  const [hexBorders, setHexBorders] = useState(initialUrlParamProps.hexborders);
  const [hexflip, setHexflip] = useState(initialUrlParamProps.hexflip);
  const [tappableLayer, setTappableLayer] = useState(TappableLayer.Delegates);
  const [snapshots, setSnapshots] = useState(JSON.parse(localStorage.getItem(SNAPSHOTS_LOCALSTORAGE_KEY) || '{}'));

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
  };

  const importMarker = (marker: string) => {
    const graphicProps = alternatingCaseToGraphicProps(marker);
    replaceGraphicProps(graphicProps);
    setRelative(Number(graphicProps.relative) || DEFAULT_GRAPHIC_PROPS.relative);
    setCounting(graphicProps.counting || DEFAULT_GRAPHIC_PROPS.counting);
    setHexBorders(graphicProps.hexborders || DEFAULT_GRAPHIC_PROPS.hexborders);
    setHexflip(graphicProps.hexflip || DEFAULT_GRAPHIC_PROPS.hexflip);
  };

  const loadLiveResults = () => {
    loadData({ forceRefresh: true }).then(data => {
      const graphicProps = liveResultsToGraphicProps(data);

      replaceGraphicProps(graphicProps);
      setRelative(graphicProps.relative || DEFAULT_GRAPHIC_PROPS.relative);
    });
  };

  function onClick({ stateId, groupId, ...args }) {
    if (tappableLayer === TappableLayer.Delegates) {
      // toggle states
      const allocationsToMixin: Allocations = {};

      const allocation = allocations[groupId];
      const allocationIndex = ALLOCATIONS.indexOf(allocation);

      // Cycle to the next Allocation in the enum (or the first if we don't recognise it)
      allocationsToMixin[groupId] = ALLOCATIONS[
        allocationIndex === ALLOCATIONS.length - 1 ? 0 : allocationIndex + 1
      ] as Allocation;

      mixinGraphicProps({ allocations: allocationsToMixin });
    }

    if (tappableLayer === TappableLayer.States) {
      /// mixins
      const focusesToMixin: Focuses = {};

      const focus = focuses[stateId];
      const focusIndex = FOCUSES.indexOf(focus);

      // Cycle to the next Focus in the enum (or the first if we don't recognise it)
      focusesToMixin[stateId] = FOCUSES[focusIndex === FOCUSES.length - 1 ? 0 : focusIndex + 1] as Focus;

      mixinGraphicProps({ focuses: focusesToMixin });
    }
  }

  const graphicProps = useMemo(
    () => ({
      ...initialUrlParamProps,
      allocations,
      focuses,
      year,
      relative,
      counting,
      hexborders: hexBorders,
      hexflip
    }),
    [allocations, focuses, year, relative, counting, hexBorders, hexflip]
  );

  const graphicPropsAsAlternatingCase = useMemo(
    () => graphicPropsToAlternatingCase(graphicProps, DEFAULT_GRAPHIC_PROPS),
    [graphicProps]
  );
  const graphicPropsAsUrlQuery = useMemo(
    () => graphicPropsToUrlQuery(graphicProps, DEFAULT_GRAPHIC_PROPS),
    [graphicProps]
  );

  const fallbackAutomationBaseURL = useMemo(
    () =>
      `https://fallback-automation.drzax.now.sh/api?url=${encodeURIComponent(
        String(document.location.href).split('?')[0] + graphicPropsAsUrlQuery
      )}&width=600&selector=.`,
    [graphicPropsAsUrlQuery]
  );

  useEffect(() => {
    history.replaceState(graphicProps, document.title, graphicPropsAsUrlQuery);
  }, [graphicPropsAsUrlQuery]);

  return (
    <div className={styles.root}>
      <div className={styles.graphic}>
        <Graphic onClick={onClick} {...graphicProps} />
      </div>
      <div className={styles.controls}>
        <label>Active layer</label>
        <div className={styles.flexRow}>
          <span>
            <label>
              <input
                type="radio"
                name="tappableLayer"
                value={TappableLayer.Delegates}
                checked={TappableLayer.Delegates === tappableLayer}
                onChange={() => setTappableLayer(TappableLayer.Delegates)}
              ></input>
              Assigned delegates
            </label>
          </span>
          <span>
            <label>
              <input
                type="radio"
                name="tappableLayer"
                value={TappableLayer.States}
                checked={TappableLayer.States === tappableLayer}
                onChange={() => setTappableLayer(TappableLayer.States)}
              ></input>
              Focused states
            </label>
          </span>
        </div>
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
                  key={Math.random() /* otherwise the checkbox value gets stuck */}
                  type="radio"
                  name="year"
                  value={animation}
                  checked={animation === hexflip}
                  onChange={() => setHexflip(animation)}
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
            Empty
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

              createSnapshot(name, graphicPropsAsUrlQuery);
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
                  replaceGraphicProps(urlQueryToGraphicProps(snapshots[name]));
                }}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
        <label>Static image downloads</label>
        <ul>
          {Object.keys(COMPONENTS_STYLES).map(key => (
            <li key={key}>
              <a
                href={`${fallbackAutomationBaseURL}${encodeURIComponent(COMPONENTS_STYLES[key].root)}`}
                download={`fallback-${key}-${graphicPropsAsAlternatingCase}.png`}
              >
                {key}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Editor;
