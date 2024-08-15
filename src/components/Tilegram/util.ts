export function getStyleDelays(x, y) {
  return {
    transitionDelay: x + y + 'ms',
    animationDelay: x + y + 'ms'
  };
}
