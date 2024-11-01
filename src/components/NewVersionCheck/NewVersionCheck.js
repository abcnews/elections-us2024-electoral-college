import React, { useEffect, useState } from 'react';
import styles from './newVersionCheck.scss';

async function fetchAndRetryWithCache(version) {
  const baseUrl = 'https://www.abc.net.au/res/sites/news-projects/elections-us2024-electoral-college/';
  const firstRes = await fetch(`${baseUrl}${version}/?v=${Math.round(Date.now() / 1000 / 60)}`, {
    cache: 'reload'
  }).catch(e => false);
  if (firstRes && firstRes.status === 200) return version;
  return false;
}

async function newVersionCheck(thisVersion) {
  const [major, minor, patch] = thisVersion.split('.');
  const nextVersions = [
    [1 + Number(major), minor, patch],
    [major, 1 + Number(minor), patch],
    [major, minor, 1 + Number(patch)]
  ].map(version => version.join('.'));
  console.log('checking versions', nextVersions.join());
  const newVersions = await Promise.all(nextVersions.map(fetchAndRetryWithCache));

  const newVersion = newVersions.find(Boolean);
  console.log('got new version', newVersion);
  if (newVersion) {
    return newVersionCheck(newVersion);
  } else {
  }

  return { version: thisVersion, url: `${baseUrl}${thisVersion}/editor${window.location.hash}` };
}

async function startVersionCheck() {
  const thisVersion = window.location.pathname.match(/\/elections-us2024-electoral-college\/(\d+\.\d+\.\d+)/)?.[1];
  if (!thisVersion) {
    return console.log('this version is missing');
  }
  const newVersion = await newVersionCheck(thisVersion);
  if (newVersion.version === thisVersion) {
    return null;
  }
  return newVersion;
}

export default function NewVersionCheck() {
  const [newVersion, setNewVersion] = useState(null);
  useEffect(() => {
    startVersionCheck().then(setNewVersion);
  }, []);

  return (
    !!newVersion?.version && (
      <a href={newVersion?.url} className={styles.root}>
        <strong>There is a new version available.</strong>
        <span>
          Click for version <em>{newVersion?.version}</em>
        </span>
      </a>
    )
  );
}
