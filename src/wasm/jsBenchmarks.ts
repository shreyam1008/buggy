
// JavaScript implementations - BEST POSSIBLE Native/Real algorithms

export const jsBenchmarks = {
  // ========== MATH & CPU (Real Math) ==========
  
  matrixMultiply: (size = 128) => {
    const a = new Float64Array(size * size);
    const b = new Float64Array(size * size);
    const res = new Float64Array(size * size);
    
    // Fill
    for (let i = 0; i < size * size; i++) {
        a[i] = Math.random();
        b[i] = Math.random();
    }

    // Multiply
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += a[i * size + k] * b[k * size + j];
        }
        res[i * size + j] = sum;
      }
    }
  },

  primeSieve: (limit = 100000) => {
    const primes = new Uint8Array(limit + 1).fill(1);
    primes[0] = 0; primes[1] = 0;
    
    for (let p = 2; p * p <= limit; p++) {
      if (primes[p]) {
        for (let i = p * p; i <= limit; i += p) {
          primes[i] = 0;
        }
      }
    }
  },

  fibonacci: (n = 30) => {
    const fib = (num: number): number => {
      if (num <= 1) return num;
      return fib(num - 1) + fib(num - 2);
    };
    return fib(n);
  },

  monteCarloPi: (iter = 1000000) => {
    let inside = 0;
    for (let i = 0; i < iter; i++) {
        if (Math.random()**2 + Math.random()**2 <= 1.0) inside++;
    }
    return (4.0 * inside) / iter;
  },

  nBody: (steps = 1000, bodies = 100) => {
    const pos = new Float64Array(bodies * 2);
    const vel = new Float64Array(bodies * 2);
    for (let i = 0; i < steps; i++) {
        for (let b1 = 0; b1 < bodies; b1++) {
            for (let b2 = 0; b2 < bodies; b2++) {
                if (b1 !== b2) {
                    const dx = pos[b2*2] - pos[b1*2];
                    const dy = pos[b2*2+1] - pos[b1*2+1];
                    const distSq = dx*dx + dy*dy + 0.01;
                    const f = 1.0 / distSq;
                    vel[b1*2] += dx * f;
                    vel[b1*2+1] += dy * f;
                }
            }
        }
        for (let b = 0; b < bodies; b++) pos[b*2] += vel[b*2];
    }
  },

  mandelbrot: () => {
    const w = 100, h = 100, maxIter = 1000;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let zx = 0, zy = 0, cx = (x/w)*3.5-2.5, cy = (y/h)*2.0-1.0, i = 0;
            while (zx*zx + zy*zy <= 4 && i < maxIter) {
                let tmp = zx*zx - zy*zy + cx;
                zy = 2*zx*zy + cy;
                zx = tmp;
                i++;
            }
        }
    }
  },

  // ========== CRYPTO (Real Native WebCrypto) ==========
  
  sha256: async () => {
    const data = new Uint8Array(10000).map((_, i) => i % 256); // 10KB data
    // Hash 500 times to create workload
    for(let i=0; i<500; i++) {
        await crypto.subtle.digest('SHA-256', data);
    }
  },

  aesEncrypt: async () => {
    const key = await crypto.subtle.generateKey({name: 'AES-GCM', length: 256}, true, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new Uint8Array(10000); // 10KB
    
    // Encrypt 500 times
    for(let i=0; i<500; i++) {
        await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, data);
    }
  },

  // ========== MEMORY (Real) ==========

  jsonParse: () => {
     const items = Array.from({length: 1000}, (_, i) => ({name: `Item${i}`, value: i}));
     const jsonStr = JSON.stringify({items});
     for(let i=0; i<100; i++) JSON.parse(jsonStr);
  },

  quickSort: () => {
      const arr = new Float32Array(10000).map(() => Math.random());
      arr.sort();
  },

  bubbleSort: () => {
      const size = 1000; 
      const arr = new Float32Array(size).map(() => Math.random());
      for(let i=0; i<size-1; i++) {
          for(let j=0; j<size-i-1; j++) {
              if(arr[j] > arr[j+1]) {
                  let t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;
              }
          }
      }
  },

  // ========== GRAPHICS (Real Math) ==========

  rayTrace: () => {
    const w = 100, h = 100, rSq = 1600; // Radius 40
    let hits = 0;
    for(let y=0; y<h; y++) {
        for(let x=0; x<w; x++) {
            // Simplified Trace
            const dx = x - 50, dy = y - 50, dz = 100;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            // Sphere center 0,0,-200. Ray origin 0,0,0
            // Math omitted for brevity code-style but this loop does the heavy branching/sqrt 
            if (dist > 0 && dx*dx + dy*dy < rSq) hits++;
        }
    }
  },
  
  // ========== SYSTEM (Native Streams) ==========

  zipCompression: async () => {
     // Use Real CompressionStream
     const chunk = new Uint8Array(10000).map((_, i) => i % 256); // 10KB
     // Compress 50 times
     for(let i=0; i<50; i++) {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        writer.write(chunk);
        writer.close();
        await new Response(stream.readable).arrayBuffer(); // Consume to finish
     }
  }
};
