import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {recallRelease,recallDownload,recallFileSize} from '../src/features/recall/release.ts';
import {founderRelease,founderAccess} from '../src/features/recall/founder-release.ts';
import {eidolonRelease} from '../src/features/recall/eidolon.ts';
const require=createRequire(import.meta.url);
function load(path,stubs={}){
 const mod={exports:{}};const imports=id=>id in stubs?stubs[id]:id.endsWith('.module.css')?{default:{}}:require(id);
 new Function('require','module','exports',ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText)(imports,mod,mod.exports);return mod.exports;
}
const data=load('src/features/recall/platinum-release.ts',{'./release':{recallDownload}});
const {platinumIdentity,platinumRelease,platinumDownload,platinumUrl}=data;
const copy=()=>structuredClone(platinumRelease);

test('Build27 enables only the newly authorized exact public QA preview',()=>{
 assert.equal(platinumIdentity.build,27);assert.equal(platinumIdentity.bytes,566966197);
 assert.equal(platinumIdentity.sha256,'ff775627bc973ea29f2bdabdb365f6b270eb9b32c4a0f5002ac6d9faedfa0862');
 assert.equal(platinumDownload(),platinumUrl);assert.match(platinumUrl,/github.com\/Wumbologist-1\/recall-android-releases\/releases\/download\/v0.7.0-qa.27\//);
 assert.equal(platinumRelease.publicDownloadApproved,false);assert.equal(platinumRelease.releaseGatesApproved,false);
});
for(const [field,value] of [['version','0.7.1-qa'],['build',28],['filename','other.apk'],['bytes',1],['sha256','a'.repeat(64)],['minAndroid','6.0'],['architectures',['x86_64']],['platform','ios'],['downloadUrl','https://other.example.test/'+platinumIdentity.filename]])test(`Build27 ${field} substitution cannot inherit approval`,()=>assert.equal(platinumDownload({...copy(),[field]:value}),null));
for(const field of ['assetVerification','signatureVerification','publicQaAuthorization'])test('Build27 requires '+field,()=>assert.equal(platinumDownload({...copy(),[field]:null}),null));
for(const channel of ['internal-qa','public-beta','unavailable','production'])test('Build27 cannot silently change channel to '+channel,()=>assert.equal(platinumDownload({...copy(),channel}),null));
test('old public and private records cannot authorize Build27',()=>{
 assert.equal(platinumDownload(recallRelease),null);assert.equal(platinumDownload(eidolonRelease),null);
 assert.equal(platinumDownload({...copy(),assetVerification:recallRelease.assetVerification}),null);
 assert.equal(platinumDownload({...copy(),publicQaAuthorization:recallRelease.publicQaAuthorization}),null);
 assert.equal(platinumDownload({...copy(),signatureVerification:recallRelease.signatureVerification}),null);
 assert.equal(founderRelease.identity.build,26);assert.ok(founderAccess(founderRelease));assert.match(recallDownload(recallRelease).href,/v0.6.0-qa.6/);assert.equal(recallDownload(eidolonRelease).href,null);
});
test('incorrect signer, nonpublic proof and broader beta flags fail closed',()=>{
 const r=copy();assert.equal(platinumDownload({...r,signatureVerification:{...r.signatureVerification,certificateSha256:'b'.repeat(64)}}),null);
 assert.equal(platinumDownload({...r,assetVerification:{...r.assetVerification,access:'restricted'}}),null);
 assert.equal(platinumDownload({...r,publicDownloadApproved:true}),null);assert.equal(platinumDownload({...r,releaseGatesApproved:true}),null);
 for(const key of ['sha256','bytes','build','version','filename','url','checkedAt'])assert.equal(platinumDownload({...r,assetVerification:{...r.assetVerification,[key]:'invalid'}}),null);
});
test('visible CTA and guide expose exact identity, QA warning, upgrade, models and privacy links',()=>{
 const ui=load('src/features/recall/platinum-access.tsx',{'./platinum-release':data,'./release':{recallFileSize}});
 const html=renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(ui.PlatinumAccess),React.createElement(ui.PlatinumInstallation)));
 for(const text of ['Download Recall for Android','Platinum Ascension · Build 27 · Android QA Preview','Gate B: PENDING','Unannounced Public QA Preview','566,966,197','Do not uninstall Recall or clear app data','Settings → Platinum AI','Manage Platinum AI','Android installation','Apache-2.0','privacy disclosures'])assert.ok(html.includes(text),text);
 assert.ok(html.includes(platinumUrl));assert.ok(!html.includes('github.com/login'));assert.match(html,/href="#android-installation"/);
});
test('missing hosting proof removes the actual binary href',()=>{
 const ui=load('src/features/recall/platinum-access.tsx',{'./platinum-release':{...data,platinumDownload:()=>null},'./release':{recallFileSize}});
 const html=renderToStaticMarkup(React.createElement(ui.PlatinumAccess));assert.ok(!/href="[^" ]*\.apk/.test(html));assert.ok(html.includes('verification is incomplete'));
});
