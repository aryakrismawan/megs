export async function onRequestGet(context: any) {
  try {
    const { results } = await context.env.DB.prepare('SELECT * FROM products ORDER BY id DESC').all();
    return new Response(JSON.stringify(results || []), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context: any) {
  const token = context.request.headers.get('X-Admin-Token');
  if (token !== 'MEGS2026') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await context.request.json();
    const { name, price, img, category, description, sizes } = body;
    
    if (!name || !price || !category) {
      return new Response('Name, price, and category are required', { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      'INSERT INTO products (name, price, img, category, description, sizes) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(name, price, img || null, category, description || '', sizes || null).run();

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw new Error('Failed to insert product');
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
