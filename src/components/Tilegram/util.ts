/*
 * Microsoft C Run-time-Library-compatible Random Number Generator
 * Copyright by Shlomi Fish, Ash Kyd 2019.
 * Released under the MIT license
 * https://opensource.org/licenses/MIT
 * */
export default class MSRand {
  seed = 0;
  constructor(seed) {
    this.seed = seed || 0;
  }
  rand() {
    this.seed = (this.seed * 214013 + 2531011) & 0x7fffffff;
    return (this.seed >> 16) & 0x7fff;
  }
  randMax(max) {
    return this.rand() % max;
  }
}

export function getStyleDelays(x, y, hexani) {
  if (!hexani || hexani === 'none') {
    return {};
  }

  if (hexani === 'twinkle') {
    const delay = (x % 4) * 50;
    // const duration = (x % 4) * 500; //new MSRand(y).randMax(400) + 1000;
    return {
      transitionDelay: delay + 'ms',
      animationDelay: delay + 'ms'
      // transitionDuration: duration + 'ms',
      // animationDuration: duration + 'ms'
    };
  }

  return {
    transitionDelay: x + y + 'ms',
    animationDelay: x + y + 'ms'
  };
}
