## E2.173 — 支承座標同步及短懸臂梁分類

- 支承識別同時接受原參考線與柱移位後的實際中心線，實際接點映射回原參考跨度的荷載位置；保存的構件荷載和選取鍵保留。
- 自動 MB 失去柱支承後，按短跨優先建立有固定端的 CB，更新實際 kind、梁號顯示、編輯選單及計算類型，再重新判定其餘梁的支承；手動指定的 MB 保留。
- 新識別或手動轉換的 CB 自由端延伸至連續建築外邊界；如穿 Opening 或造成梁重疊，保留端點並提示核對。
- 刪柱範例：短橫梁 CB-02 由 7.25 m 延伸至 8.00 m，上下兩段 MB4／MB6 維持 MB；F04 的 28 條 SB 支承誤報消除，80 條梁保留。
- 新增可重現的幾何／傳荷回歸，核對正反方向、共用樓層、重載、編輯／刪除、恢復柱及 Opening 阻擋。55 項既有荷載、12 項桁架整合及 11 項下游傳荷回歸通過。
- Section A／B 報告內容與格式、Excel 模板及原生執行檔不變；依先前指示不重編 EXE，Windows 套件更新網頁 App 和源碼。

## E2.172 — Issue #3 已确认的界面小修（2026-10-07）

- PR #1 与 #2 合并后的树与 PR #2 E2.171 完全一致；Truss 已在 E2.143 集成，合并历史不覆盖 E2.171 内容。
- 新增 version.json 统一版本来源；网页标题、顶部标记、页脚、Windows 标题／状态栏与程序版本保持一致。
- 更新使用说明以匹配现有菜单和保存／检查／导出入口；不移动菜单，不改页面布局。
- 常用数字输入清理浮点尾数，只改变显示，不改未编辑的模型数值。
- 输入触发事务校验失败时，保留错误值，在该字段旁显示原因；错误未修正时阻止保存。成功修正仍使用原事务、撤销与保存流程。临时通知移离缩放按钮。
- 177 个原计算、Excel/VBA、报告及其他源文件与 E2.171 字节一致；其他内嵌模块和样式内容对照通过。新增事务回退及数值显示回归，实际界面核对错误、保存阻止、修正和帮助。
- 桌面宿主仅重建版本标识；ExcelBridge 与报告模板未重建或修改。Issue #3 其余布局和功能建议留待单独确认。

## E2.171 — CB 跟柱闊及 SB 按主梁 bay 分間

- 現有 CB 一次性轉為跟柱闊，新畫 CB 亦預設跟柱；之後明確輸入的手動梁闊仍保留，留空可恢復跟柱。
- MB／CB／TB 均屬主梁，SB 在各主梁圍成的 bay 內獨立等分。梁端接入另一主梁截面時，以接收梁中心補足 bay 邊界，不因端點小幅偏差把相鄰 bay 合併。
- 修復受 bay 邊界變化影響的舊自動 SB 布置，保存 SB 所屬 bay；未受影響布置及有構件輸入的原 SB 不靜默重排。自動 CB 與 SB 分開保存，重排 SB 不會刪走 CB。
- 項目副本：CB_1／CB_2 由 1000 跟柱變為 1500 mm；右側三個 bay 分別有 4／7／4 條 SB，間距 2.45／3.00／2.45 m，無新增模型提示。
- 新增 bays171 回歸，涵蓋舊布置、主梁分類、共用 Framing、柱改尺寸、手動覆寫、重載及構件輸入保留。Section A／B 格式、Excel 模板及 EXE 不變。

## E2.170 — 新增中間柱後 MB 自動分跨

- 生成模型時按當層承重柱重新分割既有 MB，涵蓋保存的自動梁布置及手動畫梁；新柱位於梁中間時自動形成獨立跨度。
- 保留截面、方向及原跨度覆蓋範圍，分段梁使用獨立梁號及支承關聯；支援共用 Framing、多支中間柱，以及分段後的尺寸修改和單支／批量刪除。
- 不以僅上層柱或梁外的柱分段；有原跨構件輸入時先保留原梁並提示核對，不靜默丟失手動跨度、荷載或配筋設定。
- 項目副本核對：MB21 在 Y=25 m 分為 MB21-1／MB21-2，各 12 m；兩跨皆有計算結果，38 條次梁保留，未新增模型提示。
- column-split170、短跨主梁、主次梁連接、55 項荷載斷言、12 項桁架整合及 11 項下游传荷測試通過。Section A／B 格式、Excel 模板及 EXE 保持不變。

## E2.169 — 修正檢查完成後表格空白

- 修正舊 MODEL／構件篩選已不在新結果中，畫面顯示「全部」但內部仍按舊值篩選，造成有結果卻沒有資料列的問題。
- 篩選選項及篩選條件使用同一份列表；已失效的選擇自動回到「全部」，仍有效的選擇保留。返回的新狀態也會列入選單。
- audit-filters169 先在舊版重現 119 項結果但 0 列，再驗證修正後顯示全部 119 列；同時核對有效篩選、零交集、新狀態及空結果。
- 本機及含 Transfer Truss 的 PR 版均通過；柱建議連續套用／手動更新 Check 回歸通過。Section A／B、計算、模型及 EXE 不變。

## E2.168 — 不再提示未生成的舊自動梁

- 舊自動梁快照因越界、Opening 或與現有梁衝突而未生成時，不再列出模型提示，也不再出現在 Summary Check。
- 保存原記錄，生成的梁及尺寸保持不變；現有構件的 Check／傳荷問題、手動畫梁的模型錯誤仍照常顯示。
- dormant-beams168 測試核對未生成記錄、重疊記錄、實體梁不變、原記錄保留及現有錯誤仍可見；本機與 PR 整合版本均通過，主次梁連接回歸亦通過。
- Section A／B 報告、Excel 模板、計算及 EXE 保持不變。

## E2.167 — 構件 Mark & Size 圖例開關

