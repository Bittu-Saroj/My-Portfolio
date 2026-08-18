// Script for nav, smooth scroll, reveal on scroll, simple gallery lightbox, before/after slider and contact form validation
document.addEventListener('DOMContentLoaded', function(){
  // Keep the static HTML useful while allowing the admin to edit the portfolio.
  // Paths are relative because the site is commonly hosted in /saroj_portfolio.
  document.querySelectorAll('[src^="/assets/"]').forEach(el=>el.src = el.src.replace('/assets/','assets/'));
  document.querySelectorAll('[data-before^="/assets/"],[data-after^="/assets/"]').forEach(el=>{
    if(el.dataset.before?.startsWith('/assets/')) el.dataset.before = el.dataset.before.replace('/assets/','assets/');
    if(el.dataset.after?.startsWith('/assets/')) el.dataset.after = el.dataset.after.replace('/assets/','assets/');
  });
  fetch('admin/api-settings.php').then(r=>r.ok?r.json():{}).then(settings=>{
    const setText=(selector,key)=>{const el=document.querySelector(selector); if(el && settings[key]) el.textContent=settings[key]};
    setText('.brand','site_name'); setText('.eyebrow','hero_eyebrow'); setText('.hero-sub','hero_sub'); setText('.hero-intro','hero_intro');
    if(settings.hero_title){const title=document.querySelector('.hero-title'); title.innerHTML=''; settings.hero_title.split(/\r?\n/).forEach((line,i)=>{if(i) title.appendChild(document.createElement('br')); title.appendChild(document.createTextNode(line))});}
    if(settings.about_text){const about=document.querySelector('#about > .section-grid > div'); const p=about?.querySelectorAll('p'); if(p && p.length>1) p[1].textContent=settings.about_text;}
    setText('#education h3','education_title'); setText('#education .education-card p:last-child','education_text');
    setText('#design .section-head .muted','design_intro'); setText('#photography .section-head .muted','photo_intro');
    setText('#editing h2','before_title'); setText('#editing > .muted','before_intro');
    setText('#video .section-head .muted','video_intro'); setText('#projects .section-head .muted','projects_intro');
    setText('#contact h2','contact_title'); setText('#contact .contact-grid > div:first-child > .muted','contact_intro');
    const contactMap={email:['#contact a[href^="mailto:"]','mailto:'],phone:['#contact .contact-list li:nth-child(2)', ''],instagram_label:['#contact .contact-list li:nth-child(3)',''],facebook_label:['#contact .contact-list li:nth-child(4)','']};
    if(settings.email){const a=document.querySelector(contactMap.email[0]); if(a){a.textContent=settings.email;a.href='mailto:'+settings.email;}}
    if(settings.phone){const el=document.querySelector(contactMap.phone[0]); if(el) el.innerHTML='<strong>WhatsApp:</strong> '+settings.phone;}
    if(settings.instagram_url){const el=document.querySelector('#contact .contact-list li:nth-child(3)'); if(el) el.innerHTML='<strong>Instagram:</strong> <a href="'+settings.instagram_url+'" target="_blank" rel="noopener">'+(settings.instagram_label||settings.instagram_url)+'</a>';}
    if(settings.facebook_url){const el=document.querySelector('#contact .contact-list li:nth-child(4)'); if(el) el.innerHTML='<strong>Facebook:</strong> <a href="'+settings.facebook_url+'" target="_blank" rel="noopener">'+(settings.facebook_label||settings.facebook_url)+'</a>';}
    const hero=settings.cover_image&&document.querySelector('.profile-photo'); if(hero) hero.src=settings.cover_image;
    const pair=document.querySelector('.before-after'); if(pair){if(settings.before_image) pair.dataset.before=settings.before_image;if(settings.after_image) pair.dataset.after=settings.after_image;}
    ['instagram','facebook','github','linkedin'].forEach(name=>{if(settings[name+'_url']) document.querySelectorAll('.socials a[aria-label="'+name[0].toUpperCase()+name.slice(1)+'"]').forEach(a=>a.href=settings[name+'_url'])});
  }).catch(()=>{});

  // Software & Technology tools managed from the admin panel.
  fetch('admin/api-tools.php').then(r=>r.ok?r.json():[]).then(tools=>{
    if(!Array.isArray(tools) || !tools.length) return;
    const grid=document.querySelector('.skills-grid'); if(!grid) return;
    grid.innerHTML='';
    tools.forEach(tool=>{
      const item=document.createElement('div'); item.className='skill';
      if(tool.image){const img=document.createElement('img');img.src=tool.image;img.alt='';img.style.cssText='width:42px;height:42px;object-fit:contain;background:#fff;border-radius:6px;padding:4px';item.appendChild(img);}
      const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=tool.title||''; const desc=document.createElement('p'); desc.className='muted'; desc.textContent=tool.description||''; body.append(title,desc); item.appendChild(body); grid.appendChild(item);
    });
  }).catch(()=>{});
  // Nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  navToggle?.addEventListener('click', ()=>{
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.startsWith('#')){
        const el = document.querySelector(href);
        if(el){
          e.preventDefault();
          el.scrollIntoView({behavior:'smooth',block:'start'});
          // close mobile nav
          if(navMenu.classList.contains('open')){navMenu.classList.remove('open');navToggle.setAttribute('aria-expanded','false')}
        }
      }
    })
  });

  // Reveal on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('visible')}
    })
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  // Design projects: fallback local data, then attempt to load from admin API
  let designProjects = [
    {title:'Social Post Placeholder',category:'social',image:'assets/images/design/social-01.svg',tools:['Canva']},
    {title:'Poster Placeholder',category:'poster',image:'assets/images/design/poster-01.svg',tools:['Photoshop']},
    {title:'Branding Placeholder',category:'branding',image:'assets/images/design/branding-01.svg',tools:['Illustrator']},
    {title:'Ad Placeholder',category:'ad',image:'assets/images/design/ad-01.svg',tools:['Photoshop']}
  ];

  const designGrid = document.getElementById('design-grid');
  function renderDesign(projects){
    designGrid.innerHTML = '';
    projects.forEach(p=>{
      const toolsArr = Array.isArray(p.tools) ? p.tools : (p.tools ? String(p.tools).split(',') : []);
      const imgSrc = p.image || (p.filename ? p.filename : 'assets/images/design/social-01.svg');
      const card = document.createElement('div'); card.className = 'project-card';
      card.innerHTML = `<img src="${imgSrc}" alt="${(p.title||'Project')}" loading="lazy"><div class="project-body"><h4>${p.title||''}</h4><p class="muted">${p.category||''}</p><p class="muted">${toolsArr.join(', ')}</p></div>`;
      const imgEl = card.querySelector('img');
      imgEl.addEventListener('click', ()=>openLightbox(imgSrc, p.title || ''));
      designGrid.appendChild(card);
    })
  }

  // Try to fetch live projects from admin API, fallback to local designProjects
  fetch('admin/api-design.php').then(r=>{ if(!r.ok) throw new Error('Network response not ok'); return r.json(); }).then(data=>{
    if(Array.isArray(data) && data.length){ designProjects = data; renderDesign(designProjects); }
    else renderDesign(designProjects);
  }).catch(()=>{
    renderDesign(designProjects);
  });

  // Filter buttons (use current designProjects variable)
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      if(filter === 'all') renderDesign(designProjects);
      else renderDesign(designProjects.filter(p=>p.category===filter));
    })
  });

  // Photography grid - try to fetch from admin API, fallback to local placeholders
  const photos = [
    'assets/images/photography/portrait-01.svg','assets/images/photography/landscape-01.svg','assets/images/photography/event-01.svg','assets/images/photography/product-01.svg'
  ];
  const photoGrid = document.getElementById('photo-grid');
  function renderPhotos(list){
    photoGrid.innerHTML = '';
    list.forEach(p=>{
      const img = document.createElement('img');
      img.src = p.image || p;
      img.alt = p.title || 'Photography placeholder';
      img.loading = 'lazy';
      img.addEventListener('click', ()=>openLightbox(img.src, p.title || 'Photography'));
      photoGrid.appendChild(img);
    });
  }
  // Attempt to fetch dynamic photos from admin API
  fetch('admin/api-photos.php').then(r=>{ if(!r.ok) throw new Error('Network response not ok'); return r.json(); }).then(data=>{
    if(Array.isArray(data) && data.length) renderPhotos(data);
    else renderPhotos(photos);
  }).catch(()=>{
    // fallback local
    renderPhotos(photos);
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  function openLightbox(src, caption){
    lightboxImg.src = src; lightboxImg.alt = caption || '';
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('show'); lightbox.setAttribute('aria-hidden','false');
  }
  function closeLightbox(){lightbox.classList.remove('show');lightbox.setAttribute('aria-hidden','true');}
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e)=>{if(e.target===lightbox) closeLightbox()});
  document.addEventListener('keydown', (e)=>{if(e.key==='Escape') closeLightbox()});

  // Before/After slider simple implementation
  document.querySelectorAll('.before-after').forEach(container=>{
    const before = container.dataset.before; const after = container.dataset.after;
    const imgBefore = document.createElement('img'); imgBefore.src = before; imgBefore.className='before';
    const imgAfter = document.createElement('img'); imgAfter.src = after; imgAfter.className='after';
    container.appendChild(imgBefore); container.appendChild(imgAfter);
    const handle = document.createElement('div'); handle.className='handle'; container.appendChild(handle);
    let dragging=false; const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
    function update(x){
      const rect = container.getBoundingClientRect();
      const pct = clamp((x-rect.left)/rect.width,0,1);
      imgAfter.style.clipPath = `inset(0 ${100- pct*100}% 0 0)`;
      handle.style.left = (pct*100)+'%';
    }
    container.addEventListener('pointerdown', (e)=>{dragging=true;container.setPointerCapture(e.pointerId);update(e.clientX)});
    container.addEventListener('pointermove', (e)=>{if(dragging) update(e.clientX)});
    container.addEventListener('pointerup', (e)=>{dragging=false});
    // set default to 50%
    setTimeout(()=>update(container.getBoundingClientRect().left + container.getBoundingClientRect().width/2),100);
  });

  // Contact form validation (frontend only)
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if(!name || !email || !message){feedback.textContent='Please fill required fields.';feedback.style.color='tomato';return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){feedback.textContent='Please enter a valid email.';feedback.style.color='tomato';return}
    feedback.style.color='var(--accent)';
    feedback.textContent = 'Thanks! Your message is ready to be sent.';
    form.reset();
  });

  // Active nav on scroll
  const sections = document.querySelectorAll('main section[id]');
  window.addEventListener('scroll', ()=>{
    let current='home';
    sections.forEach(sec=>{
      const rect = sec.getBoundingClientRect();
      if(rect.top <= 120) current = sec.id;
    });
    document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active', a.getAttribute('href') === '#'+current));
  });
});
