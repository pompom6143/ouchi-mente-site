const featuresScript = document.currentScript;

const escapeFeatureHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("[data-features-list]");
  if (!container) return;

  const src = featuresScript?.dataset?.featuresSrc || "../data/features.json";

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to load features: ${response.status}`);
    }
    const data = await response.json();
    const features = data.features || [];

    container.innerHTML = features
      .map((feature) => `
        <article class="article-card feature-card">
          <span class="meta">${escapeFeatureHtml(feature.category)}</span>
          <h3>${escapeFeatureHtml(feature.title)}</h3>
          <p>${escapeFeatureHtml(feature.description)}</p>
          <div class="tag-list">
            ${(feature.tags || []).map((tag) => `<span>${escapeFeatureHtml(tag)}</span>`).join("")}
          </div>
          <p class="muted-text">${escapeFeatureHtml(feature.readTime)}</p>
          <a class="card-link" href="${escapeFeatureHtml(feature.url)}">読む</a>
        </article>
      `)
      .join("");
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="muted-text">特集を読み込めませんでした。</p>';
  }
});
