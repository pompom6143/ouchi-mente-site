(() => {
  const currentScript = document.currentScript || document.querySelector('script[src$="common-parts.js"]');
  const siteRoot = currentScript ? new URL("../", currentScript.src) : new URL("./", window.location.href);
  const appStoreUrl = "https://apps.apple.com/jp/app/%E3%81%8A%E3%81%86%E3%81%A1%E3%83%A1%E3%83%B3%E3%83%86-%E6%8E%83%E9%99%A4-%E5%AE%B6%E4%BA%8B%E7%AE%A1%E7%90%86/id6742120333";

  const url = (path) => new URL(path, siteRoot).href;

  const ensureHeadLink = (rel, href, type) => {
    const existing = document.head.querySelector(`link[rel="${rel}"]`);

    if (existing) {
      existing.href = href;
      if (type) {
        existing.type = type;
      }
      return;
    }

    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (type) {
      link.type = type;
    }
    document.head.append(link);
  };

  ensureHeadLink("icon", url("images/app-icon.png"), "image/png");
  ensureHeadLink("apple-touch-icon", url("images/app-icon.png"));

  const headerHtml = () => `
    <header class="site-header">
      <div class="site-container header-inner">
        <a href="${url("")}" class="logo-group">
          <img src="${url("images/app-icon.png")}" alt="おうちメンテ ロゴ" />
          <span class="site-title">おうちメンテ</span>
        </a>
        <button class="nav-toggle" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="site-nav">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav class="site-nav" id="site-nav" aria-label="サイト内メニュー">
          <ul>
            <li><a href="${url("")}">ホーム</a></li>
            <li><a href="${url("maintenance/")}">カテゴリ</a></li>
            <li><a href="${url("features/")}">特集</a></li>
            <li><a href="${url("app/")}">アプリ紹介</a></li>
          </ul>
          <form class="header-search" action="${url("search/")}" role="search">
            <label class="sr-only" for="header-search-input">サイト内検索</label>
            <input id="header-search-input" name="q" type="search" placeholder="キーワードで探す" autocomplete="off" />
            <button type="submit" aria-label="検索する">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="6"></circle>
                <path d="m16 16 4 4"></path>
              </svg>
            </button>
          </form>
        </nav>
      </div>
    </header>
  `;

  const appPromoHtml = (target, wrapInContainer) => {
    const isTaskPromo = target?.dataset?.commonAppPromo === "task";
    const title = isTaskPromo ? "このメンテナンスを忘れず管理したい方へ" : "メンテナンスを忘れず管理したい方へ";
    const description = isTaskPromo
      ? "おうちメンテアプリなら、このメンテナンスを家庭に合った頻度でタスク管理できます。"
      : "おうちメンテアプリなら、エアコン掃除や換気扇掃除など、定期的にやることをタスクとして管理できます。";
    const content = `
      <div class="media-cta">
        <div class="app-spotlight">
          <img src="${url("images/app-icon.png")}" alt="おうちメンテ アプリアイコン" />
          <div>
            <h2 class="section-title">${title}</h2>
            <p>${description}</p>
          </div>
        </div>
        <div class="actions app-promo-actions">
          <a class="btn btn-secondary" href="${url("app/")}">アプリ紹介を見る</a>
          <a class="btn btn-secondary" href="${appStoreUrl}" target="_blank" rel="noopener">App Storeで見る</a>
        </div>
      </div>
    `;

    return `
    <section class="${isTaskPromo ? "app-promo-section" : "section"}">
      ${wrapInContainer ? `<div class="site-container section-narrow">${content}</div>` : content}
    </section>
  `;
  };

  const footerHtml = () => `
    <footer class="footer">
      <div class="site-container footer-inner">
        <div class="logo-group">
          <img src="${url("images/app-icon.png")}" alt="おうちメンテ ロゴ" />
          <span class="site-title">おうちメンテ</span>
        </div>
        <p>家のメンテナンスを、わかりやすく整理する暮らしメディア。</p>
        <ul class="footer-links">
          <li><a href="${url("maintenance/")}">カテゴリ一覧</a></li>
          <li><a href="${url("features/")}">特集</a></li>
          <li><a href="${url("search/")}">検索</a></li>
          <li><a href="${url("app/")}">アプリ</a></li>
          <li><a href="${url("privacy-policy/")}">プライバシーポリシー</a></li>
          <li><a href="${url("disclaimer/")}">免責事項</a></li>
          <li><a href="${url("affiliate-disclosure/")}">アフィリエイト開示</a></li>
          <li><a href="${url("about/")}">運営者情報</a></li>
          <li><a href="${url("contact/")}">お問い合わせ</a></li>
        </ul>
        <p class="footer-copy">&copy; おうちメンテ / ouchi-mente.jp</p>
      </div>
    </footer>
  `;

  const renderCommonParts = () => {
    document.querySelectorAll("[data-common-header]").forEach((target) => {
      target.outerHTML = headerHtml();
    });

    document.querySelectorAll("[data-common-app-promo]").forEach((target) => {
      target.outerHTML = appPromoHtml(target, !target.closest(".page-shell"));
    });

    document.querySelectorAll("[data-common-footer]").forEach((target) => {
      target.outerHTML = footerHtml();
    });
  };

  const initNavigation = () => {
    document.querySelectorAll(".nav-toggle").forEach((toggle) => {
      const header = toggle.closest("header");
      const navId = toggle.getAttribute("aria-controls");
      const nav = navId ? document.getElementById(navId) : null;

      if (!header || !nav) {
        return;
      }

      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.setAttribute("aria-label", isOpen ? "メニューを開く" : "メニューを閉じる");
        header.classList.toggle("nav-open", !isOpen);
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "メニューを開く");
          header.classList.remove("nav-open");
        });
      });
    });
  };

  const initHeaderSearch = () => {
    document.querySelectorAll(".header-search").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector('input[name="q"]');
        const query = input?.value.trim() || "";
        const action = form.getAttribute("action") || url("search/");
        window.location.href = query ? `${action}?q=${encodeURIComponent(query)}` : action;
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderCommonParts();
    initNavigation();
    initHeaderSearch();
  });
})();
