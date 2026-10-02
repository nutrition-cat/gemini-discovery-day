# -*- coding: utf-8 -*-
"""
generate_tables.py
Generates 3 table-view artifacts from site/prompts-data.js:
1. prompts_table.md - Markdown catalog table
2. prompts_table.tsv - Spreadsheet / Excel TSV export
3. site/table.html - Interactive searchable web table view
"""

import json
import re
import os

with open('site/prompts-data.js', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'window\.PROMPTS_DATA\s*=\s*(\[[\s\S]*?\]);', text)
if not match:
    raise ValueError("Could not find window.PROMPTS_DATA in site/prompts-data.js")

prompts = json.loads(match.group(1))

# ==========================================
# 1. Generate prompts_table.md
# ==========================================
md_lines = []
md_lines.append("# Gemini Discovery Day 2026 | プロンプト一覧カタログ表（全50選）")
md_lines.append("\n**Supported by Google AI学生アンバサダー** / 2026年11月25日開催イベント参加者限定特典アーカイブ\n")
md_lines.append(f"- **総件数**: {len(prompts)}件")
md_lines.append("- **最新Gemini対応世代**: Gemini 3.8 Flash / Gemini 3.1 Pro (Thinking) / Gemini 3.1 Flash Image / Gemini with Canvas / Gemini Live\n")

# Model breakdown
model_counts = {}
cat_counts = {}
for p in prompts:
    m = p.get('recommendedModel', 'Gemini 3.8 Flash')
    c = p.get('category', '一般')
    model_counts[m] = model_counts.get(m, 0) + 1
    cat_counts[c] = cat_counts.get(c, 0) + 1

md_lines.append("### 📊 カテゴリ内訳")
for c, cnt in cat_counts.items():
    md_lines.append(f"- **{c}**: {cnt}件")

md_lines.append("\n### ⚡ 推奨モデル内訳")
for m, cnt in model_counts.items():
    md_lines.append(f"- **{m}**: {cnt}件")

md_lines.append("\n---\n")
md_lines.append("## 📋 プロンプト一覧表\n")
md_lines.append("| No | カテゴリ | プロンプトタイトル | ねらい・得られる効果 | 推奨モデル | カスタマイズ変数 |")
md_lines.append("|:---:|:---|:---|:---|:---|:---|")

for p in prompts:
    pad_id = f"#{p['id']:02d}"
    cat = p.get('category', '')
    title = p.get('title', '').replace('|', '\|')
    aim = p.get('aim', '').replace('|', '\|')
    model = p.get('recommendedModel', '').replace('|', '\|')
    
    # Extract variables
    vars_list = p.get('variables', [])
    if vars_list:
        vars_str = "<br>".join([f"`{v.get('slot', '')}`" for v in vars_list])
    elif p.get('varName'):
        vars_str = f"`[{p.get('varName')}]`"
    else:
        vars_str = "なし"
    
    md_lines.append(f"| {pad_id} | **{cat}** | [{title}](#prompt-{p['id']}) | {aim} | `{model}` | {vars_str} |")

md_lines.append("\n---\n")
md_lines.append("## 📝 プロンプト本文・詳細一覧\n")

for p in prompts:
    pad_id = f"#{p['id']:02d}"
    title = p.get('title', '')
    cat = p.get('category', '')
    aim = p.get('aim', '')
    model = p.get('recommendedModel', '')
    snippet = p.get('outputSnippet', '')
    tips = p.get('tips', '')
    template = p.get('promptTemplate', '')
    
    md_lines.append(f"<a id=\"prompt-{p['id']}\"></a>")
    md_lines.append(f"### {pad_id} {title}")
    md_lines.append(f"- **カテゴリ**: `{cat}` | **推奨モデル**: **{model}**")
    md_lines.append(f"- **ねらい**: {aim}")
    if p.get('variables'):
        md_lines.append("- **カスタマイズ変数**:")
        for v in p['variables']:
            presets_note = f" (プリセット: {', '.join([ps['label'] if isinstance(ps, dict) else ps for ps in v.get('presets', [])])})" if v.get('presets') else ""
            md_lines.append(f"  - `{v.get('slot', '')}`: {v.get('label', '')}{presets_note} [初期値: {v.get('default', '')}]")
    elif p.get('varName'):
        md_lines.append(f"- **カスタマイズ変数**: `[{p.get('varName')}]` [初期値: {p.get('varDefault', '')}]")
    
    md_lines.append("\n**【プロンプト本文】**")
    md_lines.append("```text")
    md_lines.append(template.strip())
    md_lines.append("```")
    
    if snippet:
        md_lines.append("\n**【Gemini出力プレビュー】**")
        md_lines.append("> " + snippet.replace("\n", "\n> "))
        
    if tips:
        md_lines.append(f"\n💡 **実践Tips**: {tips}")
        
    md_lines.append("\n---\n")

