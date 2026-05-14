/* =============================================
   shared.js — SotPhim Shared Library v1.0
   Used by: new-movie.html, country.html, genre.html
   ============================================= */

/* ── STATIC DATA ── */
const khuVucData = {
  data: { items: [
    ["Trung Quốc","trung-quoc"],["Hàn Quốc","han-quoc"],["Nhật Bản","nhat-ban"],["Thái Lan","thai-lan"],["Âu Mỹ","au-my"],
    ["Đài Loan","dai-loan"],["Hồng Kông","hong-kong"],["Ấn Độ","an-do"],["Anh","anh"],["Pháp","phap"],["Canada","canada"],
    ["Quốc Gia Khác","quoc-gia-khac"],["Đức","duc"],["Tây Ban Nha","tay-ban-nha"],["Thổ Nhĩ Kỳ","tho-nhi-ky"],["Hà Lan","ha-lan"],
    ["Indonesia","indonesia"],["Nga","nga"],["Mexico","mexico"],["Ba lan","ba-lan"],["Úc","uc"],["Thụy Điển","thuy-dien"],
    ["Malaysia","malaysia"],["Brazil","brazil"],["Philippines","philippines"],["Bồ Đào Nha","bo-dao-nha"],["Ý","y"],
    ["Đan Mạch","dan-mach"],["UAE","uae"],["Na Uy","na-uy"],["Thụy Sĩ","thuy-si"],["Châu Phi","chau-phi"],["Nam Phi","nam-phi"],
    ["Ukraina","ukraina"],["Ả Rập Xê Út","a-rap-xe-ut"],["Bỉ","bi"],["Ireland","ireland"],["Colombia","colombia"],
    ["Phần Lan","phan-lan"],["Việt Nam","viet-nam"],["Chile","chile"],["Hy Lạp","hy-lap"],["Nigeria","nigeria"],
    ["Argentina","argentina"],["Singapore","singapore"]
  ].map(([n,s]) => ({ name: n, slug: s })) }
};
const theLoaiData = {
  data: { items: [
    ["Hành Động","hanh-dong"],["Tình Cảm","tinh-cam"],["Hài Hước","hai-huoc"],["Cổ Trang","co-trang"],["Tâm Lý","tam-ly"],
    ["Hình Sự","hinh-su"],["Chiến Tranh","chien-tranh"],["Thể Thao","the-thao"],["Võ Thuật","vo-thuat"],["Viễn Tưởng","vien-tuong"],
    ["Phiêu Lưu","phieu-luu"],["Khoa Học","khoa-hoc"],["Kinh Dị","kinh-di"],["Âm Nhạc","am-nhac"],["Thần Thoại","than-thoai"],
    ["Tài Liệu","tai-lieu"],["Gia Đình","gia-dinh"],["Chính Kịch","chinh-kich"],["Bí Ẩn","bi-an"],["Học Đường","hoc-duong"],
    ["Kinh Điển","kinh-dien"],["Phim 18+","phim-18"],["Short Drama","short-drama"]
  ].map(([n,s]) => ({ name: n, slug: s })) }
};

/* ── CONSTANTS ── */
const FALLBACK_CDN = "https://img.ophim.live/uploads/movies/";
let cdnImage = FALLBACK_CDN;
const BASE_API = "https://ophim1.com";
const PLACEHOLDER_IMG = "https://via.placeholder.com/150x220/0b1220/9aa4b2?text=No+Image";
const totalFrames = 21;
let animationId = null;
let searchAnimationId = null;
let debounceTimer = null;

/* ── DOM REFS (bound in initHeader) ── */
let hamburger, sideMenu, overlay, searchBtn, searchWrap, searchInput,
    searchResults, searchAnimIcon, brand, searchIcon, iconContainer;

/* ── HELPERS ── */
function getImageUrl(path, cdnBase) {
  if (!path) return PLACEHOLDER_IMG;
  if (path.startsWith('http')) return path;
  return `${cdnBase || cdnImage}${path}`;
}

