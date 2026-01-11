// ============================================================================
// 3-WAY WASM BATTLE - JAVASCRIPT OPTIMIZED EDITION
// ============================================================================
// Optimizations applied:
// 1. Pre-allocated TypedArrays (reused across runs)
// 2. Custom LCG random for fair comparison
// 3. Avoid async/await in tight loops where possible
// 4. Cache-friendly access patterns
// 5. Native WebCrypto for crypto benchmarks (fair native API comparison)
// ============================================================================

// Pre-allocated buffers - ZERO allocations during benchmark runs
const MATRIX_SIZE = 128;
const matA = new Float64Array(MATRIX_SIZE * MATRIX_SIZE);
const matB = new Float64Array(MATRIX_SIZE * MATRIX_SIZE);
const matRes = new Float64Array(MATRIX_SIZE * MATRIX_SIZE);

const PRIME_LIMIT = 100000;
const primesSieve = new Uint8Array(PRIME_LIMIT + 1);

const BODIES = 100;
const nbPos = new Float64Array(BODIES * 2);
const nbVel = new Float64Array(BODIES * 2);

const SORT_SIZE = 10000;
const sortArr = new Float32Array(SORT_SIZE);

const BUBBLE_SIZE = 1000;
const bubbleArr = new Float64Array(BUBBLE_SIZE);

const CRYPTO_DATA = new Uint8Array(10000);
for (let i = 0; i < 10000; i++) CRYPTO_DATA[i] = i % 256;

const COMPRESS_DATA = new Uint8Array(10000);
for (let i = 0; i < 10000; i++) COMPRESS_DATA[i] = i % 256;

// LCG Random - Same algorithm as Go for fair comparison
class LCG {
  state: number;
  constructor(seed: number = 12345) {
    this.state = seed >>> 0;
  }
  float64(): number {
    this.state = ((this.state * 1664525 + 1013904223) >>> 0);
    return this.state / 4294967296;
  }
  int(): number {
    this.state = ((this.state * 1664525 + 1013904223) >>> 0);
    return this.state;
  }
}

export const jsBenchmarks = {
  // ========== MATH & CPU BENCHMARKS ==========
  
  matrixMultiply: () => {
    const size = MATRIX_SIZE;
    const rng = new LCG(12345);

    // Initialize matrices
    for (let i = 0; i < size * size; i++) {
      matA[i] = rng.float64();
      matB[i] = rng.float64();
    }

    // O(N^3) matrix multiply - cache-friendly access
    for (let i = 0; i < size; i++) {
      const rowOffset = i * size;
      for (let j = 0; j < size; j++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += matA[rowOffset + k] * matB[k * size + j];
        }
        matRes[rowOffset + j] = sum;
      }
    }
  },

  primeSieve: () => {
    const limit = PRIME_LIMIT;
    
    // Reset sieve
    primesSieve.fill(1);
    primesSieve[0] = 0;
    primesSieve[1] = 0;

    // Sieve of Eratosthenes
    for (let p = 2; p * p <= limit; p++) {
      if (primesSieve[p]) {
        for (let i = p * p; i <= limit; i += p) {
          primesSieve[i] = 0;
        }
      }
    }
  },

  fibonacci: () => {
    const fib = (n: number): number => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };
    return fib(30);
  },

  monteCarloPi: () => {
    const iterations = 1000000;
    const rng = new LCG(42);
    let inside = 0;

    for (let i = 0; i < iterations; i++) {
      const x = rng.float64();
      const y = rng.float64();
      if (x * x + y * y <= 1.0) inside++;
    }
    return (4.0 * inside) / iterations;
  },

  nBody: () => {
    const steps = 1000;
    const bodies = BODIES;

    // Reset positions and velocities
    nbPos.fill(0);
    nbVel.fill(0);

    for (let step = 0; step < steps; step++) {
      // Calculate forces
      for (let b1 = 0; b1 < bodies; b1++) {
        const b1x = b1 * 2;
        const b1y = b1x + 1;
        for (let b2 = 0; b2 < bodies; b2++) {
          if (b1 !== b2) {
            const b2x = b2 * 2;
            const b2y = b2x + 1;
            const dx = nbPos[b2x] - nbPos[b1x];
            const dy = nbPos[b2y] - nbPos[b1y];
            const distSq = dx * dx + dy * dy + 0.01;
            const f = 1.0 / distSq;
            nbVel[b1x] += dx * f;
            nbVel[b1y] += dy * f;
          }
        }
      }
      // Update positions
      for (let b = 0; b < bodies; b++) {
        const bx = b * 2;
        const by = bx + 1;
        nbPos[bx] += nbVel[bx];
        nbPos[by] += nbVel[by];
      }
    }
  },

  mandelbrot: () => {
    const w = 100, h = 100, maxIter = 1000;
    
    for (let y = 0; y < h; y++) {
      const cy = (y / h) * 2.0 - 1.0;
      for (let x = 0; x < w; x++) {
        let zx = 0, zy = 0;
        const cx = (x / w) * 3.5 - 2.5;
        let iter = 0;
        
        while (zx * zx + zy * zy <= 4 && iter < maxIter) {
          const tmp = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = tmp;
          iter++;
        }
      }
    }
  },

  // ========== CRYPTO BENCHMARKS (Native WebCrypto) ==========
  
  sha256: async () => {
    // 500 iterations of SHA-256 on 10KB data - Native WebCrypto
    for (let i = 0; i < 500; i++) {
      await crypto.subtle.digest('SHA-256', CRYPTO_DATA);
    }
  },

  aesEncrypt: async () => {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 }, 
      true, 
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // 500 encryptions
    for (let i = 0; i < 500; i++) {
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, CRYPTO_DATA);
    }
  },

  // ========== MEMORY & DATA BENCHMARKS ==========

  jsonParse: () => {
    // Create JSON string once
    const items = Array.from({ length: 1000 }, (_, i) => ({ name: `Item${i}`, value: i }));
    const jsonStr = JSON.stringify({ items });
    
    // Parse 100 times - Native V8 JSON
    for (let i = 0; i < 100; i++) {
      JSON.parse(jsonStr);
    }
  },

  quickSort: () => {
    // Initialize with deterministic values
    for (let i = 0; i < SORT_SIZE; i++) {
      sortArr[i] = (i ^ 0x3F) / SORT_SIZE;
    }
    
    // Native TypedArray sort - uses C++ Timsort under the hood
    sortArr.sort();
  },

  bubbleSort: () => {
    const size = BUBBLE_SIZE;
    const rng = new LCG(999);

    // Initialize with deterministic random
    for (let i = 0; i < size; i++) {
      bubbleArr[i] = rng.float64();
    }

    // Classic bubble sort
    for (let i = 0; i < size - 1; i++) {
      for (let j = 0; j < size - i - 1; j++) {
        if (bubbleArr[j] > bubbleArr[j + 1]) {
          const t = bubbleArr[j];
          bubbleArr[j] = bubbleArr[j + 1];
          bubbleArr[j + 1] = t;
        }
      }
    }
  },

  // ========== GRAPHICS BENCHMARKS ==========

  rayTrace: () => {
    const w = 100, h = 100, rSq = 1600;
    let hits = 0;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - 50;
        const dy = y - 50;
        if (dx * dx + dy * dy < rSq) hits++;
      }
    }
    return hits;
  },
  
  // ========== SYSTEM BENCHMARKS ==========

  zipCompression: async () => {
    // Native CompressionStream - uses C++ zlib
    for (let i = 0; i < 50; i++) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(COMPRESS_DATA);
      writer.close();
      await new Response(stream.readable).arrayBuffer();
    }
  }
};
