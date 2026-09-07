#!/usr/bin/env python3
"""Turn WeChat / Alipay payment screenshots into 464×464 styled QR cards.

Decodes the screenshot, rebuilds a scannable QR in the Projects-page look
(center avatar + brand badge), and writes JPEG assets.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

import qrcode
from qrcode.constants import ERROR_CORRECT_H
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import CircleModuleDrawer, RoundedModuleDrawer
import zxingcpp

TOOL_DIR = Path(__file__).resolve().parent
REPO_ROOT = TOOL_DIR.parents[1]
ASSETS_DIR = TOOL_DIR / 'assets'
DEFAULT_OUT_DIR = REPO_ROOT / 'src' / 'assets'
CANVAS = 464


@dataclass(frozen=True)
class Style:
    name: str
    default_filename: str
    badge_file: str
    module_drawer: object
    box_size: int
    border: int
    qr_ratio: float
    avatar_ratio: float
    avatar_shift: tuple[int, int]
    avatar_size: int
    avatar_radius: int
    badge_inner: int
    badge_outer: int
    badge_offset: tuple[int, int]
    circle_mask: bool
    circle_inset: int


WECHAT = Style(
    name='wechat',
    default_filename='wechat-qrcode.jpg',
    badge_file='wechat-badge.png',
    module_drawer=CircleModuleDrawer,
    box_size=16,
    border=4,
    qr_ratio=0.78,
    avatar_ratio=0.168,
    avatar_shift=(-4, -6),
    avatar_size=108,
    avatar_radius=18,
    badge_inner=76,
    badge_outer=82,
    badge_offset=(52, 52),
    circle_mask=True,
    circle_inset=8,
)

ALIPAY = Style(
    name='alipay',
    default_filename='alipay-qrcode.jpg',
    badge_file='alipay-badge.png',
    module_drawer=RoundedModuleDrawer,
    box_size=14,
    border=3,
    qr_ratio=0.68,
    avatar_ratio=0.125,
    avatar_shift=(0, 0),
    avatar_size=100,
    avatar_radius=16,
    badge_inner=56,
    badge_outer=62,
    badge_offset=(72, 74),
    circle_mask=False,
    circle_inset=0,
)


class DecodeError(RuntimeError):
    pass


def decode_qr(path: Path) -> tuple[str, tuple[int, int, int, int]]:
    im = Image.open(path).convert('RGB')
    results = list(zxingcpp.read_barcodes(im))
    if not results:
        w, h = im.size
        for box in (
            (int(w * 0.12), int(h * 0.18), int(w * 0.88), int(h * 0.75)),
            (int(w * 0.2), int(h * 0.22), int(w * 0.8), int(h * 0.7)),
        ):
            results = list(zxingcpp.read_barcodes(im.crop(box)))
            if results:
                break
    if not results:
        raise DecodeError(f'no QR code found in {path}')
    r = results[0]
    pos = r.position
    xs = [pos.top_left.x, pos.top_right.x, pos.bottom_right.x, pos.bottom_left.x]
    ys = [pos.top_left.y, pos.top_right.y, pos.bottom_right.y, pos.bottom_left.y]
    return r.text, (min(xs), min(ys), max(xs), max(ys))


def crop_avatar(src: Path, bbox: tuple[int, int, int, int], style: Style) -> Image.Image:
    im = Image.open(src).convert('RGB')
    x0, y0, x1, y1 = bbox
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    side = int((x1 - x0) * style.avatar_ratio)
    dx, dy = style.avatar_shift
    box = (
        cx - side // 2 + dx,
        cy - side // 2 + dy,
        cx + side // 2 + dx,
        cy + side // 2 + dy,
    )
    return im.crop(box)


def rounded_avatar(src: Image.Image, size: int, radius: int, border: int = 4) -> Image.Image:
    src = src.convert('RGB').resize((size, size), Image.Resampling.LANCZOS)
    src = src.filter(ImageFilter.UnsharpMask(radius=1.2, percent=80, threshold=2))

    def round_img(im: Image.Image, s: int, r: int) -> Image.Image:
        im = im.resize((s, s), Image.Resampling.LANCZOS)
        mask = Image.new('L', (s, s), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, s - 1, s - 1), radius=r, fill=255)
        out = Image.new('RGBA', (s, s), (255, 255, 255, 0))
        out.paste(im, mask=mask)
        return out

    plate = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    bmask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(bmask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    plate.paste(Image.new('RGBA', (size, size), (255, 255, 255, 255)), mask=bmask)
    inner = size - border * 2
    inner_img = round_img(src, inner, max(radius - border, 6))
    plate.paste(inner_img, (border, border), inner_img)
    return plate


def badge_with_ring(badge: Image.Image, inner: int, outer: int) -> Image.Image:
    badge = badge.convert('RGBA').resize((inner, inner), Image.Resampling.LANCZOS)
    ring = Image.new('RGBA', (outer, outer), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((0, 0, outer - 1, outer - 1), fill=(255, 255, 255, 255))
    ring.alpha_composite(badge, ((outer - inner) // 2, (outer - inner) // 2))
    return ring


def make_qr(data: str, style: Style) -> Image.Image:
    qr = qrcode.QRCode(
        error_correction=ERROR_CORRECT_H,
        box_size=style.box_size,
        border=style.border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(image_factory=StyledPilImage, module_drawer=style.module_drawer())
    return img.convert('RGBA')


def fit_on_canvas(qr: Image.Image, canvas: int, qr_ratio: float) -> Image.Image:
    target = int(canvas * qr_ratio)
    qr = qr.resize((target, target), Image.Resampling.LANCZOS)
    out = Image.new('RGBA', (canvas, canvas), (255, 255, 255, 255))
    off = (canvas - target) // 2
    out.paste(qr, (off, off), qr)
    return out


def circle_mask_outside(img: Image.Image, inset: int) -> Image.Image:
    w, h = img.size
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).ellipse((inset, inset, w - 1 - inset, h - 1 - inset), fill=255)
    white = Image.new('RGBA', (w, h), (255, 255, 255, 255))
    white.paste(img, mask=mask)
    return white


def to_jpeg(im: Image.Image) -> Image.Image:
    rgb = Image.new('RGB', im.size, (255, 255, 255))
    rgb.paste(im, mask=im.split()[-1] if im.mode == 'RGBA' else None)
    return rgb


def render(screenshot: Path, style: Style, canvas: int = CANVAS) -> Image.Image:
    data, bbox = decode_qr(screenshot)
    avatar = rounded_avatar(crop_avatar(screenshot, bbox, style), style.avatar_size, style.avatar_radius)
    badge_path = ASSETS_DIR / style.badge_file
    if not badge_path.exists():
        raise FileNotFoundError(f'missing badge asset: {badge_path}')
    badge = badge_with_ring(Image.open(badge_path), style.badge_inner, style.badge_outer)

    img = make_qr(data, style)
    img = fit_on_canvas(img, canvas, style.qr_ratio)
    if style.circle_mask:
        img = circle_mask_outside(img, style.circle_inset)

    ax = (canvas - avatar.size[0]) // 2
    img.alpha_composite(avatar, (ax, ax))
    bx, by = style.badge_offset
    img.alpha_composite(badge, (canvas - badge.size[0] - bx, canvas - badge.size[1] - by))
    return to_jpeg(img)


def verify_payload(image: Image.Image, expected: str, label: str) -> None:
    texts = [r.text for r in zxingcpp.read_barcodes(image)]
    if expected not in texts:
        raise DecodeError(f'{label} output does not scan back to {expected!r}; got {texts!r}')


def write_styled(screenshot: Path, style: Style, dest: Path, canvas: int, verify: bool) -> str:
    data, _ = decode_qr(screenshot)
    out = render(screenshot, style, canvas)
    if verify:
        verify_payload(out, data, style.name)
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, 'JPEG', quality=92, optimize=True, progressive=True)
    return data


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description='Rebuild WeChat / Alipay collection screenshots as styled QR cards.'
    )
    p.add_argument('--wechat', type=Path, help='WeChat Pay screenshot')
    p.add_argument('--alipay', type=Path, help='Alipay collection screenshot')
    p.add_argument(
        '--out-dir',
        type=Path,
        default=DEFAULT_OUT_DIR,
        help=f'output directory (default: {DEFAULT_OUT_DIR})',
    )
    p.add_argument('--wechat-out', type=Path, help='override WeChat output path')
    p.add_argument('--alipay-out', type=Path, help='override Alipay output path')
    p.add_argument('--size', type=int, default=CANVAS, help='output size in pixels (square)')
    p.add_argument('--no-verify', action='store_true', help='skip scan-back check')
    args = p.parse_args()
    if not args.wechat and not args.alipay:
        p.error('provide --wechat and/or --alipay')
    return args


def main() -> int:
    args = parse_args()
    verify = not args.no_verify
    jobs: list[tuple[Path, Style, Path]] = []
    if args.wechat:
        jobs.append(
            (
                args.wechat,
                WECHAT,
                args.wechat_out or args.out_dir / WECHAT.default_filename,
            )
        )
    if args.alipay:
        jobs.append(
            (
                args.alipay,
                ALIPAY,
                args.alipay_out or args.out_dir / ALIPAY.default_filename,
            )
        )

    for src, style, dest in jobs:
        if not src.exists():
            print(f'error: {src} not found', file=sys.stderr)
            return 1
        try:
            data = write_styled(src, style, dest, args.size, verify)
        except DecodeError as e:
            print(f'error: {e}', file=sys.stderr)
            return 1
        print(f'{style.name}: {data}')
        print(f'  -> {dest}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
