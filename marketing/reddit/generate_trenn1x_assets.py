#!/usr/bin/env python3
import math
import os
import struct
import zlib

OUT_DIR = "/Users/thomasverdier/arcane-duel/marketing/reddit"
os.makedirs(OUT_DIR, exist_ok=True)


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type)
    crc = zlib.crc32(data, crc)
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc & 0xFFFFFFFF)


def write_png(path: str, width: int, height: int, pixel_fn):
    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            r, g, b = pixel_fn(x, y, width, height)
            row.extend((max(0, min(255, int(r))), max(0, min(255, int(g))), max(0, min(255, int(b)))))
        rows.append(bytes(row))
    raw = b"".join(rows)
    compressed = zlib.compress(raw, level=9)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n"
    png += png_chunk(b"IHDR", ihdr)
    png += png_chunk(b"IDAT", compressed)
    png += png_chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(png)


def smoothstep(edge0, edge1, x):
    t = (x - edge0) / (edge1 - edge0)
    t = 0 if t < 0 else 1 if t > 1 else t
    return t * t * (3 - 2 * t)


def mix(a, b, t):
    return a * (1 - t) + b * t


def avatar_fn(x, y, w, h):
    nx = x / (w - 1)
    ny = y / (h - 1)

    # deep blue gradient background
    bg_top = (8, 22, 42)
    bg_bottom = (17, 44, 76)
    r = mix(bg_top[0], bg_bottom[0], ny)
    g = mix(bg_top[1], bg_bottom[1], ny)
    b = mix(bg_top[2], bg_bottom[2], ny)

    cx = w * 0.5
    cy = h * 0.5
    dx = x - cx
    dy = y - cy
    dist = math.sqrt(dx * dx + dy * dy)

    # neon ring
    ring_r = w * 0.43
    ring_width = w * 0.06
    ring = smoothstep(ring_r + ring_width, ring_r, dist) * smoothstep(ring_r - ring_width, ring_r, dist)
    r = mix(r, 72, ring * 0.7)
    g = mix(g, 244, ring * 0.9)
    b = mix(b, 187, ring * 0.9)

    # center orb
    orb = smoothstep(w * 0.35, 0, dist)
    r = mix(r, 22, orb * 0.8)
    g = mix(g, 82, orb * 0.8)
    b = mix(b, 132, orb * 0.8)

    # stylized beaver face circle
    face = smoothstep(w * 0.27, 0, dist)
    r = mix(r, 171, face)
    g = mix(g, 115, face)
    b = mix(b, 66, face)

    # eyes
    eye_y = h * 0.46
    eye_dx = w * 0.09
    for ex in (cx - eye_dx, cx + eye_dx):
        ed = math.sqrt((x - ex) ** 2 + (y - eye_y) ** 2)
        eye = smoothstep(w * 0.028, 0, ed)
        r = mix(r, 28, eye)
        g = mix(g, 18, eye)
        b = mix(b, 16, eye)

    # teeth block
    tx0, tx1 = int(w * 0.46), int(w * 0.54)
    ty0, ty1 = int(h * 0.56), int(h * 0.71)
    if tx0 <= x <= tx1 and ty0 <= y <= ty1:
        r, g, b = 245, 218, 180

    # cheek highlights
    for cxh in (w * 0.38, w * 0.62):
        hd = math.sqrt((x - cxh) ** 2 + (y - h * 0.58) ** 2)
        hlt = smoothstep(w * 0.08, 0, hd)
        r = mix(r, 201, hlt * 0.45)
        g = mix(g, 146, hlt * 0.35)
        b = mix(b, 96, hlt * 0.3)

    # subtle noise
    n = (math.sin(nx * 87.0 + ny * 41.0) + math.sin(nx * 131.0 + ny * 79.0)) * 0.5
    r += n * 5
    g += n * 5
    b += n * 5

    return r, g, b


