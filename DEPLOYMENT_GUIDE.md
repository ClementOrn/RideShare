# 部署指南 - Deployment Guide

## 修复钱包连接问题 / Fix Wallet Connection Issue

### 问题 / Issue
连接钱包按钮无法点击，控制台显示错误。

### 解决方案 / Solution

#### 1. 获取 WalletConnect Project ID

**重要：** 您必须获取一个有效的 WalletConnect Project ID 才能使钱包连接正常工作。

步骤：
1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 使用 GitHub 或 Email 登录
3. 点击 "Create New Project"
4. 填写项目信息：
   - **Project Name**: Private Rideshare Platform
   - **Project Description**: Privacy-preserving decentralized rideshare application
5. 创建后，复制您的 **Project ID**

#### 2. 配置环境变量

在 Vercel 项目设置中添加环境变量：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目 (ride-share-six)
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
```

将 `your-actual-project-id-here` 替换为您从 WalletConnect Cloud 获取的实际 Project ID。

#### 3. 本地开发配置

编辑 `.env.local` 文件：

```bash
# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here

# Contract Address (Sepolia)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5986FF19B524534F159af67f421ca081c6F5Acff

# Network
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
```

#### 4. 重新部署

在 Vercel 中：
1. 提交代码更改到 GitHub
2. Vercel 会自动重新部署
3. 或者在 Vercel Dashboard 中点击 "Redeploy"

#### 5. 测试

访问 https://ride-share-six.vercel.app/ 并：
1. 打开浏览器开发者工具 (F12)
2. 检查控制台是否还有错误
3. 点击 "Connect Wallet" 按钮
4. 应该能看到钱包选择弹窗

## 本地运行 / Run Locally

```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 1311)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 已修复的问题 / Fixed Issues

### ✅ 修复的问题：
1. **错误的 vercel.json 配置** - 已更新为 Next.js 配置
2. **冲突的旧文件** - 移除了 `index.html` 和 `script.js`
3. **缺少 WalletConnect Project ID** - 添加了配置说明
4. **package.json 不正确** - 更新为 Next.js 项目配置

### 🔧 需要您做的：
1. **获取 WalletConnect Project ID** (必需)
2. **在 Vercel 中配置环境变量** (必需)
3. **重新部署应用**

## 故障排除 / Troubleshooting

### 钱包按钮仍然无法点击？

1. **检查浏览器控制台**：
   - 按 F12 打开开发者工具
   - 查看 Console 标签页
   - 寻找错误信息

2. **验证 Project ID**：
   - 确保 Project ID 不是 'default-project-id' 或 'temp-project-id'
   - 应该是类似这样的格式: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

3. **清除缓存**：
   - 硬刷新页面: Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
   - 清除浏览器缓存

4. **检查钱包扩展**：
   - 确保已安装 MetaMask 或其他 Web3 钱包
   - 钱包扩展已启用

## 联系支持 / Support

如果问题仍然存在，请检查：
- [RainbowKit 文档](https://www.rainbowkit.com/docs/installation)
- [WalletConnect 文档](https://docs.walletconnect.com/)
- [Next.js 文档](https://nextjs.org/docs)
