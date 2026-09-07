# qr-style

把微信 / 支付宝收款码截图，做成 Projects 页用的 464×464 样式卡（圆角头像 + 品牌徽标，可扫描）。

不经过 Astro 构建，站点不会发布这个目录。

## 安装

```shell
cd tools/qr-style
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## 用法

在仓库根目录：

```shell
tools/qr-style/.venv/bin/python tools/qr-style/style_qr.py \
  --wechat /path/to/wechat-screenshot.jpg \
  --alipay /path/to/alipay-screenshot.jpg
```

默认写入：

- `src/assets/wechat-qrcode.jpg`
- `src/assets/alipay-qrcode.jpg`

只做其中一张时，只传对应参数即可。输出目录或文件名可改：

```shell
tools/qr-style/.venv/bin/python tools/qr-style/style_qr.py \
  --wechat ~/Downloads/wx.jpg \
  --out-dir /tmp/qr-preview
```

生成后会再解码一次，确认仍是原收款链接；不需要检查时加 `--no-verify`。

`assets/` 里的 `wechat-badge.png` / `alipay-badge.png` 是叠在码上的徽标，一般不用动。
