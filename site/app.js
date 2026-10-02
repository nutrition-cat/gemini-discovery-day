/* ============================================================
   Gemini Discovery Day 2026 - Participant Special Prompts Gallery
   Interactive Editorial Engine (muuuuu.org standard)
   - Real-time Bento Grid Rendering with Ultra-Bold Typography
   - Multi-Variable Real-Time Personalizer with Preset Quick-Chips
   - Pure JS Lightweight Particle Confetti Engine
   - Random "Gacha" Prompt Roulette
   - Participant Secret Keyword Gate
============================================================ */

// Global App State
const state = {
  prompts: [],
  filteredPrompts: [],
  activeCategory: 'すべて',
  searchQuery: '',
  currentModalPrompt: null,
  currentVariables: {}, // key: slot (e.g. '[企画名やテーマ]'), value: string
  authEnabled: localStorage.getItem('gdd_auth_enabled') === 'true',
  isAuthenticated: localStorage.getItem('gdd_is_authenticated') === 'true'
};

// Valid Passwords for the Event
const VALID_PASSWORDS = ['discovery2026', 'gemini', '1125', 'gdd2026'];

// Category Color Scheme Mapping
const CATEGORY_COLORS = {
  '講義・復習': 'cyan',
  'レポート・論文': 'purple',
  '就活・キャリア': 'blue',
  '語学・資格': 'rose',
  '開発・IT': 'emerald',
  '学生生活': 'amber'
};

// SVG Vector Icons for Card Watermarks & Symbols
const SVG_ICONS = {
  'sparkles': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
  'file-text': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  'camera': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  'brain': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/></svg>`,
  'layers': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  'mic': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
  'code': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  'message-circle': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`,
  'users': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  'compass': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  'check-square': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  'shield-alert': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  'edit-3': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  'bar-chart-2': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  'globe': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  'cpu': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>`,
  'database': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  'zap': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
};

function getIcon(name) {
  return SVG_ICONS[name] || SVG_ICONS['sparkles'];
}

/* ============================================================
   Ultra-Lightweight HTML5 Canvas Confetti Engine
============================================================ */
class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 80) {
    if (!this.ctx) return;
    const colors = ['#00f0ff', '#ff2a85', '#ffe600', '#00ff88', '#b042ff', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 14 + 6;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 4,
        size: Math.random() * 9 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        shape: Math.random() > 0.35 ? 'rect' : 'circle',
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.26; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

let confettiInstance = null;

/* ============================================================
   App Boot & Event Wire-up
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  confettiInstance = new ConfettiEngine();

  // Load Prompts Data & Normalize schema (supporting single & multi-variables)
  state.prompts = (window.PROMPTS_DATA || []).map(p => {
    let vars = [];
    if (Array.isArray(p.variables) && p.variables.length > 0) {
      vars = p.variables;
    } else if (p.variable) {
      vars = [p.variable];
    } else if (p.varName) {
      vars = [{
        name: p.varName,
        label: p.varName,
        default: p.varDefault || '',
        placeholder: `${p.varName}を入力...`,
        slot: `[${p.varName}]`
      }];
    }

    return {
      id: p.id,
      origNo: p.origNo || p.id,
      category: p.category || '一般',
      tag: p.tag || '',
      title: p.title || '',
      aim: p.aim || '',
      icon: p.icon || 'sparkles',
      model: p.recommendedModel || p.model || 'Gemini 3.8 Flash',
      snippet: p.outputSnippet || p.snippet || '',
      prompt: p.promptTemplate || p.prompt || '',
      variables: vars,
      tips: p.tips || ''
    };
  });

  state.filteredPrompts = [...state.prompts];

  setupUIEvents();
  renderCategories();
  renderBentoGrid();
  updateAuthStatus();
});

function setupUIEvents() {
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      filterPrompts();
    });
  }

  // Auth toggle button (for preview / testing)
  const btnAuth = document.getElementById('btn-toggle-auth');
  if (btnAuth) {
    btnAuth.addEventListener('click', () => {
      state.authEnabled = !state.authEnabled;
      localStorage.setItem('gdd_auth_enabled', state.authEnabled);
      if (state.authEnabled) {
        state.isAuthenticated = false;
        localStorage.setItem('gdd_is_authenticated', 'false');
      }
      updateAuthStatus();
      showToast(state.authEnabled ? '合言葉ロック（本番モード）をONにしました' : 'フリー閲覧（プレビューモード）に切り替えました', 'info');
    });
  }

  // Gacha Button (🎲 運命のプロンプトガチャ)
  const btnGacha = document.getElementById('btn-spin-gacha');
  if (btnGacha) {
    btnGacha.addEventListener('click', (e) => {
      spinGacha(e);
    });
  }

  // Modal Close
  const modal = document.getElementById('prompt-detail-modal');
  const btnClose = document.getElementById('btn-close-modal');
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });
  }

  // Modal Copy Button
  const btnModalCopy = document.getElementById('btn-modal-copy');
  if (btnModalCopy) {
    btnModalCopy.addEventListener('click', (e) => {
      if (!state.currentModalPrompt) return;
      const textToCopy = getEffectivePromptText();
      copyToClipboard(textToCopy, 'カスタマイズ後のプロンプトをコピーしました！Geminiにそのまま貼り付けられます', e);
    });
  }

  // Modal "Copy & Launch Gemini" Button
  const btnOpenGemini = document.getElementById('btn-open-gemini-app');
  if (btnOpenGemini) {
    btnOpenGemini.addEventListener('click', (e) => {
      if (!state.currentModalPrompt) return;
      const textToCopy = getEffectivePromptText();
      launchGeminiWithPrompt(textToCopy, e);
    });
  }

  // Unlock Button & Enter Key
  const btnUnlock = document.getElementById('btn-unlock');
  const lockInput = document.getElementById('lock-input');
  if (btnUnlock && lockInput) {
    btnUnlock.addEventListener('click', attemptUnlock);
    lockInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptUnlock();
    });
  }
}

/* ============================================================
   🎲 Random Gacha Feature
============================================================ */
function spinGacha(e) {
  if (state.prompts.length === 0) return;
  
  const btn = document.getElementById('btn-spin-gacha');
  if (btn) {
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.7';
  }

  // Confetti explosion from button location
  if (confettiInstance && e) {
    const rect = e.target.getBoundingClientRect();
    confettiInstance.fire(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);
  }

  // Spin Roulette effect
  let spins = 0;
  const maxSpins = 8;
  const interval = setInterval(() => {
    spins++;
    const tempIndex = Math.floor(Math.random() * state.prompts.length);
    showToast(`🎲 選定中... 「${state.prompts[tempIndex].title}」`, 'info', 300);

    if (spins >= maxSpins) {
      clearInterval(interval);
      const chosen = state.prompts[Math.floor(Math.random() * state.prompts.length)];
      if (btn) {
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
      }
      openPromptModal(chosen);
      showToast(`✨ 今日の運命のプロンプト: #${chosen.id} ${chosen.title}`, 'success', 4000);
      
      setTimeout(() => {
        if (confettiInstance) {
          confettiInstance.fire(window.innerWidth / 2, window.innerHeight * 0.4, 120);
        }
      }, 300);
    }
  }, 120);
}

