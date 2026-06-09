# 我的闲置小铺

这是一个无需数据库、适合手机浏览和分享到微信群的静态二手物品网站。

## 修改名称、价格和状态

1. 用浏览器打开网站。
2. 点击页面最下方的“管理物品”。
3. 修改微信号、取货地点、物品名称、价格或状态。
4. 点击“保存到本机”可以立即预览。
5. 点击“导出 items.js”，用导出的文件替换项目根目录中的 `items.js`，修改才会对所有访客生效。

也可以直接用文本编辑器修改 `items.js`。状态可填写：

- `available`：在售
- `reserved`：预订
- `sold`：已售

## 本地预览

在当前文件夹打开 PowerShell，运行：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 发布并分享到微信群

网站是纯静态文件，可以部署到 GitHub Pages、Cloudflare Pages、Netlify 或其他静态网站托管服务。发布后，将生成的网址复制到微信群即可。

发布时需要上传：

- `index.html`
- `styles.css`
- `app.js`
- `items.js`
- `assets` 文件夹

原始的 `IMG_*.JPG` 不需要上传，网站使用的是 `assets/items` 中已经压缩过的图片。
