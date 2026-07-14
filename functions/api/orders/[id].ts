interface Env {
  DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const adminToken = context.request.headers.get('X-Admin-Token');
    if (adminToken !== 'MEGS2026') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = context.params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
    }

    const data = await context.request.json() as any;
    const { status } = data;
    
    if (!status) {
      return new Response(JSON.stringify({ error: 'Missing status field' }), { status: 400 });
    }

    const result = await context.env.DB.prepare(
      "UPDATE orders SET status = ? WHERE id = ?"
    )
    .bind(status, id)
    .run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    return Response.json({ success: true });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const adminToken = context.request.headers.get('X-Admin-Token');
    if (adminToken !== 'MEGS2026') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = context.params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
    }

    await context.env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
    
    return Response.json({ success: true });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