/* ============================================================
   Category Filter Chips
============================================================ */
function renderCategories() {
  const container = document.getElementById('category-strip');
  if (!container) return;

  const categories = ['すべて', ...new Set(state.prompts.map(p => p.category))];

  container.innerHTML = categories.map(cat => {
    const isActive = cat === state.activeCategory;
    const count = cat === 'すべて' ? state.prompts.length : state.prompts.filter(p => p.category === cat).length;
    return `
      <button class="cat-chip-btn ${isActive ? 'active' : ''}" data-cat="${cat}">
        <span>${cat}</span>
        <span class="cat-chip-badge">${count}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.cat-chip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = e.currentTarget.getAttribute('data-cat');
      state.activeCategory = cat;
      renderCategories();
      filterPrompts();
    });
  });
}

/* ============================================================
   Filtering Logic
============================================================ */
function filterPrompts() {
  state.filteredPrompts = state.prompts.filter(item => {
    const matchesCat = state.activeCategory === 'すべて' || item.category === state.activeCategory;
    const query = state.searchQuery;
    if (!query) return matchesCat;

    const matchesQuery = 
      item.title.toLowerCase().includes(query) ||
      item.aim.toLowerCase().includes(query) ||
      item.prompt.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.model && item.model.toLowerCase().includes(query)) ||
      (item.tag && item.tag.toLowerCase().includes(query));

    return matchesCat && matchesQuery;
  });

  const countEl = document.getElementById('search-count');
  if (countEl) countEl.innerText = state.filteredPrompts.length;

  renderBentoGrid();
}

/* ============================================================
   Bento Grid Rendering (Ultra-Bold Typography, Anti-Template)
============================================================ */
function renderBentoGrid() {
  const grid = document.getElementById('showcase-grid');
  if (!grid) return;

  if (state.filteredPrompts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 90px 20px;">
        <span style="font-size: 4rem; display: block; margin-bottom: 20px;">🔍</span>
        <h3 style="font-size: 1.7rem; font-weight: 900; color: #fff; margin-bottom: 12px;">該当するプロンプトが見つかりませんでした</h3>
        <p style="color: var(--text-secondary); font-size: 1.15rem;">検索キーワードを変えるか、カテゴリフィルターを「すべて」に戻してみてください。</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.filteredPrompts.map(p => {
    const padId = String(p.id).padStart(2, '0');
    const colorClass = CATEGORY_COLORS[p.category] || 'cyan';
    const snippetHtml = p.snippet ? `
      <div class="bento-snippet-bubble">
        <div class="snippet-top-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2"/></svg>
          <span>Gemini 出力プレビュー</span>
        </div>
        <div>${escapeHtml(p.snippet)}</div>
      </div>
    ` : '';

    return `
      <article class="bento-card" data-id="${p.id}">
        <!-- Big Street Watermark Number -->
        <span class="bento-watermark-num">${padId}</span>

        <div>
          <!-- Card Header Badges -->
          <div class="bento-top-row">
            <div class="bento-badges">
              <span class="badge-category ${colorClass}">${p.category}</span>
              <span class="badge-latest-model">${p.model || 'Gemini 3.8 Flash'}</span>
            </div>
            <div class="bento-icon-symbol">
              ${getIcon(p.icon)}
            </div>
          </div>

          <!-- Bold Typography (Large, Clear) -->
          <div class="bento-main-text">
            <h3 class="bento-h3-title">#${padId} ${escapeHtml(p.title)}</h3>
            <p class="bento-aim-statement">${escapeHtml(p.aim)}</p>
            ${snippetHtml}
          </div>
        </div>

        <!-- Thumb-Friendly Large Action Row -->
        <div class="bento-action-row">
          <button class="btn-bento-open" data-action="open" data-id="${p.id}">
            <span>開いて編集</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button class="btn-bento-gemini" data-action="gemini" data-id="${p.id}" title="コピーしてGeminiアプリを開く">
            <span>🚀 Geminiへ</span>
          </button>
          <button class="btn-bento-copy" data-action="copy" data-id="${p.id}" title="プロンプトをそのままコピー">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>コピー</span>
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Attach Card Click Events
  grid.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      const id = parseInt(card.getAttribute('data-id'), 10);
      const promptObj = state.prompts.find(x => x.id === id);
      if (!promptObj) return;

      if (btn && btn.getAttribute('data-action') === 'copy') {
        e.stopPropagation();
        copyToClipboard(promptObj.prompt, `「${promptObj.title}」をコピーしました！`, e);
      } else if (btn && btn.getAttribute('data-action') === 'gemini') {
        e.stopPropagation();
        launchGeminiWithPrompt(promptObj.prompt, e);
      } else {
        openPromptModal(promptObj);
      }
    });
  });
}

