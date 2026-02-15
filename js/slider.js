/**
 * Focus Market — Image Comparison Slider
 * Працює на миші + touch, доступний з клавіатури (←/→)
 */
(function(){
  const root = document.querySelector('[data-compare]');
  if(!root) return;

  const after = root.querySelector('.layer.after');
  const grabber = root.querySelector('.grabber');
  const handle = root.querySelector('.handle');

  const state = { value: 50, dragging:false };

  function setValue(v){
    state.value = Math.min(100, Math.max(0, v));
    after.style.clipPath = `inset(0 ${100-state.value}% 0 0)`;
    grabber.style.left = `${state.value}%`;
    handle.style.left = `${state.value}%`;
    root.setAttribute('data-value', String(Math.round(state.value)));
  }

  function pointerToValue(clientX){
    const rect = root.getBoundingClientRect();
    const x = clientX - rect.left;
    return (x / rect.width) * 100;
  }

  function onDown(e){
    state.dragging = true;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    setValue(pointerToValue(x));
    root.classList.add('dragging');
  }
  function onMove(e){
    if(!state.dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    setValue(pointerToValue(x));
  }
  function onUp(){
    state.dragging = false;
    root.classList.remove('dragging');
  }

  // Mouse
  root.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);

  // Touch
  root.addEventListener('touchstart', onDown, {passive:true});
  window.addEventListener('touchmove', onMove, {passive:true});
  window.addEventListener('touchend', onUp);

  // Keyboard
  root.setAttribute('tabindex','0');
  root.setAttribute('role','group');
  root.setAttribute('aria-label','Порівняння фото До/Після');
  root.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') { e.preventDefault(); setValue(state.value - 3); }
    if(e.key === 'ArrowRight'){ e.preventDefault(); setValue(state.value + 3); }
    if(e.key === 'Home'){ e.preventDefault(); setValue(0); }
    if(e.key === 'End'){ e.preventDefault(); setValue(100); }
  });

  setValue(50);
})();
