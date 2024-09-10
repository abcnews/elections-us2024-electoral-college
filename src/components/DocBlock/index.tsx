import acto from '@abcnews/alternating-case-to-object';
import GoogleDocScrollyteller from '@abcnews/google-doc-scrollyteller';
import { isMount } from '@abcnews/mount-utils';
import type { PanelDefinition } from '@abcnews/scrollyteller';
import React from 'react';
import { render } from 'react-dom';
import { applyColourToPanels } from '../../panels';
import {
  decodeAllocations,
  decodeFocuses,
  graphicPropsToAlternatingCase,
  legactyUrlQueryToGraphicProps
} from '../../utils';
import Block from '../Block';
import type { GraphicProps, PossiblyEncodedGraphicProps } from '../Graphic';
import Live from '../Live';
import './minimal-odyssey';

const LOAD_SCROLLYTELLER_ARGS = { name: 'ecblock', markerName: 'mark' };
const MARKER_WITH_PROPS_PATTERN = /#(scrollyteller|mark)/;

const preprocessCoreEl = el => {
  const text = String(el.textContent).trim();
  const linkEl: HTMLAnchorElement | null = el.querySelector('a[href]');
  const urlQuery = linkEl && (new URL(linkEl.href).searchParams.get('q') || '').split('?')[1];
  const markerMatch = text.match(MARKER_WITH_PROPS_PATTERN);

  if (urlQuery && markerMatch) {
    const markerPrefix =
      markerMatch[1] === 'scrollyteller'
        ? `scrollytellerNAME${LOAD_SCROLLYTELLER_ARGS.name}`
        : LOAD_SCROLLYTELLER_ARGS.markerName;
    const graphicProps = legactyUrlQueryToGraphicProps('?' + urlQuery);
    const pEl = document.createElement('p');

    pEl.textContent = `#${markerPrefix}${graphicPropsToAlternatingCase(graphicProps)}`;

    return pEl;
  }

  return el;
};

const postprocessScrollytellerDefinition = scrollytellerDefinition => {
  scrollytellerDefinition.panels.forEach(({ data, nodes }) => {
    data.allocations = decodeAllocations((data.allocations as string) || '');
    data.focuses = decodeFocuses((data.focuses as string) || '');

    nodes.forEach(el => {
      if (isMount(el, 'eclive')) {
        const { state, test, hide } = acto(el.id || '');

        if (typeof hide !== 'boolean' || !hide) {
          render(<Live stateCode={String(state).toUpperCase()} test={Number(test)} />, el);
        }
      }
    });
  });

  applyColourToPanels(scrollytellerDefinition.panels);

  return scrollytellerDefinition;
};

const renderPreview = ({ panels }) => <Block panels={panels as PanelDefinition<GraphicProps>[]} />;

export default DocBlock;
