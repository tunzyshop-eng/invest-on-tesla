// client.js — shared frontend logic, talks to /api/account (backed by Vercel KV)

async function fetchAccount(name) {
  const res = await fetch(`/api/account?name=${encodeURIComponent(name.trim().toLowerCase())}`);
  return res.json();
}

async function adminAction(payload) {
  const res = await fetch('/api/account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res.status === 401) {
    alert('Wrong admin password.');
    return null;
  }
  return res.json();
}

function formatMoney(n) {
  return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}