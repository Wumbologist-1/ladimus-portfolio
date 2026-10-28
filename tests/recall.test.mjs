import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {recallRelease,recallDownload,recallFileSize,recallReleasePresentation} from '../src/features/recall/release.ts';

const asset='https://downloads.example.test/releases/'+recallRelease.filename;
function verified(overrides={}){
 const release={...recallRelease,downloadUrl:asset,...overrides};
 return {...release,assetVerification:{url:release.downloadUrl,filename:release.filename,bytes:release.bytes,sha256:release.sha256,version:release.version,build:release.build,access:'restricted',checkedAt:'2026-10-28T12:00:00Z'}};
}
test('the current verified local identity does not accidentally publish its QA package',()=>{
 assert.equal(recallRelease.version,'0.5.0-qa');assert.equal(recallRelease.build,5);assert.equal(recallRelease.bytes,564631164);
 assert.equal(recallRelease.sha256,'cda186cef81034e2d187dfffec82b507ffe2689aa740aa80a78da3253024be2b');
 assert.deepEqual(recallRelease.architectures,['arm64-v8a','x86_64']);assert.equal(recallRelease.minAndroid,'7.0');
 assert.equal(recallRelease.downloadUrl,null);assert.equal(recallRelease.publicDownloadApproved,false);assert.equal(recallRelease.assetVerification,null);
 assert.equal(recallDownload(recallRelease).href,null);assert.match(recallReleasePresentation(recallRelease).notice,/disposable test information/);
 assert.equal(recallFileSize(recallRelease.bytes),'564.6 MB (538.5 MiB)');
});
test('internal QA requires identity-bound restricted distribution even if a public URL is supplied',()=>{
 assert.equal(recallDownload(verified()).href,asset);
 const r=verified();assert.equal(recallDownload({...r,assetVerification:{...r.assetVerification,access:'public'}}).href,null);
 assert.equal(recallDownload({...r,assetVerification:null}).href,null);
 assert.match(recallDownload(r).reason,/approved tester account/);
});
test('public beta requires both explicit founder and release-gate approvals, plus verified public access',()=>{
 const r=verified({channel:'public-beta'});r.assetVerification.access='public';
 for(const [publicDownloadApproved,releaseGatesApproved] of [[false,false],[false,true],[true,false]])assert.equal(recallDownload({...r,publicDownloadApproved,releaseGatesApproved}).href,null);
 const approved={...r,publicDownloadApproved:true,releaseGatesApproved:true};assert.equal(recallDownload(approved).href,asset);
 assert.equal(recallReleasePresentation(approved).stage,'Public beta');assert.ok(!recallReleasePresentation(approved).access.includes('not open'));
 assert.equal(recallDownload({...approved,assetVerification:{...r.assetVerification,access:'restricted'}}).href,null);
 assert.equal(recallDownload({...approved,channel:'unavailable'}).href,null);
});
for(const [field,value] of [['sha256','a'.repeat(64)],['bytes',42],['filename','another.apk'],['version','0.6.0'],['build',6],['downloadUrl','https://other.example.test/'+recallRelease.filename]])test(`changing ${field} invalidates old asset verification`,()=>assert.equal(recallDownload({...verified(),[field]:value}).href,null));
for(const url of ['http://downloads.example.test/'+recallRelease.filename,'file:///C:/recall.apk','C:\\recall.apk','https://localhost/'+recallRelease.filename,'https://user:secret@example.test/'+recallRelease.filename,asset+'?token=secret',asset+'#fragment','https://downloads.example.test/archive/source.zip','https://downloads.example.test/archive/source.tar.gz'])test('unsafe or wrong asset destination stays disabled: '+url.split('?')[0],()=>assert.equal(recallDownload(verified({downloadUrl:url})).href,null));
test('the published media is the small authentic synthetic QA capture',()=>{
 const path='public/images/recall/original-memory-qa.png';assert.ok(statSync(path).size<250000);
 assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),'8332af7ba517f1202b385f3b2a8c1c6b18572e4ea665fe9b3d3ef7fb7f271de4');
});

const require=createRequire(import.meta.url);
function load(path,stubs={}){
 const mod={exports:{}};
 const imports=id=>id in stubs?stubs[id]:id.endsWith('.module.css')?{default:{}}:require(id);
 new Function('require','module','exports',ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText)(imports,mod,mod.exports);
 return mod.exports;
}
const photo=({src,alt,width,height})=>React.createElement('img',{src,alt,width,height});
test('all three project cards use their explicit visual; Recall cannot fall through to Review',()=>{
 const data=load('src/content/projects.ts');assert.deepEqual(data.projects.map(p=>p.slug),['ladimus-review','ask-ladimus','recall']);
 const {RecallVisual}=load('src/features/recall/recall-visual.tsx',{'next/image':{default:photo}});
 const {ProjectCard}=load('src/features/projects/project-card.tsx',{'@/components/ui/action-link':{ActionLink:({href,children})=>React.createElement('a',{href},children)},'@/features/recall/recall-visual':{RecallVisual},'./review-visual':{ReviewVisual:()=>React.createElement('div',null,'Review-only diagram')}});
 for(const project of data.projects){
  const html=renderToStaticMarkup(React.createElement(ProjectCard,{project}));
  assert.ok(html.includes(project.detailUrl));
  if(project.slug==='recall'){assert.ok(html.includes('/images/recall/original-memory-qa.png'));assert.ok(!html.includes('Review-only diagram'));assert.ok(html.includes('Internal QA'));}
  if(project.slug==='ladimus-review'){assert.ok(html.includes('Review-only diagram'));assert.ok(!html.includes('original-memory-qa.png'));}
  if(project.slug==='ask-ladimus'){assert.ok(html.includes('Bounded retrieval'));assert.ok(!html.includes('original-memory-qa.png'));}
 }
});
test('the actual download UI renders verified metadata and a disabled control without any APK href',()=>{
 const {RecallDownload}=load('src/features/recall/recall-download.tsx',{'./release':{recallRelease,recallDownload,recallFileSize,recallReleasePresentation}});
 const html=renderToStaticMarkup(React.createElement(RecallDownload));
 assert.match(html,/<button[^>]+disabled=""/);assert.ok(html.includes(recallRelease.sha256));assert.ok(html.includes('564,631,164'));assert.ok(!/href="[^"]*\.apk/.test(html));assert.ok(!html.includes('C:\\'));assert.ok(!html.includes('file://'));
});