function getEpisodeBadge(movie) {
  const ep = movie.episode_current || '';
  if (!ep) return movie.type === 'single' ? 'Full' : 'HD';
  if (ep.toLowerCase().includes('full') || ep.toLowerCase().includes('hoàn tất')) return 'Full';
  return ep;
}

/* ── CARD RENDERING ── */
function renderCards(container, movies) {
  if (!container) return;
  if (!movies.length) {
    container.innerHTML = '<p style="padding:40px;text-align:center;color:var(--muted);grid-column:1/-1;">Không có phim nào.</p>';
    return;
  }
  container.innerHTML = movies.map(movie => {
    const imgSrc = getImageUrl(movie.thumb_url);
    const badge = getEpisodeBadge(movie);
    return `<div class="card-item">
      <a href="phim.html?slug=${movie.slug}" style="text-decoration:none;color:inherit;">
        <div class="card-poster">
          <img class="poster-img" src="${imgSrc}" alt="${movie.name}" loading="lazy"
            onload="this.classList.add('loaded')"
            onerror="this.src='${PLACEHOLDER_IMG}';this.classList.add('loaded')">
          <div class="card-episode">${badge}</div>
        </div>
        <div class="card-title" title="${movie.name}">${movie.name}</div>
      </a>
    </div>`;
  }).join('');
}

function renderSkeletons(container, count = 24) {
  if (!container) return;
  container.innerHTML = Array(count).fill(0).map(() =>
    `<div class="card-item is-loading"><div class="card-poster"></div><div class="card-title"></div></div>`
  ).join('');
}

/* ── PAGINATION ── */
function renderPagination(totalPages, currentPage) {
  const wrap = document.getElementById('pagination');
  if (!wrap) return;
  if (totalPages <= 1) { wrap.innerHTML = ''; return; }

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) pages.push(i);
  }
  const items = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) items.push('…');
    items.push(p);
    prev = p;
  }

  wrap.innerHTML = `
    <div class="pg-bar">
      <button class="pg-btn" ${currentPage===1?'disabled':''} onclick="goToPage(${currentPage-1})">
        <i class="fa-solid fa-chevron-left"></i> Trước
      </button>
      <div class="pg-nums">
        ${items.map(p => p === '…'
          ? `<span class="pg-dot">…</span>`
          : `<button class="pg-btn pg-num${p===currentPage?' pg-active':''}" onclick="goToPage(${p})">${p}</button>`
        ).join('')}
      </div>
      <button class="pg-btn" ${currentPage===totalPages?'disabled':''} onclick="goToPage(${currentPage+1})">
        Sau <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
    <div class="pg-info">Trang <strong>${currentPage}</strong> / ${totalPages}</div>`;
}

/* ── HAMBURGER ── */
function setFrame(step) {
  if (!iconContainer) return;
  for (let i = 0; i <= totalFrames; i++) iconContainer.classList.remove(`icon-frame_${i.toString().padStart(2,'0')}`);
  iconContainer.classList.add(`icon-frame_${step.toString().padStart(2,'0')}`);
}

function animateHamburger(isOpening) {
  if (animationId) cancelAnimationFrame(animationId);
  if (isWideScreen()) { setFrame(isOpening ? totalFrames : 0); return; }
  const start = isOpening ? 0 : totalFrames, end = isOpening ? totalFrames : 0;
  const dur = 175; let t0 = null;
  const step = ts => {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    setFrame(Math.max(0, Math.min(totalFrames, Math.round(start + (end-start)*(isOpening?p:1-Math.pow(1-p,3))))));
    if (p < 1) animationId = requestAnimationFrame(step);
  };
  animationId = requestAnimationFrame(step);
}

function openMenu()  { sideMenu.classList.add('open');    overlay.classList.add('show');    animateHamburger(true);  }
function closeMenu() { sideMenu.classList.remove('open'); overlay.classList.remove('show'); animateHamburger(false); }

