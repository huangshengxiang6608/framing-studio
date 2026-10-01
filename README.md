# Framing Studio

Windows 结构建模与工程检查工具。当前版本为 **E2.113**（仓库由 E2.110 导入），包含源码、可运行程序、离线浏览器资源及原生 Excel 模板。

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
- S460 柱到柱转换桁架：跨一层／两层、杆件选型、反力传递、图形及 A/B 与无巨集 Excel 输出。详见 [使用与范围说明](FramingStudio/docs/transfer-truss.md)。

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

## 验证

[桁架测试与重跑步骤](FramingStudio/verification/README.md)。示例模型位于 `FramingStudio/示例模型/S460_两层转换桁架.framing.json`。

## 版本与依赖

E2.113 将 S460 转换桁架整合到 E2.112，保留既有报告排版。桁架工作簿为无巨集 xlsx；本机此前 RC 巨集打开遇到 `0x800A03EC`；审查者已在原 PR 提交验证下层柱 A/B 巨集导出，本次下游输入修正另有回归检查，详见测试记录。Excel 模板及 VBA 未修改。

E2.112 按参考照片调整 Floor Summary 居中、表格线宽、Load Path 颜色及基础框、Wind/Overall 排版，隐藏不适用和确定为零的荷载项，精简 Deflection，并将 Foundation Recommendation 排在验算后。适用但缺失输入的项目仍显示。当前样例 A 14 页 / B 6 页；原生计算核对 6,199 项无差异，Excel 模板/VBA 与模型数据保持不变。

第三方组件保留其随附许可文件。本仓库未另行授予开源许可。