with open('prompts_table.md', 'w', encoding='utf-8') as f:
    f.write("\n".join(md_lines))

print("Created prompts_table.md")

# ==========================================
# 2. Generate prompts_table.tsv
# ==========================================
tsv_rows = []
tsv_headers = ['ID', '元No', 'カテゴリ', 'タイトル', 'ねらい', '推奨モデル', '変数スロット', 'プロンプト本文', '出力プレビュー', '実践Tips']
tsv_rows.append('\t'.join(tsv_headers))

for p in prompts:
    vars_list = p.get('variables', [])
    if vars_list:
        vars_str = ', '.join([v.get('slot', '') for v in vars_list])
    elif p.get('varName'):
        vars_str = f"[{p.get('varName')}]"
    else:
        vars_str = ""
        
    clean_prompt = p.get('promptTemplate', '').replace('\r\n', ' \\n ').replace('\n', ' \\n ').replace('\t', ' ')
    clean_snippet = p.get('outputSnippet', '').replace('\r\n', ' \\n ').replace('\n', ' \\n ').replace('\t', ' ')
    clean_tips = p.get('tips', '').replace('\r\n', ' ').replace('\n', ' ').replace('\t', ' ')
    
    row = [
        str(p['id']),
        str(p.get('origNo', p['id'])),
        p.get('category', ''),
        p.get('title', ''),
        p.get('aim', ''),
        p.get('recommendedModel', ''),
        vars_str,
        clean_prompt,
        clean_snippet,
        clean_tips
    ]
    tsv_rows.append('\t'.join(row))

with open('prompts_table.tsv', 'w', encoding='utf-8') as f:
    f.write('\n'.join(tsv_rows))

print("Created prompts_table.tsv")

