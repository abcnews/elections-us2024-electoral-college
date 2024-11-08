import { whenDOMReady } from '@abcnews/env-utils';
import { selectMounts } from '@abcnews/mount-utils';
import React from 'react';
import { render } from 'react-dom';
import DocBlock from './components/DocBlock/DocBlock';
import './global.scss';

whenDOMReady.then(() => render(<DocBlock />, selectMounts('ecdb')[0]));
