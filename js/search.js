const searchScript = document.currentScript;

const categoryPageMap = {
  "エアコン": "/maintenance/aircon/",
  "入居時準備": "/maintenance/movein/",
  "お風呂": "/maintenance/bathroom/",
  "浴室": "/maintenance/bath/",
  "キッチン": "/maintenance/kitchen/",
  "洗面台": "/maintenance/washstand/",
  "洗濯機": "/maintenance/washer/",
  "トイレ": "/maintenance/toilet/",
  "空気清浄機": "/maintenance/airpurifier/",
  "加湿器": "/maintenance/humidifier/",
  "換気": "/maintenance/ventilation/",
  "外まわり": "/maintenance/exterior/",
  "ベランダ": "/maintenance/balcony/",
  "窓まわり": "/maintenance/window/",
  "賃貸": "/maintenance/rental/",
  "設備": "/maintenance/equipment/",
  "その他": "/maintenance/other/"
};

const categoryIntroMap = {
  "エアコン": "フィルター掃除、吹き出し口、室外機まわり、内部クリーニングの考え方を整理します。",
  "入居時準備": "入居直後にやっておくと、あとからの掃除や管理が少し軽くなる予防メンテナンスをまとめます。",
  "お風呂": "排水口、換気扇、防カビ、水垢など、湿気が多い場所のメンテナンスをまとめます。",
  "浴室": "入居時や日常の浴室まわりで、きれいな状態を保ちやすくする作業をまとめます。",
  "キッチン": "排水口、シンク、レンジフード、食洗機など、汚れがたまりやすい場所を整理します。",
  "洗面台": "排水口や排水管、水漏れ確認など、洗面台まわりのメンテナンスをまとめます。",
  "洗濯機": "洗濯槽や分解清掃など、においや見えない汚れが気になる作業をまとめます。",
  "トイレ": "便器、換気扇、ノズル、タンクまわりの確認をまとめます。",
  "空気清浄機": "フィルター掃除など、空気清浄機を使いやすく保つ作業をまとめます。",
  "加湿器": "タンク、トレー、フィルター、クエン酸洗浄など、水まわりのぬめり対策を整理します。",
  "換気": "給気口フィルターなど、空気の通り道を整える作業をまとめます。",
  "外まわり": "外壁、排水口、雑草など、家の外側で気づいた時に見たいポイントをまとめます。",
  "ベランダ": "排水口、防水、床掃除など、雨や砂ぼこりが関わる場所を整理します。",
  "窓まわり": "サッシ、網戸、窓ガラス、結露など、季節ごとに見直したい作業をまとめます。",
  "賃貸": "入居時・退去前に確認しておくと安心な記録やチェックをまとめます。",
  "設備": "給湯器や火災報知器など、無理に分解せず確認したい設備をまとめます。",
  "その他": "住まいの状況に応じて確認したいメンテナンスをまとめます。"
};

const recommendedKeywords = ["エアコン", "浴室", "カビ", "洗濯機", "入居準備", "賃貸", "排水口", "フィルター"];

const categorySynonyms = {
  "入居時準備": ["入居準備", "引っ越し前", "入居前"],
  "お風呂": ["浴室", "風呂", "カビ"],
  "浴室": ["お風呂", "風呂", "カビ"],
  "キッチン": ["台所", "換気扇", "排水口"],
  "洗面台": ["排水口", "水回り"],
  "窓まわり": ["窓", "網戸", "サッシ"]
};

const escapeSearchHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const searchFields = (item) =>
  [
    item.title,
    item.description,
    item.category,
    item.slug,
    item.summary,
    ...(item.tags || []),
    ...(item.targetKeywords || [])
  ]
    .join(" ")
    .toLowerCase();

const resultCard = (item) => `
  <a class="search-result-card card-clickable" href="${escapeSearchHtml(item.url)}">
    <span class="meta">${escapeSearchHtml(item.type)}</span>
    <h2>${escapeSearchHtml(item.title)}</h2>
    <p>${escapeSearchHtml(item.description)}</p>
    <div class="search-result-meta">
      ${item.category ? `<span>${escapeSearchHtml(item.category)}</span>` : ""}
      ${(item.tags || []).slice(0, 4).map((tag) => `<span>${escapeSearchHtml(tag)}</span>`).join("")}
    </div>
    <span class="card-link">ページを見る</span>
  </a>
`;

