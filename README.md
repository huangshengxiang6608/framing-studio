# Framing Studio

E2.222 新增「套用此 TB」按鈕，將已核對的建議梁闊及完整 Structural Zone 深度套用至該 Framing 同位置梁，可一次撤銷；套用後更新全樓 Check。

E2.221 為 RC 不通過的 TB 先核對及用盡各層／局部 Structural Zone，再提供建議梁闊；每次試算重算自重、傳荷與 RC，建議不會自動修改模型。

E2.220 在 Summary 為 RC 不通過的 SB 提供優先加深的建議尺寸、共用 Framing 最大建議及一鍵套用；受所有共用樓層與局部 Structural Zone 限制，保留 Section A／B 抄。

E2.219 將 Summary 梁闊上限分拆為尺寸提示，不再單憑超出自動加闊上限判定 RC 不通過；自動加闊停止規則、原計算及 Section A／B 抄保留。

E2.218 在各 Framing SB 預設尺寸表加入 B；自動及手動 SB 統一跟隨所屬 Framing 預設，保留個別闊度指定，清空恢復共同預設。

E2.217 讓 MB／SB／TB／CB 手動畫梁均可捕捉起點至 grid 的水平／垂直投影；Summary 預設隱藏 Span/Depth 通過、撓度不過但 RC 通過的組合，可手動勾選。

E2.216 將 Summary 梁 RC 判定與 Excel L/d 分開：只因 L/d 不過的梁不再顯示 RC 未通過；Span/Depth、短期撓度及篩選仍各自判定。原 Excel 選筋、計算及 Section A／B 抄不變。

E2.215 加強 Summary Check 狀態的白底對比：跨深比不足但短期撓度通過用亮橙色，失敗用鮮紅色，狀態文字加粗。

E2.214 新增梁的 Span/Depth、短期撓度及 RC 八種結果組合多選表，顯示各組數目；預設只列撓度或 RC 已不通過的梁。所有梁（包括全通過）均可選取查看，待確認及其他提示另列。

E2.213 恢復 Summary Check 的 Span/Depth 原結果：跨深比未通過但短期撓度通過時，以橙色顯示「未通過」，其後列出短期撓度 OK 及 L/250 比較。

E2.212 按用戶確認的簡化準則：梁跨深比不足時，以短期未開裂最大撓度 < L/250 顯示「短期撓度 OK」。Section B 獨立；非完整守則撓度驗算，兩份報表保留。

E2.211 在 Summary Check 的梁 A／B 結果下並列最大短期彈性撓度、所在位置及可展開的計算假設；保留原 A／B 判定與兩份報表。

E2.210 新增梁的短期未開裂彈性撓度圖：DL＋LL，分段雙重積分；E 嚴格取自香港混凝土守則 Table 3.2「For general use」。顯示採用 E／I、最大撓度及位置，連動 x 輸入、滑桿和游標。保留 Section B 原判定及兩份報表。

E2.209 在剪力／彎矩圖新增截面位置 x（m）輸入框，與滑桿及圖上游標同步。可直接輸入 0 至梁長之間的位置；無效輸入保留原讀值並提示修正。計算、Section A／B 報表及 Excel／VBA 不變。

E2.208 統一荷載精度：原始 DL／LL、自重、反力及中間傳荷均不取整，App 與原 VBA 使用相同的特徵荷載及係數。畫面截示三位小數，有餘數以「…」表示；輸入及計算保留完整數值。保留梁 SFD／BMD 及 Section A／B 報表格式。核對方法及原生 Excel 驗證限制見 `FramingStudio/verification/release208.md`。

新增 Legend 箭嘴，可收起／展開柱關係、構件顯示及標註選項，並記住本機狀態。保留 E2.205 的 Section A／B 分開檢查結果及手動梁深編輯。

Windows 结构建模与工程检查工具。当前 Windows／网页版本为 **E2.222**，在 E2.204 可编辑梁深的基础上，Summary Check 分开显示 Section A Span/Depth 与 Section B RC Check 的通过状态，补回仅 A 未通过的构件。保留既有支承及 RC 验算规则、Section A／B 抄格式、Excel／VBA 模板，以及界面提示和保存保护。包含源码、重新编译的 Windows 程序及离线浏览器资源。

新增 S460 转换桁架、同层／跨层布置、杆件验算、反力向下传递及独立 Excel 导出。无桁架模型使用本次更新后的 RC 建模与计算；原 Section A／B 抄格式及 Excel 模板保留。桁架反力影响的柱可进入 Section B 验算；原 Section A 面积表无法表达该反力，明确阻止该项导出。详见 `FramingStudio/docs/transfer-truss.md`。

