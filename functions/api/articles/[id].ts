export interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const id = params.id;

  if (request.method === 'GET') {
    try {
      const article = await env.DB.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first();
      
      if (!article) {
        return Response.json({ error: 'Article not found' }, { status: 404 });
      }

      return Response.json(article);
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (request.method === 'PUT') {
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
        'UPDATE articles SET title = ?, excerpt = ?, content = ?, images = ? WHERE id = ?'
      ).bind(data.title, data.excerpt, data.content, data.images ? JSON.stringify(data.images) : null, id).run();
      return Response.json({ success: true });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    const token = request.headers.get('X-Admin-Token');
    if (token !== 'MEGS2026') {
      return Response.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    try {
      await env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
      return Response.json({ success: true });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
};
