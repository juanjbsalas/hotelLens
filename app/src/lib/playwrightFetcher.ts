import type { Browser, BrowserContext, Page } from 'playwright';

let _pw: any = null;
let _browser: Browser | null = null;
let _context: BrowserContext | null = null;
let _initing: Promise<void> | null = null; // avoid concurrent inits

async function ensurePlaywright() {
    if (_pw) return _pw;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        _pw = require('playwright');
        return _pw;
    } catch (e: any) {
        if (process.env.DEBUG_SCRAPER) console.warn('playwright not installed or failed to require', e?.toString?.() || e);
        _pw = null;
        return null;
    }
}

/** Returns a NON-NULL context (throws if Playwright missing). Also handles first-time init. */
async function getContext(opts?: {
    headless?: boolean;
    userAgent?: string;
    viewport?: { width: number; height: number };
}): Promise<BrowserContext> {
    const pw = await ensurePlaywright();
    if (!pw) throw new Error('playwright-missing');

    if (!_browser || !_context) {
        if (!_initing) {
            _initing = (async () => {
                const headless = opts?.headless ?? true;
                const userAgent =
                    opts?.userAgent ??
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari hotel-lens/1.0';
                const viewport = opts?.viewport ?? { width: 1280, height: 800 };

                // use locals to convince TS these are non-null
                const browser: Browser = await pw.chromium.launch({ headless, args: ['--no-sandbox'] });
                const context: BrowserContext = await browser.newContext({ userAgent, viewport });

                _browser = browser;
                _context = context;
            })().finally(() => { _initing = null; });
        }
        await _initing;
    }

    if (!_context) throw new Error('playwright-context-unavailable');
    return _context;
}


export async function fetchWithPlaywright(
    url: string,
    opts?: {
        timeoutMs?: number;
        retries?: number;
        waitFor?: { selector?: string; timeoutMs?: number };
        waitAfterLoadMs?: number;
        blockHeavy?: boolean;
        headless?: boolean; // only used on first init
    }
): Promise<string | null> {
    const timeoutMs = opts?.timeoutMs ?? 15_000;
    const retries = Math.max(1, opts?.retries ?? 2);
    const waitSel = opts?.waitFor?.selector;
    const waitSelTimeout = opts?.waitFor?.timeoutMs ?? timeoutMs;
    const waitAfterLoadMs = opts?.waitAfterLoadMs ?? 300;
    const blockHeavy = opts?.blockHeavy ?? false;

    // if playwright isn’t installed, bail cleanly
    const pw = await ensurePlaywright();
    if (!pw) return null;

    let lastErr: unknown = null;

    for (let attempt = 0; attempt < retries; attempt++) {
        let page: Page | null = null;
        try {
            const ctx = await getContext({ headless: opts?.headless });
            page = await ctx.newPage();

            if (blockHeavy) {
                await page.route('**/*', route => {
                    const t = route.request().resourceType();
                    if (t === 'image' || t === 'font' || t === 'media' || t === 'stylesheet') route.abort();
                    else route.continue();
                });
            }

            const nav = page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
            await Promise.race([
                nav,
                new Promise((_, rej) => setTimeout(() => rej(new Error('playwright: navigation timeout')), timeoutMs))
            ]);

            if (waitSel) {
                await page.waitForSelector(waitSel, { timeout: waitSelTimeout }).catch(() => {/* non-fatal */ });
            }
            if (waitAfterLoadMs > 0) await page.waitForTimeout(waitAfterLoadMs);

            const html = await page.content();
            await safeClose(page);
            return html;
        } catch (e: any) {
            lastErr = e;
            if (process.env.DEBUG_SCRAPER) {
                console.warn(`playwright fetch attempt ${attempt + 1}/${retries} failed for ${url}`, e?.toString?.() || e);
            }
            await safeClose(page);
            await sleep(250 + attempt * 300);
        }
    }

    if (process.env.DEBUG_SCRAPER) console.warn('playwright fetch ultimately failed for', url, lastErr);
    return null;
}

export async function closePlaywright() {
    try { await _context?.close(); } catch { }
    try { await _browser?.close(); } catch { }
    _context = null;
    _browser = null;
    _pw = null;
}

/* helpers */
function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }
async function safeClose(page: Page | null) { try { if (page) await page.close(); } catch { } }
