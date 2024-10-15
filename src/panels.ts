import React, { createElement } from 'react';
import type { PanelDefinition } from '@abcnews/scrollyteller';
import { Allocation, PRESETS, StateId, STATES } from './constants';
import { getHasFocuses, getStateAllocations } from './utils';
import blockStyles from './components/Block/styles.scss';
import type { GraphicProps, PossiblyEncodedGraphicProps } from './components/Graphic';
import { render } from 'react-dom';
import TextState from './components/TextState/TextState';

const SORTED_STATES = STATES.sort((a, b) => b.name.length - a.name.length);

export function applyColourToPanels(panels: PanelDefinition<PossiblyEncodedGraphicProps>[]) {
  const stateIntroductionTracker: { [key: string]: boolean } = {};

  panels.forEach(({ data, nodes }, i) => {
    const stateIntroductionTrackerPanel: { [key: string]: boolean } = {};
    const hasFocuses = getHasFocuses(data.focuses);
    const textNodes = nodes.reduce<Node[]>((memo, node) => memo.concat(textNodesUnder(node)), []);

    textNodes.forEach(node => {
      let text = node.textContent || '';

      SORTED_STATES.forEach(({ name }) => {
        const index = text.indexOf(name);
        if (index > -1 && text[index - 1] !== '|' && text[index + name.length] !== '|') {
          text = text.replace(name, `|||${name}|||`);
        }
      });

      if (text === node.textContent) {
        return;
      }

      const parentEl = node.parentElement;

      if (!parentEl) {
        return;
      }

      text.split('|||').forEach((part, index) => {
        const partTextNode = document.createTextNode(part);

        if (!(index % 2)) {
          return parentEl.insertBefore(partTextNode, node);
        }

        const state = STATES.find(({ name }) => name === part);
        const stateId = state ? StateId[state.id] : null;

        // If this isn't a state, or we've seen this state before
        if (!stateId || stateIntroductionTrackerPanel[stateId]) {
          return parentEl.insertBefore(partTextNode, node);
        }
        stateIntroductionTrackerPanel[stateId] = true;

        const partWrapperNode = document.createElement('span');
        const { allocations, relative } = data as GraphicProps;
        let stateMainAllocation = allocations && getStateAllocations(stateId, allocations)[0];
        if (stateMainAllocation === 'n' && hasFocuses) {
          stateMainAllocation = Allocation.UnallocatedFocused;
        }
        const relativeAllocations = relative && PRESETS[relative]?.allocations;
        const stateRelativeMainAllocation = relativeAllocations && getStateAllocations(stateId, relativeAllocations)[0];

        parentEl.insertBefore(partWrapperNode, node);

        const isFirstEncounter = !stateIntroductionTracker[stateId];
        stateIntroductionTracker[stateId] = true;
        render(
          createElement(TextState, {
            name: state.name,
            id: stateId,
            allocation: stateMainAllocation,
            showAbbr: isFirstEncounter
          }),
          partWrapperNode
        );

        // if (stateMainAllocation) {
        //   partWrapperNode.setAttribute('data-main-allocation', stateMainAllocation);
        // }

        // if (stateRelativeMainAllocation) {
        //   partWrapperNode.setAttribute('data-relative-main-allocation', stateRelativeMainAllocation);
        // }

        // partWrapperNode.setAttribute('data-state', stateId);
        // partWrapperNode.className = blockStyles.state;
        // partWrapperNode.appendChild(partTextNode);
        // parentEl.insertBefore(partWrapperNode, node);
      });

      parentEl.removeChild(node);
    });
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
