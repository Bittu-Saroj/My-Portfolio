'use strict';
(() => {
  const OWNER = 'Bittu-Saroj', REPO = 'My-Portfolio', BRANCH = 'main', MANIFEST = 'content/portfolio.json';
  const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/`;
  const defaultTools = [
    ['Adobe Photoshop','Photo editing & compositing','photoshop.svg'], ['Adobe Lightroom','Color grading','lightroom.svg'],
    ['Adobe Premiere Pro','Comfortable - short edits & reels','premiere-pro.svg'], ['Adobe After Effects','Basic animation & motion graphics','after-effects.svg'],
    ['Canva','Fast layouts & social posts','premiere.jpg'], ['PHP / MySQL','Working knowledge - web apps','php-mysql.png'],
    ['HTML / CSS / JS','Responsive frontends & backends','web-stack.jpg']
  ].map(([title,description,image],index)=>({id:`existing-tool-${index}`,title,description,image:`assets/images/tools/${image}`}));
  const label = () => kind==='photos' ? 'photo' : kind==='videos' ? 'video' : 'tool';
  const $ = id => document.getElementById(id);
  let token = '', manifest = null, manifestSha = '', kind = 'photos', editingId = null, busy = false;

  function notice(message, error = false){
    const box=$('message'); box.hidden=!message; box.textContent=message; box.className=error ? 'message error' : 'message';
  }
  function setBusy(value){
    busy=value;
    for(const id of ['save','new-item','cancel','sign-out','photos-tab','videos-tab','tools-tab']) $(id).disabled=value;
  }
  async function github(url, options={}){
    let response;
    try {
      response=await fetch(url,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28',...(options.headers || {})}});
    } catch (_) { throw new Error('Could not reach GitHub. Check your connection and try again.'); }
    if(!response.ok){
      if(response.status===401) throw new Error('GitHub rejected the token. Check that it is valid and has not expired.');
      if(response.status===403) throw new Error('GitHub denied access. Check the token permissions and repository access.');
      if(response.status===409 || response.status===422) throw new Error('The repository changed or GitHub could not save the file. Reload the collection and try again.');
      if(response.status===404) throw new Error('GitHub could not find the portfolio or content file. Check that the token can access My-Portfolio.');
      throw new Error(`GitHub could not complete the request (HTTP ${response.status}).`);
    }
    return response.json();
  }
  const pathUrl = path => API + path.split('/').map(encodeURIComponent).join('/');
  const toBase64 = bytes => {
    let binary='';
    for(let i=0;i<bytes.length;i+=0x8000) binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
    return btoa(binary);
  };
  const encodeText = text => toBase64(new TextEncoder().encode(text));
  function decodeText(value){
    const binary=atob(value.replace(/\s/g,''));
    return new TextDecoder().decode(Uint8Array.from(binary,char=>char.charCodeAt(0)));
  }
  async function readManifest(){
    const file=await github(pathUrl(MANIFEST)+`?ref=${encodeURIComponent(BRANCH)}`);
    let data;
    try { data=JSON.parse(decodeText(file.content)); } catch (_) { throw new Error('The portfolio content file could not be read.'); }
    if(data.version!==1 || !Array.isArray(data.photos) || !Array.isArray(data.videos) || !file.sha) throw new Error('The portfolio content file has an unsupported format.');
    if(!Array.isArray(data.tools)) data.tools=defaultTools.map(tool=>({...tool}));
    return {data,sha:file.sha};
  }
  async function saveManifest(data, sha, message){
    const result=await github(pathUrl(MANIFEST),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,branch:BRANCH,sha,content:encodeText(JSON.stringify(data,null,2)+'\n')})});
    manifest=data; manifestSha=result.content.sha;
  }
  function assetPath(file, type){
    const ext=(file.name.split('.').pop() || '').toLowerCase();
    const image=type!=='videos';
    const types=image ? {jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'} : {mp4:'video/mp4',webm:'video/webm'};
    const limit=(image ? 8 : 20)*1024*1024;
    if(!types[ext] || (file.type && file.type!==types[ext])) throw new Error(image ? 'Choose a JPG, PNG, or WebP image.' : 'Choose an MP4 or WebM video.');
    if(!file.size || file.size>limit) throw new Error(image ? 'Images must be between 1 byte and 8 MB.' : 'Videos must be between 1 byte and 20 MB. For larger videos, use a link.');
    return `assets/${image ? 'images' : 'videos'}/studio/${crypto.randomUUID()}.${ext}`;
  }
  async function uploadFile(file, type){
    const path=assetPath(file,type);
    const bytes=new Uint8Array(await file.arrayBuffer());
    await github(pathUrl(path),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:`Add portfolio ${type==='photos' ? 'photo' : 'video'}`,branch:BRANCH,content:toBase64(bytes)})});
    return path;
  }
  function validVideoUrl(value){
    if(!value) return '';
    let url; try {url=new URL(value);} catch (_) {throw new Error('Enter a valid HTTPS video link.');}
    if(url.protocol!=='https:' || url.username || url.password) throw new Error('Enter a valid HTTPS video link.');
    return url.href;
  }
  function showEditor(item=null){
    editingId=item?.id || null; $('editor').hidden=false; $('editor-form').reset();
    $('editor-title').textContent=`${item ? 'Edit' : 'Add'} ${label()}`;
    $('photo-fields').hidden=kind!=='photos'; $('video-fields').hidden=kind!=='videos';
    $('tool-fields').hidden=kind!=='tools'; $('tool-description').value=kind==='tools' ? item?.description || '' : '';
    $('clear-video-label').hidden=kind!=='videos' || !item?.video; $('clear-video').checked=false;
    $('title').value=item?.title || ''; $('alt').value=item?.alt || ''; $('description').value=item?.description || ''; $('video-url').value=item?.url || '';
    const categories=[...$('category').options].map(option=>option.value);
    $('category').value=categories.includes(item?.category) ? item.category : 'Photography';
    $('file-label').textContent=kind==='photos' ? 'Photo file' : kind==='tools' ? 'Tool icon (optional)' : 'Video file (optional if using a link)';
    $('media-file').accept=kind!=='videos' ? '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp' : '.mp4,.webm,video/mp4,video/webm';
    $('file-hint').textContent=kind!=='videos' ? 'JPG, PNG, or WebP, up to 8 MB. '+(item ? 'Leave empty to keep the current image.' : kind==='tools' ? 'Optional for tools.' : 'A photo file is required.') : 'MP4 or WebM, up to 20 MB. For larger videos, use an HTTPS link.';
    $('editor').scrollIntoView({behavior:'smooth',block:'nearest'}); $('title').focus();
  }
  function render(){
    $('photos-tab').setAttribute('aria-selected',String(kind==='photos'));
    $('videos-tab').setAttribute('aria-selected',String(kind==='videos'));
    $('tools-tab').setAttribute('aria-selected',String(kind==='tools'));
    const list=$('list'); list.replaceChildren(); const items=manifest[kind];
    $('item-count').textContent=`${items.length} ${items.length===1 ? 'item' : 'items'}`;
    if(!items.length){const empty=document.createElement('div');empty.className='empty';empty.textContent=`No ${kind} yet. Select Add new to get started.`;list.appendChild(empty);return;}
    items.forEach(item=>{
      const row=document.createElement('article');row.className='item';
      const thumb=document.createElement('div');thumb.className='item-thumb';
      if(kind!=='videos' && item.image && !/^(?:https?:|\/\/)/i.test(item.image)){const img=document.createElement('img');img.src='../'+item.image;img.alt='';img.loading='lazy';thumb.appendChild(img);}else thumb.textContent=kind==='tools' ? '◆' : '▶';
      const copy=document.createElement('div');copy.className='item-copy';const title=document.createElement('strong');title.textContent=item.title || 'Untitled';const meta=document.createElement('small');meta.textContent=kind==='photos' ? (item.category || 'Photography') : kind==='tools' ? (item.description || 'Software or technology') : (item.video ? 'Uploaded video' : 'Video link');copy.append(title,meta);
      const actions=document.createElement('div');actions.className='item-actions';const edit=document.createElement('button');edit.type='button';edit.className='button subtle';edit.textContent='Edit';edit.setAttribute('aria-label',`Edit ${item.title || 'item'}`);edit.addEventListener('click',()=>{if(!busy)showEditor(item);});
      const remove=document.createElement('button');remove.type='button';remove.className='button remove';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${item.title || 'item'}`);remove.addEventListener('click',()=>removeItem(item));actions.append(edit,remove);row.append(thumb,copy,actions);list.appendChild(row);
    });
  }
  async function removeItem(item){
    if(busy || !window.confirm(`Remove “${item.title || 'this item'}” from the portfolio? The uploaded file will remain in GitHub.`)) return;
    setBusy(true);notice('Removing item and publishing…');
    try{
      const latest=await readManifest();if(latest.sha!==manifestSha) throw new Error('The collection changed elsewhere. Reload this page before trying again.');
      const next={...latest.data,[kind]:latest.data[kind].filter(entry=>entry.id!==item.id)};
      await saveManifest(next,latest.sha,`Remove portfolio ${label()}`);$('editor').hidden=true;render();notice('Removed. GitHub Pages will update the website in a few minutes.');
    }catch(error){notice(error.message,true);}finally{setBusy(false);}
  }
  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return; token=$('token').value.trim();$('token').value='';
    if(!token){notice('Enter your GitHub access token.',true);return;}
    setBusy(true);notice('Connecting to GitHub…');
    try{
      const user=await github('https://api.github.com/user');
      if(String(user.login || '').toLowerCase()!==OWNER.toLowerCase()) throw new Error('This studio is restricted to the Bittu-Saroj GitHub account.');
      const repo=await github(`https://api.github.com/repos/${OWNER}/${REPO}`);
      if(!repo.permissions?.push) throw new Error('This token needs write access to the My-Portfolio repository.');
      const current=await readManifest();manifest=current.data;manifestSha=current.sha;
      $('login').hidden=true;$('workspace').hidden=false;$('sign-out').hidden=false;$('account').textContent=`Connected as ${user.login}`;render();notice('Connected. Choose Photos, Videos, or Software & Technology.');
    }catch(error){token='';notice(error.message,true);}finally{setBusy(false);}
  });
  $('sign-out').addEventListener('click',()=>{if(busy)return;token='';manifest=null;manifestSha='';$('editor-form').reset();$('workspace').hidden=true;$('editor').hidden=true;$('sign-out').hidden=true;$('login').hidden=false;notice('Signed out. The token has been cleared from this page.');});
  for(const type of ['photos','videos','tools']) $(`${type}-tab`).addEventListener('click',()=>{if(busy)return;kind=type;$('editor').hidden=true;render();});
  $('new-item').addEventListener('click',()=>{if(!busy)showEditor();});
  $('cancel').addEventListener('click',()=>{$('editor').hidden=true;});
  $('editor-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    const title=$('title').value.trim(),file=$('media-file').files[0];
    if(!title){notice('Enter a title.',true);return;}
    let uploaded=false;setBusy(true);notice('Checking the latest collection…');
    try{
      const latest=await readManifest();if(latest.sha!==manifestSha) throw new Error('The collection changed elsewhere. Reload this page before saving.');
      const old=editingId ? latest.data[kind].find(entry=>entry.id===editingId) : null;
      if(editingId && !old) throw new Error('This item no longer exists. Reload the page.');
      const item={...(old || {}),id:editingId || crypto.randomUUID(),title};
      if(kind==='photos'){
        if(!file && !old?.image) throw new Error('Choose a photo file.');
        item.category=$('category').value;item.alt=$('alt').value.trim() || title;
      } else if(kind==='tools') {
        item.description=$('tool-description').value.trim();
      } else {
        item.description=$('description').value.trim();item.url=validVideoUrl($('video-url').value.trim());
        if($('clear-video').checked) delete item.video;
        if(!file && !item.video && !item.url) throw new Error('Choose a video file or enter a video link.');
      }
      if(file){notice('Uploading file to GitHub…');const path=await uploadFile(file,kind);uploaded=true;if(kind!=='videos')item.image=path;else item.video=path;}
      const nextItems=editingId ? latest.data[kind].map(entry=>entry.id===editingId ? item : entry) : [item,...latest.data[kind]];
      notice('Saving the collection…');await saveManifest({...latest.data,[kind]:nextItems},latest.sha,`${editingId ? 'Update' : 'Add'} portfolio ${label()}`);
      $('editor').hidden=true;render();notice('Saved. GitHub Pages will update the website in a few minutes.');
    }catch(error){notice(error.message+(uploaded ? ' The upload is in the repository, but it was not added to the portfolio. Reload before trying again.' : ''),true);}finally{setBusy(false);}
  });
})();