- 新增柱、MB、SB、TB、CB、牆及 Slab 的獨立 Mark & Size 開關；平面圖以兩行顯示，上行標記、下行尺寸，尺寸單位為 mm。
- 直向梁及牆的標註隨構件旋轉 90°；使用實際顯示梁號，柱標註對應當層柱，隱藏構件時一併隱藏其標註。
- 保留原有圖注開關，避免同類構件重複標記；新控制只影響螢幕平面圖，不修改模型、工程計算或 Section A／B 報告。
- 新增 member-labels167 回歸：七個獨立開關、梁號與尺寸、上下行次序、直梁旋轉、可見性及項目資料不變；本機版及含 Transfer Truss 的 PR 版均通過，並核對畫面。

## E2.166 — 柱縮小時恢復原軸線定位

- 修正放大後保存的柱中心被當成永久基準，導致由大改細仍留在大柱中心的問題。
- 保存中心與原軸線／柱定位規則一致時，改尺寸前解除衍生中心，按新尺寸重新定位；真正另行偏移的中心仍保留。
- 支援舊項目已有的大柱中心、單改 B／D、批量修改及共用 Framing；不改延後全樓 Check 的操作。
- 新增 column-resize166 回歸：手動／自動柱、放大縮小及重載、舊資料修復、定位與偏移保留、無效尺寸整批回滾。
- 柱參數表、柱界線／延後 Check、主梁中心及主次梁連接回歸通過；Section A／B、Excel 模板及 EXE 未改。

## E2.165 — 主梁及相連次梁一起跟隨柱中心

- 修正一端接柱、另一端接轉換梁的自動主梁，以及同一直線的分段主梁，沒有跟隨柱中心的問題。
- 次梁端點跟隨已接受的新主梁位置；保留次梁間距、牆面連接、梁號及原荷載參考線。
- 整組驗證主梁範圍及重疊；調整被拒絕時，次梁不會連到無效的新位置。不強制改動手動畫梁或不一致的柱中心線。
- 新增可獨立執行的 beam-network165 回歸測試，並用 F03 項目副本核對 MB26 分段及 SB28–SB34。
- 按使用者要求，每次完成修改均建立或更新 PR，列明改動與測試結果。此次只更新網頁程式及源碼，未重新生成 EXE。

## E2.165 PR integration — 2026-10-07

- Integrate E2.144–E2.165 framing, loading and column updates with the existing Transfer Truss implementation on main.
- Keep the current main desktop host and Excel bridge; update the bundled web app and source without rebuilding executables.

## E2.164 — 自動主梁中線跟隨柱中心（預覽）

- 修正保存的自動 MB 只跟柱更新梁闊、仍沿用舊中線的問題；兩端柱中心可形成有效正交梁時，優先更新實體梁端點。
- 保存支承柱關聯以供後續移動／加大使用，保留梁號、原荷載參考線及輸入；不強制移動會越界、穿 Opening 或重疊的梁。
- 以 F03 MB19 重現並驗證 X 20.50 → 20.25 m，同列 MB21／MB23 同步對齊，108 根梁及既有荷載設定保留。
- 驗證柱加大、重新載入、延後全樓 Check、牆受荷、同 bay 板方向及重複梁合併；Section A／B 報告與 Excel 模板保持不變。

## E2.163 — 合併柱尺寸更新後的重複梁記錄（預覽）

- 僅合併各共用樓層均確認重複、同尺寸及同位置的跟柱寬 MB；端點差異須完全位於支承柱內。
- 保留現有有效梁和完整舊記錄備份，轉移相容的選取／報告選項；獨立荷載、支承參照或設定衝突仍保留供核對。
- 不按底線或梁號格式刪除。以最新項目副本驗證 F02 保持 81 根有效梁，各層梁／柱／板幾何不變。
- 保留手動更新全樓 Check 的操作及 Section A／B 報告、Excel 模板。

## E2.162 — 跟柱梁寬更新及最終模型提示（預覽）

- 跟柱寬的 MB 加寬後可向內調整實體截面，保留梁號及傳荷參考線；仍檢查完整樓面／Opening 範圍及重疊。
- 優先保留已有效放置的梁；調整後與現有梁衝突時列明對應梁號，保留原始記錄，不生成重複構件。
- 模型提示依各樓層完成局部樓層處理後的模型收集，移除中途 Framing 模型造成的矛盾提示。
- 已以項目副本及柱加大測試驗證，並通過柱界線／延後 Check、牆受荷及同 bay 板方向回歸；Section A／B 報告與 Excel 模板不變。

## E2.161 — 等跨板沿用同 bay 方向（預覽）

- 未指定方向的等跨板，沿用同一主梁／牆 bay 內其他板的一致已知方向；不跨 bay、不循環推斷。
- 保留手動方向及懸挑板固定邊；無參考或方向衝突仍提示選擇。圖上箭嘴、板計算與傳荷共用判斷。
- 已驗證等跨板傳荷與手動指定相同方向一致；保留 Section A／B 報告及 Excel 模板。

## E2.160 — 當層柱選取框（預覽）

- 選取框沿當層柱完整截面繪製，避免只框住與上層柱重疊的局部；標示柱號及樓層。
- 已驗證當層 1500、上層 1000 的重疊情況；不改受荷面積、荷載計算或 Section A／B 報告。

## E2.159 — 修正偏心柱的零受荷面積（預覽）

- 幾何 tributary area 統一使用實際柱截面中心，避免已對齊／複製柱與有基準位置偏移的柱混用中心和軸線參考座標。
- 以 F04／AC12 的已觀察座標重現舊版 0 面積，驗證修正後為 28.6875 m²；柱＋牆面積守恆、無重疊，G／Q 及原報告數值一致。
- 不修改構件座標、尺寸、手動面積或 Section A／B 報告格式；不自動觸發全樓 Check。

## E2.158 — 牆組受荷面積與自動 MB 梁闊（預覽）

- 牆組按相鄰支承半跨取得獨立 tributary area，扣除 OP／刪除樓板；柱面積扣除牆組範圍，避免重疊。
- Summary Check 點牆可查看牆組面積、逐層 DL／SDL／LL 荷載合計及平面範圍；連續牆組逐層累計，相連牆肢不重複。
- 已保存的自動 MB 布置仍隨柱更新梁闊；手動指定梁闊保留，更新時檢查邊界／梁衝突。
- Section A／B 報告與 Excel 模板格式保持不變；只更新相關計算結果。本次為本機預覽。

