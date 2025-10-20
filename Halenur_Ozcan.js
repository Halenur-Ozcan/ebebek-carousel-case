// DOSYA ADI TAVSİYE: Halenur_Ozcan.js

(function() {
    
    // Proje, ES6+ JavaScript kullanılarak geliştirilmiştir.
    const EbebekCarousel = (function() {
        const self = {};
        
        // --- Yapılandırma ve Sabitler ---
        const CAROUSEL_ID = 'ebebek-carousel-final'; // Benzersiz ana ID
        const LOCAL_PRODUCTS_KEY = 'ebebekCarouselProducts_v3';
        const LOCAL_FAVORITES_KEY = 'ebebekCarouselFavorites_v3';
        
        // API URL
        const API_URL = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json';
        
        const CAROUSEL_TITLE = "Beğenebileceğinizi düşündüklerimiz";
        
        // --- Utility Fonksiyonları ---

        const isHomePage = () => {
            const path = window.location.pathname.replace(/\/$/, '');
            return path === '' || path === '/' || path.toLowerCase() === '/default.aspx';
        };

        const calcDiscount = (original, price) => {
            if (original > price) {
                const disc = Math.round(((original - price) / original) * 100);
                // İndirim yüzdesi hesaplandı
                return `<span class="discount">%${disc} İndirim</span>`;
            }
            return '';
        };

        // --- LocalStorage İşlemleri ---
        self.getFavs = () => JSON.parse(localStorage.getItem(LOCAL_FAVORITES_KEY) || '[]');
        self.saveFavs = favs => localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favs));

        // --- Veri Çekme (Düzeltilmiş Hali) ---
        self.getProducts = async () => {
            let products = null;
            try {
                // Local Storage kontrolü
                const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
                if (cached) products = JSON.parse(cached);
            } catch {}
            
            if (!products) {
                const res = await fetch(API_URL);
                const data = await res.json();
                products = Array.isArray(data) ? data : data.products || [];
                // API'den çekilen veriyi kaydet
                localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
            }
            
            // Favori bilgileri ile birleştir ve ID'leri tam sayıya çevir (DÜZELTME BURADA)
            const favs = self.getFavs();
            return products.map(p => {
                // API'den gelen string ID'yi tam sayıya çevirerek tutarlılık sağlıyoruz
                const idNumber = Number(p.id); 
                return { 
                    ...p, 
                    id: idNumber, // Ürün nesnesindeki ID'yi de tam sayı yaptık
                    isFavorite: favs.includes(idNumber) 
                };
            });
        };

        // --- Kart Oluşturma ---
        self.createCard = p => {
            const { id, name, brand, img, url, price, original_price, isFavorite } = p;
            const heart = isFavorite ? '♥' : '♡';
            const heartClass = isFavorite ? 'fav-full' : 'fav-empty';
            const discountHTML = original_price > price ? calcDiscount(original_price, price) : '';
            const origHTML = original_price > price ? `<span class="orig">${original_price.toFixed(2)} TL</span>` : '';
            
            return `
                <div class="card" data-url="${url}" data-id="${id}">
                    <div class="img-box">
                        <img src="${img}" alt="${name}" loading="lazy">
                        <span class="heart ${heartClass}" data-id="${id}">${heart}</span>
                    </div>
                    <div class="info">
                        <p class="brand">${brand || ''}</p>
                        <p class="name">${name}</p>
                        <div class="prices">
                            ${origHTML}
                            <span class="price">${price.toFixed(2)} TL</span>
                            ${discountHTML}
                        </div>
                    </div>
                </div>`;
        };

        // --- CSS Enjekte Etme ---
        self.injectCSS = () => {
            if (document.getElementById('ebebek-style-final')) return;
            const style = document.createElement('style');
            style.id = 'ebebek-style-final';
            style.textContent = `
                /* Ana Kapsayıcı */
                #${CAROUSEL_ID}{max-width:1240px;margin:30px auto;padding:20px;font-family:Arial}
                #${CAROUSEL_ID} h2{text-align:center;font-size:24px;margin-bottom:20px;font-weight:700}
                /* Kaydırma Bölümü */
                .carousel-wrap{display:flex;overflow-x:auto;scroll-behavior:smooth;gap:12px;padding-bottom:10px}
                .carousel-wrap::-webkit-scrollbar { height: 6px; }
                .carousel-wrap::-webkit-scrollbar-thumb { background-color: #ff9900; border-radius: 3px; }
                
                /* Kart Stili */
                .card{flex:0 0 200px;border:1px solid #eee;border-radius:8px;padding:8px;cursor:pointer;position:relative;background:#fff;transition:box-shadow .3s}
                .card:hover{box-shadow:0 4px 10px rgba(0,0,0,.1)}
                .img-box{position:relative}
                .img-box img{width:100%;height:auto;border-radius:6px}
                
                /* Favori İkonu */
                .heart{position:absolute;top:6px;right:6px;font-size:18px;background:#fff;border-radius:50%;padding:4px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2);line-height:1}
                .fav-empty{color:#ccc}
                .fav-full{color:#ff9900}
                
                /* Detaylar */
                .brand{font-size:12px;color:#888;margin-top:5px}
                .name{font-size:13px;height:32px;overflow:hidden;margin-bottom:5px}
                .prices{text-align:center;margin-top:5px}
                .orig{text-decoration:line-through;color:#999;font-size:12px;display:block}
                .price{color:#d90429;font-weight:bold;font-size:16px}
                .discount{background:#d90429;color:#fff;font-size:10px;padding:2px 5px;border-radius:4px;margin-left:3px;font-weight:bold}
                
                /* Responsive */
                @media(max-width:768px){
                    #${CAROUSEL_ID}{padding:10px}
                    .card{flex:0 0 calc(50% - 12px);min-width:calc(50% - 12px);}
                }
            `;
            document.head.appendChild(style);
        };

        // --- HTML Render ve Yerleştirme (Placement) ---
        self.render = async () => {
            const prods = await self.getProducts();
            
            // Ürün yoksa dur
            if (!prods || prods.length === 0) return;
            
            const old = document.getElementById(CAROUSEL_ID);
            if (old) old.remove();

            const container = document.createElement('div');
            container.id = CAROUSEL_ID;
            container.innerHTML = `<h2>${CAROUSEL_TITLE}</h2>
                <div class="carousel-wrap">${prods.map(self.createCard).join('')}</div>`;

            // --- YERLEŞTİRME MANTIĞI: "Sizin İçin Seçtiklerimiz" Üzerine Ekleme ---
            let existingSizinIcin = null;
            
            // 1. Tüm H2 başlıklarını dolaş ve metni kontrol et (En güvenilir yöntem)
            document.querySelectorAll('h2').forEach(h2 => {
                // Sitenin dinamik yapısına karşı metin kontrolü
                if (h2.textContent.trim().includes('Sizin için Seçtiklerimiz')) {
                    // Bulunduğunda, tüm bloğu temsil eden en yakın kapsayıcıyı bul.
                    existingSizinIcin = h2.closest('.module') 
                                        || h2.closest('.container') 
                                        || h2.closest('div[id]') 
                                        || h2; 
                }
            });

            const targetElement = document.querySelector('.mainContent .content') 
                                || document.querySelector('.content-main')
                                || document.querySelector('.homepage.body-area .container'); 

            
            if (existingSizinIcin && existingSizinIcin.parentNode) {
                // ÖNCELİK: Eğer "Sizin İçin Seçtiklerimiz" bloğu bulunursa, bizimkini ondan önce ekle.
                existingSizinIcin.parentNode.insertBefore(container, existingSizinIcin);
                console.log("Karosel: 'Sizin İçin Seçtiklerimiz' üzerine eklendi (Doğru Konum).");
            } else if (targetElement) {
                // YEDEK: Eğer o blok bulunamazsa, ana içerik kapsayıcısının başına ekle.
                targetElement.prepend(container); 
                console.log("Karosel: Ana içerik kapsayıcısının başına eklendi (Yedek Konum).");
            } else {
                 // SON ÇARE: Hiçbir şey bulunamazsa body'ye ekle.
                 document.body.appendChild(container);
                 console.log("Karosel: Body'nin sonuna eklendi (Hatalı Konum).");
            }

            // --- ETKİNLİK (EVENTS) ATAMALARI ---
            // 1. Ürüne tıklama (Yeni sekme)
            container.querySelectorAll('.card').forEach(c => {
                c.addEventListener('click', e => {
                    // Kalp ikonuna veya sepete ekle butonuna tıklamayı engelle
                    if (e.target.classList.contains('heart') || e.target.tagName === 'BUTTON') return;
                    const url = c.getAttribute('data-url');
                    if (url) window.open(url, '_blank');
                });
            });
            
            // 2. Favori ikonuna tıklama
            container.querySelectorAll('.heart').forEach(h => {
                h.addEventListener('click', e => {
                    e.stopPropagation(); // Ürün tıklamasını engelle
                    // ID'yi Number olarak alıyoruz, bu da ürün ID'leri (getProducts'ta düzeltildi) ile tutarlı.
                    const id = parseInt(e.target.dataset.id);
                    let favs = self.getFavs();
                    
                    if (favs.includes(id)) {
                        // Kaldır
                        favs = favs.filter(f => f !== id);
                        e.target.textContent = '♡';
                        e.target.classList.replace('fav-full', 'fav-empty');
                    } else {
                        // Ekle
                        favs.push(id);
                        e.target.textContent = '♥';
                        e.target.classList.replace('fav-empty', 'fav-full');
                    }
                    self.saveFavs(favs);
                });
            });
        };

        // --- Başlatma (Init) ---
        self.init = async () => {
            // Sadece ana sayfada çalışır
            if (!isHomePage()) return console.log("wrong page");
            
            self.injectCSS();
            await self.render();
            
            console.log("🎉 Ebebek Carousel başarıyla yüklendi.");
        };
        
        return { init: self.init };
    })();

    // DOM yüklendiğinde başlat
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", EbebekCarousel.init);
    } else {
        EbebekCarousel.init();
    }
})();
