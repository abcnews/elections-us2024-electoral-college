import { whenDOMReady } from '@abcnews/env-utils';
import { selectMounts } from '@abcnews/mount-utils';
import React from 'react';
import { render } from 'react-dom';
import Builder from './components/Builder';

whenDOMReady.then(() => render(<Builder />, selectMounts('eceditor')[0]));
