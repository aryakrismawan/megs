export async function onRequestGet(context: any) {
  const id = context.params.id;
  try {
    const product = await context.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!product) {
      return new Response('Not found', { status: 404 });
    }
    return new Response(JSON.stringify(product), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context: any) {
  const token = context.request.headers.get('X-Admin-Token');
  if (token !== 'MEGS2026') {
    return new Response('Unauthorized', { status: 401 });
  }

  const id = context.params.id;
  try {
    const body = await context.request.json();
    const { name, price, img, category, description, sizes } = body;
    
    if (!name || !price || !category) {
      return new Response('Name, price, and category are required', { status: 400 });
    }

    const { success } = await context.env.DB.prepare(
      'UPDATE products SET name = ?, price = ?, img = ?, category = ?, description = ?, sizes = ? WHERE id = ?'
    ).bind(name, price, img || null, category, description || '', sizes || null, id).run();

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw new Error('Failed to update product');
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context: any) {
  const token = context.request.headers.get('X-Admin-Token');
  if (token !== 'MEGS2026') {
    return new Response('Unauthorized', { status: 401 });
  }

  const id = context.params.id;
  try {
    const { success } = await context.env.DB.prepare(
      'DELETE FROM products WHERE id = ?'
    ).bind(id).run();

    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw new Error('Failed to delete product');
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
