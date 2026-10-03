# Framing Studio

Windows 结构建模与工程检查工具。当前版本为 **E2.123**（仓库由 E2.110 导入），包含源码、可运行程序、离线浏览器资源及原生 Excel 模板。

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

`compile.ps1` 不负责网页资源打包。修改已标记的 17 个模块后，在仓库根目录执行 `python FramingStudio/source/sync-web.py`；它只同步标记范围并保留其余网页字节。其他 JavaScript/CSS 模块仍须同步 `assets/index.html` 中对应内容；仅改 `source/` 不会自动改变运行界面。`source/build-floor-names.py` 是历史版本迁移脚本，不是当前版本的通用构建入口。

## 版本与依赖

E2.123 将“梁”窗口改名为 **Summary Check**，在原梁／板面板中加入柱受力查看：本层、上部和累计 G/Q，逐层面积，验算轴力与原柱 Check 结果。可隐藏受荷范围，或打开该柱的 Member Check。荷载与面积使用既有输入，查看时不勾选报告、不改变项目。菜单为“梁布置 → Loading → Summary Check → Member Check”。新增检查为 `source/tests/summary123.cjs` 和 `preserve123.py`。

E2.122 修正梁荷载图的反力显示：竖向反力已算出而构件弯矩／抗扭设计待补时，同时显示数值和待验算提示。接墙、接柱一致；真实缺荷载或缺支承仍阻止反力显示。计算程序和两个抄均未修改。新增检查为 `source/tests/reaction122.cjs` 和 `preserve122.py`。

E2.121 菜单顺序为“梁布置 → Loading → 梁 → Member Check”。在“梁”页加入板计算面板：点选板后查看或修改板厚与单向方向，查看实际支承分段、荷载、反力、尺寸初筛和配筋结果。面板与 Member Check 共用输入，打开面板不会改变 Check/A/B 勾选。保留净板区、梁布置、中心线／端点／中点、板方向显示开关、局部净高／E&M／结构区等既有功能。

本版修复柱截面侧面参与板支承时的漏判、手动短梁深度被自动值覆盖、上层柱显示截走本层传荷及转换柱落点只匹配参考线的问题。梁柱重叠支承只计一次；缺支承、多根转换梁争接、非矩形板超出原 Excel 范围时仍需处理提示，不会强制通过。五个年度模型已运行回归，未发现此前的公式异常；部分模型仍有待确认输入和未通过的构件。

当前检查入口：`source/tests/slab121.cjs`（新板面板、柱面分段、短梁及转换传荷）、`preserve121.py`（相对 E2.120 的报告与模板保护）、`geometry120.cjs`、`clearance119.cjs`、`loading115.cjs`、`layout116.cjs` 和 `support117.cjs`。新版保留旧项目数据映射与输入；建议打开原项目后另存一份。

E2.117 将梁页调整为先 Support 后 Loading，各自保存；识别到的柱／墙／梁编号与自由端在上方显示。保留原支承和传荷规则，支承保存不会丢掉未完成的荷载草稿。

E2.116 将梁布置侧栏接入正式软件：主梁、次梁与板方向各自折叠，布置应用于当前 Framing 的所有楼层，可分别重新布置、删除单根梁、连接端点与中点；新布置的普通板默认沿短跨，可点击或拖框修改方向。梁原有荷载、实际 Support、反力、尺寸与手动设置保留。Member Check 增加配筋示意图，点击标注编辑，仍使用原保存及检查流程。

E2.115 的全截面梁自重、净面积板自重、荷载向上取两位小数、柱逐层面积与 TC → TB 传荷继续沿用。

Section A / Section B 两个抄的文字、横线纸、格式、表格、图示及分页规则保持不变；现有字段的计算数值随输入更新。以后只有用户明确要求改抄时才修改，详见 `AGENTS.md`。本次 Excel 模板和原生计算桥接程序未改。

E2.117 验证：4 组贴边 CB 支承及分步保存检查通过；86 个原文件字节一致，报告处理和样式未改。当前入口为 `source/tests/support117.cjs`（Node/Playwright，可用 `CHROME_PATH` 指定 Chrome）及 `source/tests/preserve117.py`（Python + Git，使用 E2.116 历史版本）。E2.116 的荷载、梁布置模块保持原样，原 55 项荷载与 9 组界面检查留作回归；测试均用独立数据。

第三方组件保留其随附许可文件。本仓库未另行授予开源许可。
