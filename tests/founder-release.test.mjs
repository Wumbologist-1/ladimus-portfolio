import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {founderRelease,founderIdentity,founderAccess} from '../src/features/recall/founder-release.ts';
import {recallRelease,recallDownload} from '../src/features/recall/release.ts';

function verified(){return {...founderRelease,verification:{releaseId:441207676,assetId:1,repositoryPrivate:true,ownerOnly:true,immutable:true,authenticatedDownloadSha256:founderIdentity.sha256,bytes:founderIdentity.bytes,anonymousDenied:true,checkedAt:'2026-11-10T00:00:00Z'}};}
test('founder access enters GitHub authentication with an allowlisted private release, never a binary capability URL',()=>{
 const access=founderAccess(verified());assert.ok(access);
 const url=new URL(access.href);assert.equal(url.origin,'https://github.com');assert.equal(url.pathname,'/login');
 assert.equal(url.searchParams.get('return_to'),'/Wumbologist-1/recall-founder-qa/releases/tag/v0.7.0-founder-qa.26');
 assert.equal(access.releaseUrl,'https://github.com/Wumbologist-1/recall-founder-qa/releases/tag/v0.7.0-founder-qa.26');
 assert.ok(!access.href.includes('.apk'));assert.equal(founderRelease.publicBetaApproved,false);
});
for(const [key,value] of [['version','0.6.0-qa'],['build',23],['filename','other.apk'],['bytes',1],['sha256','a'.repeat(64)],['package','other.app'],['certificateSha256','b'.repeat(64)],['abis',['x86_64']],['minSdk',23],['targetSdk',37],['sourceCommit','c'.repeat(40)]])test(`a changed founder ${key} cannot reuse prior verification`,()=>assert.equal(founderAccess({...verified(),identity:{...founderIdentity,[key]:value}}),null));
for(const [key,value] of [['channel','public-beta'],['gateA','pending'],['gateB','passed'],['publicBetaApproved',true],['repository','Wumbologist-1/recall-android-releases'],['repository','evil.test/private'],['tag','latest']])test(`unexpected founder distribution ${key} fails closed`,()=>assert.equal(founderAccess({...verified(),[key]:value}),null));
for(const [key,value] of [['releaseId',0],['assetId',0],['repositoryPrivate',false],['ownerOnly',false],['immutable',false],['authenticatedDownloadSha256','a'.repeat(64)],['bytes',0],['anonymousDenied',false],['checkedAt','invalid']])test(`missing host protection or invalid verification ${key} refuses the CTA`,()=>{const r=verified();assert.equal(founderAccess({...r,verification:{...r.verification,[key]:value}}),null);});
test('missing identity or missing proof cannot enable the founder CTA',()=>{
 assert.equal(founderAccess({...verified(),verification:null}),null);
 assert.equal(founderAccess({...verified(),identity:null}),null);
});
test('legacy public QA authorization cannot grant Build26 access or public beta approval',()=>{
 assert.equal(founderAccess({...founderRelease,verification:recallRelease.assetVerification}),null);
 assert.equal(recallDownload({...recallRelease,version:founderIdentity.version,build:26,bytes:founderIdentity.bytes,sha256:founderIdentity.sha256,filename:founderIdentity.filename}).href,null);
 assert.match(recallDownload(recallRelease).href,/v0\.6\.0-qa\.6/);
});
test('founder guide keeps security, upgrade, resource and hardware gates explicit',()=>{
 const component=readFileSync('src/features/recall/founder-access.tsx','utf8');
 for(const phrase of ['Do not uninstall Recall or clear its storage','Keep Play Protect','Hardware Validation Pending','Source Review','experimental conversation','hardware-backed Keystore','4 GB','7 GB','SHA256SUMS.txt','Wumbologist-1'])assert.ok(component.toLowerCase().includes(phrase.toLowerCase()),phrase);
 assert.ok(!component.includes('localStorage'));assert.ok(!component.includes('process.env'));
});
