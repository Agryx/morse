/* Офлайн-режим: зберігає сайт на пристрої після першого відкриття.
   Коли є інтернет — завжди бере свіжу версію; коли немає — показує збережену. */
var CACHE = 'morse-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  /* cache: 'no-cache' — щоразу питає сервер, чи є новіша версія (швидка перевірка), тож оновлення приходять одразу */
  e.respondWith(fetch(new Request(req.url, {cache: 'no-cache', credentials: 'same-origin'})).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, {ignoreSearch: true}).then(function (hit) { return hit || caches.match('./index.html'); });
  }));
});
