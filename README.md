# 闲置物品展示网站

一个用于展示和分享个人二手闲置物品的轻量级静态网站。项目无需数据库或后端服务，适合部署到 GitHub Pages，并将网站链接分享到微信群或其他社交平台。

## 项目目的

本项目用于集中展示待出售的闲置物品，让访客可以快速查看：

- 物品名称和实拍图片
- 出售价格
- 在售、预订或已售状态
- 卖家联系方式和取货信息

网站优先适配手机屏幕，方便访客通过微信内置浏览器访问。

## 主要功能

- 响应式商品卡片布局
- 商品名称搜索
- 按在售、预订、已售状态筛选
- 点击商品查看大图和详细信息
- 一键复制卖家微信号
- 自动显示在售数量
- 纯静态部署，无需服务器和数据库
- 使用 WebP 压缩图片，减少页面加载时间

## 项目结构

```text
.
├── index.html          # 页面结构
├── styles.css         # 页面样式和移动端适配
├── app.js             # 搜索、筛选和商品弹窗等功能
├── items.js           # 网站设置和商品数据
└── assets/
    └── items/         # 网站使用的压缩商品图片
```

## 修改网站内容

网站名称、微信号和取货地点在 `items.js` 的 `SITE_CONFIG` 中设置：

```javascript
window.SITE_CONFIG = {
  title: "我的闲置小铺",
  wechat: "你的微信号",
  area: "取货地点",
};
```

商品信息保存在同一文件的 `ITEMS` 数组中：

```javascript
{
  id: "item-id",
  name: "物品名称",
  price: "$20",
  status: "available",
  image: "./assets/items/example.webp",
}
```

支持以下商品状态：

- `available`：在售
- `reserved`：已预订
- `sold`：已售

新增商品时，将压缩后的图片放入 `assets/items`，然后在 `items.js` 中添加对应商品数据。

也可以在网站地址后添加 `?manage=1` 打开本地管理页面。点击“保存本机预览”的修改只在当前浏览器中可见；要让手机和其他访客看到更新，必须导出新的 `items.js` 并上传到 GitHub 仓库。

## 本地预览

在项目目录运行：

```powershell
python -m http.server 8080
```

浏览器访问：

```text
http://localhost:8080
```

## 部署到 GitHub Pages

1. 将项目文件上传到 GitHub 仓库。
2. 打开仓库的 `Settings`。
3. 进入 `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. 选择网站所在分支和根目录，保存设置。
6. 等待 GitHub 生成公开访问地址。

部署完成后，即可将 GitHub Pages 链接分享到微信群。

## 隐私提示

这是一个公开静态网站。填写微信号、取货地点或其他联系方式前，请确认这些信息适合公开展示。原始照片可能包含拍摄位置等元数据，建议仅上传 `assets/items` 中处理过的网页图片。
