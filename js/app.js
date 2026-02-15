/**
 * Focus Market — базова логіка:
 * - перемикання пресетів (імітація через CSS filter)
 * - підстановка назви/ціни у checkout
 * - простенька валідація форми оплати
 */
(function(){
  // ===== Preset switching (demo.html) =====
  const presetRoot = document.querySelector('[data-preset-demo]');
  if(presetRoot){
    const afterImg = presetRoot.querySelector('[data-after-img]');
    const pills = Array.from(presetRoot.querySelectorAll('[data-preset]'));
    const stats = presetRoot.querySelector('[data-preset-stats]');
    const nameEl = presetRoot.querySelector('[data-preset-name]');
    const priceEl = presetRoot.querySelector('[data-preset-price]');
    const buyBtn = presetRoot.querySelector('[data-buy]');

    const presets = {
      cinematic: {
        label:'Cinematic',
        price: '149 ₴',
        filter: 'contrast(1.12) saturate(0.92) brightness(0.95) hue-rotate(-8deg)',
        stats: ['Контраст +12', 'Насиченість -8', 'Яскравість -5', 'Тінь +6']
      },
      clean: {
        label:'Clean Pro',
        price: '129 ₴',
        filter: 'contrast(1.05) saturate(1.05) brightness(1.02)',
        stats: ['Контраст +5', 'Насиченість +5', 'Яскравість +2', 'Шум -10']
      },
      warm: {
        label:'Warm Glow',
        price: '139 ₴',
        filter: 'contrast(1.06) saturate(1.10) brightness(1.00) sepia(0.18)',
        stats: ['Теплота +18', 'Насиченість +10', 'Контраст +6', 'Світла -4']
      },
      bw: {
        label:'B&W Classic',
        price: '119 ₴',
        filter: 'grayscale(1) contrast(1.15) brightness(1.02)',
        stats: ['Ч/Б', 'Контраст +15', 'Яскравість +2', 'Зерно +8']
      }
    };

    function setPreset(key){
      const p = presets[key] || presets.clean;
      afterImg.style.filter = p.filter;
      nameEl.textContent = p.label;
      priceEl.textContent = p.price;
      stats.innerHTML = '';
      p.stats.forEach(t=>{
        const span = document.createElement('span');
        span.className = 'pill';
        span.textContent = t;
        span.setAttribute('aria-pressed','false');
        span.tabIndex = -1;
        stats.appendChild(span);
      });

      pills.forEach(btn=>{
        btn.setAttribute('aria-pressed', btn.dataset.preset === key ? 'true' : 'false');
      });

      // persist to checkout
      const url = new URL(buyBtn.getAttribute('href'), window.location.href);
      url.searchParams.set('preset', key);
      buyBtn.setAttribute('href', url.pathname + url.search);
    }

    pills.forEach(btn=>{
      btn.addEventListener('click', ()=> setPreset(btn.dataset.preset));
    });

    setPreset('clean');
  }

  // ===== Checkout page: fill summary from query =====
  const checkout = document.querySelector('[data-checkout]');
  if(checkout){
    const summaryName = checkout.querySelector('[data-summary-name]');
    const summaryPrice = checkout.querySelector('[data-summary-price]');
    const form = checkout.querySelector('form');
    const payBtn = checkout.querySelector('[data-pay]');
    const result = checkout.querySelector('[data-result]');

    const map = {
      cinematic: {name:'Cinematic', price:'149 ₴', file:'FocusMarket_Cinematic.zip'},
      clean: {name:'Clean Pro', price:'129 ₴', file:'FocusMarket_Clean.zip'},
      warm: {name:'Warm Glow', price:'139 ₴', file:'FocusMarket_Warm.zip'},
      bw: {name:'B&W Classic', price:'119 ₴', file:'FocusMarket_BW.zip'},
    };

    const q = new URLSearchParams(location.search);
    const key = q.get('preset') || 'clean';
    const info = map[key] || map.clean;

    summaryName.textContent = info.name;
    summaryPrice.textContent = info.price;

    function setError(el, msg){
      let box = el.closest('.field').querySelector('.error');
      if(!box){
        box = document.createElement('div');
        box.className='error';
        el.closest('.field').appendChild(box);
      }
      box.textContent = msg;
    }
    function clearError(el){
      const box = el.closest('.field').querySelector('.error');
      if(box) box.remove();
    }

    function validate(){
      const email = form.querySelector('[name="email"]');
      const card = form.querySelector('[name="card"]');
      const name = form.querySelector('[name="name"]');

      let ok = true;

      if(!email.value.includes('@') || email.value.length < 6){ ok=false; setError(email,'Вкажіть коректний email.'); }
      else clearError(email);

      // simple mask rule: 16 digits
      const digits = card.value.replace(/\D/g,'');
      if(digits.length !== 16){ ok=false; setError(card,'Номер картки має містити 16 цифр (демо).'); }
      else clearError(card);

      if(name.value.trim().length < 2){ ok=false; setError(name,'Вкажіть імʼя (мінімум 2 символи).'); }
      else clearError(name);

      payBtn.disabled = !ok;
      payBtn.setAttribute('aria-disabled', String(!ok));
      return ok;
    }

    ['input','blur'].forEach(evt=>{
      form.addEventListener(evt, ()=>validate(), true);
    });

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      if(!validate()) return;

      // Fake processing
      payBtn.textContent = 'Опрацьовуємо…';
      payBtn.disabled = true;

      setTimeout(()=>{
        payBtn.textContent = 'Оплатити (демо)';
        result.innerHTML = `
          <div class="success">
            <strong>Готово! (демо)</strong>
            <div class="small" style="margin-top:6px">
              Ваше замовлення сформовано. Завантажте файл нижче (імітація післяоплатної сторінки).
            </div>
            <div class="btnrow" style="margin-top:10px">
              <a class="btn positive" href="assets/downloads/${info.file}" download>Завантажити пресет (.zip)</a>
              <a class="btn subtle" href="demo.html">Повернутись до демо</a>
            </div>
          </div>
        `;
        payBtn.disabled = false;
        validate();
      }, 650);
    });

    validate();
  }


  // ===== Photo upload (demo.html) =====
  const beforeImg = document.getElementById('beforeImg');
  const afterImgEl = document.getElementById('afterImg');
  const inputBefore = document.getElementById('fileInputBefore');
  const inputAfter = document.getElementById('fileInputAfter');
  const resetBtn = document.getElementById('resetPhotosBtn');
  const statusEl = document.getElementById('uploadStatus');

  // Runs only on demo page (when elements exist)
  if(beforeImg && afterImgEl && inputBefore && inputAfter && resetBtn){
    const defaultBefore = beforeImg.getAttribute('src');
    const defaultAfter = afterImgEl.getAttribute('src');
    // initial backdrops for placeholders
    updateBackdrop("before", defaultBefore);
    updateBackdrop("after", defaultAfter);

    let urlBefore = null;
    let urlAfter = null;

    function setStatus(text){
      if(!statusEl) return;
      statusEl.textContent = text || '';
    }

    function updateBackdrop(which, url){
      const el = document.querySelector(`[data-backdrop="${which}"]`);
      if(!el) return;
      el.style.backgroundImage = url ? `url("${url}")` : '';
    }

    function isImageFile(file){
      return file && file.type && file.type.startsWith('image/');
    }

    function setImageFromFile(file, target){
      if(!isImageFile(file)){
        setStatus('Будь ласка, обери файл зображення (JPG/PNG/WebP).');
        return null;
      }
      const url = URL.createObjectURL(file);
      target.src = url;
      if(target.id === "beforeImg") updateBackdrop("before", url);
      if(target.id === "afterImg") updateBackdrop("after", url);
      setStatus('Фото завантажено. Можеш рухати слайдер і перемикати пресети.');
      return url;
    }

    inputBefore.addEventListener('change', ()=>{
      const file = inputBefore.files && inputBefore.files[0];
      if(urlBefore) URL.revokeObjectURL(urlBefore);
      urlBefore = setImageFromFile(file, beforeImg);

      // If user hasn't uploaded "after", mirror before into after (preset will still apply)
      const afterFile = inputAfter.files && inputAfter.files[0];
      if(!afterFile && file){
        if(urlAfter) URL.revokeObjectURL(urlAfter);
        // reuse same object URL would be revoked; so create a new one
        urlAfter = setImageFromFile(file, afterImgEl);
      }
    });

    inputAfter.addEventListener('change', ()=>{
      const file = inputAfter.files && inputAfter.files[0];
      if(urlAfter) URL.revokeObjectURL(urlAfter);
      urlAfter = setImageFromFile(file, afterImgEl);
    });

    resetBtn.addEventListener('click', ()=>{
      if(urlBefore) { URL.revokeObjectURL(urlBefore); urlBefore = null; }
      if(urlAfter) { URL.revokeObjectURL(urlAfter); urlAfter = null; }
      beforeImg.src = defaultBefore;
      afterImgEl.src = defaultAfter;
      updateBackdrop("before", defaultBefore);
      updateBackdrop("after", defaultAfter);
      inputBefore.value = '';
      inputAfter.value = '';
      setStatus('Плейсхолдери повернуто.');
    });
  }


  // ===== small helper: smooth top =====
  const topLinks = document.querySelectorAll('[data-top]');
  topLinks.forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      window.scrollTo({top:0, behavior:'smooth'});
    })
  });
})();
