import acto from '@abcnews/alternating-case-to-object';
import { getMountValue, isMount, selectMounts } from '@abcnews/mount-utils';
// @ts-ignore
import { loadScrollyteller } from '@abcnews/svelte-scrollyteller/wc';
import React from 'react';
import { render } from 'react-dom';
import { applyColourToPanels } from './panels';
import { alternatingCaseToGraphicProps, decodeAllocations, decodeFocuses } from './utils';
import Blanks from './components/Blanks';
import Block from './components/Block';
import Graphic from './components/Graphic';
import Illustration from './components/Illustration';
import { whenOdysseyLoaded } from './utils/getOdyssey';
import './global.scss';

// App is crashing, maybe on the animations. Let's turn them off and see.
(() => {
  const isApp = location.host.includes('newsapp.');
  const isAndroid = navigator.userAgent.includes('Android');
  if (isApp && isAndroid) {
    const style = document.createElement('style');
    style.setAttribute('id', 'us24-abc-app-hack');
    style.setAttribute('type', 'text/css');
    style.innerHTML = `
[data-us24-root="true"] *{
transition:none !important;
}`;
    document.head.appendChild(style);

    let count = 0;
    let timer;

    const handler = () => {
      count++;
      if (timer) {
        clearTimeout(timer);
      }
      if (count === 10) {
        document.head.removeChild(style);
        document.body.removeEventListener('click', handler);
        return;
      }

      timer = setTimeout(() => {
        count = 0;
      }, 1000);
    };
    document.body.addEventListener('click', handler);
  }
})();

const whenScrollytellersLoaded = new Promise((resolve, reject) =>
  whenOdysseyLoaded.then(odyssey => {
    const scrollytellerMounts = selectMounts('scrollytellerNAME', { markAsUsed: false });

    const names = scrollytellerMounts
      .map(mountEl => (getMountValue(mountEl).match(/NAME([a-z]+)/) || [])[1])
      .filter(name => typeof name === 'string');

    // Feature flag: highlight currently active panel
    if (window.location.hash.includes('inactive')) {
      //@ts-ignore
      scrollytellerMounts.forEach(mount => mount.style.setProperty('--color-panel-opacity-inactive', 0.6));
    }

    //@ts-ignore
    scrollytellerMounts.forEach(mount => mount.style.setProperty('--color-panel-margin', '40vh'));

    const scrollytellerDefinitions: any[] = [];

    for (const name of names) {
      let scrollytellerDefinition: any;

      try {
        scrollytellerDefinition = loadScrollyteller(name, 'u-full');

        // Decode encoded props
        scrollytellerDefinition.panels.forEach(({ data }) => {
          data.allocations = decodeAllocations((data.allocations as string) || '');
          data.focuses = decodeFocuses((data.focuses as string) || '');
        });

        // Upgrade scrollyteller' content to show coloured state names
        applyColourToPanels(scrollytellerDefinition.panels);
      } catch (err) {
        return reject(err);
      }

      // Keep the DOM tidy.
      if (scrollytellerDefinition && scrollytellerDefinition.mountNode) {
        while (isMount(scrollytellerDefinition.mountNode.nextElementSibling)) {
          odyssey.utils.dom.detach(scrollytellerDefinition.mountNode.nextElementSibling);
        }
      }

      scrollytellerDefinitions.push(scrollytellerDefinition);
    }

    // Return scrollyteller definitions
    resolve(scrollytellerDefinitions);
  })
);

whenScrollytellersLoaded.then(scrollytellerDefinitions => {
  (scrollytellerDefinitions as any[]).forEach(scrollytellerDefinition =>
    render(<Block panels={scrollytellerDefinition.panels} />, scrollytellerDefinition.mountNode)
  );
});

whenScrollytellersLoaded.then(() => {
  document.querySelectorAll('[data-key="split"]').forEach(split => {
    const newParent = document.createElement('div');

    newParent.classList.add('us24-split');
    newParent.classList.add('u-full');
    if (!split.parentNode) {
      return;
    }
    split.parentNode.replaceChild(newParent, split);
    newParent.appendChild(split);
  });
});

whenOdysseyLoaded.then(() => {
  const illustrationMounts = selectMounts('ecillustration');

  illustrationMounts.forEach(mount => {
    const parentEl = mount.parentElement;

    if (!parentEl) {
      return;
    }

    const { name } = acto(getMountValue(mount));

    const titleEl = parentEl.querySelector('h1');

    if (titleEl && titleEl.parentElement === parentEl) {
      mount.removeAttribute('class');
      parentEl.insertBefore(mount, titleEl);
    }

    render(<Illustration name={name} />, mount);
  });

  const standaloneGraphicMounts = selectMounts('ecgraphic');

  standaloneGraphicMounts.forEach(mount => {
    const graphicProps = alternatingCaseToGraphicProps(getMountValue(mount));

    mount.classList.add('u-pull');
    render(<Graphic {...graphicProps} />, mount);
  });

  const blanksMounts = selectMounts('ecblanks');

  blanksMounts.forEach(mount => {
    const mountValue = getMountValue(mount);
    const blanksProps = { initialGraphicProps: alternatingCaseToGraphicProps(mountValue) };

    mount.classList.add('u-full');
    render(<Blanks {...blanksProps} />, mount);
  });
});
