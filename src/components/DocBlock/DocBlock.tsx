import GoogleDocScrollyteller from '@abcnews/google-doc-scrollyteller';
import type { PanelDefinition } from '@abcnews/scrollyteller';
import React, { useState } from 'react';
import { applyColourToPanels } from '../../panels';
import { decodeAllocations, decodeFocuses, graphicPropsToAlternatingCase } from '../../utils';
import Block from '../Block';
import type { GraphicProps, PossiblyEncodedGraphicProps } from '../Graphic';
import './minimal-odyssey';
import fallbacks from './fallbacks';
import NewVersionCheck from '../NewVersionCheck/NewVersionCheck';

const urlQueryToGraphicProps = string => string;
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
    const graphicProps = urlQueryToGraphicProps('?' + urlQuery);
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
  });

  applyColourToPanels(scrollytellerDefinition.panels);

  return scrollytellerDefinition;
};

const renderPreview = ({ panels }) => <Block panels={panels as PanelDefinition<GraphicProps>[]} />;

function renderFallbackImagesButton({ panels }) {
  return (
    <button
      onClick={event => {
        const buttonEl = event.target as HTMLButtonElement;

        function setIsLoading(isLoading) {
          buttonEl.innerHTML = isLoading ? 'Thinking…' : 'Fallback Images';
          buttonEl.disabled = isLoading;
        }

        if (panels) {
          setIsLoading(true);
          fallbacks(buttonEl, panels as PanelDefinition<GraphicProps>[])
            .then(() => setIsLoading(false))
            .catch(() => {
              setIsLoading(false);
            });
        }
      }}
    >
      Fallback Images
    </button>
  );
}

const DocBlock: React.FC = () => (
  <>
    <NewVersionCheck />
    <GoogleDocScrollyteller<PossiblyEncodedGraphicProps>
      loadScrollytellerArgs={LOAD_SCROLLYTELLER_ARGS}
      {...{
        preprocessCoreEl,
        postprocessScrollytellerDefinition,
        renderPreview,
        renderFallbackImagesButton
      }}
    />
  </>
);

export default DocBlock;