## E2.157 — 延後驗算與柱邊界（預覽）

- 套用建議後保留上次清單及其餘套用按鈕，標示待更新；只有手動按更新才重新 Check。
- 柱放大越界時嘗試最小幅度向內調整，無法放下則整批拒絕；單柱及批次尺寸編輯共用檢查。

## E2.156 — 所選柱參數表（預覽）

- 多選柱顯示所選柱的 B、D、中心座標及基準位置；B／D 可逐行或批次修改，留空保留原值。
- 共用 Framing 同步，保留選取，整批可一次撤銷。

## E2.155 — 套用柱尺寸建議（預覽）

- Summary Check 增加逐柱套用欄及套用全部樓層按鈕；共用 Framing 取各層最大建議尺寸。
- 整批可撤銷，拒絕過期建議及導致柱無法生成的尺寸；套用後提示重新驗算。

## E2.154 — 柱尺寸建議（預覽）

- Summary Check／Member Check 的柱失敗提示改為 500 mm 遞增尺寸建議，按設定目標鋼筋率優先選尺寸，實配仍受 4% 上限限制。
- 建議不自動修改構件；原始驗算及 Section A／B 報告保持不變。

# 版本记录

## E2.153 Preview - 2026-10-07

- Set the RC column reinforcement ratio maximum to 4% for automatic selection, manual checks, shared input validation and the active v109 Excel template.
- Preserve Section A/B report content, layout, native VBA and prior template/release versions. No EXE build or GitHub upload.

## E2.152 Preview - 2026-10-07

- Restore rotation and panning in the beam-layout 3D view by restricting slab pointer handling to the plan view.
- Apply the Loading beam-reference switch to 3D beams as well as plan reference lines.
- Preview only; calculations, Section A/B reports, Excel templates and EXE are unchanged, with no GitHub upload.

## E2.151 Preview - 2026-10-07

- Place non-default slab thickness numbers beside each slab direction symbol. Keep numbers inside the slab, rotate in narrow panels and remove external leader labels.
- Preview only; calculations, reports, Excel templates and EXE are unchanged, with no GitHub upload.

## E2.150 Preview - 2026-10-07

- Use numbers only for non-default slab thickness labels. Prefer labels inside slabs and rotate 90 degrees when horizontal space is insufficient; retain readable callouts for very small panels.
- UI-only preview update; no changes to calculations, reports, Excel templates or EXE, and no GitHub upload.

## E2.149 Preview - 2026-10-07

- Add the default 200 mm note beside slab direction controls. Annotate non-200 mm slabs in the beam-layout plan independently of direction visibility; use leader labels when panels are too small.
- Keep calculations, reports, Excel templates and the Windows package unchanged. Preview only; no EXE build or GitHub upload.

## E2.148 Preview - 2026-10-07

- Add MB (including TB/CB) and SB parameter tables for selected beams only. Edit beam type and width per row or apply to selected beams, while displaying span and the existing automatic depth.
- Synchronize shared Framing floors, preserve Loading/Check inputs when changing type, retain selection after automatic-beam edits, reject conflicting geometry atomically and support undo.
- Beam-table, slab-table and selection-scope browser tests pass. Reports, Excel templates and the Windows package remain unchanged; no EXE build or GitHub upload.

## E2.147 Preview - 2026-10-07

- Show only selected slabs in the thickness table. Remove apply-all, select-all, clear-selection and table-save buttons; commit individual thickness edits on blur or Enter and retain apply-to-selected.
- Preserve shared Framing synchronization, undo and existing reports. Preview only; no EXE package or GitHub upload.

## E2.146 Preview - 2026-10-07

- Add a Slab thickness table with individual row edits, plan/table selection, apply-to-selected and apply-to-all actions. Thickness changes synchronize all floors sharing the Framing.
- Preserve pending table edits during selection; validate the complete update before applying it and support one-step undo. Reuse existing slab thickness storage and self-weight calculations.
- Verified partial/all edits, shared and unrelated Framings, saving/reopening, self-weight, invalid inputs and selection regressions. Section A/B reports, Excel templates and EXE remain unchanged; no package or GitHub upload.

## E2.145 Preview - 2026-10-07

- Move saved Loading group editing into the matching legend rows and remove the duplicate saved-group table. Preserve the original floor range, merged-source selection, covered settings and group deletion inside the editor.
- Verified edit/save/undo, current-floor legend deletion and multi-floor group deletion. Reports, calculations and EXE are unchanged; no package or GitHub upload.

## E2.144 Preview - 2026-10-07

- Loading area includes column footprints. Apply their surface loads directly to the corresponding columns once; retain net slab concrete and existing beam-top allocation.
- Recover column holes within saved selection rectangles for both the legend and geometric column load regions. Keep openings, slab voids, walls and exact-coordinate boundaries.
- Verified load conservation, regional inputs, reopening, multi-floor accumulation and existing geometry regressions. Report rendering, Excel templates and EXE remain unchanged. No Windows package or GitHub upload, as requested.

## E2.143 - 2026-10-07

- Rotate Loading area names 90 degrees when a complete horizontal label does not fit; restore horizontal labels when space permits. Keep badges inside visible loading surfaces and away from openings.
- Verify narrow Shop labels, resizing, fallback labels, opening avoidance and actual canvas rendering without modifying project data. Preserve Section A/B reports and native Excel templates.

## E2.142 Windows - 2026-10-06

- Package the verified E2.142 preview as the Windows app, including combined MB/TB/CB selection and independent SB/Slab selection.
- Section A/B reports, workbook templates and Excel bridge are unchanged.

## E2.142 Preview - 2026-10-06

- Combine TB and CB into the MB tab. MB selection and batch deletion include MB, TB and CB; SB and Slab remain separate.
- Keep three tabs and clear selections when switching tabs. Keyboard and inspector deletion respect the active tab.
- Tab-scope and member-multiselect regression tests passed. Section A/B reports and the existing EXE are unchanged; no Windows package generated as requested.

## E2.141 預覽 — 2026-10-06