# ==========================================
# 3. Generate site/table.html (Interactive Web Table)
# ==========================================
html_content = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>プロンプト一覧データテーブル | Gemini Discovery Day by Google AI学生アンバサダー</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&family=Noto+Sans+JP:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg-deep: #050713;
      --bg-surface: #0a0f24;
      --bg-card: rgba(15, 23, 48, 0.9);
      --border-subtle: rgba(255, 255, 255, 0.1);
      --neon-cyan: #00f0ff;
      --neon-pink: #ff2a85;
      --neon-yellow: #ffe600;
      --neon-green: #00ff88;
      --neon-purple: #b042ff;
      --neon-blue: #2979ff;
      --text-main: #f8fafc;
      --text-sub: #cbd5e1;
      --text-muted: #94a3b8;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Inter', 'Noto Sans JP', sans-serif;
      background: var(--bg-deep);
      color: var(--text-main);
      padding: 32px 24px 80px;
      line-height: 1.6;
    }}
    .table-container {{
      max-width: 1560px;
      margin: 0 auto;
    }}
    header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--border-subtle);
    }}
    h1 {{
      font-size: 1.85rem;
      font-weight: 900;
      color: #fff;
    }}
    .subtitle {{
      font-size: 0.95rem;
      color: var(--neon-cyan);
      font-weight: 700;
      margin-top: 4px;
    }}
    .header-actions {{
      display: flex;
      gap: 12px;
      align-items: center;
    }}
    .btn {{
      padding: 10px 20px;
      border-radius: 9999px;
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }}
    .btn-cyan {{
      background: rgba(0, 240, 255, 0.15);
      border: 1.5px solid var(--neon-cyan);
      color: var(--neon-cyan);
    }}
    .btn-cyan:hover {{
      background: var(--neon-cyan);
      color: #050713;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
    }}
    .btn-cardview {{
      background: rgba(255, 255, 255, 0.1);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      color: #fff;
    }}
    .btn-cardview:hover {{
      border-color: #fff;
      transform: translateY(-2px);
    }}
    
    /* Toolbar */
    .filter-bar {{
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }}
    .search-box {{
      flex: 1;
      min-width: 280px;
    }}
    .search-box input {{
      width: 100%;
      background: rgba(5, 7, 20, 0.9);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 12px 18px;
      color: #fff;
      font-size: 1.05rem;
      outline: none;
    }}
    .search-box input:focus {{
      border-color: var(--neon-cyan);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
    }}
    .cat-select {{
      background: rgba(5, 7, 20, 0.9);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 12px 16px;
      color: #fff;
      font-size: 1rem;
      font-weight: 700;
      outline: none;
      cursor: pointer;
    }}
    
    /* Table Styling */
    .table-wrap {{
      overflow-x: auto;
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      background: var(--bg-card);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }}
    thead {{
      background: rgba(10, 15, 36, 0.98);
      position: sticky;
      top: 0;
      z-index: 10;
    }}
    th {{
      padding: 16px 18px;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--neon-cyan);
      border-bottom: 2px solid rgba(0, 240, 255, 0.3);
      white-space: nowrap;
    }}
    td {{
      padding: 18px;
      font-size: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      vertical-align: top;
    }}
    tr:hover {{
      background: rgba(24, 36, 74, 0.5);
    }}
    .id-badge {{
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      color: var(--neon-cyan);
      font-size: 1.05rem;
      white-space: nowrap;
    }}
    .cat-badge {{
      font-size: 0.85rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      white-space: nowrap;
    }}
    .model-badge {{
      font-size: 0.82rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(255, 230, 0, 0.12);
      color: var(--neon-yellow);
      border: 1px solid var(--neon-yellow);
      white-space: nowrap;
    }}
    .prompt-cell {{
      max-width: 480px;
    }}
    .prompt-title {{
      font-size: 1.15rem;
      font-weight: 900;
      color: #fff;
      margin-bottom: 6px;
    }}
    .prompt-aim {{
      font-size: 0.95rem;
      color: var(--text-sub);
      margin-bottom: 10px;
    }}
    .prompt-code-toggle {{
      background: rgba(5, 7, 20, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.88rem;
      color: var(--text-sub);
      max-height: 120px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }}
    .actions-cell {{
      display: flex;
      flex-direction: column;
      gap: 8px;
      white-space: nowrap;
    }}
    .btn-action-sm {{
      padding: 8px 14px;
      font-size: 0.88rem;
      border-radius: 8px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }}
    .btn-copy-sm {{
      background: rgba(0, 255, 136, 0.15);
      color: var(--neon-green);
      border: 1px solid var(--neon-green);
    }}
    .btn-copy-sm:hover {{
      background: var(--neon-green);
      color: #050713;
    }}
    .btn-gemini-sm {{
      background: rgba(0, 240, 255, 0.15);
      color: var(--neon-cyan);
      border: 1px solid var(--neon-cyan);
    }}
    .btn-gemini-sm:hover {{
      background: var(--neon-cyan);
      color: #050713;
    }}
    
    /* Toast */
    .toast {{
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #090e24;
      border: 2px solid var(--neon-green);
      padding: 14px 24px;
      border-radius: 9999px;
      color: #fff;
      font-weight: 800;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0, 255, 136, 0.4);
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s;
      pointer-events: none;
    }}
    .toast.show {{
      opacity: 1;
      transform: translateY(0);
    }}
  </style>