/* ── SEARCH ICON ── */
function setSearchFrame(step) {
  if (!searchAnimIcon) return;
  for (let i = 0; i <= totalFrames; i++) searchAnimIcon.classList.remove(`icon-frame_${i.toString().padStart(2,'0')}`);
  searchAnimIcon.classList.add(`icon-frame_${step.toString().padStart(2,'0')}`);
}

function animateSearchIcon(opening) {
  if (searchAnimationId) cancelAnimationFrame(searchAnimationId);
  if (isWideScreen()) { setSearchFrame(opening ? 21 : 2); return; }
  const start = opening ? 2 : 21, end = opening ? 21 : 2;
  const dur = 180; let t0 = null;
  const step = ts => {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    setSearchFrame(Math.max(2, Math.min(21, Math.round(start + (end-start)*p))));
    if (p < 1) searchAnimationId = requestAnimationFrame(step);
  };
  searchAnimationId = requestAnimationFrame(step);
}

function isWideScreen() {
  return window.matchMedia('(min-width:1024px)').matches || window.matchMedia('(orientation:landscape)').matches;
}

function openSearch() {
  if (isWideScreen()) { searchInput?.focus(); return; }
  searchWrap.classList.add('open'); brand?.classList.add('hide');
  if (searchIcon) { searchIcon.style.opacity='0'; searchIcon.style.transform='scale(.8)'; }
  searchAnimIcon?.classList.add('show'); setSearchFrame(2); animateSearchIcon(true);
  setTimeout(() => searchInput?.focus(), 100);
}

function closeSearch() {
  if (isWideScreen()) return;
  if (!searchWrap?.classList.contains('open')) return;
  searchWrap.classList.remove('open'); searchResults?.classList.remove('show');
  animateSearchIcon(false);
  setTimeout(() => {
    searchAnimIcon?.classList.remove('show');
    if (searchIcon) { searchIcon.style.opacity='1'; searchIcon.style.transform='scale(1)'; }
  }, 180);
  brand?.classList.remove('hide');
  if (searchInput) searchInput.value = '';
}

/* ── SEARCH LOGIC ── */
function showSearchSkeletons() {
  if (!searchResults) return;
  searchResults.innerHTML = Array(3).fill(0).map(() => `
    <div class="search-item-result">
      <div class="skeleton sk-img"></div>
      <div class="search-item-info" style="width:100%">
        <div class="skeleton sk-text"></div>
        <div style="display:flex;gap:5px"><div class="skeleton sk-tag"></div><div class="skeleton sk-tag"></div></div>
      </div>
    </div>`).join('');
  searchResults.classList.add('show');
}

function doSearch(keyword) {
  showSearchSkeletons();
  fetch(`${BASE_API}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`)
    .then(r => r.json())
    .then(data => {
      if (!searchResults) return;
      if (data.status === 'success' && data.data.items?.length > 0) {
        searchResults.innerHTML = data.data.items.slice(0,5).map(item => {
          const img = getImageUrl(item.thumb_url);
          return `<a href="phim.html?slug=${item.slug}" class="search-item-result">
            <img src="${img}" alt="${item.name}" onerror="this.src='${PLACEHOLDER_IMG}'">
            <div class="search-item-info">
              <div class="search-item-name">${item.name}</div>
              <div class="search-item-tags">
                <span class="search-item-tag highlight">${item.episode_current||'Full'}</span>
                <span class="search-item-tag">${item.quality||'HD'}</span>
                <span class="search-item-tag">${item.year||''}</span>
              </div>
            </div>
          </a>`;
        }).join('') + `<a href="https://ophim1.com/tim-kiem?keyword=${encodeURIComponent(keyword)}" target="_blank"
          style="display:block;text-align:center;padding:10px;font-size:12px;color:var(--accent);text-decoration:none;background:rgba(255,107,107,.05);border-top:1px solid rgba(255,255,255,.05);">
          Xem tất cả <i class="fa-solid fa-chevron-right" style="font-size:10px;margin-left:4px;"></i></a>`;
      } else {
        searchResults.innerHTML = '<div style="padding:15px;font-size:12px;color:var(--muted);text-align:center;">Không tìm thấy phim...</div>';
      }
    })
    .catch(() => {
      if (searchResults) searchResults.innerHTML = '<div style="padding:15px;font-size:12px;color:var(--muted);text-align:center;">Lỗi kết nối...</div>';
    });
}

