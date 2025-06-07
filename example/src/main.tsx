import { createFromFetch, encodeReply } from 'react-server-dom-webpack/client';

const BASE_PATH = '/RSC/';

export default async function main() {
  const { pathname, search } = new URL(location.href);
  const input = pathname.slice(1) || '';
  
  // Enhanced fetch with RSEasy headers
  const enhancedFetch = async (url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set('X-Structure-Protocol', 'valtio-v1');
    headers.set('X-Known-Structures', '[]'); // Start with empty known structures
    
    console.log('RSEasy: Making enhanced request', { url });
    
    return fetch(url, { ...init, headers });
  };
  
  const response = await enhancedFetch(`${BASE_PATH}${input}${search}`);
  
  // Check for RSEasy metadata
  const text = await response.text();
  console.log('RSEasy: Response received', { 
    hasMetadata: text.includes('<!--RSEasy:'),
    responseSize: text.length,
    hasStructureHeader: response.headers.get('X-Structure-Response')
  });
  
  // Create new response for createFromFetch
  const newResponse = new Response(text, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
  
  const root = createFromFetch(Promise.resolve(newResponse));
  
  return root;
}