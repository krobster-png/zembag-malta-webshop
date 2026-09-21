#!/usr/bin/env python3
"""Download authorized source catalog media into local project storage."""
from __future__ import annotations
import concurrent.futures, hashlib, json, mimetypes, re, time
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "docs/source-products.json"
OUT = ROOT / "storage/media"
MANIFEST = ROOT / "docs/media-manifest.json"
ALLOWED = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif"}
HEADERS = {"User-Agent": "Zembag-Malta-Webshop-media-import/1.0"}


def media_urls():
    catalog = json.loads(INPUT.read_text())
    urls = set()
    for product in catalog["products"]:
        for url in product.get("images", []):
            parsed = urlparse(url)
            suffix = Path(parsed.path).suffix.lower()
            if parsed.scheme in {"http", "https"} and suffix in ALLOWED and "facebook.com" not in parsed.netloc:
                urls.add(url)
    return sorted(urls)


def safe_name(url: str) -> str:
    digest = hashlib.sha256(url.encode()).hexdigest()[:24]
    suffix = Path(urlparse(url).path).suffix.lower() or ".bin"
    return digest + suffix


def download(url: str) -> dict:
    name = safe_name(url)
    destination = OUT / name
    try:
        if destination.exists() and destination.stat().st_size > 0:
            data = destination.read_bytes()
            return {"source_url": url, "local_path": f"storage/media/{name}", "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data), "mime_type": mimetypes.guess_type(name)[0], "status": "existing"}
        request = Request(url, headers=HEADERS)
        with urlopen(request, timeout=30) as response:
            data = response.read()
            content_type = response.headers.get_content_type()
        if not data:
            raise ValueError("empty response")
        digest = hashlib.sha256(data).hexdigest()
        destination.write_bytes(data)
        return {"source_url": url, "local_path": f"storage/media/{name}", "sha256": digest, "bytes": len(data), "mime_type": content_type, "status": "downloaded"}
    except Exception as exc:
        return {"source_url": url, "local_path": None, "sha256": None, "bytes": 0, "mime_type": None, "status": "failed", "error": str(exc)[:240]}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    urls = media_urls()
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for index, result in enumerate(pool.map(download, urls), 1):
            results.append(result)
            if index % 50 == 0 or index == len(urls):
                print(f"processed {index}/{len(urls)}")
    results.sort(key=lambda item: item["source_url"])
    manifest = {"generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "source": "docs/source-products.json", "authorized_by_user": True, "requested_urls": sum(len(p.get("images", [])) for p in json.loads(INPUT.read_text())["products"]), "unique_media_urls": len(urls), "downloaded": sum(r["status"] == "downloaded" for r in results), "existing": sum(r["status"] == "existing" for r in results), "failed": sum(r["status"] == "failed" for r in results), "media": results}
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: manifest[k] for k in ("requested_urls", "unique_media_urls", "downloaded", "existing", "failed")}))

if __name__ == "__main__":
    main()
