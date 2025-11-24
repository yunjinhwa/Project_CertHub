// js/pagination.js

import { renderListItem } from "./js/render.js";

let allItems = [];
let currentIndex = 0;
const BATCH_SIZE = 5;

export function setAllItems(items) {
    allItems = items;
    currentIndex = 0;
}

export function loadMoreItems() {
    const resultsDiv = document.getElementById("results");

    const next = allItems.slice(currentIndex, currentIndex + BATCH_SIZE);
    next.forEach(item => renderListItem(item, resultsDiv));

    currentIndex += BATCH_SIZE;

    if (currentIndex >= allItems.length) {
        document.getElementById("scrollContainer")
            .removeEventListener("scroll", handleDivScroll);
    }
}

export function handleDivScroll() {
    const box = document.getElementById("scrollContainer");

    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 10) {
        loadMoreItems();
    }
}