/* ============================================================
   Multi-Variable Modal & Live Personalizer Logic
============================================================ */
function openPromptModal(promptObj) {
  state.currentModalPrompt = promptObj;
  state.currentVariables = {};
  const modal = document.getElementById('prompt-detail-modal');
  if (!modal) return;

  const padId = String(promptObj.id).padStart(2, '0');

  // Set Modal Headings (Ultra-Bold)
  document.getElementById('modal-num').innerText = `#${padId}`;
  document.getElementById('modal-cat-badge').innerText = promptObj.category;
  document.getElementById('modal-model-badge').innerText = promptObj.model || 'Gemini 3.8 Flash';
  document.getElementById('modal-h2').innerText = promptObj.title;
  document.getElementById('modal-aim-p').innerText = promptObj.aim;

  // Initialize variables state with default values
  const variables = promptObj.variables || [];
  variables.forEach(v => {
    state.currentVariables[v.slot] = v.default || '';
  });

  // Render Multi-Variable Input Fields & Quick-Select Preset Chips
  const container = document.getElementById('injector-fields-container');
  if (container) {
    if (variables.length === 0) {
      container.innerHTML = `
        <div style="padding: 10px 0; color: var(--text-secondary); font-size: 1.1rem;">
          ✨ このプロンプトはそのままGeminiに貼り付けて即座にご活用いただけます。
        </div>
      `;
    } else {
      container.innerHTML = variables.map(v => {
        const presetsHtml = (v.presets && v.presets.length > 0) ? `
          <div class="injector-preset-chips" data-slot="${escapeHtml(v.slot)}">
            ${v.presets.map(ps => {
              const label = typeof ps === 'string' ? ps : ps.label;
              const val = typeof ps === 'string' ? ps : ps.value;
              const isActive = (state.currentVariables[v.slot] === val);
              return `
                <button type="button" class="preset-chip-btn ${isActive ? 'active' : ''}" data-slot="${escapeHtml(v.slot)}" data-val="${escapeHtml(val)}">
                  <span>${escapeHtml(label)}</span>
                </button>
              `;
            }).join('')}
          </div>
        ` : '';

        return `
          <div class="injector-field-block">
            <label class="injector-field-label">
              <span>${escapeHtml(v.label || v.name || '項目')}</span>
              <span class="badge-slot-tag">${escapeHtml(v.slot)}</span>
            </label>
            <input type="text" 
                   class="injector-big-input" 
                   data-slot="${escapeHtml(v.slot)}" 
                   value="${escapeHtml(state.currentVariables[v.slot] || '')}" 
                   placeholder="${escapeHtml(v.placeholder || 'ここに入力...')}">
            ${presetsHtml}
          </div>
        `;
      }).join('');

      // Wire up input changes
      container.querySelectorAll('.injector-big-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const slot = e.target.getAttribute('data-slot');
          state.currentVariables[slot] = e.target.value;

          // Toggle active presets
          const block = e.target.closest('.injector-field-block');
          if (block) {
            block.querySelectorAll('.preset-chip-btn').forEach(btn => {
              btn.classList.toggle('active', btn.getAttribute('data-val') === e.target.value);
            });
          }
          updatePromptDisplay();
        });
      });

      // Wire up quick preset chips
      container.querySelectorAll('.preset-chip-btn').forEach(chip => {
        chip.addEventListener('click', (e) => {
          const btn = e.currentTarget;
          const block = btn.closest('.injector-field-block');
          const input = block.querySelector('.injector-big-input');
          const slot = btn.getAttribute('data-slot');
          const val = btn.getAttribute('data-val');

          // Update input & state
          input.value = val;
          state.currentVariables[slot] = val;

          // Update active chip classes
          block.querySelectorAll('.preset-chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          updatePromptDisplay();
          showToast(`スタイル適用: 「${btn.innerText.trim()}」`, 'info', 1400);

          // Small confetti pop on preset selection
          if (confettiInstance) {
            const rect = btn.getBoundingClientRect();
            confettiInstance.fire(rect.left + rect.width / 2, rect.top, 35);
          }
        });
      });
    }
  }

  // Model & Tips Descriptions
  const modelTitle = document.getElementById('modal-model-title');
  const modelDesc = document.getElementById('modal-model-desc');
  if (modelTitle) modelTitle.innerText = `推奨Geminiモデル: ${promptObj.model || 'Gemini 3.8 Flash'}`;
  if (modelDesc) {
    if (promptObj.model && promptObj.model.includes('3.1 Pro')) {
      modelDesc.innerText = '複雑な論理展開、反論検証、深い学術リサーチには思考プロセスの見える「Gemini 3.1 Pro (Thinking)」が最適です。';
    } else if (promptObj.model && promptObj.model.includes('Flash Image')) {
      modelDesc.innerText = 'テキストからの超美麗な画像・スライド素材生成には最新「Gemini 3.1 Flash Image」を使用してください。';
    } else if (promptObj.model && promptObj.model.includes('Canvas')) {
      modelDesc.innerText = 'コードの対話的編集や長文レポートの推敲には「Gemini with Canvas」を開いて作業すると劇的に捗ります。';
    } else if (promptObj.model && promptObj.model.includes('Live')) {
      modelDesc.innerText = '面接練習や英語スピーキング対策には、音声で即レスしてくれる「Gemini Live」アプリで試してみてください。';
    } else {
      modelDesc.innerText = '日々の素早い講義ノート要約や日常の疑問解消には、超高速な最新世代「Gemini 3.8 Flash」が最適です。';
    }
  }

  const tipsDesc = document.getElementById('modal-tips-desc');
  if (tipsDesc) {
    tipsDesc.innerText = promptObj.tips || 'Geminiに指示を出す際は、自分の専攻や背景、提出先の文字数制限などを添えると精度が跳ね上がります！';
  }

  updatePromptDisplay();
  modal.classList.add('active');
}

