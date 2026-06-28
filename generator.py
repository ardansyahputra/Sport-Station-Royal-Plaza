import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time

def download_images(url, folder_name='downloaded_images'):
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)

    # Menambahkan header agar lebih mirip browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"Gagal mengakses situs: {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    images = soup.find_all('img')

    print(f"Ditemukan {len(images)} tag gambar. Memulai pengunduhan...")

    for i, img in enumerate(images):
        # Ambil src, jika kosong cari data-src (sering digunakan di lazy loading)
        img_url = img.get('data-src') or img.get('src')
        
        if img_url and img_url.startswith('http'):
            try:
                # Tambahkan jeda agar tidak terdeteksi spam/bot
                time.sleep(0.5) 
                
                img_data = requests.get(img_url, headers=headers).content
                # Membuat nama file unik
                img_name = os.path.join(folder_name, f"product_{i+1}.jpg")
                
                with open(img_name, 'wb') as f:
                    f.write(img_data)
                print(f"Berhasil mengunduh: {img_name}")
            except Exception as e:
                print(f"Gagal mengunduh: {e}")

# Jalankan skrip
target_url = "https://www.sportsstation.id/skechers.html"
download_images(target_url)