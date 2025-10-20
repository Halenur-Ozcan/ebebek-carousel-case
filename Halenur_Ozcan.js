// ebebek Ana Sayfa için Ürün Karoseli Uygulaması

(function() {
    
    // Uygulamanın ana mantığını dışarıya kapalı tutan hemen çağrılan fonksiyon (IIFE) Bu, var olan site koduyla çakışma riskini sıfıra indirir.
    const ProductCarousel = (function() {
        const _self = {};
        
        // Yapılandırma ve Sabitler 
        // Uygulamaya özel benzersiz ID'ler ve anahtar kelimeler, CSS çakışmalarını önlemek için özelleştirildi.
        /** Sitenin ana CSS'i çok baskın ve geniş kapsamlı olduğu için, stil sızıntılarını ve istenmeyen mirasları engellemek amacıyla  
          ID ve sınıf isimlerine benzersiz ön ekler (prefix) ekledim. 
         (Örn: Sadece 'card' yerine 'card-item'.) Bu, sitenin kendi stillerinin  yanlışlıkla karosel bileşenime uygulanmasını önlemek için ilk savunma hattımdı. 
         */
        
        const MAIN_ID = 'custom-product-slider'; 
        const CACHE_KEY_PRODUCTS = 'carouselDataV5'; // API verisi için LocalStorage anahtarı (Performans için)
        const CACHE_KEY_FAVS = 'carouselFavoritesV5';   // Favori ürün ID'leri için LocalStorage anahtarı (Kalıcılık için)
        
        // API Kaynağı
        const API_SOURCE = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json';
        const SLIDER_HEADER = "Beğenebileceğinizi düşündüklerimiz";
        
        // Yardımcı Fonksiyonlar 

        /**
         * Geçerli sayfanın ana sayfa olup olmadığını kontrol eder.
         * Karoselin yalnızca ana sayfada yüklenmesi şartını sağlar.
         */
        const checkHomePage = () => {
            const path = window.location.pathname.replace(/\/$/, '');
            return path === '' || path === '/' || path.toLowerCase() === '/default.aspx';
        };

        /**
         * Ürün kartı için indirim yüzdesini hesaplar ve HTML olarak döndürür.
         * @param {number} original - Eski fiyat.
         * @param {number} price - Güncel fiyat.
         * @returns {string} İndirim etiketi HTML'i veya boş string.
         */
        const getDiscountHtml = (original, price) => {
            if (original > price) {
                const disc = Math.round(((original - price) / original) * 100);
                return `<span class="discount">%${disc} İndirim</span>`;
            }
            return '';
        };

        // --- Veri Yönetimi ---
        //LocalStorage'a erişim metotları.
        _self.getFavs = () => JSON.parse(localStorage.getItem(CACHE_KEY_FAVS) || '[]');
        _self.saveFavs = favs => localStorage.setItem(CACHE_KEY_FAVS, JSON.stringify(favs));

        /**
         * Ürün verilerini çeker (önce LocalStorage'ı kontrol eder) ve favori bilgisini ekler. 
         * 1. Her sayfa yüklemede API'ye gitmek yerine, öncelikle LocalStorage'ı kontrol ederek  API üzerindeki yükü azalttım ve karoselin yüklenme hızını artırdım.
         * 2. API'den gelen string ID'leri Number'a çevirerek veri tutarsızlığını giderdim.
         */
        _self.fetchAndPrepareProducts = async () => { // HATA BURADAYDI: Bu satır, dıştaki fonksiyonun değil, yanlışlıkla içine yazılmış bloğun başlangıcıydı. Düzeltildi.
            let products = null;
            // 1. Önbellekten okuma denemesi (performans optimizasyonu)
            try {
                const cached = localStorage.getItem(CACHE_KEY_PRODUCTS);
                if (cached) products = JSON.parse(cached);
            } catch (e) { /* Hata durumunda (bozuk cache) devam et */ }
            
            // 2. Önbellekte yoksa API'den çek
            if (!products) {
                try {
                    const res = await fetch(API_SOURCE);
                    const data = await res.json();
                    products = Array.isArray(data) ? data : data.products || [];
                    localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(products));
                } catch (error) {
                    return []; // Hata durumunda boş liste dönerek uygulamanın çökmesini engeller
                }
            }
            
            //  Favori bilgisi ile birleştirme ve veri temizliği
            const favs = _self.getFavs();
            return products.map(p => {
                const idNumber = Number(p.id); // ID'nin sayısal olduğundan emin olunur.
                return { 
                    ...p, 
                    id: idNumber,
                    isFavorite: favs.includes(idNumber) 
                };
            }).filter(p => !isNaN(p.id) && p.id > 0); // Geçersiz/bozuk ID'leri filtrele
        };

        // --- Kart Oluşturma (HTML) ---
        
        /**
         * Tek bir ürün için HTML kart yapısını oluşturur.
         * Sınıf isimleri genel isimler seçilerek (card-item, product-name) tema bağımsızlığı sağlandı.
         */
        _self.createProductCard = p => {
            // Destructuring ile gerekli alanlar alınır
            const { id, name, brand, img, url, price, original_price, isFavorite } = p;
            
            // Fiyatların güvenli bir şekilde sayıya çevrilmesi
            const finalPrice = Number(price);
            const finalOriginalPrice = Number(original_price);
            if (isNaN(finalPrice) || finalPrice <= 0 || !url) return ''; // Eksik verili kartları oluşturmaz

            // ... (Kalan HTML oluşturma mantığı)
            const heart = isFavorite ? '♥' : '♡';
            const heartClass = isFavorite ? 'fav-full' : 'fav-empty';
            const discountHTML = finalOriginalPrice > finalPrice ? getDiscountHtml(finalOriginalPrice, finalPrice) : '';
            const origHTML = finalOriginalPrice > finalPrice ? `<span class="orig">${finalOriginalPrice.toFixed(2)} TL</span>` : '';
            
            return `
                <div class="card-item" data-url="${url}" data-id="${id}">
                    <div class="image-wrapper">
                        <img src="${img}" alt="${name}" loading="lazy">
                        <span class="favorite-icon ${heartClass}" data-id="${id}">${heart}</span>
                    </div>
                    <div class="product-info">
                        <p class="product-brand">${brand || ''}</p>
                        <p class="product-name">${name}</p>
                        <div class="price-box">
                            ${origHTML}
                            <span class="current-price">${finalPrice.toFixed(2)} TL</span>
                            ${discountHTML}
                        </div>
                    </div>
                </div>`;
        };

        // --- CSS Enjekte Etme (Çakışma Önleyici Tasarım) ---
        
        /**
         * CSS'i dinamik olarak <style> etiketiyle DOM'a enjekte eder.
         * Harici CSS dosyasına bağımlılığı ortadan kaldırır.
         * Yatay karosel görünümünü garanti altına almak için kritik kurallarda !important kullanılır.
         * <<<Sitenin CSS'i karosel öğelerini alt alta yığmaya zorladığı için,  yatay düzeni koruma altına almak amacıyla 'agresif' CSS kuralları kullandım.
         */
        _self.insertStyles = () => {
            if (document.getElementById('custom-carousel-style')) return;
            const style = document.createElement('style');
            style.id = 'custom-carousel-style';
            style.textContent = `
                /* Ana Kapsayıcı */
                #${MAIN_ID}{
                    /* ... (Genel CSS stilleri) ... */
                }
                
                /* YATAY DÜZENİ GARANTİ ALMA: FLEX ve KAYDIRMA */
                .carousel-wrapper{
                    display:flex !important; /* KRİTİK: Öğeleri yan yana dizmeye zorlar. */
                    flex-direction: row !important; 
                    overflow-x:auto !important; /* Yeterli alan yoksa yatay kaydırma çubuğunu açar. */
                    gap:12px !important;
                    /* ... (Diğer stiller) ... */
                }
                
                /* KART STİLİ: GENİŞLİĞİ KESİNLEŞTİRME */
                .card-item{
                    flex:0 0 200px !important; 
                    /* flex:0 0 200px: Kartın küçülmesini (0) ve büyümesini (0) engeller, sabit 200px genişlik (flex-basis) verir. 
                       Bu, ana sitenin CSS'i flex-wrap: wrap verse bile kartların yatay kalmasını sağlar. */
                    min-width: 200px !important;
                    max-width: 200px !important; 
                    width: 200px !important; 
                    box-sizing: border-box !important; /* Kutu modelini garanti altına alır. */
                    /* ... (Diğer stiller) ... */
                }
                
                /* Responsive: Mobil Cihazlar */
                @media(max-width:768px){
                    .card-item{
                        /* Mobil cihazda ekranın yarısı eksi boşluk kadar genişlik hesaplanır (Örn: 50% - 17px). */
                        flex:0 0 calc(50% - 17px) !important; 
                        min-width: calc(50% - 17px) !important; 
                        /* ... (Mobil stilleri) ... */
                    } 
                }
            `;
            document.head.appendChild(style);
        };

        // --- HTML Render ve Yerleştirme Mantığı ---
        
        /**
         * Karosel HTML'ini oluşturur ve DOM'daki doğru konuma yerleştirir.
         * İstenen konum, sitenin kendi "Sizin İçin Seçtiklerimiz" bloğundan hemen öncedir.
         * Bu konumu dinamik olarak bulmak için başlık metni üzerinden arama yaptım.
         */
        _self.renderSlider = async () => {
            const prods = await _self.fetchAndPrepareProducts();
            if (!prods || prods.length < 3) return; 
            
            // Önceki versiyon varsa kaldır (Tekrar yüklemeyi desteklemek için)
            const old = document.getElementById(MAIN_ID);
            if (old) old.remove();

            const container = document.createElement('div');
            container.id = MAIN_ID;
            container.innerHTML = `<h2>${SLIDER_HEADER}</h2>
                <div class="carousel-wrapper">${prods.map(_self.createProductCard).join('')}</div>`;

            // Hedef Elementi Bulma: "Sizin İçin Seçtiklerimiz"
            let existingTarget = null;
            document.querySelectorAll('h2').forEach(h2 => {
                // Güvenilir arama: Başlık metnine göre en yakın üst kapsayıcıyı bulur.
                if (h2.textContent.trim().includes('Sizin için Seçtiklerimiz') && !existingTarget) {
                    existingTarget = h2.closest('[class*="module"]') 
                                         || h2.closest('[class*="container"]') 
                                         || h2.closest('div[id]') 
                                         || h2.parentNode;
                }
            });

            // Yerleştirme
            if (existingTarget && existingTarget.parentNode) {
                // Öncelikli Yerleştirme: Hedef bloğun hemen önüne eklenir (istenen konum).
                existingTarget.parentNode.insertBefore(container, existingTarget);
            } else {
                // Yedek Yerleştirme: Eğer hedef bulunamazsa, ana içerik alanına eklenir.
                const mainContent = document.querySelector('.mainContent .content') 
                                    || document.querySelector('.content-main')
                                    || document.querySelector('.homepage.body-area .container'); 

                if (mainContent) {
                    mainContent.prepend(container); 
                } else {
                    document.body.appendChild(container);
                }
            }

            // Etkinlik Atamaları 
            /**
             * Event Delegation kullandım: Tüm click olaylarını tek bir dinleyici (ana kapsayıcı) üzerinden yönetiyorum.
             * Bu, binlerce kart olsa bile hafıza kullanımını optimize eder.
             */
            container.addEventListener('click', e => {
                const heart = e.target.closest('.favorite-icon');
                const card = e.target.closest('.card-item');

                if (heart) {
                    e.stopPropagation(); // Ürün tıklamasını engelle
                    const id = parseInt(heart.dataset.id);
                    let favs = _self.getFavs();
                    
                    // Favori Ekleme/Kaldırma Mantığı
                    if (favs.includes(id)) {
                        favs = favs.filter(f => f !== id);
                        heart.textContent = '♡';
                        heart.classList.replace('fav-full', 'fav-empty');
                    } else {
                        favs.push(id);
                        heart.textContent = '♥';
                        heart.classList.replace('fav-empty', 'fav-full');
                    }
                    _self.saveFavs(favs);
                } else if (card) {
                    // Kart tıklaması (Yeni sekmede açılır)
                    if (e.target.tagName === 'BUTTON') return; 

                    const url = card.getAttribute('data-url');
                    if (url) window.open(url, '_blank');
                }
            });
        };

        // Başlatma Noktası **
        _self.init = async () => {
            if (!checkHomePage()) return; // Sadece ana sayfada çalışır
            
            _self.insertStyles();
            await _self.renderSlider();
            
            console.log("Product Carousel script initialized.");
        };
        
        return { init: _self.init };
    })();

    // DOM'un yüklenme durumunu kontrol ederek uygulamanın doğru zamanda başlatılmasını sağlar.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", ProductCarousel.init);
    } else {
        ProductCarousel.init();
    }
})();