- MB／SB／Slab 分頁只選取及刪除自己的構件類型；新增 TB／CB 分頁，維持獨立多選及刪除。
- 切換分頁清除選取與右鍵視窗；鍵盤 Delete、批次刪除及構件視窗刪除都遵守目前分頁範圍。
- 已驗證不同種類同時可見、框選、切頁、右鍵、鍵盤及撤銷。報表與 EXE 未更改；依使用者要求暫不重建 Windows 包。

## E2.140 — 2026-10-06

- 修正「已儲存的 SB 分區」套用時清除分區外次梁的問題。區域布置僅替換分區內完整的自動次梁，合併保留區外原有梁與編號。
- 保留主梁、手動梁、區外刪除記錄、荷載及報表勾選；重複套用、預覽取消、一次撤銷及存檔重開已驗證。
- 「全部區域」仍可重新布置整個 Framing。Section A／B 報表及原生 Excel 模板保持原樣。

## E2.139 — 2026-10-06

- 轉換梁顯示名稱統一以 TB 開頭，例如 MB20 顯示為 TB20；承托標籤、構件資料及 Check 名稱一致，原有荷載識別保留。名稱碰撞時加入後綴。
- TC 圓圈交叉標記對齊上層柱實際截面中心，包括柱相對軸線偏移的情況。
- 保留現有傳荷計算、Section A／B 報表格式、Excel／VBA 及模板。

## E2.138 — 2026-10-06

- 按每層上層柱落點及實際支承路徑，自動把唯一承托的 MB／SB 識別為 TB；已有直接下層柱或牆支承時保留原類型。
- 多梁交點沿連續承托梁及分段梁的傳荷路徑判定；有歧義、無可靠支承或手動支承衝突時保留待確認提示。
- TB 標示、上層柱點荷載及下層柱受荷面積採用同一判定；保留梁荷載、Check 及 Section A／B 勾選。移動或刪除上層柱後重新判定。
- 維持 TB 尺寸編輯、批次刪除、自動布置及共用 Framing 的分層判定；梁深使用當層結構高度。
- Section A／B 報表內容、格式、Excel／VBA 及模板未改動。

## E2.137 — 2026-10-06

- 柱支援累加框選、全選當層、批量刪除及複製至上下層；複製保留柱基準點、截面位置與尺寸，非當層柱僅作參考。
- 牆、MB／SB／TB／CB 及樓板支援累加多選、Delete 批量刪除及一次撤銷。梁分頁移除大型多選面板。
- 自動主梁優先由較短且已有可靠支承的梁承托長梁，並分段長梁；明確重新自動布梁可恢復已刪梁，重複操作不產生重疊副本。
- 修復 Framing 類型複製介面；窄結構區的高度標籤可旋轉顯示。
- Section A／B 抄的內容、格式、圖示、分頁、Excel 模板及原生 Excel 程式保持原樣。

## E2.136 — 2026-10-06

- 柱 tributary area 優先分配由相鄰柱、牆及外邊界界定的規整長方形；較大的跨缺柱範圍取得餘下區域。同等條件保留等距分界，分配不依賴柱的編號或儲存次序。
- 完整矩形合併為單一範圍；Opening 及樓板缺口仍扣除，畫面、柱荷載及現有報表欄位使用同一面積。
- 驗證規整區、餘下區、面積守恆、不重疊、柱次序、分區荷載和 Section A/B 計算一致。報表格式、Excel/VBA 與模板保持原樣。


## E2.135 — 2026-10-06

- 梁布置以實際截面闊度檢查重疊，不再只比較中心線端點。
- MB／柱已佔用的邊界帶不再自動生成無效短 SB／CB；正常垂直接駁及端對端接駁保留。
- 手動畫梁遇到重疊會拒絕新增。舊手動重疊梁保留輸入並提示未生成，避免重複計算；無效自動梁快照不再顯示。
- 梁落在牆上的正常承托保留。Section A／B 報告格式、Excel 模板及原生計算程式未改。

## E2.134 — 2026-10-06

- 局部層高 Area 整合到各項設定；局部結構高度上限為 30 m，樓層頁在未劃建築區域前亦顯示結構區。
- 梁布置分為 MB／SB／Slab 分頁；SB 支援框選區域、預覽及套用。「重新布置」保留柱和牆。
- 自動主梁對齊柱中心；加柱、切換柱輸入模式不會自動重排梁。柱分頁顯示梁中點並支援吸附加柱。
- 加入柱座標表、複製至上層／下層；非當層柱只供參考。
- 上方圖例可切換板受力方向；Loading 名稱自動避開 Opening，必要時分行。
- MB／TB／CB 梁深採用當層及局部可用結構高度，跨區採較小值；尺寸、自重、傳荷及 Check 同步。普通 SB 保留現有梁深規則。
- Section A／B 報告文字、版面、模板及原生 Excel 程式保留；核准的計算修改只更新既有欄位數值。

## E2.133 — 2026-10-04

- 将已确认的 Horizontal Load Path 预览接入正式“双剖面 Section”及 Section A。蓝色为实际构件，红色为水平作用方向，绿色为侧向作用引起的 Push–Pull 轴力增量示意，不标作求解后的轴力或受力分配。
- 按实际截面与连续高度识别墙柱；取消按建筑总高固定摆放绿色箭头。低层裙房柱、缺层柱及不连通墙体不会补造高层传力路径，转换梁标签定位到实际梁，局部分段合并显示。
- Horizontal 可自动选择穿过连续墙的剖面，显示实际坐标；原剖面已合适时保留。2015 模型为 Y=29 m、X=8.25 m。可关闭自动选位，原手动位置及 Vertical 的剖切设置保持不变。
- 水平方向默认按剖面读取 Overall B／D，可手动选择荷载面及正／反方向。风、土、水及地面 surcharge 使用原 Overall 输入；无地下室不画地下压力，缺输入不套用示例，零 surcharge 不画荷载。选定楼层范围时按真实标高截取压力图。
- 通过实际模型、低层裙房、纯框架、柱中断、不连通墙及墙内剖面测试；正反方向、自动／手动、报告单图／双图、撤销、保存重开、窄窗口通过。Windows 独立启动及保存重开通过，原生 Excel 报告图形导出及 16 个既有数值对照通过，PDF 页面已目视核对。
- 153 个原文件逐字节相同，原生 Excel 模板及程序不变。仅 Horizontal 图属于本次授权修改；Vertical、其余 A／B 抄的文字、表格、格式与分页不变，构件计算及用户项目文件未改写。

