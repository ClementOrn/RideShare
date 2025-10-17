#!/bin/bash

# 静态网站部署脚本
echo "================================================"
echo "Private Rideshare - 静态网站部署"
echo "================================================"
echo ""

# 检查是否在 git 仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误: 不在 Git 仓库中"
    echo "请先初始化 Git 仓库: git init"
    exit 1
fi

# 显示将要提交的文件
echo "📦 准备部署以下文件:"
echo "  - index.html (静态主页)"
echo "  - script.js (JavaScript 逻辑)"
echo "  - vercel.json (Vercel 配置)"
echo "  - .vercelignore (忽略文件)"
echo "  - public/favicon.ico (网站图标)"
echo ""

# 查看当前状态
echo "📋 当前 Git 状态:"
git status --short
echo ""

# 添加文件
echo "➕ 添加文件到 Git..."
git add index.html script.js vercel.json .vercelignore public/favicon.ico .gitignore
echo "✅ 文件已添加"
echo ""

# 显示将要提交的更改
echo "📝 将要提交的更改:"
git status --short
echo ""

# 提示用户确认
read -p "是否继续提交并推送? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 提交更改
    echo "💾 提交更改..."
    git commit -m "Deploy static HTML version of Private Rideshare

- Add index.html and script.js from PrivateRideShare-main/public/
- Configure vercel.json for static site deployment
- Add .vercelignore to exclude Next.js files
- This deploys the working static HTML version"

    if [ $? -eq 0 ]; then
        echo "✅ 提交成功"
        echo ""

        # 推送到远程仓库
        echo "🚀 推送到 GitHub..."
        git push origin main

        if [ $? -eq 0 ]; then
            echo ""
            echo "================================================"
            echo "✅ 部署成功！"
            echo "================================================"
            echo ""
            echo "Vercel 将自动检测更改并开始部署"
            echo "预计 1-2 分钟后完成"
            echo ""
            echo "🌐 访问: https://ride-share-six.vercel.app/"
            echo "📊 查看部署状态: https://vercel.com/dashboard"
            echo ""
        else
            echo "❌ 推送失败，请检查网络连接和权限"
            exit 1
        fi
    else
        echo "❌ 提交失败"
        exit 1
    fi
else
    echo "❌ 部署已取消"
    exit 0
fi