function updatePromptDisplay() {
  const preEl = document.getElementById('prompt-pre');
  if (!preEl || !state.currentModalPrompt) return;

  const text = state.currentModalPrompt.prompt;
  const variables = state.currentModalPrompt.variables || [];

  if (variables.length === 0) {
    preEl.innerText = text;
    return;
  }

  // Escape HTML base text
  let escapedText = escapeHtml(text);

  // Replace each slot with highlighted tag
  variables.forEach(v => {
    const slotEscaped = escapeHtml(v.slot);
    const value = state.currentVariables[v.slot] || v.slot;
    const replacementHtml = `<span class="injected-var-tag">${escapeHtml(value)}</span>`;
    escapedText = escapedText.split(slotEscaped).join(replacementHtml);
  });

  preEl.innerHTML = escapedText;
}

function getEffectivePromptText() {
  if (!state.currentModalPrompt) return '';
  let text = state.currentModalPrompt.prompt;
  const variables = state.currentModalPrompt.variables || [];

  variables.forEach(v => {
    const value = state.currentVariables[v.slot];
    if (value) {
      text = text.split(v.slot).join(value);
    }
  });

  return text;
}

/* ============================================================
   Clipboard & Toast System
============================================================ */
function copyToClipboard(text, message = 'コピーしました！', clickEvent = null) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(message, 'success');
    
    // Confetti effect on copy!
    if (confettiInstance) {
      if (clickEvent && clickEvent.clientX && clickEvent.clientY) {
        confettiInstance.fire(clickEvent.clientX, clickEvent.clientY, 60);
      } else {
        confettiInstance.fire(window.innerWidth / 2, window.innerHeight * 0.7, 60);
      }
    }
  }).catch(err => {
    console.error('Clipboard copy failed:', err);
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(message, 'success');
    } catch (e) {
      showToast('コピーに失敗しました。手動で選択してコピーしてください。', 'error');
    }
    document.body.removeChild(textarea);
  });
}

