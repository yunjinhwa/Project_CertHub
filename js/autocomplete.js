// js/autocomplete.js

import { fetchCertificates, getItemsFromXML } from "./api.js";
import { searchCertificate } from "./search.js";

export async function handleAutocomplete() {
    const input = document.getElementById("searchInput").value.trim();
    const box = document.getElementById("autocomplete");

    if (input.length < 1) {
        box.style.display = "none";
        box.innerHTML = "";
        return;
    }

    const xmlDoc = await fetchCertificates(input);
    const items = getItemsFromXML(xmlDoc);

    box.innerHTML = "";
    if (items.length === 0) {
        box.style.display = "none";
        return;
    }

    box.style.display = "block";

    const normalize = (str) =>
        str?.normalize("NFC").replace(/\s+/g, "").trim().toLowerCase() || "";

    const keyword = normalize(input);

    let names = items
        .map(item => item.getElementsByTagName("jmfldnm")[0]?.textContent || "")
        .filter(name => normalize(name).includes(keyword));

    names = [...new Set(names)];

    names.forEach(name => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.textContent = name;

        div.onclick = () => {
            document.getElementById("searchInput").value = name;
            box.style.display = "none";
            searchCertificate();
        };

        box.appendChild(div);
    });
}