def banner_fn(x, y, w, h):
    nx = x / (w - 1)
    ny = y / (h - 1)

    top = (7, 18, 33)
    bottom = (12, 34, 57)
    r = mix(top[0], bottom[0], ny)
    g = mix(top[1], bottom[1], ny)
    b = mix(top[2], bottom[2], ny)

    # diagonal aurora bands
    for i, hue in enumerate(((52, 198, 255), (118, 255, 198), (255, 201, 120))):
        phase = i * 1.8
        band = math.sin((nx * 7.0 + ny * 3.2 + phase) * math.pi)
        strength = smoothstep(0.35, 1.0, band)
        r = mix(r, hue[0], strength * 0.13)
        g = mix(g, hue[1], strength * 0.13)
        b = mix(b, hue[2], strength * 0.13)

    # glowing orbs
    orbs = [
        (w * 0.18, h * 0.28, h * 0.32, (99, 212, 255)),
        (w * 0.51, h * 0.18, h * 0.28, (126, 255, 210)),
        (w * 0.83, h * 0.31, h * 0.35, (255, 193, 118)),
    ]
    for ox, oy, rad, col in orbs:
        d = math.sqrt((x - ox) ** 2 + (y - oy) ** 2)
        glow = smoothstep(rad, 0, d)
        r = mix(r, col[0], glow * 0.3)
        g = mix(g, col[1], glow * 0.3)
        b = mix(b, col[2], glow * 0.3)

    # ground strip
    if y > h * 0.72:
        t = (y - h * 0.72) / (h * 0.28)
        r = mix(r, 18, t)
        g = mix(g, 45, t)
        b = mix(b, 71, t)

    # pixel text block "TRENN1X" as stylized bars
    block_y0 = int(h * 0.44)
    block_y1 = int(h * 0.63)
    if block_y0 <= y <= block_y1:
        # 8 characters represented by vertical stacks
        left = int(w * 0.34)
        cell = int(w * 0.032)
        spacing = int(w * 0.005)
        pattern = [1, 1, 1, 1, 1, 1, 1, 1]
        for idx, val in enumerate(pattern):
            x0 = left + idx * (cell + spacing)
            x1 = x0 + cell
            if x0 <= x <= x1 and val:
                line = 1.0
                if (x - x0) < 3 or (x1 - x) < 3 or (y - block_y0) < 3 or (block_y1 - y) < 3:
                    line = 0.75
                r = mix(r, 168, line)
                g = mix(g, 247, line)
                b = mix(b, 220, line)

    return r, g, b


def card_square_fn(x, y, w, h):
    nx = x / (w - 1)
    ny = y / (h - 1)
    bg1 = (6, 17, 31)
    bg2 = (13, 36, 58)
    r = mix(bg1[0], bg2[0], ny)
    g = mix(bg1[1], bg2[1], ny)
    b = mix(bg1[2], bg2[2], ny)

    cx, cy = w * 0.5, h * 0.48
    d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    ring = smoothstep(w * 0.33, w * 0.29, d)
    r = mix(r, 116, ring * 0.9)
    g = mix(g, 245, ring * 0.9)
    b = mix(b, 205, ring * 0.9)

    core = smoothstep(w * 0.22, 0, d)
    r = mix(r, 173, core * 0.8)
    g = mix(g, 121, core * 0.8)
    b = mix(b, 74, core * 0.8)

    if y > h * 0.8:
        t = (y - h * 0.8) / (h * 0.2)
        r = mix(r, 15, t)
        g = mix(g, 38, t)
        b = mix(b, 60, t)

    return r, g, b


def card_vertical_fn(x, y, w, h):
    nx = x / (w - 1)
    ny = y / (h - 1)
    bg1 = (7, 20, 35)
    bg2 = (12, 34, 56)
    r = mix(bg1[0], bg2[0], ny)
    g = mix(bg1[1], bg2[1], ny)
    b = mix(bg1[2], bg2[2], ny)

    for ox, oy, rad, col in [
        (w * 0.26, h * 0.23, w * 0.24, (83, 213, 255)),
        (w * 0.74, h * 0.34, w * 0.27, (138, 255, 204)),
        (w * 0.52, h * 0.57, w * 0.31, (255, 201, 123)),
    ]:
        d = math.sqrt((x - ox) ** 2 + (y - oy) ** 2)
        glow = smoothstep(rad, 0, d)
        r = mix(r, col[0], glow * 0.32)
        g = mix(g, col[1], glow * 0.32)
        b = mix(b, col[2], glow * 0.32)

    return r, g, b


write_png(os.path.join(OUT_DIR, "avatar_trenn1x_512.png"), 512, 512, avatar_fn)
write_png(os.path.join(OUT_DIR, "banner_trenn1x_1920x384.png"), 1920, 384, banner_fn)
write_png(os.path.join(OUT_DIR, "post_square_1080.png"), 1080, 1080, card_square_fn)
write_png(os.path.join(OUT_DIR, "post_vertical_1080x1350.png"), 1080, 1350, card_vertical_fn)

print("generated:")
for name in [
    "avatar_trenn1x_512.png",
    "banner_trenn1x_1920x384.png",
    "post_square_1080.png",
    "post_vertical_1080x1350.png",
]:
    print(os.path.join(OUT_DIR, name))
