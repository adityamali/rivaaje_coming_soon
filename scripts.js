// Simple email capture — stores locally
const form = document.getElementById('notify-form');
const emailInput = document.getElementById('email');
const msg = document.getElementById('notify-msg');

const webapp_url = 'https://script.google.com/macros/s/AKfycbys3MUI-qUFMDySL8egIU0kx2ZJ6Wma3VSAOH-wYsf18OAVfTI_Adcxi0UoYz6g4ypW/exec';

// Autoplay helper for mobile Safari: ensure video is muted and attempt play;
// if blocked, try again on first user interaction (touchstart/click).
function ensureBackgroundAutoplay(){
  const vid = document.getElementById('bg-video');
  if(!vid) return;

  // Ensure muted (some browsers require the property, not just attribute)
  try{ vid.muted = true; vid.setAttribute('muted', ''); }catch(e){}

  const tryPlay = ()=>{
    vid.play().then(()=>{
      // playing
      removeListeners();
    }).catch(()=>{
      // play was prevented — wait for a user gesture
    });
  };

  function onFirstInteract(){
    tryPlay();
  }

  function removeListeners(){
    document.removeEventListener('touchstart', onFirstInteract);
    document.removeEventListener('click', onFirstInteract);
    document.removeEventListener('keydown', onFirstInteract);
  }

  // Try immediately
  tryPlay();

  // If not playing, start listening for first interaction to play
  // (Safari on iOS often requires a user gesture)
  document.addEventListener('touchstart', onFirstInteract, {passive:true});
  document.addEventListener('click', onFirstInteract, {passive:true});
  document.addEventListener('keydown', onFirstInteract, {passive:true});
}

// Run autoplay helper on DOM ready
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ensureBackgroundAutoplay);
} else {
  ensureBackgroundAutoplay();
}

// -- Background video diagnostics & fallback --
function setupBgDiagnostics(){
  const vid = document.getElementById('bg-video');
  if(!vid) return;

  function showFallback(err){
    console.error('Background video failed to play', err || vid.error);
    try{ vid.style.display = 'none'; }catch(e){}

    if(document.getElementById('video-fallback')) return;
    const box = document.createElement('div');
    box.id = 'video-fallback';
    box.innerHTML = `<div class="video-fallback-inner">Background video unavailable in this browser. Try re-encoding to H.264 MP4:<br/><code>ffmpeg -i input.mov -vcodec libx264 -profile:v baseline -level 3.0 -preset fast -crf 23 -acodec aac -movflags +faststart background.mp4</code><br/><button id="retry-video">Retry</button></div>`;
  Object.assign(box.style, {position:'fixed',right:'12px',bottom:'12px',zIndex:9999,background:'rgba(0,0,0,0.7)',color:'#fff',padding:'12px',borderRadius:'0',maxWidth:'360px',fontSize:'13px'});
    document.body.appendChild(box);
    document.getElementById('retry-video').addEventListener('click', ()=>{
      // attempt to reload and play
      try{ vid.load(); vid.play().catch(()=>{}); vid.style.display='block'; box.remove(); }catch(e){}
    });
  }

  vid.addEventListener('error', (e)=>{
    showFallback(e);
  });
  vid.addEventListener('stalled', ()=>{ console.warn('bg-video stalled'); });
  vid.addEventListener('suspend', ()=>{ console.warn('bg-video suspend'); });
  vid.addEventListener('emptied', ()=>{ console.warn('bg-video emptied'); });
  vid.addEventListener('canplay', ()=>{
    console.log('bg-video canplay');
  });
  // If metadata never arrives within a short timeout, show fallback
  const t = setTimeout(()=>{
    if(!vid.readyState || vid.readyState < 3){
      showFallback();
    }
  }, 3000);
  vid.addEventListener('loadeddata', ()=>{ clearTimeout(t); });
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', setupBgDiagnostics);
} else {
  setupBgDiagnostics();
}

function isValidEmail(e){
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
}

form.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const email = emailInput.value.trim();
  if(!isValidEmail(email)){
    msg.textContent = 'Please enter a valid email.';
    msg.style.color = 'crimson';
    return;
  }
  // save to localStorage list
  try{
    // // save locally as a fallback
    // try{
    //   const list = JSON.parse(localStorage.getItem('rivaje_emails') || '[]');
    //   if(!list.includes(email)) list.push(email);
    //   localStorage.setItem('rivaje_emails', JSON.stringify(list));
    // }catch(err){
    //   console.warn('localStorage not available', err);
    // }

    // send to webapp endpoint if configured
    const payload = new URLSearchParams({email}).toString();
    const res = await fetch(webapp_url, { 
      method: 'POST', 
      headers: {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
      body: payload
    });
    if(!res.ok) throw new Error('Server responded with ' + res.status);
  }catch(e){
    console.error('Failed to save email:', e);
  }
  alert('Thank you! Your email has been recorded.');
  msg.style.color = '';
  msg.textContent = 'Thanks — we will notify you.';
  emailInput.value = '';
});
