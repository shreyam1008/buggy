import { useState, useEffect } from 'react';

// Type definition for the Go global object injected by wasm_exec.js
declare global {
  interface Window {
    Go: any;
    [key: string]: any;
  }
}

export function useWasm() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        if (window.Go) {
             // Already loaded? Maybe just check if the functions exist
             if (window['go_matrixMultiply']) {
                 setIsLoaded(true);
                 return;
             }
        }

        // 1. Load wasm_exec.js if not present
        if (!window.Go) {
            const script = document.createElement('script');
            script.src = '/wasm/wasm_exec.js';
            script.async = true;
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }

        // 2. Initialize Go
        const go = new window.Go();
        
        // 3. Fetch and Instantiate
        const result = await WebAssembly.instantiateStreaming(
            fetch('/wasm/main.wasm'),
            go.importObject
        );
        
        // 4. Run the instance
        // go.run(result.instance) is strict and blocks, but for typical wasm compiled with tinygo or newer go, 
        // we often need to run it. However, standard Go `main` blocks forever on channel receive.
        // We run it without awaiting because it blocks the thread if the Go main doesn't return
        go.run(result.instance);
        
        setIsLoaded(true);
      } catch (err: any) {
        console.error("WASM Load Error:", err);
        setError(err.message);
      }
    };

    loadWasm();
  }, []);

  return { isLoaded, error };
}
