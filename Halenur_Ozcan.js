// ebebek Ana Sayfa için Ürün Karoseli Uygulaması


(function() {

    const ProductCarousel = (function() {
        const _self = {};
        // Yapılandırma ve Sabitler 
        const MAIN_ID = 'custom-product-slider'; 
        const CACHE_KEY_PRODUCTS = 'carouselDataV5'; 
        const CACHE_KEY_FAVS = 'carouselFavoritesV5'; 
        
        // API Kaynağı ve Başlık Metni
        const API_SOURCE = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json';
        const SLIDER_HEADER = "Beğenebileceğinizi düşündüklerimiz";
        
        // Yardımcı Fonksiyonlar 
        const checkHomePage = () => {
            const path = window.location.pathname.replace(/\/$/, '');
            return path === '' || path === '/' || path.toLowerCase() === '/default.aspx';
        };

        // İndirim Yüzdesi Hesaplama 
        const getDiscountHtml = (original, price) => {
            if (original > price) {
                const disc = Math.round(((original - price) / original) * 100);
                return `<span class="discount">%${disc} İndirim</span>`;
            }
            return '';
        };

        // Veri Yönetimi 
        _self.getFavs = () => {
            try {
                return JSON.parse(localStorage.getItem(CACHE_KEY_FAVS) || '[]');
            } catch {
                return [];
            }
        };
        _self.saveFavs = favs => {
            try {
                localStorage.setItem(CACHE_KEY_FAVS, JSON.stringify(favs));
            } catch (e) {
                console.error("Local storage save failed:", e);
            }
        };

        _self.fetchAndPrepareProducts = async () => { 
            let products = null;
            try {
                const cached = localStorage.getItem(CACHE_KEY_PRODUCTS);
                if (cached) products = JSON.parse(cached); 
            } catch (e) { /* Hata durumunda (bozuk cache) devam et */ }
            
            if (!products) {
                try {
                    const res = await fetch(API_SOURCE); 
                    const data = await res.json();
                    products = Array.isArray(data) ? data : data.products || [];
                    localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(products));
                } catch (error) {
                    console.error("API Fetch Error:", error);
                    return [];
                }
            }
            
            const favs = _self.getFavs();
            return products.map(p => {
                const idNumber = Number(p.id);
                return { 
                    ...p, 
                    id: idNumber,
                    isFavorite: favs.includes(idNumber)
                };
            }).filter(p => !isNaN(p.id) && p.id > 0); 
        };

        // Kart Oluşturma (HTML) 
        _self.createProductCard = p => {
            const { id, name, brand, img, url, price, original_price, isFavorite } = p;
            
            const finalPrice = Number(price);
            const finalOriginalPrice = Number(original_price);
            if (isNaN(finalPrice) || finalPrice <= 0 || !url) return ''; 

            const heart = isFavorite ? '♥' : '♡';
            const heartClass = isFavorite ? 'fav-full' : 'fav-empty';
            const discountHTML = finalOriginalPrice > finalPrice ? getDiscountHtml(finalOriginalPrice, finalPrice) : '';
            // Eski fiyat etiketi
            const origHTML = finalOriginalPrice > finalPrice ? `<span class="orig">${finalOriginalPrice.toFixed(2)} TL</span>` : '';
            
            return `
                <div class="card-item" data-url="${url}" data-id="${id}">
                    <div class="image-wrapper">
                        <img src="${img}" alt="${name}" loading="lazy">
                        <span class="favorite-icon ${heartClass}" data-id="${id}">${heart}</span>
                        ${discountHTML} 
                    </div>
                    <div class="product-info">
                        <p class="product-brand">${brand || ''}</p>
                        <p class="product-name">${name}</p>
                        <div class="price-box">
                            ${origHTML} 
                            <span class="current-price">${finalPrice.toFixed(2)} TL</span>
                        </div>
                    </div>
                </div>`;
        };

        // CSS Enjekte Etme (Favorileme ve İndirim Görünürlüğü İçin KRİTİK EKLENTİLER) 
        
        _self.insertStyles = () => {
            if (document.getElementById('custom-carousel-style')) return;
            const style = document.createElement('style');
            style.id = 'custom-carousel-style';
            style.textContent = `
                /* Ana Kapsayıcı: Hizalama için soldan ve sağdan dolgu veriyoruz. */
                #${MAIN_ID}{
                    padding: 20px 20px 20px 20px !important; /* Masaüstü: Tüm ana kapsayıcıya 20px sol/sağ dolgu */
                    margin: 40px auto;
                    font-family: Arial, sans-serif;
                    width: 100%;
                    max-width: 1240px; 
                    box-sizing: border-box; 
                    position: relative;
                }

                /* BAŞLIK DÜZELTMESİ: KESİN GÖRÜNÜRLÜK ve HİZALAMA */
                #${MAIN_ID} .carousel-title {
                    font-size: 26px;
                    font-weight: 700;
                    text-align: left !important;
                    color: #222 !important; 
                    margin: 0 0 24px 0 !important;
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    width: auto;
                    line-height: 1.3;
                    position: relative;
                    z-index: 100000;
                }

                /* YATAY DÜZENİ GARANTİ ALMA: FLEX ve KAYDIRMA */
                .carousel-wrapper{
                    display:flex !important; 
                    flex-direction: row !important;
                    overflow-x: auto !important; /* KRİTİK: Kaydırmayı zorlar */
                    scroll-behavior: smooth;
                    gap: 16px;
                    padding: 0 0 10px 0 !important; 
                    justify-content: flex-start;
                    align-items: stretch;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .carousel-wrapper::-webkit-scrollbar { display: none; }

                /* KART STİLİ: KAYDIRMAYI SAĞLAMAK İÇİN KESİN GENİŞLİK */
                .card-item{
                    flex: 0 0 240px !important; 
                    min-width: 240px !important; 
                    max-width: 240px !important;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    padding-bottom: 10px;
                    transition: box-shadow 0.3s;
                    cursor: pointer;
                    background-color: #fff;
                    position: relative;
                    box-sizing: border-box;
                }
                #${MAIN_ID} .card-item:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                /* GÖRSEL ALANI VE İKON KONUMLANDIRMASI */
                .image-wrapper {
                    position: relative; 
                    height: 240px; 
                    overflow: hidden;
                    margin-bottom: 10px;
                    border-radius: 8px 8px 0 0;
                    background-color: #f7f7f7;
                }
                .image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain; 
                    padding: 10px;
                    box-sizing: border-box;
                }

                /* 1. EKLENEN ÖZELLİK: Favori İkonu Stili */
                .favorite-icon {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 24px;
                    cursor: pointer;
                    line-height: 1;
                    z-index: 10;
                    transition: transform 0.1s ease;
                    background-color: rgba(255, 255, 255, 0.8);
                    border-radius: 50%;
                    padding: 2px 4px;
                }
                .fav-empty {
                    color: #ccc; 
                    text-shadow: 0 0 1px #fff;
                }
                .fav-full {
                    color: #f00; 
                }
                .favorite-icon:hover {
                    transform: scale(1.1);
                }

                /* 2. EKLENEN ÖZELLİK: İndirim Etiketi Stili */
                .discount {
                    position: absolute;
                    top: 10px;
                    left: 0;
                    background-color: #f00;
                    color: #fff;
                    padding: 4px 8px;
                    font-size: 13px;
                    font-weight: 700;
                    border-radius: 0 4px 4px 0;
                    z-index: 5;
                    white-space: nowrap;
                }

                /* Fiyat ve Marka Bilgisi */
                .product-info {
                    padding: 0 10px;
                }
                .product-brand {
                    font-size: 12px;
                    color: #999;
                    margin: 0 0 4px 0;
                    height: 14px;
                    overflow: hidden;
                }
                .product-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 8px 0;
                    height: 32px;
                    overflow: hidden;
                    line-height: 1.15;
                }
                .price-box {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    flex-wrap: wrap;
                }
                /* Eski Fiyat (İndirimli fiyat varsa görünür) */
                .orig {
                    font-size: 13px;
                    color: #999;
                    text-decoration: line-through;
                }
                /* Yeni/Güncel Fiyat */
                .current-price {
                    font-size: 18px;
                    font-weight: 700;
                    color: #000;
                }
                


                /* Responsive: Mobil Cihazlar (768px altı) */
                @media(max-width:768px){
                    #${MAIN_ID}{
                        padding: 10px 10px 20px 10px !important; 
                        margin: 20px auto;
                    }
                    #${MAIN_ID} .carousel-title {
                        font-size: 22px;
                        margin: 0 0 15px 0 !important;
                        text-align: left;
                    }
                    .carousel-wrapper{
                        padding: 0 0 10px 0 !important;
                    }
                    .card-item {
                        /* Mobil cihazda ekranın yarısı eksi boşluk kadar genişlik */
                        flex: 0 0 calc(50% - 8px) !important;
                        min-width: calc(50% - 8px) !important;
                        max-width: calc(50% - 8px) !important;
                        margin-bottom: 10px;
                    }
                    .image-wrapper { height: 180px; }
                    .current-price { font-size: 16px; }
                    .orig { font-size: 12px; }
                }
            `;
            document.head.appendChild(style);
        };

        // HTML Render ve Yerleştirme Mantığı 
        
        _self.renderSlider = async () => {
            const prods = await _self.fetchAndPrepareProducts();
            if (!prods || prods.length < 3) return; 
            const old = document.getElementById(MAIN_ID);
            if (old) old.remove();

            const container = document.createElement('div');
            container.id = MAIN_ID;
            container.innerHTML = `
                <h2 class="carousel-title">${SLIDER_HEADER}</h2>
                <div class="carousel-wrapper">${prods.map(_self.createProductCard).join('')}</div>
            `;

            // Hedef Elementi Bulma: "Sizin İçin Seçtiklerimiz"
            let existingTarget = null;
            document.querySelectorAll('h2, h3').forEach(el => {
                // "Sizin için Seçtiklerimiz" başlığını bulur
                if (el.textContent.trim().includes('Sizin için Seçtiklerimiz') && !existingTarget) {
                    existingTarget = el.closest('[class*="module"]') 
                                         || el.closest('[class*="container"]') 
                                         || el.closest('div[id]') 
                                         || el.parentNode;
                }
            });

            // Yerleştirme (Mevcut 'Sizin için Seçtiklerimiz' başlığının hemen üstüne)
            if (existingTarget && existingTarget.parentNode) {
                existingTarget.parentNode.insertBefore(container, existingTarget);
            } else {
                // Yedek yerleştirme noktaları
                const mainContent = document.querySelector('.mainContent .content') 
                                         || document.querySelector('.content-main')
                                         || document.querySelector('.homepage.body-area .container'); 

                if (mainContent) {
                    mainContent.prepend(container); 
                } else {
                    document.body.appendChild(container);
                }
            }

            // Etkinlik Atamaları (Favlama ve Ürün Linkine Gitme)
            container.addEventListener('click', e => {
                const heart = e.target.closest('.favorite-icon');
                const card = e.target.closest('.card-item');

                // Favori İkonu Tıklaması
                if (heart) {
                    e.stopPropagation(); 
                    const id = parseInt(heart.dataset.id);
                    let favs = _self.getFavs();
                    
                    if (favs.includes(id)) {
                        favs = favs.filter(f => f !== id);
                        heart.textContent = '♡';
                        heart.classList.replace('fav-full', 'fav-empty');
                    } else {
                        favs.push(id);
                        heart.textContent = '♥';
                        heart.classList.replace('fav-empty', 'fav-full');
                    }
                    _self.saveFavs(favs); // Favları Local Storage'a kaydet
                } 
                // Ürün Kartı Tıklaması
                else if (card) {
                    if (e.target.tagName === 'BUTTON') return; 

                    const url = card.getAttribute('data-url');
                    if (url) window.open(url, '_blank');
                }
            });
        };

        // Başlatma Noktası 
        _self.init = async () => {
            if (!checkHomePage()) return console.log("wrong page");
            
            _self.insertStyles();
            await _self.renderSlider();
            
            console.log("🎉 Product Carousel initialized successfully.");
        };
        
        return { init: _self.init };
    })();

    // DOM'un tamamen yüklenmesini bekler.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", ProductCarousel.init);
    } else {
        ProductCarousel.init();
    }
})();