## E2.132 — 2026-10-04

- TB／MB／SB 的集中荷载按参考线及节点统一定位。转换柱采用柱参考节点，Area 向下分配与梁反力使用同一落点；梁宽、截面偏置不改变该点的坐标。真实偏离参考线的柱不再由梁宽补造连接，可能受影响的 TB 保持待确认。
- 板支承使用实际净边界的每个区段，包括宽 TB 的端面。梁侧面与端面在交界处重叠时，优先沿板边的侧面；只有端面相接的区段按合力传为梁上的集中荷载，不再生成零长度线荷载。X／Y、梁端反转、洞口及外围台阶共用该规则。
- 在既有 Slab Support 加入自动识别／手动指定。每段实际板边可选择相接的梁、墙或柱，支持同 Framing 共用、保存后更新、恢复自动、撤销与项目重开。方向或几何改变造成记录失效时明确提示，不静默改接其他构件。
- 保留之前的板手动 Span、板宽及自重面积选择；手动支承参与自动有效跨度、实际反力和下游荷载。板独立验算与真实传荷待确认继续分开，真实不规则板仍需要用户确认适用的手动 Span。
- 全楼 Check 分批执行，显示当前阶段、楼层及构件，支持取消；检查期间输入改变或打开其他项目，旧结果作废。缓存同层结构高度区域，减少重复计算；不改变 Check／A 抄／B 抄的勾选。
- “全楼问题清单”改为“全楼检查结果”，区分缺输入、真实未通过及传荷待确认，不把缺 Loading 或 NOT OK 归为软件故障。
- 原 2015 模型的七块台阶板以测试用手动 L=3 m 复现，支承完整、G／Q 守恒；C02／C16 在下层 TB 的落点为 4.00 m。仅在内存测试副本使用这些诊断输入，未改写用户项目或替用户确定设计跨度。
- 4,310 个构件的诊断全楼检查约 31 秒，验证进度、取消、输入失效及界面响应；仍有 298 项真实 NOT OK。通过旧梁 Span、Loading 面积、边界拓扑、柱 Summary 和新增分段 Support 回归。
- 10 组原生 Excel 对照共 365 个数值一致，包含本次修复直接影响的 2015 TB_004；Windows 启动、布局、保存及重开通过。140 个受保护文件逐字节相同，Section A／B 抄的模板、内容、格式、图示、分页及原生 Excel 程序保持原样。

## E2.131 — 2026-10-04

- 在原有板设置内加入计算跨度：默认自动有效跨度，可手动输入 Span L、可选板宽 B，并恢复自动。Summary Check 与 Member Check 共用数据；保存即更新板 Check，同 Framing 各层共用，支持撤销及项目重开；刷新不会覆盖未保存的输入。
- 手动 L 同步到原 Section A 初筛和 Section B 验算输入。Section B 自重面积可选 L×B 或原净面积，自重按所选面积传至实际支承；楼面 SDL／LL 范围、梁顶荷载与模型几何不变。Section A 总 DL 继续读取 Loading 的含自重输入。
- 柱角切口只影响实际净板区，不再把被柱占去边角的规则单向板误判为不可计算的异形板；按实际支承分带求控制有效跨度。真实洞口、自由端切口及内部柱仍保留自动适用性提示。
- 手动板验算与实际传荷状态分开，缺少支承时仍明确标出传荷待确认并阻止相关下游梁反力；不会由手动 Span 补造支承或消除真实模型问题。
- 柱 Area Check、TC→TB 的 Area 荷载不再继承无关上部板梁的反力错误；缺总 DL、缺实际承托或多个承托等错误仍保留。梁板反力路径的问题单独显示。
- 局部结构高度提示使用构件所在区域的净高／E&M 预留高度；全楼问题清单使用真实计算结果，按楼层、构件与状态筛选并定位，保留 Check／A 抄／B 抄原勾选。
- 通过板手动跨度、实际界面保存／撤销／重开、悬臂固定边、边界板区、Area 传荷及既有梁 Span 回归。原生 Excel 8 组、250 个数值对照一致。2015 模型几何保持原样，待输入构件由 3055 降为 846，另有 108 项真实 NOT OK，未强制改为通过。
- Section A／B 抄的内容、格式、图示、分页、Excel 模板及原生程序均未修改；此次仅更新既有字段读取的计算值。沿用先前的 Loading 轴线整格选区、梁顶覆盖、方向／长度比例和梁 Span。

## E2.130 — 2026-10-04

- 在现有 Summary Check → 梁 → Support 中加入 Span L（m），默认读取当前梁几何跨度；可手动修改、恢复自动，经“保存 Support”生效。同 Framing 共用，支持保存重开与撤销；不加入侧窗曾预览的自动梁深及批量面板。
- Span 共用于荷载图、弯矩、剪力、反力、梁向下传荷、Section A 尺寸初筛及 Section B 验算；原报表既有输入字段读取同一数值。
- 平面几何、板受荷面积和实际连接不变。自动荷载位置按 L / 原跨度换算；线荷载强度按原跨度 / L 换算，保留每段合力，集中力数值不变。先按原规则取荷载小数，再换算且不重复取整；梁自身均布自重按全截面及新 L 计算。
- 手动荷载继续以米从原 A 端输入，不自动拉伸或截掉。超出新 Span 时提示修正并停止相关反力计算；已有未保存荷载草稿在调整跨度后保留。
- 无效 Span、同 Framing 冲突和失效支承仍提示待补，不能通过手动跨度补造支承。未设手动 Span 的旧模型几何、计算和 A／B 原生输入保持一致。
- Section A／B 抄的内容、格式、图示、分页、Excel 模板及原生程序均未修改；本次只更新原字段所用的计算值。

## E2.129 — 2026-10-04

