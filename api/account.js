import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const name = (req.query.name || '').trim().toLowerCase();
    if (!name) return res.status(400).json({ error: 'name required' });
    const acc = await kv.get(`account:${name}`);
    return res.status(200).json(acc || null);
  }

  if (req.method === 'POST') {
    const { password, action, name, balance, delta } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    if (action === 'list') {
      const keys = await kv.smembers('account-keys');
      const accounts = await Promise.all(keys.map((k) => kv.get(`account:${k}`)));
      return res.status(200).json(accounts.filter(Boolean));
    }

    const key = (name || '').trim().toLowerCase();
    if (!key) return res.status(400).json({ error: 'name required' });

    if (action === 'set') {
      const acc = { displayName: name.trim(), balance: Number(balance), lastChange: 0 };
      await kv.set(`account:${key}`, acc);
      await kv.sadd('account-keys', key);
      return res.status(200).json(acc);
    }

    if (action === 'adjust') {
      const acc = await kv.get(`account:${key}`);
      if (!acc) return res.status(404).json({ error: 'not found' });
      acc.balance = Math.max(0, acc.balance + Number(delta));
      acc.lastChange = Number(delta);
      await kv.set(`account:${key}`, acc);
      return res.status(200).json(acc);
    }

    if (action === 'delete') {
      await kv.del(`account:${key}`);
      await kv.srem('account-keys', key);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'unknown action' });
  }

  res.status(405).end();
}