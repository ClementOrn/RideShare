@echo off
chcp 65001 >nul
echo ================================================
echo Private Rideshare - 静态网站部署
echo ================================================
echo.

REM 检查是否在 git 仓库中
if not exist ".git" (
    echo ❌ 错误: 不在 Git 仓库中
    echo 请先初始化 Git 仓库: git init
    pause
    exit /b 1
)

REM 显示将要提交的文件
echo 📦 准备部署以下文件:
echo   - index.html (静态主页)
echo   - script.js (JavaScript 逻辑)
echo   - vercel.json (Vercel 配置)
echo   - .vercelignore (忽略文件)
echo   - public/favicon.ico (网站图标)
echo.

REM 查看当前状态
echo 📋 当前 Git 状态:
git status --short
echo.

REM 添加文件
echo ➕ 添加文件到 Git...
git add index.html script.js vercel.json .vercelignore public/favicon.ico .gitignore
echo ✅ 文件已添加
echo.

REM 显示将要提交的更改
echo 📝 将要提交的更改:
git status --short
echo.

REM 提示用户确认
set /p confirm="是否继续提交并推送? (y/n): "
if /i not "%confirm%"=="y" (
    echo ❌ 部署已取消
    pause
    exit /b 0
)

REM 提交更改
echo.
echo 💾 提交更改...
git commit -m "Deploy static HTML version of Private Rideshare" -m "- Add index.html and script.js from PrivateRideShare-main/public/" -m "- Configure vercel.json for static site deployment" -m "- Add .vercelignore to exclude Next.js files" -m "- This deploys the working static HTML version"

if %errorlevel% neq 0 (
    echo ❌ 提交失败
    pause
    exit /b 1
)

echo ✅ 提交成功
echo.

REM 推送到远程仓库
echo 🚀 推送到 GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ 推送失败，请检查网络连接和权限
    pause
    exit /b 1
)

echo.
echo ================================================
echo ✅ 部署成功！
echo ================================================
echo.
echo Vercel 将自动检测更改并开始部署
echo 预计 1-2 分钟后完成
echo.
echo 🌐 访问: https://ride-share-six.vercel.app/
echo 📊 查看部署状态: https://vercel.com/dashboard
echo.
pause