- Loading 按建筑轴线选择完整楼面区域：点选一格，拖动取覆盖范围的完整轴线矩形；支持追加、移除、整层选择与清空。选区连续覆盖板面和梁顶，自动扣除 Opening、墙柱实体和无楼板区；显示有效受荷面积。
- Loading 图移除按梁／板选择的视觉分割，提供可隐藏的梁线参考；其他页面显示设置保持。区域按坐标保存，调整梁布置后保持范围；新区域覆盖重叠部分，其余保留，多楼层设置、撤销、保存重开均支持。旧板块区域仅在主动编辑时转成原实际范围。
- Summary Check 点选梁显示实际梁宽 B、梁深 D；共同默认板厚与 Structural Depth 放在下方折叠“Framing 默认设置”，不再作为所选梁参数展示。
- 梁荷载图统一为平面左端至右端、上端至下端；全图共用长度比例与端部参考线。支承、固定端、点荷载、线荷载、反力标注同步对应。输入仍从原 A 端量起，图中明确显示量距方向；DL／LL 保持一起显示。
- 仅合并显示连续、相同数值的梁顶 SDL／LL 段；真正的荷载变化、间断和不同来源保留，原始分段明细与计算反力不变。
- 已验证面积与梁顶荷载守恒、轴线框选、重叠覆盖、多层共用、旧区域编辑、保存重开、撤销、反向横／竖梁及长度比例。旧模型几何、计算和 A／B 原生输入与 E2.128 一致；Section A／B 抄的内容、格式、图示、分页、Excel 模板及原生程序均未更改。

## E2.128 — 2026-10-04

- 将“重新布置”移到梁布置顶部，合并原主梁、次梁折叠区内的两个按钮；三个折叠区及各自的自动布置操作保留。
- 点击后清空当前 Framing 的主梁、次梁、TB、CB、墙、板和相应旧构件设置，仅保留现有柱；同一 Framing 全部楼层同步，可一次撤销。轴线、建筑范围、Opening、楼层荷载和其他 Framing 保留。
- 自动柱转为现有柱记录，避免移除墙后柱重新生成、移动或增加；保留柱尺寸、位置和柱输入。次梁方向和间距保留，清除旧次梁分区后从全部区域开始。
- 清空状态保存后重开保持；自动画主梁、次梁或手动画梁后恢复板块生成。重置前的普通板、CB、转换柱模型及荷载结果与 E2.127 一致。
- 验证包括手动／自动柱、墙边柱、偏置及对齐柱、空模型、同类型多层、撤销、保存重开和重新绘图。Section A/B 抄的内容、格式、横线纸、图示、分页、Excel 模板及原生程序未改。

## E2.127 — 2026-10-04

- 移除截图指定的 Member Check 通用说明、初次计算操作提示和 Check／抄勾选说明。
- 移除板设置中的普通单向板传荷说明及 Framing 共用设置说明；板类型、固定边、方向、厚度和所有操作按钮保持原样。
- 保留输入变化、支承冲突等实际状态提示。计算程序、项目数据、Section A/B 抄内容格式、横线纸、Excel 模板及原生报告程序未改。

## E2.126 — 2026-10-04

- 修复梁顶 SDL / LL 漏计：按有效楼面扣除开洞、删板范围、实体墙柱后，将净板外的梁顶面荷载直接计入梁；交叉区域只计一次，承托梁先接收，独立交叉按梁深及稳定几何顺序分配。此项为面荷载分配，不增加梁系节点分析。
- 保留梁全截面自重和板净面积自重。板选区荷载延伸到相邻梁顶的所属半宽，外围独侧板覆盖剩余梁宽；坐标区域保留实际范围，重复或缺失荷载继续提示待补。Section A 仍使用已保存总 DL，柱面积法不叠加梁反力。
- 单向矩形板验算按香港混凝土规范 2013 式 5.4 / 图 5.3 采用有效跨度：净跨加两端 min(板厚/2, 支承宽/2)，悬臂板只加固定端。分段支承采用控制跨度；几何、净面积和实际传荷仍按原净板范围。Section A 初筛、Member Check 和原 Excel 输入使用一致的跨度数值。
- 验证包括四种梁宽、局部荷载、开洞及边界、梁端反向、荷载守恒、柱／墙支承、原生输入一致性，以及截图算例：净跨 2.125 m、有效跨度 2.325 m，梁中段 LL 5.32 + 5.00 = 10.32 kN/m。
- 页面排版、Section A/B 抄的文字、格式、横线纸、图示、表格、分页、Excel 模板及原生报告程序保持原样；仅原字段的计算数值随修正更新。

## E2.125 — 2026-10-03

- Summary Check 点选柱时，Framing 平面图显示该柱本层受荷面积及对应范围；面积沿用柱面积法的自动划分或已保存手动设置，切换梁／板及上层柱投影时不显示柱面积标注。
- 移除柱面板中重复的“各荷载区域 · DL / SDL / LL”明细块，保留本层 G/Q、累计荷载和逐层受荷明细。Loading 原有输入及 Member Check 不变。
- 仅调整界面显示，柱面积及荷载计算、梁板传荷、Section A/B 抄的内容格式、横线纸、分页、Excel 模板和原生报告程序保持原样。

## E2.124 — 2026-10-03

- 自动识别到完整支承及到柱／墙的连接路径时，“手动补 Support”默认折叠；缺失、歧义、失效及手动指定支承保持展开，仍可随时点击展开或收起。普通梁和接柱／墙的 CB 均适用。
- Summary Check 的柱面板突出当前楼层：本层 G/Q 单独以色块及大数字显示，示意图本层荷载与箭头加粗，上部累计淡化；逐层明细中当前层加粗高亮。
- 移除该窗口的“柱尺寸与受荷范围”和重复的“柱验算”块，仅保留柱受力、逐层受荷明细及 Member Check 入口；尺寸及验算原入口不变。
- 柱继续沿用面积法，未添加梁端反力重复累加。荷载、支承、传荷、验算公式及 Section A/B 抄、横线纸、Excel 模板和原生报告程序未改。

## E2.123 — 2026-10-03

- “梁”窗口改名为 Summary Check，继续位于 Loading 后、Member Check 前；保留原梁及板的荷载、支承、计算和输入功能。
- 点选柱后显示柱受力面板：本层与上部 G/Q、累计 G/Q、原项目系数后的验算轴力、逐层受荷面积与荷载明细、原柱轴压验算和配筋结果。与现有 Member Check 共用计算，不新增荷载输入。
- 可显示或隐藏本层柱受荷范围，并从面板打开对应柱的 Member Check。普通柱、转换柱、手动面积均沿用已保存设置；缺荷载、传荷待确认和上层柱投影明确提示，不自动勾选 Check 或 A/B 抄。
- 多层累计、转换柱、手动面积、缺输入及实际界面切换检查通过。两个抄、计算公式、传荷程序、Excel 模板和原生报告程序保持原样。

