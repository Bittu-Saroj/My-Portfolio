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
    const safeHttpUrl=value=>{
      if(typeof value!=='string' || !value.trim()) return null;
      try{const url=new URL(value,window.location.origin);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}
    };
    const setContactText=(selector,label,value)=>{
      const item=document.querySelector(selector); if(!item) return;
      const heading=document.createElement('strong'); heading.textContent=label+':';
      item.replaceChildren(heading,document.createTextNode(' '+String(value)));
    };
    const setContactLink=(selector,label,urlValue,labelValue)=>{
      const url=safeHttpUrl(urlValue); const item=document.querySelector(selector); if(!url || !item) return;
      const heading=document.createElement('strong'); heading.textContent=label+':';
      const link=document.createElement('a'); link.href=url; link.target='_blank'; link.rel='noopener'; link.textContent=labelValue||url;
      item.replaceChildren(heading,document.createTextNode(' '),link);
    };
    setText('.brand','site_name');
    if(settings.about_text){const about=document.querySelector('#about > .section-grid > div'); const p=about?.querySelectorAll('p'); if(p && p.length>1) p[1].textContent=settings.about_text;}
    setText('#design .section-head .muted','design_intro'); setText('#photography .section-head .muted','photo_intro');
    setText('#video .section-head .muted','video_intro'); setText('#projects .section-head .muted','projects_intro');
    setText('#contact h2','contact_title'); setText('#contact .contact-grid > div:first-child > .muted','contact_intro');
    const contactMap={email:['#contact a[href^="mailto:"]','mailto:'],phone:['#contact .contact-list li:nth-child(2)', ''],instagram_label:['#contact .contact-list li:nth-child(3)',''],facebook_label:['#contact .contact-list li:nth-child(4)','']};
    if(settings.email){const email=String(settings.email).trim();const a=document.querySelector(contactMap.email[0]); if(a && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){a.textContent=email;a.href=new URL('mailto:'+email).href;}}
    if(settings.phone) setContactText(contactMap.phone[0],'WhatsApp',settings.phone);
    if(settings.instagram_url) setContactLink('#contact .contact-list li:nth-child(3)','Instagram',settings.instagram_url,settings.instagram_label||settings.instagram_url);
    if(settings.facebook_url) setContactLink('#contact .contact-list li:nth-child(4)','Facebook',settings.facebook_url,settings.facebook_label||settings.facebook_url);
    const heroUrl=safeHttpUrl(settings.cover_image); const hero=heroUrl&&document.querySelector('.profile-photo'); if(hero) hero.src=heroUrl;
    const pair=document.querySelector('.before-after'); if(pair){if(settings.before_image) pair.dataset.before=settings.before_image;if(settings.after_image) pair.dataset.after=settings.after_image;}
    ['instagram','facebook','github','linkedin'].forEach(name=>{const url=safeHttpUrl(settings[name+'_url']);if(url) document.querySelectorAll('.socials a[aria-label="'+name[0].toUpperCase()+name.slice(1)+'"]').forEach(a=>a.href=url)});
  }).catch(()=>{});

  // Software & Technology tools managed from the admin panel.
  const fallbackTools = [
    {title:'Adobe Photoshop',description:'Photo editing & compositing',image:'assets/images/tools/photoshop.svg'},
    {title:'Adobe Lightroom',description:'Color grading',image:'assets/images/tools/lightroom.svg'},
    {title:'Adobe Premiere Pro',description:'Comfortable - short edits & reels',image:'assets/images/tools/premiere-pro.svg'},
    {title:'Adobe After Effects',description:'Basic animation & motion graphics',image:'assets/images/tools/after-effects.svg'},
    {title:'Canva',description:'Fast layouts & social posts',image:'assets/images/tools/premiere.jpg'},
    {title:'PHP / MySQL',description:'Working knowledge - web apps',image:'assets/images/tools/php-mysql.png'},
    {title:'HTML / CSS / JS',description:'Responsive frontends & backends',image:'assets/images/tools/web-stack.jpg'}
  ];
  const renderTools = tools => {
    const grid=document.querySelector('.skills-grid'); if(!grid) return;
    grid.innerHTML='';
    if(!Array.isArray(tools) || !tools.length) tools = fallbackTools;
    tools.forEach(tool=>{
      const item=document.createElement('div'); item.className='skill';
      if(tool.image){const img=document.createElement('img');img.className='skill-icon';img.src=tool.image;img.alt='';item.appendChild(img);}
      const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=tool.title||''; const desc=document.createElement('p'); desc.className='muted'; desc.textContent=tool.description||''; body.append(title,desc); item.appendChild(body); grid.appendChild(item);
    });
  };
  fetch('admin/api-tools.php').then(r=>r.ok?r.json():[]).then(renderTools).catch(()=>renderTools(fallbackTools));
  // Nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.mobile-nav-menu');
  const mobileBackdrop = document.querySelector('.mobile-nav-backdrop');
  const mobileTriggers = [...document.querySelectorAll('.mobile-nav-trigger')];
  const closeMobileNav = () => {
    navMenu?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded','false');
    navToggle?.setAttribute('aria-label','Open navigation');
    mobileBackdrop?.classList.remove('open');
    document.body.classList.remove('mobile-nav-open');
    closeMobileMenus();
  };
  const closeMobileMenus = () => mobileTriggers.forEach(trigger=>{
    trigger.setAttribute('aria-expanded','false');
    trigger.nextElementSibling?.classList.remove('open');
  });
  mobileTriggers.forEach((trigger, index)=>{
    const submenu = trigger.nextElementSibling;
    if(submenu){
      submenu.id = submenu.id || `mobile-submenu-${index + 1}`;
      trigger.setAttribute('aria-controls', submenu.id);
    }
    trigger.addEventListener('click', event=>{
      event.preventDefault();
      const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeMobileMenus();
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
    if(expanded) closeMobileMenus();
  });
  document.addEventListener('click', (event)=>{
    if(!event.target.closest('.mobile-nav-dropdown')) closeMobileMenus();
    if(navMenu?.classList.contains('open') && !navMenu.contains(event.target) && !navToggle.contains(event.target)){
      navMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded','false');
      navToggle.setAttribute('aria-label','Open navigation');
      mobileBackdrop?.classList.remove('open');
      document.body.classList.remove('mobile-nav-open');
    }
  });
  document.addEventListener('keydown', event=>{
    if(event.key === 'Escape'){
      const mobileWasOpen = navMenu?.classList.contains('open');
      closeMobileNav();
      if(mobileWasOpen) navToggle?.focus();
    }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', event=>{
    if(event.matches) closeMobileNav();
  });
  mobileBackdrop?.addEventListener('click', ()=>{
    navMenu?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded','false');
    navToggle?.setAttribute('aria-label','Open navigation');
    mobileBackdrop.classList.remove('open');
    document.body.classList.remove('mobile-nav-open');
    closeMobileMenus();
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
          if(navMenu?.classList.contains('open')){navMenu.classList.remove('open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open navigation');mobileBackdrop?.classList.remove('open');document.body.classList.remove('mobile-nav-open');closeMobileMenus()}
        }
      }
    })
  });

  const navList = document.querySelector('.nav-list');
  const navItems = [...document.querySelectorAll('.nav-list > li > .nav-link')];
  const sectionGroups = {
    home: 'Home', about: 'About', education: 'About',
    design: 'Portfolio', photography: 'Portfolio', editing: 'Portfolio',
    video: 'Portfolio', projects: 'Portfolio', services: 'Services',
    process: 'Services', contact: 'Contact'
  };
  const trackedSections = [...document.querySelectorAll('main section[id]')]
    .filter(section=>sectionGroups[section.id]);
  let selectionFrame = 0;
  // Skills is inside About, so retain the clicked item during its smooth scroll.
  let selectedByNavigation = null;
  const updateNavSelection = () => {
    selectionFrame = 0;
    const marker = window.innerHeight * .35;
    let current = trackedSections[0];
    trackedSections.forEach(section=>{
      if(section.getBoundingClientRect().top <= marker) current = section;
    });
    const selected = selectedByNavigation || navItems.find(item=>item.textContent.trim().startsWith(sectionGroups[current?.id] || 'Home'));
    if(!selected || !navList) return;
    navItems.forEach(item=>{
      const isSelected = item === selected;
      item.classList.toggle('active', isSelected);
      if(isSelected) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
    if(navList.offsetWidth){
      const listRect = navList.getBoundingClientRect();
      const itemRect = selected.getBoundingClientRect();
      navList.style.setProperty('--selected-left', `${itemRect.left - listRect.left}px`);
      navList.style.setProperty('--selected-width', `${itemRect.width}px`);
      navList.classList.add('has-indicator');
    }
  };
  const scheduleNavSelection = () => {
    if(!selectionFrame) selectionFrame = requestAnimationFrame(updateNavSelection);
  };
  navItems.forEach(item=>item.addEventListener('click', ()=>{
    selectedByNavigation = item;
    scheduleNavSelection();
  }));
  const resumeScrollSelection = () => { selectedByNavigation = null; scheduleNavSelection(); };
  window.addEventListener('wheel', resumeScrollSelection, {passive:true});
  window.addEventListener('touchstart', resumeScrollSelection, {passive:true});
  window.addEventListener('keydown', event=>{
    if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) resumeScrollSelection();
  });
  window.addEventListener('scroll', scheduleNavSelection, {passive:true});
  window.addEventListener('resize', scheduleNavSelection);
  scheduleNavSelection();

  // Reveal on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('visible')}
    })
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  // Design projects: fallback local data, then attempt to load from admin API
  let designProjects = [
    {title:'Liceria Coffee Shop — Fresh On The Menu',category:'Social Media Design',image:'assets/images/design/liceria-coffee-shop-social-01.png',tools:['Canva'],description:'Creative promotional social media poster for Liceria Coffee Shop featuring a cold cappuccino coffee campaign, combining product-focused visual composition, coffee-themed elements, and bold promotional typography.'},
    {title:'Fashion Editorial Poster',category:'poster',image:'assets/images/design/BITTU1photoshop-face-denoise-upscale-3.5x.jpg',tools:['Photoshop'],description:'Creative fashion editorial poster created and enhanced in Adobe Photoshop, focusing on portrait retouching, face enhancement, denoising, and image upscaling.'},
    {title:'Branding Placeholder',category:'branding',image:'assets/images/design/pixels-photography.png',tools:['Illustrator']},
    {title:'Ad Placeholder',category:'ad',image:'assets/images/design/ad-01.svg',tools:['Photoshop']}
  ];

  const designGrid = document.getElementById('design-grid');
  const designCount = document.getElementById('design-count');
  const designFilters = [...document.querySelectorAll('#design .filter-btn')];
  const designPreview = document.getElementById('design-preview');
  let activeDesignFilter = 'all', visibleDesignProjects = [], previewIndex = 0, previewOpener = null, previousBodyOverflow = '';
  const categoryNames = {social:'Social Media', poster:'Posters', branding:'Branding', ad:'Advertisements'};
  function designCategory(value){
    const category=String(value || '').trim().toLowerCase();
    if(category.includes('social')) return 'social';
    if(category.includes('poster')) return 'poster';
    if(category.includes('brand')) return 'branding';
    if(category === 'ad' || category.includes('advert')) return 'ad';
    return category;
  }
  function designImage(project){return project.image || project.filename || 'assets/images/design/social-01.svg';}
  function updateDesignPreview(){
    const project=visibleDesignProjects[previewIndex];
    if(!project || !designPreview) return;
    const img=designPreview.querySelector('.preview-image');
    img.src=designImage(project); img.alt=project.title || 'Design project';
    designPreview.querySelector('#design-preview-title').textContent=project.title || 'Untitled project';
    designPreview.querySelector('.preview-category').textContent=categoryNames[designCategory(project.category)] || project.category || 'Design';
    designPreview.querySelector('#design-preview-description').textContent=project.description || '';
    const tools=Array.isArray(project.tools) ? project.tools : (project.tools ? String(project.tools).split(',') : []);
    designPreview.querySelector('.preview-tools').textContent=tools.length ? `Tools: ${tools.map(tool=>String(tool).trim()).filter(Boolean).join(', ')}` : '';
    designPreview.querySelector('.preview-count').textContent=`${previewIndex + 1} / ${visibleDesignProjects.length}`;
    designPreview.querySelector('.preview-prev').disabled=visibleDesignProjects.length < 2;
    designPreview.querySelector('.preview-next').disabled=visibleDesignProjects.length < 2;
  }
  function openDesignPreview(index, opener){
    if(!designPreview || !visibleDesignProjects[index]) return;
    previewIndex=index; previewOpener=opener; previousBodyOverflow=document.body.style.overflow;
    updateDesignPreview(); designPreview.showModal(); document.body.style.overflow='hidden';
    designPreview.querySelector('.preview-close').focus();
  }
  function closeDesignPreview(){
    if(!designPreview?.open || designPreview.classList.contains('is-closing')) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ designPreview.close(); return; }
    designPreview.classList.add('is-closing');
    setTimeout(()=>{ if(designPreview.open) designPreview.close(); }, 180);
  }
  function moveDesignPreview(direction){
    if(visibleDesignProjects.length < 2) return;
    previewIndex=(previewIndex + direction + visibleDesignProjects.length) % visibleDesignProjects.length;
    updateDesignPreview();
  }
  designPreview?.querySelector('.preview-close')?.addEventListener('click', closeDesignPreview);
  designPreview?.querySelector('.preview-prev')?.addEventListener('click', ()=>moveDesignPreview(-1));
  designPreview?.querySelector('.preview-next')?.addEventListener('click', ()=>moveDesignPreview(1));
  designPreview?.addEventListener('cancel', event=>{event.preventDefault();closeDesignPreview();});
  designPreview?.addEventListener('click', event=>{if(event.target===designPreview) closeDesignPreview();});
  designPreview?.addEventListener('keydown', event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();moveDesignPreview(-1);}
    if(event.key==='ArrowRight'){event.preventDefault();moveDesignPreview(1);}
  });
  designPreview?.addEventListener('close', ()=>{
    designPreview.classList.remove('is-closing'); document.body.style.overflow=previousBodyOverflow;
    if(previewOpener?.isConnected) previewOpener.focus();
  });
  if(designGrid) designGrid.innerHTML = '<div class="loading-state">Loading selected work…</div>';
  function applyDesignAssetOverrides(projects){
    return projects.map(project=> project.title === 'Branding Placeholder'
      ? {...project, image:'assets/images/design/pixels-photography.png'}
      : project
    );
  }
  function renderDesign(){
    if(!designGrid) return;
    const projects=activeDesignFilter === 'all' ? designProjects : designProjects.filter(p=>designCategory(p.category)===activeDesignFilter);
    visibleDesignProjects=projects;
    if(designCount) designCount.textContent=`${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`;
    designGrid.innerHTML = '';
    if(!projects.length){ designGrid.innerHTML='<div class="empty-state">No projects in this category yet.</div>'; return; }
    projects.forEach((p,index)=>{
      const kind=designCategory(p.category);
      const card = document.createElement('article'); card.className = 'design-card category-' + (['social','poster','branding','ad'].includes(kind) ? kind : 'other');
      card.style.setProperty('--card-index', String(Math.min(index, 8)));
      const button=document.createElement('button'); button.type='button'; button.className='design-tile';
      button.setAttribute('aria-label', `View ${p.title || 'design project'}`);
      const art=document.createElement('span'); art.className='design-art';
      const imgEl = document.createElement('img');
      imgEl.src = designImage(p); imgEl.alt = ''; imgEl.loading = 'lazy'; imgEl.decoding = 'async';
      art.appendChild(imgEl);
      const overlay=document.createElement('span'); overlay.className='design-overlay'; overlay.setAttribute('aria-hidden','true');
      const overlayText=document.createElement('span'); overlayText.className='design-overlay-text';
      const overlayCategory=document.createElement('small'); overlayCategory.textContent=categoryNames[kind] || p.category || 'Design';
      const overlayTitle=document.createElement('strong'); overlayTitle.textContent=p.title || 'Untitled project';
      overlayText.append(overlayCategory,overlayTitle);
      const arrow=document.createElement('span'); arrow.className='design-arrow'; arrow.textContent='↗'; overlay.append(overlayText,arrow); art.appendChild(overlay);
      const body=document.createElement('span'); body.className='design-card-info';
      const category=document.createElement('span'); category.className='design-card-category'; category.textContent=categoryNames[kind] || p.category || 'Design';
      const title=document.createElement('strong'); title.className='design-card-title'; title.textContent=p.title || 'Untitled project';
      body.append(category,title); button.append(art,body); card.appendChild(button);
      button.addEventListener('click', ()=>openDesignPreview(index,button));
      designGrid.appendChild(card);
    })
  }

  // Try to fetch live projects from admin API, fallback to local designProjects
  fetch('admin/api-design.php').then(r=>{ if(!r.ok) throw new Error('Network response not ok'); return r.json(); }).then(data=>{
    if(Array.isArray(data)) designProjects = applyDesignAssetOverrides(data);
    else designProjects = [];
    renderDesign();
  }).catch(()=>{
    renderDesign();
  });

  // Filter buttons (use current designProjects variable)
  designFilters.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      designFilters.forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      activeDesignFilter=btn.dataset.filter;
      renderDesign();
    })
  });

  // Photography grid - try to fetch from admin API, fallback to local placeholders
  const photos = [
    'assets/images/photography/portrait-01.jpg','assets/images/photography/landscape-01.svg','assets/images/photography/event-01.svg','assets/images/photography/product-01.svg'
  ];
  const photoGrid = document.getElementById('photo-grid');
  if(photoGrid) photoGrid.innerHTML = '<div class="loading-state">Loading photographs…</div>';
  function renderPhotos(list){
    if(!photoGrid) return;
    photoGrid.innerHTML = '';
    if(!list.length){ photoGrid.innerHTML='<div class="empty-state">Photography will be published here soon.</div>'; return; }
    list.forEach((p, index)=>{
      const img = document.createElement('img');
      img.src = p.image || p;
      img.alt = p.title || 'Photography placeholder';
      img.loading = 'lazy';
      img.decoding = 'async';
      if(index === 0) img.fetchPriority = 'high';
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
    videoGrid.innerHTML='<article class="video-feature-card"><img src="assets/images/tools/premiere-pro.svg" alt="Adobe Premiere Pro" class="video-pr-icon"><div><span class="video-kicker">Featured Project</span><h3>Video Coming Soon</h3><p>Project Placeholder</p><small>Premiere Pro / Reels</small></div><span class="video-arrow" aria-hidden="true">→</span></article>';
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
  document.addEventListener('keydown', (e)=>{if(e.key==='Escape' && lightbox?.classList.contains('show')) closeLightbox()});

  // Before/After slider simple implementation
  document.querySelectorAll('.before-after').forEach(container=>{
    const before = container.dataset.before; const after = container.dataset.after;
    const imgBefore = document.createElement('img'); imgBefore.src = before; imgBefore.className='before';
    const imgAfter = document.createElement('img'); imgAfter.src = after; imgAfter.className='after';
    container.appendChild(imgBefore); container.appendChild(imgAfter);
    const rawLabel=document.createElement('span'); rawLabel.className='comparison-label comparison-label--raw'; rawLabel.textContent='RAW';
    const editedLabel=document.createElement('span'); editedLabel.className='comparison-label comparison-label--edited'; editedLabel.textContent='EDITED';
    container.append(rawLabel,editedLabel);
    const handle = document.createElement('div'); handle.className='handle'; container.appendChild(handle);
    let dragging=false; const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
    function update(x){
      const rect = container.getBoundingClientRect();
      const pct = clamp((x-rect.left)/rect.width,0,1);
      imgAfter.style.clipPath = `inset(0 0 0 ${pct*100}%)`;
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
