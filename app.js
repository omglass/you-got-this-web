// App logic for You Got This web app

// Utility: get today's date as YYYY-MM-DD
function getToday() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Choose a random quote based on rarity probabilities
function getRandomQuote() {
  // determine rarity
  const rarity = pickRarity();
  // filter quotes by rarity
  const candidates = QUOTES.filter((q) => q.rarity === rarity);
  if (candidates.length === 0) {
    // fallback to common
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

// Display a quote on screen and add to collection
function displayQuote(q) {
  const quoteTextEl = document.getElementById('quote-text');
  const quoteRarityEl = document.getElementById('quote-rarity');
  quoteTextEl.textContent = q.text;
  quoteRarityEl.textContent = q.rarity;
  // set CSS class based on rarity
  quoteRarityEl.className = '';
  const rarityClass = 'rarity-' + q.rarity.toLowerCase();
  quoteRarityEl.classList.add(rarityClass.replace('prysm', 'prys')); // normalise prysmatic
  // save to collection
  let collection = JSON.parse(localStorage.getItem('collection') || '[]');
  // avoid duplicates by quote id
  if (!collection.find((item) => item.id === q.id)) {
    collection.push(q);
    localStorage.setItem('collection', JSON.stringify(collection));
  }
}

// Show a message
function showMessage(msg) {
  const msgEl = document.getElementById('message');
  msgEl.textContent = msg;
  msgEl.classList.remove('hidden');
  setTimeout(() => msgEl.classList.add('hidden'), 3000);
}

// Render collection overlay
function renderCollection() {
  const overlay = document.getElementById('collection-overlay');
  const listEl = document.getElementById('collection-list');
  listEl.innerHTML = '';
  let collection = JSON.parse(localStorage.getItem('collection') || '[]');
  // sort by rarity order
  const order = ['Prysmatic', 'Divine', 'Mythic', 'Legendary', 'Rare', 'Uncommon', 'Common'];
  collection.sort((a, b) => order.indexOf(a.rarity) - order.indexOf(b.rarity));
  collection.forEach((item) => {
    const p = document.createElement('p');
    p.textContent = `${item.rarity} — ${item.text}`;
    p.classList.add('rarity-' + item.rarity.toLowerCase().replace('prysm', 'prys'));
    listEl.appendChild(p);
  });
  overlay.classList.remove('hidden');
}

// Hide collection overlay
function hideCollection() {
  document.getElementById('collection-overlay').classList.add('hidden');
}

// Initialize app
function init() {
  const dailyBtn = document.getElementById('daily-btn');
  const adBtn = document.getElementById('ad-btn');
  const premiumBtn = document.getElementById('premium-btn');
  const viewCollectionBtn = document.getElementById('view-collection-btn');
  const adOverlay = document.getElementById('ad-overlay');
  const closeCollectionBtn = document.getElementById('close-collection-btn');
  // Check premium status
  let premium = JSON.parse(localStorage.getItem('premium') || 'false');
  if (premium) {
    adBtn.style.display = 'none';
    premiumBtn.style.display = 'none';
  }
  // Check if daily quote used
  function updateDailyState() {
    const last = localStorage.getItem('lastDailyDate');
    if (last === getToday()) {
      dailyBtn.disabled = true;
    } else {
      dailyBtn.disabled = false;
    }
  }
  updateDailyState();

  dailyBtn.addEventListener('click', () => {
    // daily quote logic
    updateDailyState();
    if (dailyBtn.disabled) {
      showMessage("You've already pulled your daily quote. Try again tomorrow or watch an ad!");
      return;
    }
    const q = getRandomQuote();
    displayQuote(q);
    localStorage.setItem('lastDailyDate', getToday());
    updateDailyState();
  });

  adBtn.addEventListener('click', () => {
    // show fake ad overlay for 5 seconds
    adOverlay.classList.remove('hidden');
    adBtn.disabled = true;
    setTimeout(() => {
      adOverlay.classList.add('hidden');
      adBtn.disabled = false;
      const q = getRandomQuote();
      displayQuote(q);
    }, 5000);
  });

  premiumBtn.addEventListener('click', () => {
    // upgrade to premium: remove ads and allow unlimited daily pulls
    premium = true;
    localStorage.setItem('premium', 'true');
    adBtn.style.display = 'none';
    premiumBtn.style.display = 'none';
    dailyBtn.disabled = false;
    showMessage('Premium unlocked! Unlimited quote pulls and no ads.');
  });

  viewCollectionBtn.addEventListener('click', renderCollection);
  closeCollectionBtn.addEventListener('click', hideCollection);
}

document.addEventListener('DOMContentLoaded', init);
