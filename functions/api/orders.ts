interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM orders ORDER BY created_at DESC"
    ).all();
    return Response.json(results);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const data = await context.request.json() as any;
    const { customer_name, customer_phone, customer_address, order_items, total_price } = data;

    if (!customer_name || !customer_phone || !customer_address || !order_items) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const info = await context.env.DB.prepare(
      `INSERT INTO orders (customer_name, customer_phone, customer_address, order_items, total_price, status) 
       VALUES (?, ?, ?, ?, ?, 'menunggu pembayaran')`
    )
    .bind(
      customer_name,
      customer_phone,
      customer_address,
      typeof order_items === 'string' ? order_items : JSON.stringify(order_items),
      total_price || ''
    )
    .run();

    return Response.json({ success: true, id: info.meta.last_row_id });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
