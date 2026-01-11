package main

import (
	"bytes"
	"compress/gzip"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"sort"
	"syscall/js"
)

// BEAST MODE BENCHMARKS - WASM EDITION (REAL ALGORITHMS)

func main() {
	c := make(chan struct{}, 0)
	fmt.Println("WASM Go Initialized")
	registerCallbacks()
	<-c
}

func registerCallbacks() {
	js.Global().Set("go_matrixMultiply", js.FuncOf(matrixMultiply))
	js.Global().Set("go_primeSieve", js.FuncOf(primeSieve))
	js.Global().Set("go_fibonacci", js.FuncOf(fibonacci))
	js.Global().Set("go_monteCarloPi", js.FuncOf(monteCarloPi))
	js.Global().Set("go_nBody", js.FuncOf(nBodySim))
	js.Global().Set("go_mandelbrot", js.FuncOf(mandelbrot))
	js.Global().Set("go_sha256", js.FuncOf(sha256Hash))
	js.Global().Set("go_aesEncrypt", js.FuncOf(aesEncrypt))
	js.Global().Set("go_jsonParse", js.FuncOf(jsonParse))
	js.Global().Set("go_quickSort", js.FuncOf(quickSort))
	js.Global().Set("go_bubbleSort", js.FuncOf(bubbleSort))
	js.Global().Set("go_rayTrace", js.FuncOf(rayTrace))
	js.Global().Set("go_compression", js.FuncOf(zipCompression))
}

// --- Implementations ---

func matrixMultiply(this js.Value, args []js.Value) interface{} {
	size := 128
	a := make([]float64, size*size)
	b := make([]float64, size*size)
	res := make([]float64, size*size)
	
	// O(N^3) standard multiply
	for i := 0; i < size; i++ {
		for j := 0; j < size; j++ {
			sum := 0.0
			for k := 0; k < size; k++ {
				sum += a[i*size+k] * b[k*size+j]
			}
			res[i*size+j] = sum
		}
	}
	return nil
}

func primeSieve(this js.Value, args []js.Value) interface{} {
	limit := 100000
	primes := make([]bool, limit+1)
	for i := 2; i <= limit; i++ { primes[i] = true }
	for p := 2; p*p <= limit; p++ {
		if primes[p] {
			for i := p * p; i <= limit; i += p {
				primes[i] = false
			}
		}
	}
	return nil
}

func fibonacci(this js.Value, args []js.Value) interface{} {
	n := 30
	return fib(n)
}
func fib(n int) int {
	if n <= 1 { return n }
	return fib(n-1) + fib(n-2)
}

func monteCarloPi(this js.Value, args []js.Value) interface{} {
    // We can't easily rely on math/rand here for speed comparison if generators differ 
    // but we use pseudo-random for CPU burn
	iter := 1000000
	inside := 0
	// Simple LCG for speed & fairness comparable to JS Math.random
    state := uint32(1)
    randFloat := func() float64 {
        state = state * 1664525 + 1013904223
        return float64(state) / 4294967296.0
    }

	for i := 0; i < iter; i++ {
		x := randFloat()
		y := randFloat()
		if x*x+y*y <= 1.0 { inside++ }
	}
	return nil
}

func nBodySim(this js.Value, args []js.Value) interface{} {
	steps := 1000
	bodies := 100
	pos := make([]float64, bodies*2)
	vel := make([]float64, bodies*2)
	for i := 0; i < steps; i++ {
		for b1 := 0; b1 < bodies; b1++ {
			for b2 := 0; b2 < bodies; b2++ {
				if b1 != b2 {
					dx := pos[b2*2] - pos[b1*2]
					dy := pos[b2*2+1] - pos[b1*2+1]
					distSq := dx*dx + dy*dy + 0.01
					f := 1.0 / distSq
					vel[b1*2] += dx * f
					vel[b1*2+1] += dy * f
				}
			}
		}
		for b := 0; b < bodies; b++ {
			pos[b*2] += vel[b*2]
			pos[b*2+1] += vel[b*2+1]
		}
	}
	return nil
}

func mandelbrot(this js.Value, args []js.Value) interface{} {
	w, h, maxIter := 100, 100, 1000
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			zx, zy := 0.0, 0.0
			cx := float64(x)/float64(w)*3.5 - 2.5
			cy := float64(y)/float64(h)*2.0 - 1.0
			iter := 0
			for zx*zx+zy*zy <= 4 && iter < maxIter {
				tmp := zx*zx - zy*zy + cx
				zy = 2*zx*zy + cy
				zx = tmp
				iter++
			}
		}
	}
	return nil
}

func sha256Hash(this js.Value, args []js.Value) interface{} {
	// Matches JS 500 iters of 10KB
	data := make([]byte, 10000)
    for i := range data { data[i] = byte(i % 256) }
    
	for i := 0; i < 500; i++ {
		h := sha256.New()
		h.Write(data)
		h.Sum(nil)
	}
	return nil
}

func aesEncrypt(this js.Value, args []js.Value) interface{} {
	// AES GCM
    key := make([]byte, 32)
    rand.Read(key) // Real random
    block, _ := aes.NewCipher(key)
    aesgcm, _ := cipher.NewGCM(block)
    nonce := make([]byte, 12)
    rand.Read(nonce)
    data := make([]byte, 10000)
    
    for i := 0; i < 500; i++ {
        aesgcm.Seal(nil, nonce, data, nil)
    }
	return nil
}

func jsonParse(this js.Value, args []js.Value) interface{} {
	type Item struct { Name string; Value int }
	type Data struct { Items []Item }
	d := Data{Items: make([]Item, 1000)}
	for i := range d.Items { d.Items[i] = Item{fmt.Sprintf("Item%d", i), i} }
	jsonData, _ := json.Marshal(d)
	
	for i := 0; i < 100; i++ {
		var foo Data
		json.Unmarshal(jsonData, &foo)
	}
	return nil
}

func quickSort(this js.Value, args []js.Value) interface{} {
	arr := make([]int, 10000)
	for i := range arr { arr[i] = i ^ 0x3F }
	sort.Ints(arr)
	return nil
}

func bubbleSort(this js.Value, args []js.Value) interface{} {
	size := 1000
	arr := make([]float64, size)
	for i := 0; i < size; i++ { arr[i] = float64(i ^ 0x55) }
	for i := 0; i < size-1; i++ {
		for j := 0; j < size-i-1; j++ {
			if arr[j] > arr[j+1] {
				arr[j], arr[j+1] = arr[j+1], arr[j]
			}
		}
	}
	return nil
}

func rayTrace(this js.Value, args []js.Value) interface{} {
	w, h := 100, 100
    rSq := 1600.0
	hits := 0
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
            dx := float64(x - 50)
            dy := float64(y - 50)
            if dx*dx + dy*dy < rSq { hits++ }
		}
	}
	return hits
}

func zipCompression(this js.Value, args []js.Value) interface{} {
    data := make([]byte, 10000)
    for i := range data { data[i] = byte(i % 256) }
    
    // 50 Iterations of Gzip
    for i := 0; i < 50; i++ {
        var buf bytes.Buffer
        zw := gzip.NewWriter(&buf)
        zw.Write(data)
        zw.Close()
        _ = buf.Bytes() // consume
    }
    return nil
}