E2.172 统一网页与桌面版本、更新帮助、清理显示数字的浮点尾数，并为事务校验失败的输入保留错误值和就近提示。布局与计算不变。桌面宿主仅更新版本标识并重建；ExcelBridge、Excel 模板及 Section A/B 抄保持 E2.171 原样。完整更新见 `CHANGELOG.md`。

E2.173 保留 E2.172 的版本／帮助／输入提示更新，并修正移位梁支承与短 CB 分类。Windows 套件沿用 E2.172 桌面宿主 EXE，网页 App 为 E2.173；未重新编译 EXE。

E2.174 讓手動畫柱保留原貼齊軸線的邊，放大／縮小不再以最後一次中心作新基準；轉換桁架移到 Scheme 2。已存舊中心的柱可重新套用尺寸修正。套件仍沿用 E2.172 EXE，網頁 App／源碼為 E2.174。

E2.175 的板尺寸與計算 L/B 採實際梁中心距，手動梁與自動梁共用跟隨支承及 CB 識別；位置、類型可獨立固定。[修改前後差異表](FramingStudio/docs/changes-e2175.md)。套件沿用 E2.172 EXE。

E2.176 集中板 L/h 輸入、逐格支承覆寫、L/h 結果及鋼筋率；共同預設移至「00 參數」。[八項修改差異表](FramingStudio/docs/changes-e2176.md)。

E2.177 板反力使用相同 L，梁頂荷載與板層自重同步去重。[跨度傳荷差異表](FramingStudio/docs/changes-e2177.md)。

E2.178 分清 SB 預設深度與主梁 Structural Zone，板資料及列表顯示中心距；柱維持 tributary area。[逐項差異](FramingStudio/docs/changes-e2178.md)。

E2.179 按構件獨立計算梁自重，板反力以原線荷載強度施加全梁跨；柱仍採 tributary area。[修改差異](FramingStudio/docs/changes-e2179.md)。

E2.180 限制 SB 不超過當層／局部 Structural Zone，並顯示加係數荷載及支承反力箭頭。[修改差異](FramingStudio/docs/changes-e2180.md)。

E2.181 將支承標示移至各端反力旁，縮短箭嘴並避免文字重疊。[修改差異](FramingStudio/docs/changes-e2181.md)。

E2.182 拒絕超過 Structural Zone 的 SB 預設輸入，移除實際深度欄，並直接標示 Factored 荷載。[修改差異](FramingStudio/docs/changes-e2182.md)。

E2.183 的 Factored 荷載／反力按計算階段向上取兩位，後續直接採用取整結果。[修改差異](FramingStudio/docs/changes-e2183.md)。

E2.184 新增梁深 D 輸入、移除梁設計額外梁頂面荷載，並修正板自動方向與反力圖。[修改差異](FramingStudio/docs/changes-e2184.md)。

E2.185 在完整 Factored 自重公式結尾取整，後續反力沿用畫面顯示值。[修改差異](FramingStudio/docs/changes-e2185.md)。

E2.186 按柱截面中心定位轉換梁集中荷載，操作介面統一 DL／LL。[修改差異](FramingStudio/docs/changes-e2186.md)。

E2.187 顯示受荷區 X／Y 尺寸，並按每塊板支承中心線區段傳荷。[修改差異](FramingStudio/docs/changes-e2187.md)。

E2.188 在受荷區上方／左側顯示 X／Y 尺寸線，面積卡及尺寸置於畫布最前層。[修改差異](FramingStudio/docs/changes-e2188.md)。

E2.189 新增量距：選兩點、放置尺寸線，支援斜距／水平／垂直及捕捉。量距不存入專案。[使用及修改說明](FramingStudio/docs/changes-e2189.md)。

E2.191 可在「幾何與出圖」多選梁並按 m 移動出圖位置，一鍵恢復 Functional Framing；計算及 Section A／B 保持原樣。[使用說明](FramingStudio/docs/changes-e2191.md)。

E2.193 出圖調整表只列已選梁／柱；框選只加入完整包住的構件。[使用說明](FramingStudio/docs/changes-e2193.md)。

E2.194 補柱接到 SB 端點、另一端已有柱或牆支承時，自動轉為 MB。[使用說明](FramingStudio/docs/changes-e2194.md)。

E2.195 加入 Shift 取消出圖選取，修正 Member Check 焦點清除，Column above 跟隨上層出圖位移。[使用說明](FramingStudio/docs/changes-e2195.md)。

E2.196 單支／批量複製柱後也會自動識別 MB；已複製的柱可再按複製修正梁類型，不會重複加柱。[使用說明](FramingStudio/docs/changes-e2196.md)。

