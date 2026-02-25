import { Env } from '../index';
import { json, error, getCorsHeaders } from '../utils/response';

export async function handleAIChat(env: Env, req: Request) {
  try {
    const { model, messages, stream } = await req.json() as any;
    
    // Only proxy specific chat models
    const CHAT_MODELS = [
      'meta/llama-3.1-70b-instruct',
      'meta/llama-3.1-8b-instruct',
      'mistralai/mixtral-8x22b-instruct-v0.1',
      'google/gemma-2-9b-it',
      'snowflake/arctic'
    ];
    
    if (!CHAT_MODELS.includes(model)) {
      return error('Invalid chat model requested', req, 400);
    }

    const res = await fetch(`https://integrate.api.nvidia.com/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, stream, max_tokens: 1024 }),
    });

    if (!stream) {
      const data = await res.json();
      return json(data, req);
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        ...getCorsHeaders(req)
      }
    });

  } catch (err: any) {
    return error(err.message, req, 500);
  }
}

export async function handleAIImage(env: Env, req: Request) {
  try {
    const { model, prompt } = await req.json() as any;
    
    if (model !== 'stabilityai/stable-diffusion-xl') {
       return error('Invalid image model requested', req, 400);
    }

    const reqBody = {
       text_prompts: [{ text: prompt, weight: 1 }],
       cfg_scale: 5,
       sampler: "K_DPM_2_ANCESTRAL",
       seed: 0,
       steps: 25
    };

    const res = await fetch(`https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
        const errText = await res.text();
        return error(`NVIDIA API Error: ${errText}`, req, res.status);
    }

    const data = await res.json();
    
    if (data.artifacts && data.artifacts[0]?.base64) {
        return json({ data: [{ b64_json: data.artifacts[0].base64 }] }, req);
    }

    return json(data, req);
    
  } catch (err: any) {
    return error(err.message, req, 500);
  }
}
