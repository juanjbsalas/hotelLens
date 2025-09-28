(async () => {
  const url = 'http://localhost:3000/api/search?lat=38.575764&lng=-121.478851&radius=20';
  const outPath = new URL('../../app/tmp/latest_api_response.json', import.meta.url).pathname.replace(/^\//, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const text = await res.text();
    const fs = await import('fs/promises');
    await fs.mkdir(new URL('../../app/tmp', import.meta.url).pathname.replace(/^\//, ''), { recursive: true });
    await fs.writeFile(outPath, text, 'utf8');
    console.log('status', res.status);
    console.log('wrote', outPath);
    console.log(text.slice(0, 1200));
  } catch (e) {
    console.error('error', e && e.message ? e.message : e);
  }
})();