/* ============================================================
   Auto-Copy & Instant Launch Gemini App
============================================================ */
function launchGeminiWithPrompt(promptText, clickEvent = null) {
  // 1. クリップボードにプロンプトを自動コピー＆紙吹雪
  copyToClipboard(promptText, '⚡ プロンプトを自動コピーしました！Geminiが開いたら【Ctrl+V】（貼り付け）ですぐ使えます！', clickEvent);

  // 2. 新規タブでGeminiアプリを開く
  setTimeout(() => {
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
  }, 120);
}

function showToast(message, type = 'info', duration = 2800) {
  const shelf = document.getElementById('toast-shelf');
  if (!shelf) return;

  const pill = document.createElement('div');
  pill.className = 'toast-pill';
  
  let icon = '✨';
  if (type === 'success') icon = '🎉';
  if (type === 'error') icon = '⚠️';
  if (type === 'info') icon = '💡';

  pill.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  shelf.appendChild(pill);

  setTimeout(() => {
    pill.style.animation = 'toastFade 0.3s forwards';
    setTimeout(() => {
      if (pill.parentElement) pill.parentElement.removeChild(pill);
    }, 300);
  }, duration);
}

/* ============================================================
   Password Auth Gate Logic
============================================================ */
function updateAuthStatus() {
  const lockScreen = document.getElementById('lock-screen');
  const btnAuth = document.getElementById('btn-toggle-auth');

  if (btnAuth) {
    btnAuth.className = `btn-nav-auth ${state.authEnabled ? 'active' : ''}`;
    btnAuth.innerHTML = state.authEnabled 
      ? `<span>🔒 本番保護モード ON</span>` 
      : `<span>🔓 プレビュー閲覧モード</span>`;
  }

  if (!lockScreen) return;

  if (state.authEnabled && !state.isAuthenticated) {
    lockScreen.classList.remove('hidden');
    const lockInput = document.getElementById('lock-input');
    if (lockInput) setTimeout(() => lockInput.focus(), 100);
  } else {
    lockScreen.classList.add('hidden');
  }
}

function attemptUnlock() {
  const input = document.getElementById('lock-input');
  const errEl = document.getElementById('lock-err');
  if (!input) return;

  const entered = input.value.trim().toLowerCase();
  if (VALID_PASSWORDS.includes(entered)) {
    state.isAuthenticated = true;
    localStorage.setItem('gdd_is_authenticated', 'true');
    if (errEl) errEl.style.display = 'none';
    updateAuthStatus();
    showToast('合言葉を確認しました！ようこそGemini Discovery Dayへ 🎉', 'success');

    if (confettiInstance) {
      confettiInstance.fire(window.innerWidth / 2, window.innerHeight / 2, 100);
    }
  } else {
    if (errEl) {
      errEl.style.display = 'block';
      errEl.innerText = '合言葉が違います。会場で案内されたパスワードを入力してください。';
    }
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
  }
}

/* Helper Utilities */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
