# 理财工具包

纯前端工具集合（React），通过 GitHub Actions 自动部署到 GitHub Pages。

## 本地开发

```bash
cd client
npm install
npm start
```

## 新增工具

1. 在 `client/src/tools/` 下新建目录，例如 `my-tool/index.js`，默认导出一个 React 组件
2. 在 `client/src/tools/index.js` 的注册表中加一项（`path`、`name`、`icon`、`description`、`component`），`icon` 取 `client/src/components/Icon` 中的图标名

首页卡片、顶部导航、路由、页面标题会自动生成，访问地址为 `#/my-tool`。

## 部署

push 到 `main` 后自动构建并部署。首次需要在仓库 Settings → Pages → Source 选择 **GitHub Actions**。
