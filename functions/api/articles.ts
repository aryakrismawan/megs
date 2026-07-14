export interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const { results } = await env.DB.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
      return Response.json(results);
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    const token = request.headers.get('X-Admin-Token');
    if (token !== 'MEGS2026') {
      return Response.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    try {
      const data: any = await request.json();
      
      if (!data.title || !data.excerpt || !data.content) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      await env.DB.prepare(
        'INSERT INTO articles (title, excerpt, content, images) VALUES (?, ?, ?, ?)'
      ).bind(data.title, data.excerpt, data.content, data.images ? JSON.stringify(data.images) : null).run();

      return Response.json({ success: true }, { status: 201 });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
};
