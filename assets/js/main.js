(function () {
  "use strict";

  const CONFIG = window.SITE_CONFIG || {};

  /* ---------------------------------------------------------------------
   * Utilities
   * ------------------------------------------------------------------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  async function fetchJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed: " + path);
    return res.json();
  }

  /* ---------------------------------------------------------------------
   * Loader
   * ------------------------------------------------------------------- */
  window.addEventListener("load", () => {
    const loader = qs("#loader");
    if (loader) setTimeout(() => loader.classList.add("hide"), 350);
  });

  /* ---------------------------------------------------------------------
   * Scroll reveal
   * ------------------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  function observeReveals(container) {
    qsa(".reveal", container).forEach((node) => revealObserver.observe(node));
  }

  /* ---------------------------------------------------------------------
   * Works Archive — data render, tabs, lightbox
   * ------------------------------------------------------------------- */
  const RHYTHM = ["l", "m", "m", "s", "m", "l", "s", "m"]; // visual rhythm cycle (used for scenes/party)

  function workCardHTML(w) {
    const flag = w.needsReview
      ? '<span class="flag" title="확인 필요">확인필요</span>'
      : (w.multiWork ? '<span class="flag" style="background:var(--sage)">' + (w.workCount || 2) + '점</span>' : "");
    return (
      '<div class="work-thumb">' +
        '<img src="' + w.thumb + '" alt="' + w.name + ', ' + w.title + '" loading="lazy">' +
        flag +
      '</div>' +
      '<div class="work-cap">' +
        '<div class="row1"><span class="cohort">' + w.cohort + '</span><span class="name">' + w.name + '</span></div>' +
        '<div class="title">' + w.title + '</div>' +
        '<div class="sub">' + w.major + ' · ' + w.year + ' · ' + w.material + ' · ' + w.size + '</div>' +
      '</div>'
    );
  }

  function renderWorksGrid(list, container) {
    container.innerHTML = "";
    list.forEach((w, i) => {
      const card = el("div", "work-card reveal");
      card.innerHTML = workCardHTML(w);
      card.addEventListener("click", () => openModal(list, i));
      container.appendChild(card);
    });
    observeReveals(container);
  }

  let modalState = { list: [], index: 0 };

  function renderModal() {
    const w = modalState.list[modalState.index];
    if (!w) return;
    qs("#modalImg").src = w.image;
    qs("#modalImg").alt = w.name + ", " + w.title;
    qs("#modalCohort").textContent = w.cohort;
    qs("#modalName").textContent = w.name;
    qs("#modalTitle").textContent = w.title;
    qs("#modalMajor").textContent = w.major + " · " + w.year;
    qs("#modalMaterial").textContent = w.material;
    qs("#modalSize").textContent = w.size;
    const noteEl = qs("#modalNote");
    if (w.reviewNote) {
      noteEl.style.display = "block";
      noteEl.textContent = "⚠ " + w.reviewNote;
    } else {
      noteEl.style.display = "none";
    }
  }

  function openModal(list, index) {
    modalState = { list, index };
    renderModal();
    qs("#modalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    qs("#modalOverlay").classList.remove("open");
    document.body.style.overflow = "";
  }
  function stepModal(dir) {
    const len = modalState.list.length;
    if (!len) return;
    modalState.index = (modalState.index + dir + len) % len;
    renderModal();
  }

  function initModal() {
    qs("#modalClose").addEventListener("click", closeModal);
    qs("#modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") closeModal();
    });
    qs("#modalPrev").addEventListener("click", () => stepModal(-1));
    qs("#modalNext").addEventListener("click", () => stepModal(1));
    document.addEventListener("keydown", (e) => {
      if (!qs("#modalOverlay").classList.contains("open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") stepModal(-1);
      if (e.key === "ArrowRight") stepModal(1);
    });
  }

  async function initWorks() {
    let data;
    try {
      data = await fetchJSON("assets/data/works.json");
    } catch (err) {
      console.error("작품 데이터를 불러오지 못했습니다.", err);
      return;
    }
    const alumniList = data.alumni.slice().sort((a, b) => a.cohortNum - b.cohortNum);
    const studentList = data.student.slice().sort((a, b) => a.cohortNum - b.cohortNum);

    qs("#tabAlumniCount").textContent = alumniList.length;
    qs("#tabStudentCount").textContent = studentList.length;

    const alumniGrid = qs("#alumniGrid");
    const studentGrid = qs("#studentGrid");
    renderWorksGrid(alumniList, alumniGrid);
    renderWorksGrid(studentList, studentGrid);

    const tabs = qsa(".works-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.target;
        alumniGrid.style.display = target === "alumni" ? "" : "none";
        studentGrid.style.display = target === "student" ? "" : "none";
      });
    });

    initModal();
  }

  /* ---------------------------------------------------------------------
   * Awards
   * ------------------------------------------------------------------- */
  async function initAwards() {
    let list;
    try {
      list = await fetchJSON("assets/data/awards.json");
    } catch (err) {
      console.error("수상 데이터를 불러오지 못했습니다.", err);
      return;
    }
    const grid = qs("#awardsGrid");
    grid.innerHTML = list
      .map(
        (a) => `
      <div class="award-card reveal">
        <div class="award-photo">
          <img src="${a.image}" alt="${a.titleKo} - ${a.name}" loading="lazy">
          <span class="award-ribbon">${a.titleEn}</span>
        </div>
        <div class="award-body">
          <div class="ko">${a.titleKo}</div>
          <div class="who"><b>${a.cohort} ${a.name}</b>${a.workTitle ? " · " + a.workTitle : ""}</div>
          ${a.note ? `<div class="note">＊ ${a.note}</div>` : ""}
        </div>
      </div>`
      )
      .join("");
    observeReveals(grid);
  }

  /* ---------------------------------------------------------------------
   * Folder auto-loading (GitHub Contents API) with manifest fallback
   * Used for: Party & People / Exhibition Scenes extension
   * ------------------------------------------------------------------- */
  async function listFolderImages(folderPath, manifestPath) {
    const repo = (CONFIG.GITHUB_REPO || "").trim();
    if (repo) {
      try {
        const branch = CONFIG.GITHUB_BRANCH || "main";
        const api = `https://api.github.com/repos/${repo}/contents/${folderPath}?ref=${branch}`;
        const res = await fetch(api);
        if (res.ok) {
          const items = await res.json();
          const files = items
            .filter((it) => it.type === "file" && /\.(jpe?g|png|webp)$/i.test(it.name))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((it) => it.download_url);
          if (files.length) return files;
        }
      } catch (err) {
        console.warn("GitHub API 로딩 실패, 매니페스트로 대체합니다.", err);
      }
    }
    // Fallback: local manifest file (works fully offline / before repo configured)
    try {
      const names = await fetchJSON(manifestPath);
      return names.map((n) => folderPath + "/" + n);
    } catch (err) {
      console.error("매니페스트도 불러오지 못했습니다.", err);
      return [];
    }
  }

  function renderPhotoMasonry(urls, container, emptyMessage) {
    container.innerHTML = "";
    if (!urls.length) {
      container.innerHTML = '<div class="party-empty">' + emptyMessage + "</div>";
      return;
    }
    urls.forEach((url, i) => {
      const size = RHYTHM[i % RHYTHM.length];
      const item = el("div", "party-item reveal size-" + size);
      const img = el("img");
      img.src = url;
      img.loading = "lazy";
      img.alt = "";
      item.appendChild(img);
      container.appendChild(item);
    });
    observeReveals(container);
  }

  async function initParty() {
    const container = qs("#partyGrid");
    const urls = await listFolderImages(CONFIG.PARTY_FOLDER || "assets/img/party", "assets/data/party-manifest.json");
    renderPhotoMasonry(urls, container, "사진을 불러오는 중이거나 아직 없습니다.");
  }

  async function initScenesExtra() {
    // Base 4 curated photos are already in the static HTML for a fixed editorial
    // layout. Anything added to the folder beyond those four appears here.
    const container = qs("#sceneExtra");
    if (!container) return;
    const KNOWN = ["scene-01.jpg", "scene-02.jpg", "scene-03.jpg", "scene-04.jpg"];
    const urls = await listFolderImages(CONFIG.SCENES_FOLDER || "assets/img/scenes", "assets/data/scenes-manifest.json");
    const extra = urls.filter((u) => !KNOWN.some((k) => u.endsWith(k)));
    if (!extra.length) return;
    extra.forEach((url, i) => {
      const size = RHYTHM[i % RHYTHM.length];
      const item = el("div", "scene-item reveal size-" + size);
      const img = el("img");
      img.src = url;
      img.loading = "lazy";
      img.alt = "전시 현장 추가 사진";
      item.appendChild(img);
      container.appendChild(item);
    });
    observeReveals(container);
  }

  /* ---------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    observeReveals(document);

    initWorks();
    initAwards();
    initParty();
    initScenesExtra();
  });
/* Section Navigation */
  function initSectionNav() {
    const navLinks = qsa(".section-nav a[data-section]");
    const sections = qsa("section[data-section]");
    
    // Click navigation
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        const section = qs('section[data-section="' + sectionId + '"]');
        if (section) section.scrollIntoView({ behavior: "smooth" });
      });
    });
    
    // Scroll-based active state
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section");
            navLinks.forEach(l => l.classList.toggle("active", l.dataset.section === id));
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach(s => navObserver.observe(s));
  }

  document.addEventListener("DOMContentLoaded", () => {
    observeReveals(document);
    initSectionNav();
    initWorks();
    initAwards();
    initParty();
    initScenesExtra();
  });
})();
