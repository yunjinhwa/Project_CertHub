// js/api.js

export async function fetchCertificates(keyword = "") {
    const response = await fetch(`/api/cert?name=${encodeURIComponent(keyword)}`);

    const xmlText = await response.text();

    const parser = new DOMParser();
    return parser.parseFromString(xmlText, "text/xml");
}

export function getItemsFromXML(xmlDoc) {
    return Array.from(xmlDoc.getElementsByTagName("item"));
}