const buildIndex = (tasks, features) => {
  const categories = Object.keys(categoryPageMap).map((category) => ({
    type: "カテゴリ",
    title: `${category}のメンテナンス`,
    description: categoryIntroMap[category] || "このカテゴリのメンテナンスをまとめています。",
    category,
    tags: [category],
    targetKeywords: [category, `${category} 掃除`, `${category} メンテナンス`, ...(categorySynonyms[category] || [])],
    slug: categoryPageMap[category],
    summary: categoryIntroMap[category],
    url: categoryPageMap[category]
  }));

  const maintenance = tasks.map((task) => ({
    type: "メンテナンス",
    title: task.title,
    description: task.seoDescription || task.summary,
    category: task.category,
    tags: [task.category, task.recommendedFrequency, task.difficulty].filter(Boolean),
    targetKeywords: [task.title, task.seoTitle, task.seoDescription, ...(categorySynonyms[task.category] || [])],
    slug: task.id,
    summary: task.summary,
    url: task.articlePath || categoryPageMap[task.category] || "/maintenance/"
  }));

  const featureItems = features.map((feature) => ({
    ...feature,
    type: "特集",
    url: feature.url
  }));

  return [...categories, ...maintenance, ...featureItems];
};

const renderEmptyState = (container) => {
  container.innerHTML = `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">キーワードで探す</h2>
        <p class="section-desc">おすすめキーワードやカテゴリから、気になるメンテナンスを探せます。</p>
      </div>
      <div class="tag-list keyword-list">
        ${recommendedKeywords.map((keyword) => `<a href="?q=${encodeURIComponent(keyword)}">${escapeSearchHtml(keyword)}</a>`).join("")}
      </div>
    </section>
    <section class="section soft-band">
      <div class="section-head">
        <h2 class="section-title">人気カテゴリ</h2>
        <p class="section-desc">場所から探す場合はこちらからどうぞ。</p>
      </div>
      <div class="grid category-grid">
        ${["エアコン", "お風呂", "キッチン", "洗濯機", "入居時準備", "窓まわり"].map((category) => `
          <a class="category-card card-clickable" href="${escapeSearchHtml(categoryPageMap[category])}">
            <h3>${escapeSearchHtml(category)}</h3>
            <p>${escapeSearchHtml(categoryIntroMap[category])}</p>
            <span class="card-link">カテゴリを見る</span>
          </a>
        `).join("")}
      </div>
    </section>
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">特集</h2>
        <p class="section-desc">季節や暮らし方に合わせて読める記事です。</p>
      </div>
      <div class="hero-actions"><a class="btn btn-secondary" href="/features/">特集を見る</a></div>
    </section>
  `;
};

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("[data-search-page-form]");
  const input = document.querySelector("[data-search-page-input]");
  const summary = document.querySelector("[data-search-summary]");
  const results = document.querySelector("[data-search-results]");
  if (!results || !summary) return;

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  if (input) input.value = query;

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input?.value.trim() || "";
    window.location.href = value ? `?q=${encodeURIComponent(value)}` : window.location.pathname;
  });

  const tasksSrc = searchScript?.dataset?.tasksSrc || "../data/maintenance-tasks.json";
  const featuresSrc = searchScript?.dataset?.featuresSrc || "../data/features.json";

  try {
    const [tasksResponse, featuresResponse] = await Promise.all([fetch(tasksSrc), fetch(featuresSrc)]);
    if (!tasksResponse.ok || !featuresResponse.ok) {
      throw new Error("Failed to load search data");
    }
    const tasksData = await tasksResponse.json();
    const featuresData = await featuresResponse.json();
    const index = buildIndex(tasksData.tasks || [], featuresData.features || []);
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      summary.textContent = "キーワードを入力するか、おすすめキーワードから探してみてください。";
      renderEmptyState(results);
      return;
    }

    const found = index.filter((item) => searchFields(item).includes(normalizedQuery));
    summary.textContent = `「${query}」の検索結果: ${found.length}件`;

    if (!found.length) {
      results.innerHTML = `
        <section class="section">
          <div class="notice-box">
            <h2>該当するページが見つかりませんでした</h2>
            <p>エアコン、浴室、洗濯機、入居準備などのキーワードで探してみてください。</p>
          </div>
          <div class="tag-list keyword-list">
            ${recommendedKeywords.map((keyword) => `<a href="?q=${encodeURIComponent(keyword)}">${escapeSearchHtml(keyword)}</a>`).join("")}
          </div>
        </section>
      `;
      return;
    }

    results.innerHTML = `<div class="search-result-list">${found.map(resultCard).join("")}</div>`;
  } catch (error) {
    console.error(error);
    summary.textContent = "検索データを読み込めませんでした。";
    results.innerHTML = '<p class="muted-text">時間をおいて再度お試しください。</p>';
  }
});