/* ── DROPDOWNS ── */
function initDropdowns() {
  const configs = [
    { triggerId:'dropKhuVuc',  containerId:'listKhuVuc',  data: khuVucData.data.items,  urlBase:'country.html?slug=' },
    { triggerId:'dropTheLoai', containerId:'listTheLoai', data: theLoaiData.data.items, urlBase:'genre.html?slug='   }
  ];
  configs.forEach(conf => {
    const container = document.getElementById(conf.containerId);
    const trigger   = document.getElementById(conf.triggerId);
    if (!container || !trigger) return;
    container.innerHTML = conf.data.map(item =>
      `<a href="${conf.urlBase}${item.slug}" role="menuitem">${item.name}</a>`
    ).join('');
    trigger.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      document.querySelectorAll('.dropdown-content').forEach(el => { if (el.id !== conf.containerId) el.classList.remove('show'); });
      document.querySelectorAll('.dropdown-trigger').forEach(el => { if (el.id !== conf.triggerId) el.classList.remove('active'); });
      const isOpen = container.classList.toggle('show');
      trigger.classList.toggle('active');
      if (isOpen) setTimeout(() => container.scrollIntoView({ behavior:'smooth', block:'nearest' }), 300);
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.menu-item-dropdown')) {
      document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('show'));
      document.querySelectorAll('.dropdown-trigger').forEach(el => el.classList.remove('active'));
    }
  });
}

/* ── HEADER INIT (call once in DOMContentLoaded) ── */
function initHeader() {
  hamburger      = document.getElementById('hamburger');
  sideMenu       = document.getElementById('sidemenu');
  overlay        = document.getElementById('overlay');
  searchBtn      = document.getElementById('searchBtn');
  searchWrap     = document.getElementById('searchWrap');
  searchInput    = document.getElementById('searchInput');
  searchResults  = document.getElementById('searchResults');
  searchAnimIcon = document.getElementById('searchAnimIcon');
  brand          = document.querySelector('.brand');
  searchIcon     = searchBtn?.querySelector('i');
  iconContainer  = hamburger?.querySelector('.hamburger-icon');

  const yr = document.getElementById('yr');
  const fy = document.getElementById('footerYear');
  const year = new Date().getFullYear();
  if (yr) yr.textContent = year;
  if (fy) fy.textContent = year;

  initDropdowns();
  if (iconContainer) iconContainer.classList.add('icon-frame_00');

  if (hamburger) hamburger.onclick = () => sideMenu.classList.contains('open') ? closeMenu() : openMenu();
  if (overlay)   overlay.onclick   = () => { closeMenu(); closeSearch(); };
  if (searchBtn) searchBtn.onclick  = () => {
    if (isWideScreen()) { searchInput?.focus(); return; }
    searchWrap.classList.contains('open') ? closeSearch() : openSearch();
  };

  if (searchInput) {
    searchInput.oninput = e => {
      const kw = e.target.value.trim();
      clearTimeout(debounceTimer);
      const spinner = document.getElementById('searchSpinner');
      if (kw.length < 2) { searchResults?.classList.remove('show'); spinner?.classList.remove('active'); return; }
      spinner?.classList.add('active');
      debounceTimer = setTimeout(() => { spinner?.classList.remove('active'); doSearch(kw); }, 500);
    };
    searchInput.onkeydown = e => {
      if (e.key === 'Enter' && searchInput.value.trim())
        window.open(`https://ophim1.com/tim-kiem?keyword=${encodeURIComponent(searchInput.value.trim())}`, '_blank');
      if (e.key === 'Escape') closeSearch();
    };
  }

  document.addEventListener('click', e => {
    if (!isWideScreen() && !e.target.closest('.header-right')) closeSearch();
  });
}
