import React, { createElement } from 'react';
import type { PanelDefinition } from '@abcnews/scrollyteller';
import { Allocation, PRESETS, StateId, STATES } from './constants';
import { getHasFocuses, getStateAllocations } from './utils';
import type { GraphicProps, PossiblyEncodedGraphicProps } from './components/Graphic';
import { render } from 'react-dom';
import TextState from './components/TextState/TextState';

export function applyColourToPanels(panels: PanelDefinition<PossiblyEncodedGraphicProps>[]) {
  panels.forEach(({ data, nodes }, i) => {
    const hasFocuses = getHasFocuses(data.focuses);

    (nodes as HTMLElement[]).forEach(node =>
      node.querySelectorAll('strong').forEach(stronk => {
        const state = STATES.find(({ name }) => name === stronk.textContent?.trim());
        const stateId = state ? StateId[state.id] : null;
        if (!stateId) {
          return;
        }
        const newParent = document.createElement('span');
        stronk.replaceWith(newParent);

        const { allocations } = data as GraphicProps;
        let stateMainAllocation = allocations && getStateAllocations(stateId, allocations)[0];
        if (stateMainAllocation === 'n' && hasFocuses) {
          stateMainAllocation = Allocation.UnallocatedFocused;
        }

        render(
          createElement(TextState, {
            name: state?.name,
            id: stateId,
            allocation: stateMainAllocation,
            showAbbr: true
          }),
          newParent
        );
      })
    );
  });
}

function textNodesUnder(node: Node) {
  const textNodes: Node[] = [];
  const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  let textNode: Node | null;

  while ((textNode = walk.nextNode())) {
    textNodes.push(textNode);
  }

  return textNodes;
}