E2.197 出圖移柱時梁端跟隨伸縮，梁身遮線及交接線裁切同步打印／SVG。[使用說明](FramingStudio/docs/changes-e2197.md)。

E2.198 補上 CB 出圖支承連動，保留 CB 支承實線，其他梁線停在 CB 邊界。[使用說明](FramingStudio/docs/changes-e2198.md)。

E2.199 取消梁類型鎖定，修正轉 SB 後尺寸及唯讀 D 的儲存，增加恢復預設尺寸。[使用說明](FramingStudio/docs/changes-e2199.md)。

E2.200 手動或已儲存 SB 跨過有效主支承時自動分跨，可分別選取及編輯。[使用說明](FramingStudio/docs/changes-e2200.md)。

E2.201 把構件布置來源與尺寸模式分開：自動梁改尺寸保留自動布置，柱可逐項跟參數。[使用說明](FramingStudio/docs/changes-e2201.md)。

E2.202 切換梁類型直接顯示預設 B／D，保留跟參數模式。[使用說明](FramingStudio/docs/changes-e2202.md)。

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

`compile.ps1` 不负责网页资源打包。修改已标记的 23 个模块后，在仓库根目录执行 `python FramingStudio/source/sync-web.py`；它只同步标记范围并保留其余网页字节。其他 JavaScript/CSS 模块仍须同步 `assets/index.html` 中对应内容；仅改 `source/` 不会自动改变运行界面。`source/build-floor-names.py` 是历史版本迁移脚本，不是当前版本的通用构建入口。

## 版本与依赖

E2.133 将确认的 Horizontal Load Path 图接入“双剖面 Section”和 Section A：红色表示水平力方向，绿色表示侧向作用的 Push–Pull 轴力增量示意。箭头贴合真实连续墙柱，转换梁标签跟随实际位置；可自动选取穿过连续墙的剖面、按方向读取 Overall B／D、反向显示或保留手动剖面。风、土、水及 surcharge 读取原 Overall 输入，缺输入保留待补，无地下室不画地下压力。此次按用户明确要求更新 Horizontal 图；Vertical、其余 A／B 内容、模板、原生程序和所有构件计算保持不变。

E2.133 检查入口：`source/tests/horizontal133.cjs`（Node / Playwright；用 `FRAMING_2015_FIXTURE` 指定原 2015 模型）及 `source/tests/preserve133.py`（Python / Git）。已通过实际模型与不同连续性几何、保存／撤销／重开、窄窗口及原生 Excel 图形导出检查。绿色箭头不代表已求解的构件总轴力或抗侧力分担。

E2.132 统一 TB／MB／SB 集中荷载的参考线节点定位，修复宽梁端面及台阶板边支承识别；Slab Support 加入自动／按区段手动指定及恢复自动。全楼 Check 分批执行，显示楼层、构件与阶段，可取消，输入改变后丢弃旧结果；清单改名“全楼检查结果”，保留真实缺输入与 NOT OK。Section A／B 抄原样保留。

E2.131 补齐侧窗确认的板 Span 与 Check：自动有效跨度、手动 L／可选 B、自重面积选择、同 Framing 共用和恢复自动。修正柱角切口导致规则板不能验算、Area 柱及 TC→TB 被无关传荷错误阻断、局部结构高度误报；Summary Check 新增可筛选及定位的全楼问题清单。保留真实缺输入、缺支承与 NOT OK。Section A／B 抄及原生 Excel 模板、程序不变。

E2.130 在 Summary Check 的梁 Support 中加入 Span L（m）：默认自动识别，可手动修改及恢复自动。保存后同 Framing 共用，联动荷载图、内力、反力、下传荷载及 A／B 原有验算字段。平面几何不变；自动面荷载按跨度比例换算并保留各段合力，梁自重按计算跨度计取；手动荷载坐标保留，越界提示修正。Section A／B 抄的排版、模板及原生程序保持原样。

E2.129 将 Loading 改为轴线整格／矩形楼面选区，统一覆盖板面与梁顶，并显示有效面积；梁线仅作可隐藏参考。新增区域覆盖重叠部分且可撤销。Summary Check 显示所选梁实际宽、深；荷载图按平面左→右／上→下及实际作用长度显示，连续相同梁顶荷载段合并展示。既有计算与 Section A／B 抄保持原样。

E2.128 将“重新布置”统一移到梁布置顶部。点击后清空当前 Framing 的梁、墙和板，保留已有柱的位置和尺寸，应用到同类型全部楼层并可撤销。之后可分别自动画主梁、次梁或手动画梁；Section A／B 抄保持原样。

