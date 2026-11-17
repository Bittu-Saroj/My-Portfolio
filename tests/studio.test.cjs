const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor(){this.children=[];this.events={};this.attributes={};this.value='';this.hidden=false;this.files=[];this.options=[];}
  addEventListener(name,handler){this.events[name]=handler;}
  setAttribute(name,value){this.attributes[name]=value;}
  append(...items){this.children.push(...items);}
  appendChild(item){this.children.push(item);}
  replaceChildren(...items){this.children=items;}
  reset(){}
  focus(){}
  scrollIntoView(){}
  async trigger(name){if(this.events[name]) await this.events[name]({preventDefault(){}});}
}

async function main(){
  const ids=['message','save','new-item','cancel','sign-out','photos-tab','videos-tab','tools-tab','login-form','token','login','workspace','account','list','item-count','editor','editor-form','editor-title','photo-fields','video-fields','tool-fields','tool-description','title','alt','description','video-url','clear-video-label','clear-video','category','file-label','media-file','file-hint'];
  const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
  nodes.category.options=['Portrait','Landscape','Events','Product','Photography'].map(value=>({value}));
  const document={getElementById:id=>nodes[id],createElement:()=>new Element()};
  let account='someone-else', sha='sha-1', uuid=0;
  let data={version:1,photos:[],videos:[]};
  const uploads=[];
  const requests=[];
  const response=(status,value)=>({ok:status>=200&&status<300,status,json:async()=>value});
  const fetch=async(url,options={})=>{
    assert.ok(url.startsWith('https://api.github.com/'),'token must only go to GitHub');
    assert.match(options.headers.Authorization,/^Bearer /);
    requests.push({url,method:options.method||'GET'});
    if(url==='https://api.github.com/user') return response(200,{login:account});
    if(url==='https://api.github.com/repos/Bittu-Saroj/My-Portfolio') return response(200,{permissions:{push:true}});
    if(url.includes('/contents/content/portfolio.json')){
      if(options.method==='PUT'){
        const body=JSON.parse(options.body);
        if(body.sha!==sha) return response(409,{});
        data=JSON.parse(Buffer.from(body.content,'base64').toString('utf8'));sha='sha-'+(Number(sha.split('-')[1])+1);
        return response(200,{content:{sha}});
      }
      return response(200,{sha,content:Buffer.from(JSON.stringify(data)).toString('base64')});
    }
    if(options.method==='PUT' && url.includes('/contents/assets/')){uploads.push({url,body:JSON.parse(options.body)});return response(201,{content:{sha:'media'}});}
    throw Error('Unexpected GitHub request '+url);
  };
  const context={document,window:{confirm:()=>true},fetch,crypto:{randomUUID:()=>`test-${++uuid}`},TextEncoder,TextDecoder,Uint8Array,URL,btoa,atob,console};
  vm.runInNewContext(fs.readFileSync('studio/studio.js','utf8'),context);

  nodes.token.value='fake-token';await nodes['login-form'].trigger('submit');
  assert.match(nodes.message.textContent,/restricted/i);assert.equal(nodes.token.value,'');
  account='Bittu-Saroj';nodes.token.value='fake-token';await nodes['login-form'].trigger('submit');
  assert.equal(nodes.workspace.hidden,false);assert.equal(nodes.login.hidden,true);assert.equal(nodes.token.value,'');
  await nodes['new-item'].trigger('click');nodes.title.value='New portrait';nodes.alt.value='A portrait';nodes.category.value='Portrait';
  nodes['media-file'].files=[{name:'bad.svg',type:'image/svg+xml',size:10,arrayBuffer:async()=>new ArrayBuffer(10)}];
  await nodes['editor-form'].trigger('submit');assert.match(nodes.message.textContent,/JPG, PNG, or WebP/);assert.equal(uploads.length,0);
  nodes['media-file'].files=[{name:'portrait.jpg',type:'image/jpeg',size:3,arrayBuffer:async()=>Uint8Array.from([1,2,3]).buffer}];
  await nodes['editor-form'].trigger('submit');assert.equal(uploads.length,1);assert.equal(data.photos.length,1);assert.equal(data.photos[0].title,'New portrait');assert.match(data.photos[0].image,/^assets\/images\/studio\//);
  const uploadedPath=data.photos[0].image;
  await nodes.list.children[0].children[2].children[0].trigger('click');nodes.title.value='Updated portrait';nodes['media-file'].files=[];
  await nodes['editor-form'].trigger('submit');assert.equal(data.photos[0].title,'Updated portrait');assert.equal(data.photos[0].image,uploadedPath);assert.equal(uploads.length,1);
  await nodes.list.children[0].children[2].children[1].trigger('click');assert.equal(data.photos.length,0);assert.ok(!requests.some(request=>request.method==='DELETE'));
  await nodes['videos-tab'].trigger('click');await nodes['new-item'].trigger('click');nodes.title.value='Video';nodes['media-file'].files=[];nodes['video-url'].value='javascript:alert(1)';
  await nodes['editor-form'].trigger('submit');assert.match(nodes.message.textContent,/HTTPS/);assert.equal(data.videos.length,0);
  nodes['video-url'].value='https://example.com/video';await nodes['editor-form'].trigger('submit');assert.equal(data.videos.length,1);assert.equal(data.videos[0].url,'https://example.com/video');
  await nodes['tools-tab'].trigger('click');assert.equal(nodes.list.children.length,7);
  await nodes['new-item'].trigger('click');nodes.title.value='New tool';nodes['tool-description'].value='Creative work';nodes['media-file'].files=[];await nodes['editor-form'].trigger('submit');assert.equal(data.tools[0].title,'New tool');assert.equal(data.tools[0].description,'Creative work');assert.equal(data.videos.length,1);
  await nodes.list.children[0].children[2].children[0].trigger('click');nodes.title.value='Updated tool';await nodes['editor-form'].trigger('submit');assert.equal(data.tools[0].title,'Updated tool');
  await nodes.list.children[0].children[2].children[1].trigger('click');assert.equal(data.tools.length,7);
  await nodes['videos-tab'].trigger('click');
  sha='sha-99';await nodes['new-item'].trigger('click');nodes.title.value='Conflicting edit';nodes['video-url'].value='https://example.com/other';await nodes['editor-form'].trigger('submit');assert.match(nodes.message.textContent,/changed elsewhere/i);assert.equal(data.videos.length,1);
  await nodes['sign-out'].trigger('click');assert.equal(nodes.workspace.hidden,true);assert.equal(nodes.login.hidden,false);
  assert.ok(requests.every(request=>request.url.startsWith('https://api.github.com/')));
  console.log('Studio account restriction, add/edit/remove, upload, video link, conflict and sign-out checks passed');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
