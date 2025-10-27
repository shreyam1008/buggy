// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Create a delay/sleep promise
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Add timeout to any promise
 * @param promise - Promise to add timeout to
 * @param timeoutMs - Timeout duration in milliseconds
 * @param errorMessage - Custom error message for timeout
 * @returns Promise that races between the original and timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Request timeout. Please try again.'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
