# 版本记录

## E2.113 — 2026-10-01

- Section A / B 抄的表格文字水平、垂直居中，多行文字整体居中；遮住单元格内部的线纸横线，避免文字贴线或被穿过。保留加粗表格边框。
- Deflection 的 B、D 两面根据当前输入自动计算并比较，移除手动 Check 按钮。风荷载、材料、楼层或墙柱选择变化后自动更新；资料不足仍提示，不显示通过。
- 当前样例 A 14 页 / B 6 页，13,000 个正文字符和数值保持一致；表格居中、续表和浏览器交互检查通过。
- 8 组自动计算情景与原手动 Check 结果一致；计算公式、Excel 模板、VBA 及生成 Excel 页面未改。

## E2.112 — 2026-10-01

- Floor Summary 所有文字水平居中；Section A/B 表格边框加粗至 0.9 pt。
- Vertical / Horizontal Load Path 用蓝色结构及 Foundation 框，红色传力箭头，保留绿色水平推拉箭头；增加图下标题并按照片更新默认 Horizontal Stability 文字。
- Wind Load 示意图移到右上，H/B/D 和参数在左，后续计算连续排版。保留当前项目数值和风压算法。
- 无地下室时隐藏不适用的 Soil/Uplift 内容；Sliding / Overturning 隐藏确定为零的荷载及无用自重分区，适用但缺失输入的项目仍显示。
- Deflection 保留关键假定、截面图、惯性矩与挠度公式/代入值/结果，删去重复长说明。
- Foundation Recommendation 移到 Foundation 验算抄后。
- 6,199 项原生计算核对无差异，Excel 模板/VBA 和模型输入未改。Section B 正文/数值与 E2.111 一致。
- 当前样例 A 14 页 / B 6 页；13,000 个正文字符与 501 行横线检查通过，40 行楼层表续页无漏行。

## E2.111 — 2026-10-01

- Floor Summary / Design Assumptions 接在首页正文后；不足时续页，跨页楼层表重复正确表头。
- Robustness 与 Other Considerations 合为一页；当前样例 Section A 从 18 页减为 16 页。
- 按云线删除首页抬头、圈选编号、Design Appraisal 行、Framing 顶部说明和图例下方三行说明、Overall 正文重复页号。
- Floor Summary 增加现有 Loading 中的 SDL，删除 Floor Height / Headroom / EM Zone 三列，保留 Structural Zone。
- Load Path 删除轴号、轴圈和圈选楼层/层高标注，保留跨距尺寸；受力符号图例移到右上。
- Deflection 墙编号加大、加粗，并用引线对应墙段，应用于 B、D 两方向。
- 6,199 项原生计算核对无差异；Section B 六页逐页图像与 E2.110 一致。模板/VBA 与项目输入未改。
- 40 行楼层表续页测试通过，每行恰好出现一次，各表格续页均有正确表头。

## E2.110 — 2026-10-01

- Section A/B 正文、公式及表格文字按参考线纸的横线排版。
- 修复双线、表格边框断续及多行单元格错位。
- 修正 Deflection 图旁正文排版，以及 Foundation 标题和正文左对齐。
- 保留 Load Path 图内箭头、轴线、距离和楼层标注的相对位置。
- 改善分页和续表头；修复带前导空格的原生 PDF 结果行遗漏。
- 保留 Section A 彩色 Framing 每张 A4 两图、左图右图例布局。

当前项目 A 18 页 / B 6 页、多楼层测试模型 A 23 页 / B 9 页均已渲染检查；正文与计算字符比对通过。此次仅调整排版，未重新进行工程计算。

仓库导入时保持 App 运行文件及源码与 E2.110 发布文件逐字节一致。历史发布包、个人项目、测试 PDF 及本机备份没有上传。
