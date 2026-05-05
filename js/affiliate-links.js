const affiliateLinks = {
  bathroom_mold_spray: {
    label: "カビ取り剤を見る",
    url: "https://example.com/bathroom-mold-spray",
    type: "product",
    description: "お風呂の黒カビ対策に使いやすい定番アイテムです。"
  },
  aircon_cleaning_service: {
    label: "エアコンクリーニングを依頼する",
    url: "https://example.com/aircon-cleaning-service",
    type: "service",
    description: "自分で掃除しづらい内部洗浄を業者に依頼したい方向けです。"
  },
  drain_cleaning_kit: {
    label: "排水口掃除キットを見る",
    url: "https://example.com/drain-cleaning-kit",
    type: "product",
    description: "排水口のぬめりやにおいをしっかり落とす専用キットです。"
  },
  kitchen_filter_spray: {
    label: "換気扇クリーナーを見る",
    url: "https://example.com/kitchen-filter-spray",
    type: "product",
    description: "油汚れに強いキッチンフィルター用スプレーです。"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const placeholders = document.querySelectorAll(".affiliate-card[data-affiliate-id]");
  if (!placeholders.length) {
    return;
  }

  placeholders.forEach((placeholder) => {
    const id = placeholder.dataset.affiliateId;
    const entry = affiliateLinks[id];
    if (!entry) {
      placeholder.style.display = "none";
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = `affiliate-card__inner affiliate-card--${entry.type}`;

    const link = document.createElement("a");
    link.className = "affiliate-card__link";
    link.href = entry.url;
    link.target = "_blank";
    link.rel = "nofollow sponsored noopener";

    const title = document.createElement("div");
    title.className = "affiliate-card__label";
    title.textContent = entry.label;

    const typeTag = document.createElement("div");
    typeTag.className = "affiliate-card__type";
    typeTag.textContent = entry.type === "service" ? "業者依頼" : "商品";

    const description = document.createElement("p");
    description.className = "affiliate-card__description";
    description.textContent = entry.description;

    link.append(title, typeTag, description);
    wrapper.appendChild(link);
    placeholder.appendChild(wrapper);
  });
});