## E2.122 — 2026-10-03

- 修复梁荷载图把“构件设计待补”误当成“竖向反力未算出”的显示问题。已存在有效竖向计算结果时显示 DL/LL、ULS 反力；承托 CB/CS 根部产生的弯矩及抗扭待验算提示仍保留，Member Check 不会因此变成通过。
- 接墙与接柱使用相同的反力显示规则。存在待分析根部作用时，图中的固定端 M 标明为“竖向荷载固定端 M”，不把它误作完整梁系分析结果。真实支承缺失或上游荷载不完整仍阻止反力显示。
- 接柱、接墙、分别承托另一根 CB、缺支承和上游缺荷载六种情况通过实际荷载图检查；更新自动荷载前后的结果一致。
- 仅修正界面状态分类；几何、荷载、反力、配筋计算代码及 Section A/B 抄的内容、横线纸、格式、模板、原生程序保持原样。

## E2.121 — 2026-10-03

- 菜单调整为“梁布置 → Loading → 梁 → Member Check”，编号随顺序更新。
- “梁”页可直接点选楼板：四个独立折叠区显示尺寸与方向、支承分段、荷载与反力、Section A 尺寸初筛及 Section B 配筋验算。板厚、方向和配筋沿用现有项目与 Member Check 数据；自动计算不改变 Check 或 A/B 抄的勾选。板面板只检查当前层，避免每次重算整栋。
- 净板区支承匹配增加本层柱的实际截面侧面，覆盖 X/Y 方向和梁柱交接分段。梁、墙、柱重叠区只传荷一次，不按 SL-01 或任何项目编号特殊处理；真实缺口和多重支承仍提示待确认。
- 修复手动 MB/SB 梁深被自动初定值覆盖，保留明确输入的尺寸；未指定时继续自动初定。无有效高度或钢筋放不下时提前说明具体输入问题，避免仅显示 SB!G53 等公式错误。
- “上层柱”显示构件不再作为本层竖向支承或重复累积的传荷对象。转换柱按实际落点与 TB 截面接触传荷，反力位置沿梁计算；多根 TB 同时承托时保留待确认，列出候选编号，不擅自分配荷载。
- 新增板面板交互、柱面分段、反向构件、短梁尺寸保留、上层柱显示、偏心参考线下的 TC → TB 传荷及多重支承检查。截图条件的 MB_6 反力复现成功：两端 G = 31.93125 kN，Q = 6.24375 kN。
- 五个年度模型完成计算回归，未发现此前的公式异常；有效梁反力满足荷载平衡。非矩形板超出原 Excel 单向矩形板适用范围、等边方向未选、真实缺支承或配筋不足等问题仍保留提示，不代表五个模型全部验算通过。
- Section A/B 抄的文字、横线纸、格式、表格、图示、分页、Excel 模板及原生桥接程序保持原样；91 个保护文件保持一致（旧导航测试仅更新顺序断言）。授权的输入与计算修复仅更新现有字段数值。

## E2.120 — 2026-10-03

- 板块生成改为先扣除梁、墙及本层柱的实际占地，再识别独立净板区；不再用梁参考线把外围窄条连成一块。适用于不同梁宽、偏移、转角、开洞、缺口及重叠构件，不对 SL-01 或任何项目编号作特殊处理。
- 平面板区、净面积、方向标注、自重和支承边匹配共用实际边界。荷载区域裁切到净板区，按现有荷载值和 roundup 规则传荷；梁仍计算全高自重，板不再二次扣梁宽。净面积修正会相应更新现有计算字段的数值。
- 默认单向短跨；等边板未指定方向时显示 X / Y ? 并阻止其下游自动计算通过。保留逐块 X/Y 手动修改。真实支承缺口和非矩形板仍提示待确认，不用虚构支承补齐。
- 首次打开旧项目时将原板块的板厚、方向、手动输入、Check、A/B 勾选及荷载区域映射到新板区；已替代记录存入项目备份字段。保存后重开保持设置。
- 通过物理净区域覆盖、真实窄板、构件反向／增删／改宽、等边方向、支承缺口及旧设置迁移检查；保留原荷载、梁布置、支承及局部层高回归检查。
- Section A / B 抄的内容、横线纸、格式、表格、绘图代码、分页、Excel 模板及原生桥接程序保持原样。

## E2.119 — 2026-10-03

- 梁窗口显示与“梁布置”一致的 slab 单向板受力方向双箭头，读取现有 X/Y 设置；提供显示／隐藏开关并记住偏好。移除 E2.118 误加的梁 A → B 箭头，原梁中线、端点及中点保留。
- 楼层页面保留原表格、按钮与折叠区，在局部层高条目增加净高、E&M 和自动结构高度；保留拖框／清空／应用 Area。新条目的当前楼层绑定所属楼层组顶部，原有条目保留其指定楼层。
- 结构高度 =（下方空间总高 − 局部净高 − E&M）× 1000 mm。平面显示结构区及其高度，可隐藏；同一来源用于局部梁深超限提示，不改变 Framing 梁截面。无效新输入回退并提示，旧项目缺少合理净高时显示待填写。
- 局部高度定义当前楼层下方空间，修改后当前梁板标高固定；原多层 Area 中间层留空规则保留。
- 46 组板边界回归及 5 组新增方向／局部净高检查通过，另通过 55 项荷载断言、9 组梁布置与配筋交互、4 组支承保存检查。保存重开、拖框、负值、标高与旧条目兼容均已检查。
- Section A / B 两个抄的内容、横线纸、格式、表格、图示、分页、Excel 模板及原生桥接程序均保持原样。

## E2.118 — 2026-10-03

