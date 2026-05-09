const affiliateLinks = {
  bathroom_mold_spray: {
    label: "カビ取り剤を確認する",
    url: null,
    type: "product",
    description: "お風呂の黒カビ対策を自分で進める場合に、選択肢として確認できます。"
  },
  aircon_cleaning_service: {
    label: "エアコンクリーニングを確認する",
    url: null,
    type: "service",
    description: "自分で掃除しづらい内部洗浄が必要そうな場合に、業者依頼という選択肢があります。"
  },
  drain_cleaning_kit: {
    label: "排水口掃除キットを確認する",
    url: null,
    type: "product",
    description: "ぬめりやにおいが気になるとき、自分で掃除するための道具として確認できます。"
  },
  kitchen_filter_spray: {
    label: "換気扇クリーナーを確認する",
    url: null,
    type: "product",
    description: "油汚れを自分で落としたい場合に、補助アイテムとして確認できます。"
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

    const disclosure = document.createElement("p");
    disclosure.className = "affiliate-disclosure-note";
    disclosure.textContent = "この記事にはアフィリエイトリンクが含まれます。リンク経由で購入された場合、運営者が報酬を受け取ることがあります。";

    const wrapper = document.createElement("div");
    wrapper.className = `affiliate-card__inner affiliate-card--${entry.type}`;

    const content = entry.url ? document.createElement("a") : document.createElement("div");
    content.className = entry.url ? "affiliate-card__link" : "affiliate-card__body";
    if (entry.url) {
      content.href = entry.url;
      content.target = "_blank";
      content.rel = "nofollow sponsored noopener";
    }

    const title = document.createElement("div");
    title.className = "affiliate-card__label";
    title.textContent = entry.label;

    const typeTag = document.createElement("div");
    typeTag.className = "affiliate-card__type";
    typeTag.textContent = entry.type === "service" ? "業者依頼" : "商品";

    const description = document.createElement("p");
    description.className = "affiliate-card__description";
    description.textContent = entry.description;

    content.append(title, typeTag, description);
    wrapper.appendChild(content);
    placeholder.append(disclosure, wrapper);
  });
});
