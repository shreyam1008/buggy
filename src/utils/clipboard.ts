// ============================================================================
// CLIPBOARD UTILITIES
// ============================================================================

/**
 * Copy text to clipboard and provide visual feedback via callback
 * @param text - Text to copy
 * @param onSuccess - Callback when copy succeeds (optional)
 * @param feedbackDuration - Duration in ms to maintain feedback state (default: 2000)
 */
export async function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  feedbackDuration: number = 2000
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    if (onSuccess) {
      onSuccess();
      // Reset feedback after duration
      setTimeout(() => {
        // Caller should handle state reset
      }, feedbackDuration);
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}

/**
 * Copy text to clipboard with automatic state management
 * Returns a function to reset the state
 * @param text - Text to copy
 * @param setState - State setter function for copied state
 * @param feedbackDuration - Duration in ms to show feedback (default: 2000)
 */
export async function copyToClipboardWithState(
  text: string,
  setState: (value: boolean) => void,
  feedbackDuration: number = 2000
): Promise<void> {
  await navigator.clipboard.writeText(text);
  setState(true);
  setTimeout(() => setState(false), feedbackDuration);
}
