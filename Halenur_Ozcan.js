// DOSYA ADI: Halenur_Ozcan.js
(function() {
  const EbebekCarousel = (function() {
    const self = {};
    const CAROUSEL_ID = 'ebebek-carousel-final';
    const LOCAL_PRODUCTS_KEY = 'ebebekCarouselProducts_v3';
    const LOCAL_FAVORITES_KEY = 'ebebekCarouselFavorites_v3';
    const API_URL = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json';
    const CAROUSEL_TITLE = "Beğenebileceğinizi düşündüklerimiz";

    const isHomePage = () => {
      const path = window.location.pathname.replace(/\/$/, '');
      return path === '' || path === '/' || path.toLowerCase() === '/default.aspx';
    };

    const calcDiscount = (original, price) => {
      if (original > price) {
        const disc = Math.round(((original - price) / original) * 100);
        return `<span class="discount">%${disc} İndirim</span>`;
      }
      return '';
    };

    // LocalStorage işlemleri
    self.getFavs = () => JSON.parse(localStorage.getItem(LOCAL_FAVORITES_KEY) || '[]');
    self.saveFavs = favs => localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favs));

    self.getProducts = async () => {
      let products = null;
      try {
        const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
        if (cached) products = JSON.parse(cached);
      } catch {}
      if (!products) {
        const res = await fetch(API_URL);
        const data = await res.json();
        products = Array.isArray(data) ? data : data.products || [];
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
      }
      const favs = self.getFavs();
      return products.map(p => ({ ...p, isFavorite: favs.includes(p.id) }));
    };

    self.createCard = p => {
      const { id, name, brand, img, url, price, original_price, isFavorite } = p;
      const heart = isFavorite ? '♥' : '♡';
      const heartClass = isFavorite ? 'fav-full' : 'fav-empty';
      const discountHTML = original_price > price ? calcDiscount(original_price, price) : '';
      const origHTML = original_price > price ? `<span class="orig">${original_price.toFixed(2)} TL</span>` : '';
      return `
        <div class="card" data-url="${url}" data-id="${id}">
          <div class="img-box">
            <img src="${img}" alt="${name}">
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

    self.injectCSS = () => {
      if (document.getElementById('ebebek-style-final')) return;
      const style = document.createElement('style');
      style.id = 'ebebek-style-final';
      style.textContent = `
        #${CAROUSEL_ID}{max-width:1240px;margin:30px auto;padding:20px;font-family:Arial}
        #${CAROUSEL_ID} h2{text-align:center;font-size:24px;margin-bottom:20px}
        .carousel-wrap{display:flex;overflow-x:auto;scroll-behavior:smooth;gap:12px}
        .card{flex:0 0 200px;border:1px solid #eee;border-radius:8px;padding:8px;cursor:pointer;position:relative;background:#fff}
        .img-box{position:relative}
        .img-box img{width:100%;border-radius:6px}
        .heart{position:absolute;top:6px;right:6px;font-size:18px;background:#fff;border-radius:50%;padding:4px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2)}
        .fav-empty{color:#ccc}
        .fav-full{color:#ff9900}
        .brand{font-size:12px;color:#888;margin-top:5px}
        .name{font-size:13px;height:32px;overflow:hidden}
        .prices{text-align:center;margin-top:5px}
        .orig{text-decoration:line-through;color:#999;font-size:12px;display:block}
        .price{color:#d90429;font-weight:bold}
        .discount{background:#d90429;color:#fff;font-size:10px;padding:2px 5px;border-radius:4px;margin-left:3px}
        @media(max-width:768px){.card{flex:0 0 45%}}
      `;
      document.head.appendChild(style);
    };

    self.render = async () => {
      const prods = await self.getProducts();
      const old = document.getElementById(CAROUSEL_ID);
      if (old) old.remove();
      const container = document.createElement('div');
      container.id = CAROUSEL_ID;
      container.innerHTML = `<h2>${CAROUSEL_TITLE}</h2>
        <div class="carousel-wrap">${prods.map(self.createCard).join('')}</div>`;
      document.body.appendChild(container);

      // eventler
      container.querySelectorAll('.card').forEach(c => {
        c.addEventListener('click', e => {
          if (e.target.classList.contains('heart')) return;
          const url = c.getAttribute('data-url');
          if (url) window.open(url, '_blank');
        });
      });
      container.querySelectorAll('.heart').forEach(h => {
        h.addEventListener('click', e => {
          e.stopPropagation();
          const id = parseInt(e.target.dataset.id);
          let favs = self.getFavs();
          if (favs.includes(id)) {
            favs = favs.filter(f => f !== id);
            e.target.textContent = '♡';
            e.target.classList.replace('fav-full', 'fav-empty');
          } else {
            favs.push(id);
            e.target.textContent = '♥';
            e.target.classList.replace('fav-empty', 'fav-full');
          }
          self.saveFavs(favs);
        });
      });
    };

    self.init = async () => {
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