</head>
<body>

  <div class="table-container">
    <header>
      <div>
        <h1>Gemini Discovery Day | プロンプト全一覧データ表</h1>
        <p class="subtitle">Supported by Google AI学生アンバサダー / 2026年最新50選 完全データ一覧</p>
      </div>
      <div class="header-actions">
        <a href="index.html" class="btn btn-cardview">
          <span>🎨 カードギャラリーへ戻る</span>
        </a>
        <a href="../prompts_table.tsv" download="prompts_50.tsv" class="btn btn-cyan">
          <span>📥 TSV (Excel) をダウンロード</span>
        </a>
      </div>
    </header>

    <!-- Toolbar Filters -->
    <div class="filter-bar">
      <div class="search-box">
        <input type="text" id="filter-search" placeholder="キーワード・タイトル・内容で検索... (全50件)">
      </div>
      <div>
        <select id="filter-cat" class="cat-select">
          <option value="すべて">すべてのカテゴリ (50)</option>
        </select>
      </div>
      <div style="font-weight: 800; color: var(--text-sub); margin-left: auto;">
        表示中: <span id="visible-count" style="color: var(--neon-cyan); font-family: 'JetBrains Mono'; font-size: 1.3rem;">50</span> / 50 件
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table id="prompts-table">
        <thead>
          <tr>
            <th>No</th>
            <th>カテゴリ</th>
            <th>プロンプト詳細・本文</th>
            <th>推奨モデル</th>
            <th>出力イメージ (Snippet)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="table-body">
          <!-- Populated by JavaScript -->
        </tbody>
      </table>
    </div>
  </div>

  <div class="toast" id="toast">コピーしました！</div>

  <script src="prompts-data.js"></script>
  <script>
    const prompts = window.PROMPTS_DATA || [];
    const tbody = document.getElementById('table-body');
    const searchInput = document.getElementById('filter-search');
    const catSelect = document.getElementById('filter-cat');
    const countEl = document.getElementById('visible-count');
    const toast = document.getElementById('toast');

    // Populate categories in select
    const cats = ['すべて', ...new Set(prompts.map(p => p.category))];
    catSelect.innerHTML = cats.map(c => {{
      const count = c === 'すべて' ? prompts.length : prompts.filter(p => p.category === c).length;
      return `<option value="${{c}}">${{c}} (${{count}})</option>`;
    }}).join('');

    function renderTable() {{
      const query = searchInput.value.toLowerCase().trim();
      const selectedCat = catSelect.value;

      const filtered = prompts.filter(p => {{
        const matchCat = selectedCat === 'すべて' || p.category === selectedCat;
        const matchQuery = !query || 
          p.title.toLowerCase().includes(query) ||
          p.aim.toLowerCase().includes(query) ||
          p.promptTemplate.toLowerCase().includes(query) ||
          p.recommendedModel.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query);
        return matchCat && matchQuery;
      }});

      countEl.innerText = filtered.length;

      if (filtered.length === 0) {{
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--text-muted);">該当するプロンプトがありません</td></tr>`;
        return;
      }}

      tbody.innerHTML = filtered.map(p => {{
        const padId = '#' + String(p.id).padStart(2, '0');
        return `
          <tr data-id="${{p.id}}">
            <td><span class="id-badge">${{padId}}</span></td>
            <td><span class="cat-badge">${{escapeHtml(p.category)}}</span></td>
            <td class="prompt-cell">
              <div class="prompt-title">${{escapeHtml(p.title)}}</div>
              <div class="prompt-aim">${{escapeHtml(p.aim)}}</div>
              <div class="prompt-code-toggle">${{escapeHtml(p.promptTemplate)}}</div>
            </td>
            <td><span class="model-badge">${{escapeHtml(p.recommendedModel)}}</span></td>
            <td style="max-width: 280px; font-size: 0.92rem; color: var(--text-sub);">
              ${{escapeHtml(p.outputSnippet)}}
            </td>
            <td>
              <div class="actions-cell">
                <button class="btn-action-sm btn-copy-sm" onclick="copyPrompt(${{p.id}})">
                  📋 コピー
                </button>
                <button class="btn-action-sm btn-gemini-sm" onclick="launchGemini(${{p.id}})">
                  🚀 Geminiへ
                </button>
              </div>
            </td>
          </tr>
        `;
      }}).join('');
    }}

    function copyPrompt(id) {{
      const p = prompts.find(x => x.id === id);
      if (!p) return;
      navigator.clipboard.writeText(p.promptTemplate).then(() => {{
        showToast(`「${{p.title}}」をコピーしました！`);
      }});
    }}

    function launchGemini(id) {{
      const p = prompts.find(x => x.id === id);
      if (!p) return;
      navigator.clipboard.writeText(p.promptTemplate).then(() => {{
        showToast('プロンプトを自動コピーしました！Geminiが開いたら【Ctrl+V】で貼り付けてください');
        setTimeout(() => {{
          window.open('https://gemini.google.com/app', '_blank');
        }}, 120);
      }});
    }}

    function showToast(msg) {{
      toast.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }}

    function escapeHtml(str) {{
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }}

    searchInput.addEventListener('input', renderTable);
    catSelect.addEventListener('change', renderTable);

    renderTable();
  </script>
</body>
</html>
"""

with open('site/table.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Created site/table.html")
print("ALL TABLES GENERATED SUCCESSFULLY!")
