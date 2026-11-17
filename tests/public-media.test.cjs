const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

class Element{
  constructor(){this.children=[];this.events={};this.style={setProperty(){}};this.attributes={};}
  set innerHTML(value){this.html=value;this.children=[];}
  setAttribute(key,value){this.attributes[key]=value;}
  addEventListener(name,handler){this.events[name]=handler;}
  appendChild(item){this.children.push(item);}
  append(...items){this.children.push(...items);}
}
async function main(){
  const grid=new Element(),photoGrid=new Element(),videoGrid=new Element(),designCount=new Element(),photoCount=new Element();
  const document={getElementById:id=>({'design-grid':grid,'design-count':designCount,'design-preview':null,'photo-grid':photoGrid,'photo-count':photoCount,'video-grid':videoGrid}[id]||null),querySelectorAll:()=>[],createElement:()=>new Element()};
  const data={photos:[{id:'p1',title:'Uploaded portrait',image:'assets/images/studio/photo.jpg',alt:'A portrait',category:'Portrait'}],videos:[{id:'v1',title:'Film',video:'assets/videos/studio/film.mp4',thumb:'assets/images/studio/thumb.jpg',url:'https://example.com/watch'},{id:'v2',title:'Bad link',url:'javascript:alert(1)'}]};
  const fetch=async url=>url.startsWith('content/') ? {ok:true,json:async()=>data} : {ok:false,json:async()=>({})};
  const source=fs.readFileSync('js/script.js','utf8');
  const start=source.indexOf('  let designProjects = ['),end=source.indexOf('  // Videos and process steps',start);
  const videoStart=source.indexOf('  const videoGrid =',end),videoEnd=source.indexOf('  const processTimeline =',videoStart);
  const urlStart=source.indexOf('  const safeHttpUrl='),urlEnd=source.indexOf("  fetch('admin/api-settings.php')",urlStart);
  if([start,end,videoStart,videoEnd,urlStart,urlEnd].some(i=>i<0)) throw Error('Expected public media code not found');
  const window={location:{origin:'https://example.com'},matchMedia:()=>({matches:true})};
  vm.runInNewContext(source.slice(urlStart,urlEnd)+source.slice(start,end)+source.slice(videoStart,videoEnd),{document,fetch,window,URL,setTimeout,console});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(photoCount.textContent,'1 item');assert.equal(photoGrid.children.length,1);
  assert.equal(videoGrid.children.length,2);
  const first=videoGrid.children[0];assert.equal(first.children[0].children[0].src,'assets/videos/studio/film.mp4');assert.equal(first.children[0].children[0].poster,'assets/images/studio/thumb.jpg');
  assert.equal(first.children[3].href,'https://example.com/watch');
  assert.equal(videoGrid.children[1].children.length,3,'unsafe link must not be rendered');
  console.log('Static photo/video fallback, uploaded video and URL validation checks passed');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