E2.127 移除 Member Check 的通用说明、初次计算提示和勾选说明，以及板设置中的传荷及共用设置说明。计算与操作保持原样，输入变化和支承冲突提示保留；Section A／B 抄不变。

E2.126 补齐梁顶 SDL／LL，梁自重仍按全截面、板自重按净面积；板验算使用有效跨度，传荷按实际净范围。页面排版和 Section A／B 抄保持原样。

E2.125 在 Summary Check 点选柱时，在 Framing 平面图标明本层受荷面积及范围，并移除柱面板内重复的荷载区域明细块。面积和本层 G/Q 读取同一套原有面积法数据；计算及两个抄未改。

E2.124 精简 Summary Check 的柱面板：突出本层 G/Q，保留累计荷载和逐层明细，移除重复的柱尺寸、受荷范围控件和柱验算块。柱仍按原面积法计算，详细验算沿用 Member Check。梁支承自动完整识别时默认收起手动 Support，待确认和手动支承保持展开；计算及两个抄均未改。

E2.123 将“梁”窗口改名为 **Summary Check**，在原梁／板面板中加入柱受力查看：本层、上部和累计 G/Q，逐层面积，验算轴力与原柱 Check 结果。可隐藏受荷范围，或打开该柱的 Member Check。荷载与面积使用既有输入，查看时不勾选报告、不改变项目。菜单为“梁布置 → Loading → Summary Check → Member Check”。新增检查为 `source/tests/summary123.cjs` 和 `preserve123.py`。

E2.122 修正梁荷载图的反力显示：竖向反力已算出而构件弯矩／抗扭设计待补时，同时显示数值和待验算提示。接墙、接柱一致；真实缺荷载或缺支承仍阻止反力显示。计算程序和两个抄均未修改。新增检查为 `source/tests/reaction122.cjs` 和 `preserve122.py`。

E2.121 菜单顺序为“梁布置 → Loading → 梁 → Member Check”。在“梁”页加入板计算面板：点选板后查看或修改板厚与单向方向，查看实际支承分段、荷载、反力、尺寸初筛和配筋结果。面板与 Member Check 共用输入，打开面板不会改变 Check/A/B 勾选。保留净板区、梁布置、中心线／端点／中点、板方向显示开关、局部净高／E&M／结构区等既有功能。

本版修复柱截面侧面参与板支承时的漏判、手动短梁深度被自动值覆盖、上层柱显示截走本层传荷及转换柱落点只匹配参考线的问题。梁柱重叠支承只计一次；缺支承、多根转换梁争接、非矩形板超出原 Excel 范围时仍需处理提示，不会强制通过。五个年度模型已运行回归，未发现此前的公式异常；部分模型仍有待确认输入和未通过的构件。

当前检查入口：`source/tests/slab121.cjs`（新板面板、柱面分段、短梁及转换传荷）、`preserve121.py`（相对 E2.120 的报告与模板保护）、`geometry120.cjs`、`clearance119.cjs`、`loading115.cjs`、`layout116.cjs` 和 `support117.cjs`。新版保留旧项目数据映射与输入；建议打开原项目后另存一份。

E2.117 将梁页调整为先 Support 后 Loading，各自保存；识别到的柱／墙／梁编号与自由端在上方显示。保留原支承和传荷规则，支承保存不会丢掉未完成的荷载草稿。

E2.116 将梁布置侧栏接入正式软件：主梁、次梁与板方向各自折叠，布置应用于当前 Framing 的所有楼层，可分别重新布置、删除单根梁、连接端点与中点；新布置的普通板默认沿短跨，可点击或拖框修改方向。梁原有荷载、实际 Support、反力、尺寸与手动设置保留。Member Check 增加配筋示意图，点击标注编辑，仍使用原保存及检查流程。

E2.115 的全截面梁自重、净面积板自重、荷载向上取两位小数、柱逐层面积与 TC → TB 传荷继续沿用。

Section A / Section B 两个抄仅在用户明确要求时修改，详见 `AGENTS.md`。E2.133 的授权例外为 Horizontal Load Path 图；其他文字、横线纸、格式、表格、图示及分页规则保持不变，现有字段的计算数值随输入更新。Excel 模板和原生计算桥接程序未改。

E2.117 验证：4 组贴边 CB 支承及分步保存检查通过；86 个原文件字节一致，报告处理和样式未改。当前入口为 `source/tests/support117.cjs`（Node/Playwright，可用 `CHROME_PATH` 指定 Chrome）及 `source/tests/preserve117.py`（Python + Git，使用 E2.116 历史版本）。E2.116 的荷载、梁布置模块保持原样，原 55 项荷载与 9 组界面检查留作回归；测试均用独立数据。

第三方组件保留其随附许可文件。本仓库未另行授予开源许可。
