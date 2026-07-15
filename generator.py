#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scraper gambar produk berdasarkan halaman listing (bukan Google Images).

Contoh:
  python scrape_product_images.py -u "https://www.sportsstation.id/diadora.html?p=24" -o downloads_diadora

Cara kerja:
  1. Buka halaman listing -> ambil semua link produk (product-item-link)
  2. Masuk ke tiap halaman produk -> ambil SEMUA foto galeri full-size
     (dicoba beberapa strategi: JSON gallery Magento, JSON-LD schema.org,
     og:image, lalu fallback ke tag <img class="product-image-photo">)
  3. Tiap produk disimpan ke folder tersendiri (dinamai dari slug URL produk)
"""

import argparse
import hashlib
import json
import re
import sys
import time
import random
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs, urlencode, urlunparse

import requests
from bs4 import BeautifulSoup

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/123.0.0.0 Safari/537.36"
)

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": UA,
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
)

IMG_EXT_ALLOW = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
CONTENT_TYPE_TO_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}


def safe_sleep(a=0.8, b=1.8):
    time.sleep(random.uniform(a, b))


def fetch_html(url: str, retries=3, timeout=20) -> str:
    for attempt in range(retries):
        try:
            resp = SESSION.get(url, timeout=timeout)
            if resp.status_code == 429:
                time.sleep(3 + attempt * 2)
                continue
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            if attempt == retries - 1:
                print(f"  [!] Gagal fetch {url}: {e}", file=sys.stderr)
                return ""
            safe_sleep(1.5, 3.0)
    return ""


def set_page_param(url: str, page: int) -> str:
    """Ganti/tambah parameter ?p=N pada URL listing (paging Magento)."""
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    qs["p"] = [str(page)]
    new_query = urlencode(qs, doseq=True)
    return urlunparse(parsed._replace(query=new_query))


def slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:80] if text else "produk"


def extract_product_links(listing_html: str, base_url: str) -> list[str]:
    """Ambil semua link produk dari halaman listing Magento."""
    soup = BeautifulSoup(listing_html, "html.parser")
    links = []

    # Pola umum Magento: <a class="product-item-link" href="...">
    for a in soup.select("a.product-item-link"):
        href = a.get("href")
        if href:
            links.append(urljoin(base_url, href))

    # Fallback: <a> di dalam <li class="item product product-item">
    if not links:
        for li in soup.select("li.product-item, li.item.product"):
            a = li.find("a", href=True)
            if a:
                links.append(urljoin(base_url, a["href"]))

    # Dedup, pertahankan urutan
    return list(dict.fromkeys(links))


def extract_gallery_images(product_html: str, product_url: str) -> list[str]:
    """
    Coba beberapa strategi ekstraksi gambar dari halaman produk Magento,
    diurutkan dari yang paling lengkap/akurat.
    """
    soup = BeautifulSoup(product_html, "html.parser")
    urls: list[str] = []

    # --- Strategi 1: JSON galeri Magento (data-mage-init pada gallery-placeholder) ---
    gallery_el = soup.select_one('[data-gallery-role="gallery-placeholder"]')
    if gallery_el and gallery_el.get("data-mage-init"):
        try:
            data = json.loads(gallery_el["data-mage-init"])
            gallery_data = data.get("mage/gallery/gallery", {}).get("data", [])
            for item in gallery_data:
                full = item.get("full") or item.get("img")
                if full:
                    urls.append(full)
        except Exception:
            pass

    # --- Strategi 2: script type="text/x-magento-init" yang berisi gallery data ---
    if not urls:
        for script in soup.find_all("script", {"type": "text/x-magento-init"}):
            txt = script.string or script.text or ""
            if "gallery" not in txt:
                continue
            try:
                data = json.loads(txt)
                for _selector, cfg in data.items():
                    gallery_cfg = cfg.get("mage/gallery/gallery") if isinstance(cfg, dict) else None
                    if not gallery_cfg:
                        continue
                    for item in gallery_cfg.get("data", []):
                        full = item.get("full") or item.get("img")
                        if full:
                            urls.append(full)
            except Exception:
                continue

    # --- Strategi 3: JSON-LD schema.org/Product ---
    if not urls:
        for script in soup.find_all("script", {"type": "application/ld+json"}):
            txt = script.string or script.text or ""
            try:
                data = json.loads(txt)
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if isinstance(item, dict) and item.get("@type") == "Product":
                        img = item.get("image")
                        if isinstance(img, str):
                            urls.append(img)
                        elif isinstance(img, list):
                            urls.extend(img)
            except Exception:
                continue

    # --- Strategi 4: fallback og:image ---
    if not urls:
        og = soup.find("meta", {"property": "og:image"})
        if og and og.get("content"):
            urls.append(og["content"])

    # --- Strategi 5: fallback tag <img class="product-image-photo"> ---
    if not urls:
        for img in soup.select("img.product-image-photo, img.gallery-placeholder__image"):
            src = img.get("data-src") or img.get("src")
            if src:
                urls.append(urljoin(product_url, src))

    # Dedup, pertahankan urutan, buang data URI
    clean = [u for u in dict.fromkeys(urls) if u and not u.startswith("data:")]
    return clean


def guess_ext(url: str, content_type: str | None) -> str:
    if content_type and content_type in CONTENT_TYPE_TO_EXT:
        return CONTENT_TYPE_TO_EXT[content_type]
    path = urlparse(url).path
    _, ext = __import__("os").path.splitext(path)
    ext = ext.lower()
    return ext if ext in IMG_EXT_ALLOW else ".jpg"


def download_image(url: str, out_dir: Path, seen_hashes: set, idx: int, retries=3, timeout=25):
    safe_sleep(0.2, 0.6)
    for attempt in range(retries):
        try:
            r = SESSION.get(url, stream=True, timeout=timeout)
            if r.status_code >= 400:
                if attempt == retries - 1:
                    return None
                safe_sleep(0.8, 1.6)
                continue
            ct = r.headers.get("Content-Type", "").split(";")[0].strip().lower()
            if not ct.startswith("image/"):
                if attempt == retries - 1:
                    return None
                safe_sleep(0.8, 1.6)
                continue

            content = r.content
            if len(content) < 2048:  # buang placeholder/pixel kecil
                return None

            h = hashlib.sha1(content).hexdigest()
            if h in seen_hashes:
                return None
            seen_hashes.add(h)

            ext = guess_ext(url, ct)
            out_path = out_dir / f"image_{idx:03d}{ext}"
            with open(out_path, "wb") as f:
                f.write(content)
            return str(out_path)
        except Exception:
            if attempt == retries - 1:
                return None
            safe_sleep(1.0, 2.0)
    return None


def scrape_listing(start_url: str, out_dir: str, pages: int, max_products: int | None, debug: bool = False):
    out_root = Path(out_dir)
    out_root.mkdir(parents=True, exist_ok=True)

    total_products = 0
    total_images = 0

    for p_offset in range(pages):
        listing_url = set_page_param(start_url, page=_get_page_number(start_url) + p_offset)
        print(f"\n=== Listing: {listing_url} ===")
        html = fetch_html(listing_url)
        if not html:
            print("  [!] Halaman listing gagal dibuka / mungkin diblokir bot-detection.")
            break

        print(f"  Panjang HTML diterima: {len(html)} karakter")

        if debug:
            debug_path = out_root / f"debug_listing_p{p_offset}.html"
            with open(debug_path, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"  [debug] HTML mentah disimpan ke: {debug_path.resolve()}")

        # Deteksi indikasi umum bot-block / halaman kosong / butuh JS
        lower_html = html.lower()
        if "captcha" in lower_html or "access denied" in lower_html or "unusual traffic" in lower_html:
            print("  [!] Terindikasi halaman block/captcha, bukan halaman produk asli.")
        if "product-item-link" not in html and "product-item" not in html:
            print("  [!] Kata kunci 'product-item' TIDAK ditemukan sama sekali di HTML.")
            print("      Kemungkinan besar situs ini render produk pakai JavaScript (bukan server-rendered),")
            print("      jadi requests.get() cuma dapat kerangka HTML kosong sebelum JS jalan.")

        product_links = extract_product_links(html, listing_url)
        if not product_links:
            print("  [!] Tidak ada link produk ditemukan. Struktur halaman mungkin beda / diblokir.")
            break

        print(f"  Ditemukan {len(product_links)} produk di halaman ini.")

        for link in product_links:
            if max_products and total_products >= max_products:
                break

            product_html = fetch_html(link)
            if not product_html:
                continue

            images = extract_gallery_images(product_html, link)
            if not images:
                print(f"  [-] {link} -> tidak ada gambar ditemukan, skip.")
                continue

            slug = slugify(urlparse(link).path.rsplit("/", 1)[-1].replace(".html", ""))
            product_dir = out_root / slug
            product_dir.mkdir(parents=True, exist_ok=True)

            seen_hashes = set()
            saved_count = 0
            for i, img_url in enumerate(images):
                saved = download_image(img_url, product_dir, seen_hashes, i)
                if saved:
                    saved_count += 1

            print(f"  [{total_products + 1}] {slug} -> {saved_count} gambar")
            total_products += 1
            total_images += saved_count

            safe_sleep(0.6, 1.4)  # jeda antar produk, sopan ke server

        if max_products and total_products >= max_products:
            break

        safe_sleep(1.5, 3.0)  # jeda antar halaman listing

    print(f"\nSelesai. Total produk: {total_products}, total gambar: {total_images}, folder: {out_root.resolve()}")


def _get_page_number(url: str) -> int:
    qs = parse_qs(urlparse(url).query)
    try:
        return int(qs.get("p", ["1"])[0])
    except ValueError:
        return 1


def main():
    parser = argparse.ArgumentParser(
        description="Unduh gambar produk berdasarkan halaman listing Magento (mis. sportsstation.id)."
    )
    parser.add_argument(
        "-u", "--url", type=str,
        default="https://www.sportsstation.id/diadora.html?p=24",
        help="URL halaman listing produk (boleh sudah mengandung ?p=N).",
    )
    parser.add_argument("-o", "--out", type=str, default="downloads_produk", help="Folder output.")
    parser.add_argument(
        "-p", "--pages", type=int, default=1,
        help="Jumlah halaman listing yang di-scrape berurutan mulai dari nomor page di --url (default 1).",
    )
    parser.add_argument(
        "-m", "--max-products", type=int, default=None,
        help="Batas maksimum jumlah produk yang diambil (opsional, buat testing).",
    )
    parser.add_argument(
        "--debug", action="store_true",
        help="Simpan HTML mentah halaman listing ke folder output buat didiagnosa.",
    )
    args = parser.parse_args()

    scrape_listing(
        start_url=args.url,
        out_dir=args.out,
        pages=args.pages,
        max_products=args.max_products,
        debug=args.debug,
    )


if __name__ == "__main__":
    main()