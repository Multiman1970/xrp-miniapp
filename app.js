const tg = window.Telegram.WebApp;
tg.expand();

let userId = null;
const apiUrl = "https://YOUR_BACKEND_URL_HERE";

function init() {
  const initDataUnsafe = tg.initDataUnsafe;
  userId = initDataUnsafe.user?.id?.toString();
  document.getElementById("user-id").innerText = "User ID: " + userId;

  fetch(apiUrl + "/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  });

  loadUser();
  renderBoosters();
  renderShareLinks();
}

function loadUser() {
  fetch(`${apiUrl}/status/${userId}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("balance").innerText = data.balance;
    });
}

function claimDaily() {
  fetch(`${apiUrl}/daily-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.reward) {
      alert("You earned " + data.reward + " XRP today!");
      loadUser();
    } else {
      alert("Already claimed today!");
    }
  });
}

function withdraw() {
  fetch(`${apiUrl}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Withdrawn: " + data.amount + " XRP");
      loadUser();
    } else {
      alert("Withdraw failed: " + data.reason);
    }
  });
}

function renderBoosters() {
  const boosterList = [
    { name: "Booster 1", ton: 1, xrp: 16 },
    { name: "Booster 2", ton: 5, xrp: 50 },
    { name: "Booster 3", ton: 10, xrp: 100 },
    { name: "Booster 4", ton: 20, xrp: 250 },
    { name: "Booster 5", ton: 50, xrp: 500 },
    { name: "Booster 6", ton: 100, xrp: 5000 },
  ];

  const container = document.getElementById("boosters");
  container.innerHTML = "";
  boosterList.forEach(booster => {
    const btn = document.createElement("button");
    btn.innerText = `${booster.name} – ${booster.ton} TON`;
    btn.onclick = () => {
      const tonAddress = "UQDoR5-QpwlE24kEBErtq8kiuQ6O5pHUL8B1rQmhNOy-39Yg";
      const memo = `${userId}|${booster.name}`;
      const qr = `ton://transfer/${tonAddress}?amount=${booster.ton * 1_000_000_000}&text=${encodeURIComponent(memo)}`;
      tg.showPopup({ title: booster.name, message: `Scan this QR to pay ${booster.ton} TON`, buttons: [
        { text: "Copy Link", type: "default" },
        { text: "Open Wallet", url: qr, type: "default" },
        { text: "Close", type: "close" }
      ] });
    };
    container.appendChild(btn);
  });
}

function renderShareLinks() {
  const link = `https://t.me/${tg.initDataUnsafe.bot_username}?start=${userId}`;
  const share = [
    { name: "Telegram", url: `https://t.me/share/url?url=${link}`, emoji: "📨" },
    { name: "WhatsApp", url: `https://wa.me/?text=${link}`, emoji: "📱" },
    { name: "Messenger", url: `fb-messenger://share/?link=${link}`, emoji: "💬" },
    { name: "LINE", url: `https://social-plugins.line.me/lineit/share?url=${link}`, emoji: "🟢" },
    { name: "X (Twitter)", url: `https://x.com/intent/tweet?text=${link}`, emoji: "🐦" }
  ];

  const div = document.getElementById("share-buttons");
  share.forEach(item => {
    const a = document.createElement("a");
    a.href = item.url;
    a.innerText = `${item.emoji} ${item.name}`;
    a.target = "_blank";
    a.style.display = "block";
    div.appendChild(a);
  });
}

init();
