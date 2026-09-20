(function () {
  const data = window.GAME_JAM_DATA;

  function pageName() {
    const name = location.pathname.split('/').pop() || 'index.html';
    return name === '' ? 'index.html' : name;
  }

  function header() {
    const current = pageName();
    const nav = [
      ['index.html', '首页'],
      ['games.html', '作品'],
      ['rules.html', '规则'],
      ['notices.html', '公告'],
      ['results.html', '结果'],
      ['archive.html', '归档']
    ];
    const pinned = data.notices.find(n => n.pinned) || data.notices[0];
    return `
      ${pinned ? `<div class="notice-bar"><div class="shell"><a href="notices.html"><span class="notice-dot"></span><strong>${pinned.title}</strong><span>查看详情 →</span></a></div></div>` : ''}
      <header class="site-header">
        <div class="shell nav">
          <a class="brand" href="index.html"><span class="brand-mark"></span><span>嘻嘻狐计划<small>AI GAME JAM 01</small></span></a>
          <button class="nav-toggle" type="button" aria-label="打开导航" aria-expanded="false">菜单</button>
          <nav class="nav-links" aria-label="主要导航">
            ${nav.map(([href, label]) => `<a href="${href}" ${current === href ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
          </nav>
        </div>
      </header>`;
  }

  function footer() {
    return `<footer class="site-footer"><div class="shell footer-grid"><div><strong>嘻嘻狐 AI Game Jam</strong><p>一个小规模、可持续的 AI 游戏展览与评选实验。</p></div><div class="footer-links"><a href="rules.html">活动规则</a><a href="notices.html">公告</a><a href="../">返回个人主页</a></div></div></footer>`;
  }

  function mountChrome() {
    const head = document.querySelector('[data-site-header]');
    const foot = document.querySelector('[data-site-footer]');
    if (head) head.outerHTML = header();
    if (foot) foot.outerHTML = footer();
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function eventValues() {
    document.querySelectorAll('[data-event]').forEach(el => {
      const key = el.dataset.event;
      if (key in data.event) el.textContent = data.event[key];
    });
    document.querySelectorAll('[data-submit]').forEach(el => {
      if (data.event.submissionFormUrl) {
        el.href = data.event.submissionFormUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      } else {
        el.classList.add('disabled');
        el.setAttribute('aria-disabled', 'true');
        el.textContent = '投稿入口准备中';
      }
    });
  }

  function renderGames(filter = 'all') {
    const target = document.querySelector('[data-game-list]');
    if (!target) return;
    const games = data.games.filter(game => filter === 'all' || game.platforms.includes(filter));
    if (!games.length) {
      target.innerHTML = `<div class="empty"><strong>首批作品正在集合</strong><p>正式征集开放后，通过基础审核的作品都会在这里拥有独立页面。</p><a class="button secondary" href="rules.html">先了解规则</a></div>`;
      target.className = '';
      return;
    }
    target.className = 'game-grid';
    target.innerHTML = games.map(game => `<a class="game-card" href="game.html?id=${encodeURIComponent(game.gameId)}"><div class="game-cover">${game.title.slice(0, 1)}</div><div class="game-body"><span class="eyebrow">${game.platforms.join(' · ')}</span><h3>${game.title}</h3><p>${game.summary}</p></div></a>`).join('');
  }

  function renderNotices() {
    const target = document.querySelector('[data-notice-list]');
    if (!target) return;
    const labels = { normal: '普通公告', reminder: '提醒', important: '重要公告', emergency: '紧急公告', game: '作品公告' };
    target.innerHTML = data.notices.map(n => `<article class="notice-card" id="${n.id}"><div><div class="notice-type">${labels[n.type] || '公告'}</div><div class="notice-date">${n.publishedAt}</div></div><div><h3>${n.title}</h3><p>${n.content || n.summary}</p></div></article>`).join('');
  }

  function renderFeatured() {
    const target = document.querySelector('[data-featured]');
    if (!target) return;
    if (!data.games.length) {
      target.innerHTML = `<div class="empty"><strong>这里将出现第一批 AI 游戏</strong><p>网页作品和 Windows 下载作品都可以参加。我们会人工试玩，确认基本可玩后再发布。</p></div>`;
      return;
    }
    target.className = 'game-grid';
    target.innerHTML = data.games.slice(0, 3).map(game => `<a class="game-card" href="game.html?id=${encodeURIComponent(game.gameId)}"><div class="game-cover">${game.title.slice(0, 1)}</div><div class="game-body"><h3>${game.title}</h3><p>${game.summary}</p></div></a>`).join('');
  }

  function renderGameDetail() {
    const target = document.querySelector('[data-game-detail]');
    if (!target) return;
    const id = new URLSearchParams(location.search).get('id');
    const game = data.games.find(item => item.gameId === id);
    if (!game) {
      target.innerHTML = `<section class="page-hero"><div class="shell"><div class="breadcrumb"><a href="index.html">首页</a> / <a href="games.html">作品</a> / 详情</div><h1 class="page-title">作品详情</h1><p>作品可能尚未发布、链接有误，或正在维护。</p></div></section><section class="section compact"><div class="shell"><div class="empty"><strong>未找到对应作品</strong><p>首批作品通过审核后，将按永久作品 ID 自动填充内容。</p><a class="button secondary" href="games.html">返回作品展厅</a></div></div></section>`;
      return;
    }
    document.title = `${game.title}｜嘻嘻狐 AI Game Jam`;
    const action = game.playUrl ? `<a class="button" href="${game.playUrl}" target="_blank" rel="noopener noreferrer">${game.platforms.includes('Web') ? '在线游玩' : '下载游戏'} ↗</a>` : `<span class="button disabled">链接维护中</span>`;
    target.innerHTML = `<section class="page-hero"><div class="shell"><div class="breadcrumb"><a href="index.html">首页</a> / <a href="games.html">作品</a> / ${game.title}</div><p class="eyebrow">${game.platforms.join(' · ')}</p><h1 class="page-title">${game.title}</h1><p>${game.summary}</p><div class="actions">${action}</div></div></section><section class="section compact"><div class="shell split"><article class="panel"><p class="eyebrow">作者</p><h3>${game.author}</h3><p>${game.description || game.summary}</p></article><article class="panel accent"><p class="eyebrow">AI 使用</p><h3>${(game.aiTools || []).join(' · ') || '待补充'}</h3><p>${game.aiUsage || '作者尚未补充详细说明。'}</p></article></div></section>`;
  }

  function filters() {
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      renderGames(button.dataset.filter);
    }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    mountChrome();
    eventValues();
    renderFeatured();
    renderGames();
    renderNotices();
    renderGameDetail();
    filters();
  });
})();
