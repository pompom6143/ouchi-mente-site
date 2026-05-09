const categoryDataCache = new Map();
const categoryScript = document.currentScript;

const categoryPageMap = {
  "エアコン": "aircon/index.html",
  "入居時準備": "movein/index.html",
  "お風呂": "bathroom/index.html",
  "浴室": "bath/index.html",
  "キッチン": "kitchen/index.html",
  "洗面台": "washstand/index.html",
  "洗濯機": "washer/index.html",
  "トイレ": "toilet/index.html",
  "空気清浄機": "airpurifier/index.html",
  "加湿器": "humidifier/index.html",
  "換気": "ventilation/index.html",
  "外まわり": "exterior/index.html",
  "ベランダ": "balcony/index.html",
  "窓まわり": "window/index.html",
  "賃貸": "rental/index.html",
  "設備": "equipment/index.html",
  "その他": "other/index.html"
};

const categoryIntroMap = {
  "エアコン": "フィルター掃除、吹き出し口、室外機まわり、内部クリーニングの考え方を整理します。",
  "入居時準備": "入居直後にやっておくと、あとからの掃除や管理が少し軽くなる予防メンテナンスをまとめます。",
  "お風呂": "排水口、換気扇、防カビ、水垢など、湿気が多い場所のメンテナンスをまとめます。",
  "浴室": "入居時や日常の浴室まわりで、きれいな状態を保ちやすくする作業をまとめます。",
  "キッチン": "排水口、シンク、レンジフード、食洗機など、汚れがたまりやすい場所を整理します。",
  "洗濯機": "洗濯槽や分解清掃など、においや見えない汚れが気になる作業をまとめます。",
  "空気清浄機": "フィルター掃除など、空気清浄機を使いやすく保つ作業をまとめます。",
  "加湿器": "タンク、トレー、フィルター、クエン酸洗浄など、水まわりのぬめり対策を整理します。",
  "外まわり": "外壁、排水口、雑草など、家の外側で気づいた時に見たいポイントをまとめます。",
  "ベランダ": "排水口、防水、床掃除など、雨や砂ぼこりが関わる場所を整理します。",
  "窓まわり": "サッシ、網戸、窓ガラス、結露など、季節ごとに見直したい作業をまとめます。",
  "換気": "給気口フィルターなど、空気の通り道を整える作業をまとめます。",
  "賃貸": "入居時・退去前に確認しておくと安心な記録やチェックをまとめます。",
  "設備": "給湯器や火災報知器など、無理に分解せず確認したい設備をまとめます。",
  "洗面台": "排水口や排水管、水漏れ確認など、洗面台まわりのメンテナンスをまとめます。",
  "トイレ": "便器、換気扇、ノズル、タンクまわりの確認をまとめます。",
  "その他": "住まいの状況に応じて確認したいメンテナンスをまとめます。"
};

const categoryOrder = [
  "入居時準備",
  "エアコン",
  "お風呂",
  "浴室",
  "キッチン",
  "洗面台",
  "洗濯機",
  "トイレ",
  "空気清浄機",
  "加湿器",
  "換気",
  "外まわり",
  "ベランダ",
  "窓まわり",
  "賃貸",
  "設備",
  "その他"
];

const escapeCategoryHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const loadCategoryTasks = async () => {
  const src = categoryScript?.dataset?.tasksSrc || "../data/maintenance-tasks.json";
  if (!categoryDataCache.has(src)) {
    categoryDataCache.set(
      src,
      fetch(src)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load category tasks: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => data.tasks || [])
    );
  }
  return categoryDataCache.get(src);
};

const taskHref = (task, categoryPath) => {
  if (task.articlePath) {
    return `..${task.articlePath}`;
  }
  return categoryPath || "#";
};

const renderTaskItem = (task, categoryPath) => {
  const href = taskHref(task, categoryPath);
  const isClickable = href && href !== "#";
  const tag = isClickable ? "a" : "div";
  const hrefAttr = isClickable ? ` href="${escapeCategoryHtml(href)}"` : "";
  return `
    <${tag} class="task-link-card ${isClickable ? "card-clickable" : "task-link-card--static"}"${hrefAttr}>
      <div>
        <h3>${escapeCategoryHtml(task.title)}</h3>
        <p>${escapeCategoryHtml(task.summary)}</p>
      </div>
      <dl class="task-meta-list">
        <div><dt>頻度</dt><dd>${escapeCategoryHtml(task.recommendedFrequency)}</dd></div>
        <div><dt>目安</dt><dd>${escapeCategoryHtml(task.estimatedMinutes)}分</dd></div>
      </dl>
      <span class="meta">${isClickable ? "詳しく読む" : "準備中"}</span>
    </${tag}>
  `;
};

const renderCategories = (container, tasks) => {
  const grouped = tasks.reduce((acc, task) => {
    const category = task.category || "その他";
    if (!acc.has(category)) {
      acc.set(category, []);
    }
    acc.get(category).push(task);
    return acc;
  }, new Map());

  const categories = Array.from(grouped.keys()).sort((a, b) => {
    const ai = categoryOrder.includes(a) ? categoryOrder.indexOf(a) : categoryOrder.length - 1;
    const bi = categoryOrder.includes(b) ? categoryOrder.indexOf(b) : categoryOrder.length - 1;
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b, "ja");
  });

  container.innerHTML = categories
    .map((category) => {
      const categoryPath = categoryPageMap[category] || "";
      const tasksInCategory = grouped.get(category) || [];
      return `
        <section class="category-directory-section" id="${encodeURIComponent(category)}">
          <div class="category-directory-head">
            <div>
              <span class="category-label">${escapeCategoryHtml(category)}</span>
              <h2>${escapeCategoryHtml(category)}</h2>
              <p>${escapeCategoryHtml(categoryIntroMap[category] || "このカテゴリのメンテナンスをまとめています。")}</p>
            </div>
            ${categoryPath ? `<a class="btn btn-secondary" href="${escapeCategoryHtml(categoryPath)}">カテゴリページへ</a>` : ""}
          </div>
          <div class="task-link-grid">
            ${tasksInCategory.map((task) => renderTaskItem(task, categoryPath)).join("")}
          </div>
        </section>
      `;
    })
    .join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("[data-category-directory]");
  if (!container) return;

  try {
    const tasks = await loadCategoryTasks();
    renderCategories(container, tasks);
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="muted-text">カテゴリ一覧を読み込めませんでした。</p>';
  }
});
