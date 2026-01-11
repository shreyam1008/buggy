#!/bin/bash
# Build script for Rust WASM benchmarks
# Run with: ./build.sh

set -e

echo "🦀 Building Rust WASM Benchmarks..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack not found. Installing..."
    cargo install wasm-pack
fi

# Build with SIMD support (if available)
echo "📦 Compiling with maximum optimizations..."
RUSTFLAGS='-C target-feature=+simd128' wasm-pack build \
    --target web \
    --release \
    --out-dir ./pkg

# Copy to public folder
echo "📋 Copying WASM files to public/wasm..."
cp ./pkg/rust_wasm_benchmarks_bg.wasm ../public/wasm/rust_benchmarks.wasm
cp ./pkg/rust_wasm_benchmarks.js ../public/wasm/rust_wasm_init.js

# Optional: Run wasm-opt for extra optimization
if command -v wasm-opt &> /dev/null; then
    echo "⚡ Running wasm-opt for extra optimization..."
    wasm-opt -O3 ../public/wasm/rust_benchmarks.wasm -o ../public/wasm/rust_benchmarks.wasm
else
    echo "ℹ️  wasm-opt not found (optional). Install with: npm install -g binaryen"
fi

# Show file sizes
echo ""
echo "📊 Build complete! File sizes:"
ls -lh ../public/wasm/*.wasm

echo ""
echo "✅ Rust WASM ready!"
