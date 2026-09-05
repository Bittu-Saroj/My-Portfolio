// Script for nav, smooth scroll, reveal on scroll, simple gallery lightbox, before/after slider and contact form validation
document.addEventListener('DOMContentLoaded', function(){
  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 16);
  updateHeader();
  const progressBar = document.querySelector('.nav-progress span');
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if(progressBar) progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  };
  window.addEventListener('scroll', () => { updateHeader(); updateProgress(); }, {passive:true});
  updateProgress();
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
  const fallbackTools = [
    {title:'Adobe Photoshop',description:'Photo editing & compositing',image:'assets/images/tools/photoshop.webp'},
    {title:'Adobe Lightroom',description:'Color grading',image:'assets/images/tools/lightroom.webp'},
    {title:'Adobe Premiere Pro',description:'Comfortable - short edits & reels',image:'assets/images/tools/premiere.jpg'},
    {title:'Canva',description:'Fast layouts & social posts',image:'assets/images/tools/canva.webp'},
    {title:'PHP / MySQL',description:'Working knowledge - web apps',image:'assets/images/tools/php-mysql.png'},
    {title:'HTML / CSS / JS',description:'Responsive frontends & backends',image:'assets/images/tools/web-stack.jpg'}
  ];
  const renderTools = tools => {
    const grid=document.querySelector('.skills-grid'); if(!grid) return;
    grid.innerHTML='';
    if(!Array.isArray(tools) || !tools.length) tools = fallbackTools;
    tools.forEach(tool=>{
      const item=document.createElement('div'); item.className='skill';
      if(tool.image){const img=document.createElement('img');img.src=tool.image;img.alt='';img.style.cssText='width:42px;height:42px;object-fit:contain;background:#fff;border-radius:6px;padding:4px';item.appendChild(img);}
      const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=tool.title||''; const desc=document.createElement('p'); desc.className='muted'; desc.textContent=tool.description||''; body.append(title,desc); item.appendChild(body); grid.appendChild(item);
    });
  };
  fetch('admin/api-tools.php').then(r=>r.ok?r.json():[]).then(renderTools).catch(()=>renderTools(fallbackTools));
  // Nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const mobileBackdrop = document.querySelector('.mobile-nav-backdrop');
  const megaTriggers = [...document.querySelectorAll('.nav-trigger')];
  const closeMegaMenus = () => megaTriggers.forEach(trigger=>{
    trigger.setAttribute('aria-expanded','false');
    trigger.nextElementSibling?.classList.remove('open');
  });
  megaTriggers.forEach(trigger=>{
    trigger.addEventListener('click', event=>{
      event.preventDefault();
      const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeMegaMenus();
      if(!wasOpen){
        trigger.setAttribute('aria-expanded','true');
        trigger.nextElementSibling?.classList.add('open');
      }
    });
  });
  navToggle?.addEventListener('click', ()=>{
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    navMenu.classList.toggle('open');
    mobileBackdrop?.classList.toggle('open', !expanded);
    document.body.classList.toggle('mobile-nav-open', !expanded);
    if(expanded) closeMegaMenus();
  });
  document.addEventListener('click', (event)=>{
    if(!event.target.closest('.nav-dropdown')) closeMegaMenus();
    if(navMenu?.classList.contains('open') && !navMenu.contains(event.target) && !navToggle.contains(event.target)){
      navMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded','false');
      navToggle.setAttribute('aria-label','Open navigation');
      mobileBackdrop?.classList.remove('open');
      document.body.classList.remove('mobile-nav-open');
    }
  });
  document.addEventListener('keydown', event=>{
    if(event.key === 'Escape'){
      closeMegaMenus();
      navMenu?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded','false');
      navToggle?.setAttribute('aria-label','Open navigation');
      mobileBackdrop?.classList.remove('open');
      document.body.classList.remove('mobile-nav-open');
    }
  });
  mobileBackdrop?.addEventListener('click', ()=>{
    navMenu?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded','false');
    navToggle?.setAttribute('aria-label','Open navigation');
    mobileBackdrop.classList.remove('open');
    document.body.classList.remove('mobile-nav-open');
    closeMegaMenus();
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
          if(navMenu.classList.contains('open')){navMenu.classList.remove('open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open navigation');mobileBackdrop?.classList.remove('open');document.body.classList.remove('mobile-nav-open');closeMegaMenus()}
        }
      }
    })
  });

  const navLinks = [...document.querySelectorAll('.nav-link[href]')];
  const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const activeSectionObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navLinks.forEach(link=>link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  },{rootMargin:'-35% 0px -55% 0px',threshold:0});
  navSections.forEach(section=>activeSectionObserver.observe(section));

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
  if(designGrid) designGrid.innerHTML = '<div class="loading-state">Loading selected work…</div>';
  function renderDesign(projects){
    if(!designGrid) return;
    designGrid.innerHTML = '';
    if(!projects.length){ designGrid.innerHTML='<div class="empty-state">No projects in this category yet.</div>'; return; }
    projects.forEach(p=>{
      const toolsArr = Array.isArray(p.tools) ? p.tools : (p.tools ? String(p.tools).split(',') : []);
      const imgSrc = p.image || (p.filename ? p.filename : 'assets/images/design/social-01.svg');
      const card = document.createElement('div'); card.className = 'project-card';
      const imgEl = document.createElement('img');
      imgEl.src = imgSrc; imgEl.alt = p.title || 'Project'; imgEl.loading = 'lazy';
      const body = document.createElement('div'); body.className = 'project-body';
      const title = document.createElement('h4'); title.textContent = p.title || '';
      const category = document.createElement('p'); category.className = 'muted'; category.textContent = p.category || '';
      const toolList = document.createElement('p'); toolList.className = 'muted'; toolList.textContent = toolsArr.join(', ');
      body.append(title, category, toolList);
      if(p.description){const description=document.createElement('p'); description.textContent=p.description; body.appendChild(description);}
      card.append(imgEl, body);
      imgEl.addEventListener('click', ()=>openLightbox(imgSrc, p.title || ''));
      designGrid.appendChild(card);
    })
  }

  // Try to fetch live projects from admin API, fallback to local designProjects
  fetch('admin/api-design.php').then(r=>{ if(!r.ok) throw new Error('Network response not ok'); return r.json(); }).then(data=>{
    if(Array.isArray(data)){ designProjects = data; renderDesign(designProjects); }
    else renderDesign([]);
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
  if(photoGrid) photoGrid.innerHTML = '<div class="loading-state">Loading photographs…</div>';
  function renderPhotos(list){
    if(!photoGrid) return;
    photoGrid.innerHTML = '';
    if(!list.length){ photoGrid.innerHTML='<div class="empty-state">Photography will be published here soon.</div>'; return; }
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
    if(Array.isArray(data)) renderPhotos(data);
    else renderPhotos([]);
  }).catch(()=>{
    // fallback local
    renderPhotos(photos);
  });

  // Videos and process steps are managed from the admin panel. A fallback is
  // used only when the API is unavailable; a successful empty response means
  // the administrator intentionally has no published items.
  const videoGrid = document.getElementById('video-grid');
  if(videoGrid) videoGrid.innerHTML = '<div class="loading-state">Loading video projects…</div>';
  function renderVideoFallback(){
    if(!videoGrid) return;
    videoGrid.innerHTML='<div class="video-card placeholder"><div class="video-thumb">Video Coming Soon</div><h4>Project Placeholder</h4><p class="muted">Premiere Pro / Reels</p></div>';
  }
  fetch('admin/api-videos.php').then(r=>{if(!r.ok) throw new Error('API unavailable'); return r.json();}).then(videos=>{
    if(!videoGrid) return;
    videoGrid.innerHTML='';
    if(!videos.length){ videoGrid.innerHTML='<div class="empty-state">Video projects will be published here soon.</div>'; return; }
    videos.forEach(video=>{
      const card=document.createElement('div'); card.className='video-card';
      const thumb=document.createElement('div'); thumb.className='video-thumb';
      if(video.video && !video.thumb){const player=document.createElement('video'); player.src=video.video; player.controls=true; player.preload='metadata'; thumb.appendChild(player);}
      else if(video.thumb){const img=document.createElement('img'); img.src=video.thumb; img.alt=video.title||'Video'; thumb.appendChild(img);}
      else thumb.textContent='Video';
      card.append(thumb);
      const title=document.createElement('h4'); title.textContent=video.title||''; card.appendChild(title);
      const desc=document.createElement('p'); desc.className='muted'; desc.textContent=video.description||''; card.appendChild(desc);
      if(video.url){const link=document.createElement('a'); link.className='btn btn-sm'; link.href=video.url; link.target='_blank'; link.rel='noopener'; link.textContent='Watch video'; card.appendChild(link);}
      videoGrid.appendChild(card);
    });
  }).catch(()=>{renderVideoFallback();});

  const processTimeline = document.getElementById('process-timeline');
  if(processTimeline) processTimeline.innerHTML = '<div class="loading-state">Loading process…</div>';
  function renderProcessFallback(){
    if(!processTimeline) return;
    const fallback = [
      ['Discover','Understand your goals, audience, and direction.','fa-compass'],
      ['Plan','Shape the concept, structure, and visual language.','fa-lightbulb'],
      ['Design','Turn the idea into thoughtful, polished visuals.','fa-pen-ruler'],
      ['Refine','Review details, improve clarity, and perfect the finish.','fa-wand-magic-sparkles'],
      ['Deliver','Prepare the final work and make it ready to launch.','fa-rocket']
    ];
    processTimeline.innerHTML=fallback.map(([name,description,icon],index)=>'<div class="step"><span class="step-number">'+String(index+1).padStart(2,'0')+'</span><i class="fa-solid '+icon+'"></i><strong>'+name+'</strong><small>'+description+'</small></div>').join('');
  }
  fetch('admin/api-process.php').then(r=>{if(!r.ok) throw new Error('API unavailable'); return r.json();}).then(steps=>{
    if(!processTimeline) return;
    processTimeline.innerHTML='';
    if(!steps.length){ processTimeline.innerHTML='<div class="empty-state">Process details coming soon.</div>'; return; }
    steps.forEach(step=>{
      const item=document.createElement('div'); item.className='step';
      const number=document.createElement('span'); number.className='step-number'; number.textContent=String(step.step_index || 1).padStart(2,'0'); item.appendChild(number);
      const icon=document.createElement('i'); icon.className='fa-solid fa-sparkles'; item.appendChild(icon);
      const title=document.createElement('strong'); title.textContent=step.title||''; item.appendChild(title);
      if(step.description){const description=document.createElement('small'); description.textContent=step.description; item.appendChild(description);}
      processTimeline.appendChild(item);
    });
  }).catch(()=>{renderProcessFallback();});

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('.lightbox-img');
  const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  function openLightbox(src, caption){
    if(!lightbox || !lightboxImg || !lightboxCaption) return;
    lightboxImg.src = src; lightboxImg.alt = caption || '';
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('show'); lightbox.setAttribute('aria-hidden','false');
    lightboxClose?.focus();
    document.body.style.overflow='hidden';
  }
  function closeLightbox(){lightbox.classList.remove('show');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e)=>{if(e.target===lightbox) closeLightbox()});
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
    container.setAttribute('role','slider');
    container.setAttribute('tabindex','0');
    container.setAttribute('aria-label','Before and after image comparison');
    container.addEventListener('keydown', (e)=>{
      if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const current = parseFloat(handle.style.left) || 50;
      update(container.getBoundingClientRect().left + container.getBoundingClientRect().width * (current + (e.key === 'ArrowRight' ? 5 : -5)) / 100);
    });
    // set default to 50%
    setTimeout(()=>update(container.getBoundingClientRect().left + container.getBoundingClientRect().width/2),100);
  });

  // Validate before handing the form to FormSubmit for email delivery.
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  form?.addEventListener('submit', (e)=>{
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if(!name || !email || !message){
      e.preventDefault();
      feedback.textContent='Please fill required fields.';
      feedback.style.color='tomato';
      return;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      e.preventDefault();
      feedback.textContent='Please enter a valid email.';
      feedback.style.color='tomato';
    }
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
