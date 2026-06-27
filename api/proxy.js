export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');

  // 浏览器预检OPTIONS请求必须返回200，否则跨域拦截
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('缺少url参数');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body) : undefined,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const rawData = await response.text();
    res.status(response.status).send(rawData);
  } catch (err) {
    res.status(504).send(`代理超时：${err.message}`);
  }
}
