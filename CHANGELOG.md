# 版本记录

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
