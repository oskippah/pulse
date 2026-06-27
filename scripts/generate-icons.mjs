import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

function makeCRC32Table() {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[i] = c
  }
  return t
}

const crc32Table = makeCRC32Table()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const b of buf) c = (c >>> 8) ^ crc32Table[(c ^ b) & 0xFF]
  return (c ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type)
  const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length)
  const body = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(body))
  return Buffer.concat([lenBuf, body, crcBuf])
}

function generateIcon(size, path) {
  const pixels = Buffer.alloc(size * size * 3)

  function setPixel(x, y, r, g, b) {
    x = Math.round(x); y = Math.round(y)
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 3
    pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b
  }

  function fillRect(x, y, w, h, r, g, b) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        setPixel(x + dx, y + dy, r, g, b)
  }

  function fillCircle(cx, cy, radius, r, g, b) {
    for (let dy = -radius; dy <= radius; dy++)
      for (let dx = -radius; dx <= radius; dx++)
        if (dx * dx + dy * dy <= radius * radius)
          setPixel(cx + dx, cy + dy, r, g, b)
  }

  // Background: black
  pixels.fill(0)

  // White circle
  const cx = size / 2, cy = size / 2
  fillCircle(cx, cy, Math.round(size * 0.42), 255, 255, 255)

  // Blue "P" letter
  const s = size / 192
  const px = Math.round(cx - 18 * s)
  const py = Math.round(cy - 28 * s)
  const pw = Math.round(10 * s)
  const ph = Math.round(56 * s)
  const bw = Math.round(28 * s)
  const bh = Math.max(2, Math.round(12 * s))

  fillRect(px, py, pw, ph, 59, 130, 246)                          // vertical bar
  fillRect(px, py, bw, bh, 59, 130, 246)                          // top bar
  fillRect(px, py + Math.round(26 * s), bw, bh, 59, 130, 246)    // mid bar
  fillRect(px + bw - pw, py, pw, Math.round(26 * s) + bh, 59, 130, 246) // right bar

  // Build PNG scanlines
  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0 // filter: None
    pixels.copy(row, 1, y * size * 3, (y + 1) * size * 3)
    rows.push(row)
  }
  const raw = deflateSync(Buffer.concat(rows))

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // colour type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const png = Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', raw),
    pngChunk('IEND', Buffer.alloc(0)),
  ])

  writeFileSync(path, png)
  console.log(`✓ ${path} (${size}×${size})`)
}

mkdirSync('public', { recursive: true })
generateIcon(192, 'public/icon-192.png')
generateIcon(512, 'public/icon-512.png')
generateIcon(180, 'public/apple-touch-icon.png')
console.log('Done!')
