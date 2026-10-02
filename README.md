# Framing Studio

Windows 结构建模与工程检查工具。当前版本为 **E2.115**（仓库由 E2.110 导入），包含源码、可运行程序、离线浏览器资源及原生 Excel 模板。

## 运行

1. 将完整仓库下载到本机，或克隆仓库。
2. 运行 `FramingStudio/FramingStudio.exe`，保持其余文件和子目录在原位。
3. 首次运行需要 Microsoft Edge WebView2 Runtime；安装程序已随附于 `FramingStudio/Install_WebView2.exe`。
4. 原生 Excel 计算、工作簿导出和相关 PDF 抄生成需要 Windows 桌面版 Microsoft Excel。

现有项目通过 App 的“打开项目”载入。项目、自动备份、测试报告及开发机器临时文件不在本仓库内。

## 功能范围

- 轴线、楼层、区域、Framing、墙柱梁板及三维浏览。
- Loading、RC Member Check、Overall、Deflection、Foundation。
- Section A / B 抄、几何出图和原生 Excel 导出。
- 原有独立 Steel 方案功能及对应模板。

## 目录

| 路径 | 内容 |
| --- | --- |
| `FramingStudio/source/` | C# 桌面宿主、Excel Bridge、JavaScript/CSS 模块及 VBA 源码 |
| `FramingStudio/assets/index.html` | 当前可运行的网页界面和打包后的模块 |
| `FramingStudio/assets/pdfjs/` | 随附的离线 PDF.js 资源 |
| `FramingStudio/Excel/` | Excel 模板、模板映射及 ExcelBridge.exe |
| `FramingStudio/desktop-bridge.js` | 网页界面与 Windows 宿主的通信 |
| `CHANGELOG.md` | 版本与改动说明 |

## 构建

在 Windows PowerShell 中执行：

```powershell
Set-Location FramingStudio
powershell -NoProfile -ExecutionPolicy Bypass -File source/compile.ps1 -DesktopOnly
```

该命令使用系统 .NET Framework C# 编译器及随附的 WebView2 库重建桌面程序。省略 `-DesktopOnly` 可同时重建 ExcelBridge.exe。

`compile.ps1` 不负责网页资源打包。修改 JavaScript/CSS 模块时，也需要同步 `assets/index.html` 中对应的打包内容；仅改 `source/` 下的模块不会自动改变运行界面。`source/build-floor-names.py` 是历史版本迁移脚本，不是当前版本的通用构建入口。

## 版本与依赖

E2.115 增加梁中心线及端点吸附、实际 Support 和 DL/LL 反力显示；梁的荷载与支承输入集中在梁页，Member Check 保留尺寸初筛及配筋。Section B 自动传荷中，梁自重按全截面，板自重按梁／墙侧面之间的净面积；梁 DL/LL 向上取两位小数后参与计算。柱逐层受荷面积可修改并恢复自动值，TC → TB 使用确认后的累计荷载。

Section A / Section B 两个抄沿用 E2.114 的文字、格式、表格、图示及分页规则，仅现有字段的计算数值随输入更新。以后只有用户明确要求改抄时才修改，详见 `AGENTS.md`。本次原生模板保留全部原始样式与尺寸，仅更新悬臂梁两处计算公式及相关计算宏。

验证：55 项荷载与传荷回归、961 项原生 Excel 结果比对、保留原始模板版面后的 658 项复核均通过。界面已验证画梁连接、Support、反力、手动荷载取整、逐层面积编辑及恢复。

第三方组件保留其随附许可文件。本仓库未另行授予开源许可。
