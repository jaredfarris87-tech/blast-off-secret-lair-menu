'use strict';
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'');
const total = cards => cards.reduce((sum, card) => sum + card.qty, 0);
let decks = [], activeDeck = null, viewerCards = [], viewerIndex = 0, reverse = false, imageTrigger = null, browseScroll = 0;
const groupOrder = ['Commander','Creatures','Planeswalkers','Artifacts','Enchantments','Instants','Sorceries','Lands','Other'];
function cardGroup(card) {
  const front = card.type.split(' // ')[0];
  for (const [word, group] of [['Creature','Creatures'],['Planeswalker','Planeswalkers'],['Artifact','Artifacts'],['Enchantment','Enchantments'],['Instant','Instants'],['Sorcery','Sorceries'],['Land','Lands']]) if (front.includes(word)) return group;
  return 'Other';
}
function cover(deck, lazy = true) {
  return `<div class="deck-cover"><img src="${esc(deck.cover)}" alt="${esc(deck.coverAlt)}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'}></div>`;
}
function renderBrowse() {
  const query = normalize($('#deck-search').value.trim()), series = $('#series-filter').value;
  const results = decks.filter(deck => (series === 'all' || deck.series === series) && normalize([deck.title,deck.series,...deck.commanders.map(c=>c.name),...deck.cards.map(c=>c.name)].join(' ')).includes(query));
  $('#deck-count').textContent = `${results.length} ${results.length === 1 ? 'deck' : 'decks'} to discover`;
  $('#empty').hidden = results.length !== 0;
  $('#deck-grid').innerHTML = results.map(deck => `<a class="deck-tile" href="#deck=${encodeURIComponent(deck.id)}" aria-label="View ${esc(deck.title)} decklist">${cover(deck)}<div class="deck-info"><p class="release-name">${esc(deck.series)}</p><h3>${esc(deck.title)}</h3><p class="commander-name">${esc(deck.commanders.map(c=>c.name).join(' + '))}</p><div class="tile-bottom"><span>100 cards</span><strong>View decklist ↗</strong></div></div></a>`).join('');
}
function cardRow(card, index) {
  return `<li><button class="card-row" data-card="${index}" aria-label="View ${esc(card.name)}, ${card.qty} ${card.qty===1?'copy':'copies'}"><span class="card-qty">${card.qty}×</span><span class="card-title">${esc(card.name)}</span><span class="card-type">${esc(card.type.split(' — ')[0])}</span><span class="card-arrow" aria-hidden="true">↗</span></button></li>`;
}
function renderCardList() {
  if (!activeDeck) return;
  const query = normalize($('#card-search').value.trim());
  const matches = viewerCards.map((card,index)=>({card,index})).filter(({card})=>normalize(card.name).includes(query));
  const playable = matches.filter(({index})=>index < activeDeck.commanders.length + activeDeck.cards.length);
  const groups = new Map(groupOrder.map(group=>[group,[]]));
  playable.forEach(item => groups.get(item.index < activeDeck.commanders.length ? 'Commander' : cardGroup(item.card)).push(item));
  $('#card-groups').innerHTML = [...groups].filter(([,items])=>items.length).map(([group,items])=>{
    items.sort((a,b)=>a.card.name.localeCompare(b.card.name));
    return `<section class="card-group"><h3>${group === 'Commander' && items.length > 1 ? 'Commanders' : group}<span>${total(items.map(i=>i.card))}</span></h3><ul class="card-rows">${items.map(item=>cardRow(item.card,item.index)).join('')}</ul></section>`;
  }).join('') || '<p class="deck-no-match">No cards in this deck match your search.</p>';
  $('#list-count').textContent = query ? `${total(playable.map(i=>i.card))} of 100 cards` : '100 cards · tap a name';
  const extras = matches.filter(({index})=>index >= activeDeck.commanders.length + activeDeck.cards.length);
  $('#extra-cards').innerHTML = extras.length ? `<div class="extras-heading"><h2>Original product extras</h2><p>These planes or schemes are separate from the 100-card deck. Ask our team which extras come with this pre-owned copy.</p></div><ul class="card-rows">${extras.map(item=>cardRow(item.card,item.index)).join('')}</ul>` : '';
  $('#deck-view').querySelectorAll('[data-card]').forEach(button=>button.addEventListener('click',()=>{
    imageTrigger = button;
    openCard(Number(button.dataset.card));
  }));
}
function renderDeck(deck) {
  activeDeck = deck;
  viewerCards = [...deck.commanders,...deck.cards,...deck.extras];
  $('#deck-view').innerHTML = `<a class="back-link" href="#collection">← All pre-owned precons</a><div class="deck-layout"><aside class="deck-sidebar">${cover(deck,false)}<p class="deck-status">PRE-OWNED · COMPLETE</p><p class="side-note">Original 100-card decklist.<br>Ask in store for current availability and pricing.</p><p class="side-note">${deck.coverKind === 'official-product-packshot' ? 'Original packaging shown for reference. Sold in store packaging.' : 'Commander card shown for reference.'}</p><button class="text-link" id="share-deck">Copy deck link</button><span id="share-status" class="side-note" role="status"></span><div class="sources"><a class="source-link" href="${esc(deck.source)}" target="_blank" rel="noopener noreferrer">Original Wizards decklist ↗</a><span class="side-note">Card images: Scryfall</span></div></aside><div><div class="deck-detail-heading"><p class="eyebrow">${esc(deck.series)} / COMMANDER</p><h1 id="deck-title" tabindex="-1">${esc(deck.title)}</h1><p class="deck-description">Led by ${esc(deck.commanders.map(c=>c.name).join(' and '))}.</p><div class="deck-facts"><span>100-card deck</span><span>Original decklist</span><span>Pre-owned</span></div></div>${(deck.notes || []).filter(note=>!note.startsWith('Original sealed product extras')).map(note=>`<p class="list-note">${esc(note)}</p>`).join('')}<div class="list-heading"><h2>Inside this deck</h2><span id="list-count" aria-live="polite">100 cards · tap a name</span></div><p class="side-note">Tap any card name to view its picture. Basic lands are grouped by name; their artwork may vary. Tokens and accessories are not part of this 100-card list.</p><label class="search-box list-search"><span aria-hidden="true">⌕</span><input id="card-search" type="search" placeholder="Find a card in this deck…" aria-label="Find a card in this deck"></label><div id="card-groups"></div><div id="extra-cards"></div></div></div>`;
  $('#card-search').addEventListener('input',renderCardList);
  $('#share-deck').addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(location.href); $('#share-status').textContent='Deck link copied.'; }
    catch { $('#share-status').textContent='Copy this page’s address to share the deck.'; }
  });
  renderCardList();
  document.title = `${deck.title} · Blast Off Gaming`;
}
function route(initial = false) {
  if ($('#card-viewer').open) closeCard();
  let id = null;
  try { if (location.hash.startsWith('#deck=')) id = decodeURIComponent(location.hash.slice(6)); } catch { id = '__invalid__'; }
  const deck = decks.find(item=>item.id===id);
  if (id && !activeDeck) browseScroll = window.scrollY;
  $('#browse-view').hidden = Boolean(id);
  $('#deck-view').hidden = !deck;
  $('#not-found').hidden = !id || Boolean(deck);
  if (deck) {
    renderDeck(deck);
    window.scrollTo({top:0,behavior:'instant'});
    if (!initial) $('#deck-title').focus({preventScroll:true});
  } else if (!id) {
    const returning = Boolean(activeDeck);
    activeDeck = null;
    document.title = 'Pre-owned Precons · Blast Off Gaming';
    if (returning) window.scrollTo({top:browseScroll,behavior:'instant'});
    else if (location.hash === '#collection') $('#collection').scrollIntoView();
  } else {
    activeDeck = null;
    document.title = 'Deck not found · Blast Off Gaming';
    window.scrollTo({top:0,behavior:'instant'});
  }
}
function paintCard() {
  const card = viewerCards[viewerIndex], image = $('#card-image');
  image.hidden = false; image.classList.add('loading'); $('#image-error').hidden = true;
  image.alt = `${card.name}${reverse ? ' — reverse side' : ''}`;
  image.src = reverse ? card.backImage : card.image;
  $('#card-name').textContent = card.name;
  $('#card-position').textContent = `${card.qty} ${card.qty===1?'copy':'copies'} · ${card.set.toUpperCase()} ${card.number}`;
  $('#previous-card').disabled = viewerIndex===0;
  $('#next-card').disabled = viewerIndex===viewerCards.length-1;
  $('#flip-card').hidden = !card.backImage;
  $('#flip-card').textContent = reverse ? 'View front side' : 'View reverse side';
}
function openCard(index) { viewerIndex=index; reverse=false; paintCard(); $('#card-viewer').showModal(); $('#close-card').focus(); }
function closeCard() { $('#card-viewer').close(); if (imageTrigger?.isConnected) imageTrigger.focus(); }
function nextCard(step) { viewerIndex=Math.max(0,Math.min(viewerCards.length-1,viewerIndex+step)); reverse=false; paintCard(); }
$('#card-image').addEventListener('load',()=>$('#card-image').classList.remove('loading'));
$('#card-image').addEventListener('error',()=>{$('#card-image').hidden=true;$('#image-error').hidden=false;});
$('#retry-image').addEventListener('click',paintCard);
$('#close-card').addEventListener('click',closeCard);
$('#previous-card').addEventListener('click',()=>nextCard(-1));
$('#next-card').addEventListener('click',()=>nextCard(1));
$('#flip-card').addEventListener('click',()=>{reverse=!reverse;paintCard();});
$('#card-viewer').addEventListener('cancel',event=>{event.preventDefault();closeCard();});
$('#card-viewer').addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();nextCard(event.key==='ArrowLeft'?-1:1);}});
$('#card-viewer').addEventListener('click',event=>{if(event.target === $('#card-viewer')){const rect=event.target.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeCard();}});
$('#deck-search').addEventListener('input',renderBrowse);
$('#series-filter').addEventListener('change',renderBrowse);
$('#clear-filters').addEventListener('click',()=>{$('#deck-search').value='';$('#series-filter').value='all';renderBrowse();$('#deck-search').focus();});
window.addEventListener('hashchange',()=>route());
async function loadDecks() {
  $('#load-error').hidden=true;
  $('#deck-count').textContent='Loading the decks…';
  try {
    const response=await fetch('decks.json',{cache:'no-cache'});
    if(!response.ok) throw new Error('Deck data unavailable');
    const data=await response.json();
    if(!Array.isArray(data.decks)||!data.decks.length) throw new Error('No decks');
    decks=data.decks.sort((a,b)=>a.title.localeCompare(b.title));
    $('#series-filter').innerHTML='<option value="all">All releases</option>'+[...new Set(decks.map(deck=>deck.series))].sort().map(series=>`<option value="${esc(series)}">${esc(series)}</option>`).join('');
    renderBrowse(); route(true);
  } catch { $('#load-error').hidden=false;$('#deck-count').textContent='Collection unavailable'; }
}
$('#retry').addEventListener('click',loadDecks);
loadDecks();
