import { json } from '../utils/response';

const startTime = Date.now();

export async function handleHealth(_env: any, req: Request): Promise<Response> {
  const now = Date.now();
  const uptimeMs = now - startTime;
  
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
  
  let uptimeStr = '';
  if (days > 0) uptimeStr += `${days}d `;
  if (hours > 0) uptimeStr += `${hours}h `;
  if (minutes > 0) uptimeStr += `${minutes}m `;
  uptimeStr += `${seconds}s`;

  // Cloudflare specific request details available on the cf object
  const cf = req.cf || {};

  const stats = {
    status: 'operational',
    service: 'Buggy Cloudflare Edge',
    timestamp: new Date().toISOString(),
    uptime: uptimeStr || '0s',
    metrics: {
      memory_usage: 'N/A (Not accessible directly in Workers)',
      v8_version: 'Cloudflare edge runtime',
    },
    client_info: {
      ip: req.headers.get('cf-connecting-ip') || 'unknown',
      colo: cf.colo || 'unknown',
      country: cf.country || 'unknown',
      city: cf.city || 'unknown',
      continent: cf.continent || 'unknown',
      timezone: cf.timezone || 'unknown',
      tls_version: cf.tlsVersion || 'unknown',
      tls_cipher: cf.tlsCipher || 'unknown',
      http_protocol: cf.httpProtocol || 'unknown',
    },
    system: {
      datacenters: '300+ global locations',
      platform: 'Cloudflare Workers V8 Isolate',
      cold_start: uptimeMs < 10000 ? true : false,
    },
    routes_available: [
      'GET /',
      'GET /api/health',
      'POST /api/notes/sync',
      'POST /api/ai',
      'POST /api/ai/image',
      'WS /api/chat'
    ]
  };

  return json(stats, req);
}
