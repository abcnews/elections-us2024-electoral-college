import React, { createElement } from 'react';
import type { PanelDefinition } from '@abcnews/scrollyteller';
import { Allocation, PRESETS, StateId, STATES } from './constants';
import { getHasFocuses, getStateAllocations } from './utils';
import type { GraphicProps, PossiblyEncodedGraphicProps } from './components/Graphic';
import { render } from 'react-dom';
import TextState from './components/TextState/TextState';

function hasWords(words, text) {
  return words.some(word => text.includes(word));
}

function replaceNodeWithTextState(node, props) {
  const newParent = document.createElement('span');
  node.replaceWith(newParent);
  render(createElement(TextState, props), newParent);
}

export function applyColourToPanels(panels: PanelDefinition<PossiblyEncodedGraphicProps>[]) {
  panels.forEach(({ data, nodes }, i) => {
    const hasFocuses = getHasFocuses(data.focuses);

    (nodes as HTMLElement[]).forEach(node =>
      node.querySelectorAll('strong').forEach(stronk => {
        const textContent = String(stronk.textContent).trim();
        const magicWords = ['solid', 'likely', 'lean', 'leans', 'leaning'];

        if (magicWords.includes(textContent.toLowerCase())) {
          const redWords = ['trump', 'donald', 'republican'];
          const blueWords = ['harris', 'kamala', 'democrat'];
          const blockText = String(node.textContent).toLowerCase();
          const isRed = hasWords(redWords, blockText);
          const isBlue = hasWords(blueWords, blockText);

          let allocation = 'n';
          if (isBlue) {
            allocation = textContent === 'solid' ? 'd' : 's';
          }
          if (isRed) {
            allocation = textContent === 'solid' ? 'r' : 'e';
          }

          replaceNodeWithTextState(stronk, {
            name: textContent,
            allocation: allocation,
            showAbbr: false
          });

          return;
        }

        const state = STATES.find(({ name }) => name === stronk.textContent?.trim());
        const stateId = state ? StateId[state.id] : null;
        if (!stateId) {
          return;
        }

        const { allocations } = data as GraphicProps;
        let stateMainAllocation = allocations && getStateAllocations(stateId, allocations)[0];
        if (stateMainAllocation === 'n' && hasFocuses) {
          stateMainAllocation = Allocation.UnallocatedFocused;
        }

        replaceNodeWithTextState(stronk, {
          name: state?.name,
          id: stateId,
          allocation: stateMainAllocation,
          showAbbr: true
        });
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
