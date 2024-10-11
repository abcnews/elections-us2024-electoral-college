/** @ts-ignore import self-executes so abcnews-scrollyteller is available as an element */
import Scrollyteller from '@abcnews/svelte-scrollyteller/wc';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function tryUntil(condition, action, interval = 100) {
  const intervalId = setInterval(() => {
    const cr = condition();
    if (!cr) {
      return;
    }
    clearInterval(intervalId);
    action(cr);
  }, interval);
  return () => clearInterval(intervalId);
}

/** Portals children into the given DOM node */
function ScrollytellerPortalChild({ domNode, children }) {
  if (!domNode) {
    console.log('portal - no dom node, not rendering');
    return null;
  }
  console.log('portal - found child, rendering in', domNode);
  return createPortal(children, domNode);
}

/** Scrollyteller Web Component wrapper */
export default function ScrollytellerWebComponent({ children, panels, styles, onMarker }) {
  const scrollyEl: typeof Scrollyteller.element = useRef();
  const [scrollyPortal, setScrollyPortal] = useState();

  useEffect(() => {
    const { current } = scrollyEl;
    if (!current) {
      return;
    }
    current.panels = panels;
    current.layout = { align: 'left' };
    current.addEventListener('load', e => {
      setScrollyPortal(e.detail);
    });
    current.addEventListener('marker', e => {
      onMarker(e.detail);
    });
  }, [scrollyEl]);

  useEffect(() => {
    return tryUntil(
      () => scrollyEl.current.querySelector('.viz'),
      el => setScrollyPortal(el),
      100
    );
  }, []);

  return (
    <>
      <ScrollytellerPortalChild domNode={scrollyPortal}>{children}</ScrollytellerPortalChild>
      <abcnews-scrollyteller ref={scrollyEl} className={styles.scrollyteller} />
    </>
  );
}