- 修正板边界传荷：凹形、多段外边界及开洞板沿既定 X/Y 跨向，按实际连续板区逐段寻找支承；不再使用整块外包矩形把远处板荷载分到无接触的梁。局部荷载、板净面积自重及来源追踪均按同一实际区段积分。
- 统一规则覆盖 L/U 形、阶梯形、开洞、贴边、梁反向和 X/Y 换向；不针对板编号或单一项目特判。真实缺少或重复支承、非矩形板设计不适用等既有限制继续明确提示，不生成虚假的通过结果。已有板编号、用户几何、荷载与方向设置保留。
- 梁页新增“梁方向 A → B”显示开关，箭头沿输入起点至终点；选中梁显示 A/B，与 Support 和荷载图一致。隐藏只影响显示并记住偏好。
- Section A / B 两个抄的内容、横线纸、格式、表格、图示、分页和 Excel 模板保持不变。楼层局部净高/E&M/结构区的侧边预览尚未合入本版。
- 47 组边界及界面检查、55 项荷载断言、9 组梁布置与配筋界面检查、4 组支承保存检查通过；保护文件和报告绘制另做字节核对。

## E2.117 — 2026-10-03

- 梁页先显示 Support，再显示 Loading。支承识别结果、CB 固定端及支承选择集中在上方，显示连接的柱／墙／梁编号和自由端。
- Support 与 Loading 分开保存：支承可先保存，不受尚未完成的荷载表影响；未保存的荷载草稿继续保留。Support 按原规则在同 Framing 各层共用，Loading 仍按当前楼层保存。
- 复核贴边 CB：梁端在柱实际截面内或边界上能自动识别柱根部；反向画梁仍识别同一根部，柱移开后不会误判连接。下端梁反力继续传到 CB 自由端。几何连接识别不等于节点刚接承载力验算。
- 四组针对性检查通过。86 个原有保护文件完全一致，荷载算法、两个抄的内容/横线纸/格式、Excel 模板未改。

## E2.116 — 2026-10-03

- 将预览确认的梁布置整合到正式软件，独立入口放在“梁”上面。右侧主梁、次梁、板受力方向各自折叠，沿用原有尺寸规则和项目设置。
- 主梁、次梁分别预览、应用和重新布置，只作用于当前 Framing 的所有楼层。保留既有手动梁、分区和其他 Framing 设置；删除单根自动梁可撤销，重新布置只恢复对应类别。
- 新布置的普通板默认单向短跨；点击或拖框选板后可改为 X/Y，方向同步用于显示和实际传荷。已有项目未应用新布置时保持原方向规则；已有悬臂板继续沿固定边规则。
- 梁中线增加中点标记和吸附，包括新加入的梁；保留原有端点及中线任意位置连接。
- Member Check 的梁配筋改为点图编辑上筋、下筋、剪箍和扭箍，复用原配筋字段及保存/检查流程。梁的荷载和实际支承仍在“梁”页。
- **Section A / B 抄文字、横线纸、格式、图示、表格和分页保持不变。** 78 个既有保护文件（报表模块、其他原模块、Excel 模板等）逐字节一致，打包网页原有样式与报告模块未改。
- 55 项荷载回归及 9 组界面/旧项目兼容检查通过；方向切换确实改变受荷梁且保持总 LL，保存重开保留新旧设置，新画梁中点可以继续连接。

## E2.115 — 2026-10-03

- 移除“柱子对齐”入口，保留项目已有柱位；梁编辑图增加实际中心线和端点吸附，梁信息显示 A/B 端实际 Support。
- 梁荷载图显示 DL/LL 支承反力及 ULS 反力，CB 显示固定端弯矩。荷载与实际支承输入独立放在梁页；Member Check 梁面板保留 Section A 尺寸初筛和 Section B 配筋。
- 梁的线荷载和集中荷载 DL/LL 向上取两位小数后参与计算。Section B 自动传荷采用梁全截面自重，楼板自重扣除梁／墙占用范围；SDL/LL 范围及分析跨度不变。Section A 与柱面积法保留 Loading 总 DL（含结构自重）口径。
- 柱逐来源楼层面积可直接修改、单层恢复自动值，并保留区域荷载比例。TC → TB 按确认后的柱累计 DL/LL 传荷，不依赖 Check 勾选状态；上层面积修改继续向下传递，避免重复累加。
- 原生 CB 计算支持分段线荷载及多个集中荷载，与界面采用同一取整后的荷载表。Excel 模板仅两处计算单元格公式变化，输出宏、原始样式、行高、列宽、合并单元格和打印设置保持原样。
- **两个抄的格式和文字内容保持 E2.114，不改排版、数字显示格式或说明文字。以后须有用户明确要求才能改抄。** 计算结果仍更新到原有字段；规则已写入 AGENTS.md。
- 55 项计算回归通过；8 组原生 Excel 核对共 961 项无差异，原始模板版面保留后的额外 658 项复核无差异。画梁吸附、支承、反力、取整荷载保存、柱面积编辑及恢复通过界面验证。

## E2.114 — 2026-10-01

- Section A 的 Site Constraint / Client's Requirement 与 Design Implications 表格改为左对齐，保留上下居中、行距和加粗边框。
- 移除“生成 Excel”菜单和独立生成卡片；已生成工作簿及核对结果合并到 Section A/B 抄页，A/B 分别保留记录。打开文件不会重新生成。
- 其他表格维持 E2.113 的居中格式；计算、Deflection 自动更新、Excel 模板及原生生成流程未改。
- 样例仅 A 第 1 页的目标表格水平位置变化，其余 19 页渲染完全一致；13,000 个正文字符与数值不变。报告生成、A/B 文件保留、打开文件及差异显示已验证。

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


## Transfer Truss release history (main)

## E2.143 — 2026-10-06

- Import the supplied E2.142 Windows baseline and add only the transfer-truss feature from PR #1. Existing E2.142 layout and member-selection behavior are retained.
- Add same-floor and multi-storey S460 trusses, axial-member checks, reaction propagation and a standalone Excel workbook.
- Preserve original Section A/B report layouts, VBA and workbook templates. Truss-affected columns use physical reactions for checking; Section A area-table export is explicitly blocked for those columns rather than reformatted.
- Verified: 55 existing loading assertions; 11 core, 12 integration and 11 downstream groups; four no-truss models match E2.142; native Excel 451 comparisons with zero differences. UI inputs and undo checked.
