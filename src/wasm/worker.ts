// Web Worker for Go WASM execution
// This allows true parallel processing across CPU cores

declare function importScripts(...urls: string[]): void;

// Import the Go WASM bridge
importScripts('/wasm/wasm_exec.js');

declare const Go: any;

const go = new Go();
let initialized = false;

async function initWasm() {
    try {
        const response = await fetch('/wasm/main.wasm');
        const buffer = await response.arrayBuffer();
        const result = await WebAssembly.instantiate(buffer, go.importObject);
        
        // Run the instance - it will block on main() channel receive, 
        // but that's what keeps the Go runtime alive for calls.
        go.run(result.instance);
        initialized = true;
        
        self.postMessage({ type: 'READY' });
    } catch (err: any) {
        self.postMessage({ type: 'ERROR', error: err.message });
    }
}

initWasm();

self.onmessage = async (e) => {
    const { type, fnName, args, id } = e.data;
    
    if (type === 'RUN_BENCHMARK') {
        if (!initialized) {
            self.postMessage({ type: 'ERROR', error: 'WASM not initialized', id });
            return;
        }
        
        const fn = (self as any)[fnName];
        if (typeof fn === 'function') {
            try {
                const t0 = performance.now();
                fn(...(args || []));
                const t1 = performance.now();
                
                self.postMessage({ 
                    type: 'RESULT', 
                    time: t1 - t0, 
                    fnName,
                    id 
                });
            } catch (err: any) {
                self.postMessage({ type: 'ERROR', error: err.message, id });
            }
        } else {
            self.postMessage({ type: 'ERROR', error: `Function ${fnName} not found on WASM instance`, id });
        }
    }
};
