/**
 * Mobile Haptic Vibration Utilities
 * Provides subtle tactile feedback for mobile touch controls.
 */
export function triggerHaptic(type: 'tap' | 'hop' | 'carrot' | 'goldCarrot' | 'gameover' | 'fanfare') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      switch (type) {
        case 'tap':
          navigator.vibrate(8);
          break;
        case 'hop':
          navigator.vibrate(12);
          break;
        case 'carrot':
          navigator.vibrate(22);
          break;
        case 'goldCarrot':
          navigator.vibrate([15, 30, 25]);
          break;
        case 'gameover':
          navigator.vibrate([35, 40, 45]);
          break;
        case 'fanfare':
          navigator.vibrate([15, 30, 15, 30, 35]);
          break;
      }
    }
  } catch {
    // Ignore unsupported browser errors
  }
}
