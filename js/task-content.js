const taskDataCache = new Map();
const taskContentScript = document.currentScript;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const resolveDataPath = () => {
  return taskContentScript?.dataset?.tasksSrc || "/data/maintenance-tasks.json";
};

const loadTasks = async () => {
  const src = resolveDataPath();
  if (!taskDataCache.has(src)) {
    taskDataCache.set(
      src,
      fetch(src)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load tasks: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => data.tasks || [])
    );
  }
  return taskDataCache.get(src);
};

const findTask = (tasks, id) => tasks.find((task) => task.id === id);

const renderList = (items) => {
  if (!items?.length) {
    return '<p class="muted-text">この項目は、必要に応じて確認してください。</p>';
  }
  return `<ul class="summary-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
};

const renderSteps = (steps) => {
  if (!steps?.length) {
    return '<p class="muted-text">手順は準備中です。</p>';
  }
  return `<ol class="step-list">${steps
    .map(
      (step, index) => `
        <li class="step-card">
          <div class="step-number">${index + 1}</div>
          <h3>${escapeHtml(step)}</h3>
          <p>機種ごとの外し方や使用可否は、説明書を確認しながら進めてください。</p>
        </li>
      `
    )
    .join("")}</ol>`;
};

const renderRecommendations = (task) => {
  const entries = [
    ...(task.products || []).map((item) => ({ ...item, type: item.type || "product" })),
    ...(task.services || []).map((item) => ({ ...item, type: item.type || "service" }))
  ].filter((item) => item.label || item.description);

  if (!entries.length) {
    return '<p class="muted-text">このメンテナンスは、まず家にある道具で見える範囲から始められます。</p>';
  }

  return entries
    .map((entry) => {
      const typeText = entry.type === "service" ? "業者依頼" : "商品";
      const body = `
        <div class="affiliate-card__label">${escapeHtml(entry.label)}</div>
        <div class="affiliate-card__type">${typeText}</div>
        <p class="affiliate-card__description">${escapeHtml(entry.description)}</p>
      `;

      if (!entry.url) {
        return `<div class="affiliate-card__inner"><div class="affiliate-card__body">${body}</div></div>`;
      }

      return `
        <div class="affiliate-card__inner">
          <a class="affiliate-card__link" href="${escapeHtml(entry.url)}" target="_blank" rel="nofollow sponsored noopener">
            ${body}
          </a>
        </div>
      `;
    })
    .join("");
};

const renderTaskMeta = (task) => `
  <dl class="task-meta-list">
    <div><dt>頻度</dt><dd>${escapeHtml(task.recommendedFrequency)}</dd></div>
    <div><dt>時間</dt><dd>${escapeHtml(task.estimatedMinutes)}分</dd></div>
    <div><dt>難易度</dt><dd>${escapeHtml(task.difficulty || "ふつう")}</dd></div>
    <div><dt>DIY目安</dt><dd>${escapeHtml(task.diyScope || "見える範囲で対応")}</dd></div>
  </dl>
`;

const renderAirconCards = (container, tasks) => {
  const ids = (container.dataset.taskIds || "").split(",").map((id) => id.trim()).filter(Boolean);
  container.innerHTML = ids
    .map((id) => findTask(tasks, id))
    .filter(Boolean)
    .map((task) => {
      const firstTip = task.tips?.[0] || "無理なくできる範囲で確認してください。";
      const url = task.articlePath || "#";
      return `
        <article class="maintenance-card">
          <div>
            <span class="meta">レベル${escapeHtml(task.maintenanceLevel || "-")}・${escapeHtml(task.levelLabel || task.category)}</span>
            <h3>${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.summary)}</p>
          </div>
          ${renderTaskMeta(task)}
          <div class="mini-note">${escapeHtml(firstTip)}</div>
          ${url ? `<a class="card-link" href="${escapeHtml(url)}">詳しく読む</a>` : ""}
        </article>
      `;
    })
    .join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  const targets = document.querySelectorAll("[data-task-id], [data-aircon-task-cards]");
  if (!targets.length) {
    return;
  }

  try {
    const tasks = await loadTasks();

    document.querySelectorAll("[data-aircon-task-cards]").forEach((container) => {
      renderAirconCards(container, tasks);
    });

    document.querySelectorAll("[data-task-id]").forEach((root) => {
      const task = findTask(tasks, root.dataset.taskId);
      if (!task) {
        return;
      }

      root.querySelectorAll("[data-task-title]").forEach((node) => {
        node.textContent = task.title;
      });
      root.querySelectorAll("[data-task-summary]").forEach((node) => {
        node.textContent = task.summary;
      });
      root.querySelectorAll("[data-task-frequency]").forEach((node) => {
        node.textContent = task.recommendedFrequency;
      });
      root.querySelectorAll("[data-task-minutes]").forEach((node) => {
        node.textContent = `${task.estimatedMinutes}分`;
      });
      root.querySelectorAll("[data-task-difficulty]").forEach((node) => {
        node.textContent = task.difficulty || "ふつう";
      });
      root.querySelectorAll("[data-task-diy]").forEach((node) => {
        node.textContent = task.diyScope || "見える範囲で対応";
      });
      root.querySelectorAll("[data-task-steps]").forEach((node) => {
        node.innerHTML = renderSteps(task.steps);
      });
      root.querySelectorAll("[data-task-tips]").forEach((node) => {
        node.innerHTML = renderList(task.tips);
      });
      root.querySelectorAll("[data-task-tools]").forEach((node) => {
        node.innerHTML = renderRecommendations(task);
      });
    });
  } catch (error) {
    console.error(error);
    document.querySelectorAll("[data-task-tools], [data-task-steps], [data-task-tips], [data-aircon-task-cards]").forEach((node) => {
      node.innerHTML = '<p class="muted-text">現在、詳細情報を読み込めませんでした。</p>';
    });
  }
});
