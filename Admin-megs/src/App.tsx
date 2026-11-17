import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildReportSummaryAndRows(ordersToExport: any[]) {
  let grandTotalAll = 0;
  let realizedRevenue = 0;
  let pendingRevenue = 0;
  let totalPcsSold = 0;

  const preparedRows = ordersToExport.map((order, index) => {
    const createdDate = order.created_at ? new Date(order.created_at) : null;
    const dateStr = createdDate && !isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
      : '-';
    const timeStr = createdDate && !isNaN(createdDate.getTime())
      ? createdDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '';

    let parsedItems: any[] = [];
    try {
      parsedItems = JSON.parse(order.order_items || '[]');
    } catch {
      parsedItems = [];
    }

    const orderQty = Array.isArray(parsedItems)
      ? parsedItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0)
      : 0;

    const itemsListHtml = Array.isArray(parsedItems) && parsedItems.length > 0
      ? parsedItems
          .map(
            (item: any) =>
              `• <strong>${escapeHtml(item.quantity || 1)}x ${escapeHtml(item.name || 'Produk')}</strong>${
                item.selectedSize ? ` (Ukuran: ${escapeHtml(item.selectedSize)})` : ''
              } — Rp ${escapeHtml(item.price || '0')}`
          )
          .join('<br/>')
      : '-';

    const amount = parseInt(String(order.total_price || '0').replace(/\D/g, ''), 10) || 0;
    grandTotalAll += amount;
    totalPcsSold += orderQty;

    const statusLower = String(order.status || 'menunggu pembayaran').toLowerCase();
    if (statusLower === 'selesai' || statusLower === 'dikirim') {
      realizedRevenue += amount;
    } else {
      pendingRevenue += amount;
    }

    let statusBg = '#FEF3C7';
    let statusColor = '#92400E';
    let statusLabel = 'MENUNGGU PEMBAYARAN';

    if (statusLower === 'selesai') {
      statusBg = '#DCFCE7';
      statusColor = '#166534';
      statusLabel = 'SELESAI (LUNAS)';
    } else if (statusLower === 'dikirim') {
      statusBg = '#F3E8FF';
      statusColor = '#6B21A8';
      statusLabel = 'SEDANG DIKIRIM';
    } else if (statusLower === 'diproses') {
      statusBg = '#DBEAFE';
      statusColor = '#1E40AF';
      statusLabel = 'SEDANG DIPROSES';
    }

    const addressHtml = escapeHtml(order.customer_address || '-').replace(/\r?\n/g, '<br/>');

    return {
      no: index + 1,
      id: `#${order.id}`,
      dateStr,
      timeStr,
      customerName: escapeHtml(order.customer_name || '-'),
      customerPhone: escapeHtml(order.customer_phone || '-'),
      addressHtml,
      itemsListHtml,
      orderQty,
      couponCode: escapeHtml(order.coupon_code || '-'),
      statusBg,
      statusColor,
      statusLabel,
      amount,
      amountFormatted: `Rp ${amount.toLocaleString('id-ID')}`
    };
  });

  return {
    preparedRows,
    grandTotalAll,
    realizedRevenue,
    pendingRevenue,
    totalPcsSold
  };
}

/**
 * Mengunduh Laporan Pembukuan dalam format Tabel Microsoft Excel (.xls) yang sudah rapi,
 * berwarna, memiliki garis tabel (border), dan lebar kolom otomatis (tanpa perlu setting CSV).
 */
function exportOrdersToExcel(ordersToExport: any[], periodLabel = 'Semua Periode') {
  if (!ordersToExport || ordersToExport.length === 0) return;

  const {
    preparedRows,
    grandTotalAll,
    realizedRevenue,
    pendingRevenue,
    totalPcsSold
  } = buildReportSummaryAndRows(ordersToExport);

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const rowsHtml = preparedRows
    .map(
      (row, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
        <td style="border: 1pt solid #CBD5E1; padding: 8px; text-align: center; vertical-align: top;">${row.no}</td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; text-align: center; font-weight: bold; vertical-align: top;">${row.id}</td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; vertical-align: top;">${row.dateStr}<br/><span style="color: #64748B; font-size: 9pt;">${row.timeStr}</span></td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; vertical-align: top;"><strong>${row.customerName}</strong><br/><span style="color: #475569; mso-number-format:'\\@';">WA: ${row.customerPhone}</span></td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; vertical-align: top;">${row.addressHtml}</td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; vertical-align: top;">${row.itemsListHtml}</td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; text-align: center; font-weight: bold; vertical-align: top;">${row.orderQty} Pcs</td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; text-align: center; vertical-align: top;">${row.couponCode}</td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; text-align: center; font-weight: bold; background-color: ${row.statusBg}; color: ${row.statusColor}; vertical-align: top;">${row.statusLabel}</td>
        <td style="border: 1pt solid #CBD5E1; padding: 8px; text-align: right; font-weight: bold; vertical-align: top;">${row.amountFormatted}</td>
      </tr>`
    )
    .join('');

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Pembukuan MEGS</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body, table, td, th { font-family: Arial, Calibri, sans-serif; font-size: 10pt; color: #0F172A; }
        br { mso-data-placement: same-cell; }
      </style>
    </head>
    <body>
      <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <colgroup>
          <col width="45" />
          <col width="85" />
          <col width="140" />
          <col width="190" />
          <col width="290" />
          <col width="310" />
          <col width="95" />
          <col width="100" />
          <col width="160" />
          <col width="160" />
        </colgroup>
        <tr>
          <td colspan="10" style="background-color: #0F172A; color: #FFFFFF; font-size: 16pt; font-weight: bold; padding: 14px;">
            LAPORAN PEMBUKUAN &amp; PENJUALAN — MEGS APPAREL
          </td>
        </tr>
        <tr>
          <td colspan="10" style="background-color: #F1F5F9; color: #334155; font-size: 10pt; padding: 8px 14px; border-bottom: 2pt solid #CBD5E1;">
            <strong>Filter Laporan:</strong> ${escapeHtml(periodLabel)} &nbsp;|&nbsp; <strong>Tanggal Unduh:</strong> ${escapeHtml(printDate)} &nbsp;|&nbsp; <strong>Total Data:</strong> ${ordersToExport.length} Pesanan
          </td>
        </tr>
        <tr><td colspan="10" height="12"></td></tr>

        <!-- TABEL RINGKASAN KEUANGAN -->
        <tr>
          <td colspan="3" style="background-color: #DCFCE7; border: 1pt solid #86EFAC; padding: 10px;">
            <span style="font-size: 9pt; color: #166534;">UANG MASUK (DIKIRIM &amp; SELESAI)</span><br/>
            <strong style="font-size: 13pt; color: #14532D;">Rp ${realizedRevenue.toLocaleString('id-ID')}</strong>
          </td>
          <td colspan="2" style="background-color: #FEF3C7; border: 1pt solid #FDE047; padding: 10px;">
            <span style="font-size: 9pt; color: #92400E;">MENUNGGU PEMBAYARAN / DIPROSES</span><br/>
            <strong style="font-size: 13pt; color: #78350F;">Rp ${pendingRevenue.toLocaleString('id-ID')}</strong>
          </td>
          <td colspan="3" style="background-color: #DBEAFE; border: 1pt solid #93C5FD; padding: 10px;">
            <span style="font-size: 9pt; color: #1E40AF;">TOTAL NILAI SELURUH PESANAN</span><br/>
            <strong style="font-size: 13pt; color: #1E3A8A;">Rp ${grandTotalAll.toLocaleString('id-ID')}</strong>
          </td>
          <td colspan="2" style="background-color: #F1F5F9; border: 1pt solid #CBD5E1; padding: 10px;">
            <span style="font-size: 9pt; color: #475569;">TOTAL BARANG TERJUAL</span><br/>
            <strong style="font-size: 13pt; color: #0F172A;">${ordersToExport.length} Order (${totalPcsSold} Pcs)</strong>
          </td>
        </tr>
        <tr><td colspan="10" height="14"></td></tr>

        <!-- HEADER TABEL TRANSAKSI -->
        <tr style="background-color: #1E293B; color: #FFFFFF; font-weight: bold; text-align: center;">
          <th style="border: 1pt solid #334155; padding: 10px;">NO</th>
          <th style="border: 1pt solid #334155; padding: 10px;">NO. ORDER</th>
          <th style="border: 1pt solid #334155; padding: 10px;">TANGGAL PESAN</th>
          <th style="border: 1pt solid #334155; padding: 10px;">PEMBELI &amp; WA</th>
          <th style="border: 1pt solid #334155; padding: 10px;">ALAMAT &amp; KURIR PENGIRIMAN</th>
          <th style="border: 1pt solid #334155; padding: 10px;">DAFTAR BARANG &amp; UKURAN</th>
          <th style="border: 1pt solid #334155; padding: 10px;">JUMLAH</th>
          <th style="border: 1pt solid #334155; padding: 10px;">KUPON</th>
          <th style="border: 1pt solid #334155; padding: 10px;">STATUS PESANAN</th>
          <th style="border: 1pt solid #334155; padding: 10px;">TOTAL BAYAR</th>
        </tr>

        ${rowsHtml}

        <!-- BARIS TOTAL BAWAH -->
        <tr style="background-color: #0F172A; color: #FFFFFF; font-weight: bold; font-size: 11pt;">
          <td colspan="6" style="border: 1pt solid #0F172A; padding: 12px; text-align: right;">
            TOTAL KESELURUHAN (${ordersToExport.length} PESANAN):
          </td>
          <td style="border: 1pt solid #0F172A; padding: 12px; text-align: center;">
            ${totalPcsSold} Pcs
          </td>
          <td colspan="2" style="border: 1pt solid #0F172A; padding: 12px;"></td>
          <td style="border: 1pt solid #0F172A; padding: 12px; text-align: right; color: #4ADE80;">
            Rp ${grandTotalAll.toLocaleString('id-ID')}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + excelHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const safeLabel = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '-');
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Laporan-Pembukuan-MEGS-${safeLabel}-${today}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Membuka Lembar Laporan Resmi Siap Cetak / Simpan sebagai PDF (A4 Landscape)
 * yang sangat rapi dan mudah dibaca oleh Admin non-IT.
 */
function printOrSaveOrdersPDF(ordersToExport: any[], periodLabel = 'Semua Periode') {
  if (!ordersToExport || ordersToExport.length === 0) return;

  const {
    preparedRows,
    grandTotalAll,
    realizedRevenue,
    pendingRevenue,
    totalPcsSold
  } = buildReportSummaryAndRows(ordersToExport);

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const rowsHtml = preparedRows
    .map(
      row => `
      <tr>
        <td class="center">${row.no}</td>
        <td class="center bold">${row.id}</td>
        <td>${row.dateStr}<div class="muted">${row.timeStr}</div></td>
        <td><strong>${row.customerName}</strong><div class="muted">WA: ${row.customerPhone}</div></td>
        <td>${row.addressHtml}</td>
        <td>${row.itemsListHtml}</td>
        <td class="center bold">${row.orderQty} Pcs</td>
        <td class="center"><span class="badge" style="background:${row.statusBg};color:${row.statusColor};">${row.statusLabel}</span></td>
        <td class="right bold">${row.amountFormatted}</td>
      </tr>`
    )
    .join('');

  const reportWindow = window.open('', '_blank');
  if (!reportWindow) {
    alert('Mohon izinkan pop-up pada browser untuk membuka lembar cetak laporan PDF.');
    return;
  }

  reportWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Laporan Pembukuan MEGS — ${escapeHtml(periodLabel)}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0F172A;
          background: #F8FAFC;
          margin: 0;
          padding: 24px;
          font-size: 12px;
          line-height: 1.45;
        }
        .sheet {
          max-width: 1200px;
          margin: 0 auto;
          background: #FFFFFF;
          padding: 32px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }
        .action-bar {
          max-width: 1200px;
          margin: 0 auto 16px auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0F172A;
          color: #FFFFFF;
          padding: 12px 20px;
          border-radius: 6px;
        }
        .btn {
          background: #22C55E;
          color: #FFFFFF;
          border: none;
          padding: 10px 18px;
          font-weight: 700;
          font-size: 13px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-close {
          background: transparent;
          color: #CBD5E1;
          border: 1px solid #475569;
          padding: 10px 14px;
          font-weight: 600;
          font-size: 13px;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 8px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0F172A;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0 0 4px 0;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .summary-box {
          padding: 14px 16px;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
        }
        .summary-box .label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .summary-box .val {
          font-size: 18px;
          font-weight: 900;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #0F172A;
          color: #FFFFFF;
          font-size: 11px;
          text-transform: uppercase;
          padding: 10px 8px;
          border: 1px solid #0F172A;
          text-align: left;
        }
        td {
          padding: 10px 8px;
          border: 1px solid #CBD5E1;
          vertical-align: top;
        }
        tbody tr:nth-child(even) { background: #F8FAFC; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: 700; }
        .muted { color: #64748B; font-size: 11px; margin-top: 2px; }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
        }
        tfoot td {
          background: #0F172A;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 13px;
          padding: 12px 8px;
          border: 1px solid #0F172A;
        }
        @media print {
          body { background: #FFFFFF; padding: 0; }
          .action-bar { display: none !important; }
          .sheet { border: none; box-shadow: none; padding: 0; max-width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="action-bar">
        <div>
          <strong>Pratinjau Laporan Siap Cetak / PDF</strong> — Klik tombol hijau di kanan, lalu pilih <em>"Save as PDF" (Simpan sebagai PDF)</em> atau pilih Printer Anda.
        </div>
        <div>
          <button class="btn" onclick="window.print()">🖨 CETAK / SIMPAN SEBAGAI PDF</button>
          <button class="btn-close" onclick="window.close()">✕ TUTUP</button>
        </div>
      </div>

      <div class="sheet">
        <div class="header">
          <div>
            <h1>LAPORAN PEMBUKUAN &amp; PENJUALAN MEGS APPAREL</h1>
            <div class="muted">Asal Pengiriman: Cicurug, Kab. Sukabumi, Jawa Barat</div>
          </div>
          <div class="right">
            <div><strong>Periode / Filter:</strong> ${escapeHtml(periodLabel)}</div>
            <div class="muted">Dicetak pada: ${escapeHtml(printDate)}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-box" style="background:#F0FDF4;border-color:#86EFAC;">
            <div class="label" style="color:#166534;">Uang Masuk (Dikirim &amp; Selesai)</div>
            <div class="val" style="color:#14532D;">Rp ${realizedRevenue.toLocaleString('id-ID')}</div>
          </div>
          <div class="summary-box" style="background:#FFFBEB;border-color:#FDE047;">
            <div class="label" style="color:#92400E;">Menunggu Pembayaran / Diproses</div>
            <div class="val" style="color:#78350F;">Rp ${pendingRevenue.toLocaleString('id-ID')}</div>
          </div>
          <div class="summary-box" style="background:#EFF6FF;border-color:#93C5FD;">
            <div class="label" style="color:#1E40AF;">Total Nilai Seluruh Pesanan</div>
            <div class="val" style="color:#1E3A8A;">Rp ${grandTotalAll.toLocaleString('id-ID')}</div>
          </div>
          <div class="summary-box" style="background:#F8FAFC;border-color:#CBD5E1;">
            <div class="label" style="color:#475569;">Total Pesanan &amp; Barang</div>
            <div class="val" style="color:#0F172A;">${ordersToExport.length} Order (${totalPcsSold} Pcs)</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="center" style="width:36px;">No</th>
              <th class="center" style="width:70px;">Order</th>
              <th style="width:115px;">Tanggal</th>
              <th style="width:150px;">Pembeli &amp; WA</th>
              <th>Alamat Tujuan &amp; Kurir</th>
              <th>Daftar Barang Dipesan</th>
              <th class="center" style="width:65px;">Jumlah</th>
              <th class="center" style="width:130px;">Status</th>
              <th class="right" style="width:125px;">Total Bayar</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" class="right">TOTAL KESELURUHAN (${ordersToExport.length} PESANAN):</td>
              <td class="center">${totalPcsSold} Pcs</td>
              <td></td>
              <td class="right" style="color:#4ADE80;">Rp ${grandTotalAll.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </body>
    </html>
  `);
  reportWindow.document.close();
}

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </Router>
  );
}

function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem('megs_admin_token')
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem('megs_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        alert('ACCESS DENIED: ' + (data.error || 'INVALID CREDENTIALS'));
        setPassword('');
      }
    } catch (e) {
      alert('LOGIN ERROR');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--color-bg-main)', color: 'var(--color-text-main)', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} style={{ background: 'var(--color-bg-card)', padding: '4rem', border: '1px solid var(--color-border)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, color: 'var(--color-white)', fontSize: '2.5rem', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '0.5rem' }}>SYSTEM<br />LOCKED</h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>RESTRICTED ACCESS</p>
          </div>
          <input
            type="text"
            placeholder="USERNAME"
            className="input-text"
            style={{ textAlign: 'center', letterSpacing: '0.1em' }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="PASSWORD"
            className="input-text"
            style={{ textAlign: 'center', letterSpacing: '0.2em' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>AUTHORIZE</button>
          <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', textDecoration: 'underline' }}>RETURN TO APP</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-mobile-header">
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, color: 'var(--color-white)', fontSize: '1.5rem', letterSpacing: '-0.05em', margin: 0 }}>MEGS OS</h2>
        <button className="admin-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          ☰
        </button>
      </div>
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, color: 'var(--color-white)', marginBottom: '3rem', fontSize: '2rem', letterSpacing: '-0.05em', display: 'block' }}>MEGS OS</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-mono)' }}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>DASHBOARD</Link>
          <Link to="/bookkeeping" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-white)', fontWeight: 700, fontSize: '0.8rem', borderLeft: '2px solid var(--color-white)', paddingLeft: '0.6rem' }}>PEMBUKUAN</Link>
          <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>ORDERS</Link>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>PRODUCTS</Link>
          <Link to="/products-thrive" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>PRODUCT MEGS THRIVES</Link>
          <Link to="/articles" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>JOURNAL ARTICLES</Link>
          <Link to="/create-yours" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>CREATE YOURS</Link>
          <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>HOME SETTINGS</Link>
          <Link to="/megs-thrive" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>MEGS THRIVE</Link>
          <Link to="/manage-admins" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>MANAGE ADMINS</Link>
          <Link to="/coupons" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>COUPONS</Link>
          <button onClick={() => { sessionStorage.removeItem('megs_admin_token'); setIsAuthenticated(false); }} style={{ color: '#ff4444', fontSize: '0.8rem', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>LOGOUT</button>
        </nav>
      </aside>
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/bookkeeping" element={<AdminBookkeeping />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/products" element={<AdminProductList type="origin" />} />
          <Route path="/products/new" element={<AdminProductForm type="origin" />} />
          <Route path="/products/edit/:id" element={<AdminProductForm type="origin" />} />
          <Route path="/products-thrive" element={<AdminProductList type="thrive" />} />
          <Route path="/products-thrive/new" element={<AdminProductForm type="thrive" />} />
          <Route path="/products-thrive/edit/:id" element={<AdminProductForm type="thrive" />} />
          <Route path="/articles" element={<AdminArticleList />} />
          <Route path="/articles/new" element={<AdminArticleForm />} />
          <Route path="/articles/edit/:id" element={<AdminArticleForm />} />
          <Route path="/create-yours" element={<AdminCreateYoursList />} />
          <Route path="/create-yours/new" element={<AdminCreateYoursForm />} />
          <Route path="/create-yours/edit/:id" element={<AdminCreateYoursForm />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/megs-thrive" element={<AdminMegsThrive />} />
          <Route path="/manage-admins" element={<ManageAdmins />} />
          <Route path="/coupons" element={<AdminCoupons />} />
        </Routes>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const totalOrders = data.length;
          const pendingOrders = data.filter(o => o.status === 'menunggu pembayaran').length;
          const totalRevenue = data
            .filter(o => o.status === 'selesai' || o.status === 'dikirim')
            .reduce((sum, order) => sum + (parseInt(order.total_price) || 0), 0);
          
          setStats({ totalOrders, pendingOrders, totalRevenue });
          setAllOrders(data);
          setRecentOrders(data.slice(0, 5));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ fontFamily: 'var(--font-mono)' }}>Loading overview...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>Overview</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/bookkeeping" className="btn-secondary" style={{ padding: '0.75rem 1.25rem', fontSize: '0.8rem', textDecoration: 'none' }}>
            BUKA PEMBUKUAN LENGKAP &rarr;
          </Link>
          <button
            type="button"
            onClick={() => printOrSaveOrdersPDF(allOrders, 'Semua Periode')}
            disabled={allOrders.length === 0}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.8rem', opacity: allOrders.length === 0 ? 0.5 : 1, cursor: allOrders.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            🖨 CETAK / SIMPAN PDF
          </button>
          <button
            type="button"
            onClick={() => exportOrdersToExcel(allOrders, 'Semua Periode')}
            disabled={allOrders.length === 0}
            className="btn-primary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.8rem', opacity: allOrders.length === 0 ? 0.5 : 1, cursor: allOrders.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            ⬇ UNDUH TABEL EXCEL RAPI ({allOrders.length})
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)', borderLeft: '4px solid var(--color-text-main)' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>TOTAL REVENUE (Dikirim/Selesai)</h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 900, margin: 0 }}>Rp. {stats.totalRevenue.toLocaleString('id-ID')}</p>
        </div>
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)', borderLeft: '4px solid #ff9900' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>PENDING ORDERS (Menunggu Pembayaran)</h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 900, margin: 0 }}>{stats.pendingOrders}</p>
        </div>
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)', borderLeft: '4px solid #4CAF50' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>TOTAL ORDERS (All Status)</h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 900, margin: 0 }}>{stats.totalOrders}</p>
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Recent Orders</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>ID</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>DATE</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>CUSTOMER</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>STATUS</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem 0' }}>#{order.id}</td>
                <td style={{ padding: '1rem 0' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem 0' }}>{order.customer_name}</td>
                <td style={{ padding: '1rem 0' }}>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    background: order.status === 'selesai' ? '#4CAF50' : order.status === 'dikirim' ? '#9C27B0' : order.status === 'diproses' ? '#2196F3' : order.status === 'menunggu pembayaran' ? '#ff9900' : 'var(--color-border)', 
                    color: '#fff', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 0' }}>Rp. {(parseInt(order.total_price) || 0).toLocaleString('id-ID')}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>No recent orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminBookkeeping() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [periodPreset, setPeriodPreset] = useState<'ALL' | 'TODAY' | '7DAYS' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(err => console.error('Failed to load bookkeeping data', err))
      .finally(() => setLoading(false));
  }, []);

  const applyPreset = (preset: 'ALL' | 'TODAY' | '7DAYS' | 'MONTH') => {
    setPeriodPreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7DAYS') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      setStartDate(sevenDaysAgo.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === 'MONTH') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDayOfMonth.toISOString().slice(0, 10));
      setEndDate(todayStr);
    }
  };

  const filteredOrders = orders.filter(order => {
    const statusLower = String(order.status || 'menunggu pembayaran').toLowerCase();
    if (statusFilter === 'REALIZED') {
      if (statusLower !== 'selesai' && statusLower !== 'dikirim') return false;
    } else if (statusFilter !== 'ALL') {
      if (statusLower !== statusFilter.toLowerCase()) return false;
    }

    if (startDate || endDate) {
      const orderDate = order.created_at ? new Date(order.created_at) : null;
      if (!orderDate || isNaN(orderDate.getTime())) return false;
      const orderDateStr = orderDate.toISOString().slice(0, 10);
      if (startDate && orderDateStr < startDate) return false;
      if (endDate && orderDateStr > endDate) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(order.id).includes(q);
      const matchName = String(order.customer_name || '').toLowerCase().includes(q);
      const matchPhone = String(order.customer_phone || '').toLowerCase().includes(q);
      const matchAddress = String(order.customer_address || '').toLowerCase().includes(q);
      const matchItems = String(order.order_items || '').toLowerCase().includes(q);
      const matchCoupon = String(order.coupon_code || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchAddress && !matchItems && !matchCoupon) {
        return false;
      }
    }

    return true;
  });

  const realizedRevenue = filteredOrders
    .filter(o => {
      const s = String(o.status || '').toLowerCase();
      return s === 'selesai' || s === 'dikirim';
    })
    .reduce((sum, o) => sum + (parseInt(String(o.total_price || '0').replace(/\D/g, ''), 10) || 0), 0);

  const pendingRevenue = filteredOrders
    .filter(o => {
      const s = String(o.status || '').toLowerCase();
      return s !== 'selesai' && s !== 'dikirim';
    })
    .reduce((sum, o) => sum + (parseInt(String(o.total_price || '0').replace(/\D/g, ''), 10) || 0), 0);

  const totalGrossFiltered = realizedRevenue + pendingRevenue;

  const totalPcsFiltered = filteredOrders.reduce((sum, o) => {
    try {
      const items = JSON.parse(o.order_items || '[]');
      if (Array.isArray(items)) {
        return sum + items.reduce((acc, i) => acc + (parseInt(i.quantity) || 1), 0);
      }
    } catch {}
    return sum;
  }, 0);

  return (
    <div style={{ maxWidth: '1300px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>
            REKAPITULASI KEUANGAN &amp; PENJUALAN MUDAH DIBACA
          </span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>
            Pembukuan &amp; Laporan
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              const label = startDate || endDate
                ? `Periode ${startDate || 'Awal'} s/d ${endDate || 'Akhir'}`
                : statusFilter === 'ALL'
                  ? 'Semua Periode'
                  : `Status ${statusFilter}`;
              printOrSaveOrdersPDF(filteredOrders, label);
            }}
            disabled={filteredOrders.length === 0}
            className="btn-secondary"
            style={{
              padding: '0.9rem 1.4rem',
              fontSize: '0.82rem',
              opacity: filteredOrders.length === 0 ? 0.5 : 1,
              cursor: filteredOrders.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            🖨 CETAK / SIMPAN PDF RAPI
          </button>

          <button
            type="button"
            onClick={() => {
              const label = startDate || endDate
                ? `${startDate || 'Awal'}-sd-${endDate || 'Akhir'}`
                : statusFilter === 'ALL'
                  ? 'Semua-Periode'
                  : statusFilter;
              exportOrdersToExcel(filteredOrders, label);
            }}
            disabled={filteredOrders.length === 0}
            className="btn-primary"
            style={{
              padding: '0.9rem 1.6rem',
              fontSize: '0.82rem',
              opacity: filteredOrders.length === 0 ? 0.5 : 1,
              cursor: filteredOrders.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ⬇ UNDUH TABEL EXCEL RAPI ({filteredOrders.length} ORDER)
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'SEMUA WAKTU' },
              { id: 'TODAY', label: 'HARI INI' },
              { id: '7DAYS', label: '7 HARI TERAKHIR' },
              { id: 'MONTH', label: 'BULAN INI' }
            ].map(preset => {
              const active = periodPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id as any)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--color-border)',
                    background: active ? 'var(--color-white)' : 'transparent',
                    color: active ? 'var(--color-bg-main)' : 'var(--color-text-main)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: active ? 700 : 400,
                    cursor: 'pointer'
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {(startDate || endDate || statusFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setPeriodPreset('ALL');
                setStartDate('');
                setEndDate('');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff4444',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              RESET FILTER
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="control-group" style={{ marginBottom: 0 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>DARI TANGGAL</label>
            <input
              type="date"
              className="input-text"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setPeriodPreset('CUSTOM');
              }}
            />
          </div>

          <div className="control-group" style={{ marginBottom: 0 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>SAMPAI TANGGAL</label>
            <input
              type="date"
              className="input-text"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setPeriodPreset('CUSTOM');
              }}
            />
          </div>

          <div className="control-group" style={{ marginBottom: 0 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>STATUS PESANAN</label>
            <select
              className="input-text"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">SEMUA STATUS</option>
              <option value="REALIZED">PENDAPATAN BERSIH (DIKIRIM & SELESAI)</option>
              <option value="menunggu pembayaran">MENUNGGU PEMBAYARAN</option>
              <option value="diproses">DIPROSES</option>
              <option value="dikirim">DIKIRIM</option>
              <option value="selesai">SELESAI</option>
            </select>
          </div>

          <div className="control-group" style={{ marginBottom: 0 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>CARI TRANSAKSI</label>
            <input
              type="text"
              className="input-text"
              placeholder="Nama, ID, produk, kota..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)', borderLeft: '4px solid #4CAF50' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            PENDAPATAN TEREALISASI (DIKIRIM/SELESAI)
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, margin: 0, color: '#4CAF50' }}>
            Rp. {realizedRevenue.toLocaleString('id-ID')}
          </p>
        </div>

        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)', borderLeft: '4px solid #ff9900' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            POTENSI TERTUNDA (BELUM DIKIRIM)
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>
            Rp. {pendingRevenue.toLocaleString('id-ID')}
          </p>
        </div>

        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)', borderLeft: '4px solid var(--color-white)' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            TOTAL NILAI TRANSAKSI (TERFILTER)
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>
            Rp. {totalGrossFiltered.toLocaleString('id-ID')}
          </p>
        </div>

        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)', borderLeft: '4px solid #2196F3' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            VOLUME PENJUALAN
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>
            {filteredOrders.length} Order <span style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>({totalPcsFiltered} Pcs)</span>
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            Memuat data pembukuan...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            Tidak ada data transaksi yang sesuai dengan filter periode/status saat ini.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', background: 'var(--color-bg-main)' }}>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>TANGGAL</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>PELANGGAN</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>RINCIAN PRODUK</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>QTY</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>KUPON</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>STATUS</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>TOTAL (RP)</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                let items: any[] = [];
                try {
                  items = JSON.parse(order.order_items || '[]');
                } catch {}
                const qty = Array.isArray(items)
                  ? items.reduce((s, i) => s + (parseInt(i.quantity) || 1), 0)
                  : 0;
                const amount = parseInt(String(order.total_price || '0').replace(/\D/g, ''), 10) || 0;

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>#{order.id}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700 }}>{order.customer_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{order.customer_phone}</div>
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '320px' }}>
                      {Array.isArray(items) && items.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                          • {item.quantity}x {item.name} {item.selectedSize ? `(${item.selectedSize})` : ''}
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '1rem' }}>{qty} pcs</td>
                    <td style={{ padding: '1rem' }}>{order.coupon_code || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          background:
                            order.status === 'selesai'
                              ? '#4CAF50'
                              : order.status === 'dikirim'
                                ? '#9C27B0'
                                : order.status === 'diproses'
                                  ? '#2196F3'
                                  : order.status === 'menunggu pembayaran'
                                    ? '#ff9900'
                                    : 'var(--color-border)',
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      Rp. {amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--color-border)', background: 'var(--color-bg-main)', fontWeight: 900 }}>
                <td colSpan={4} style={{ padding: '1rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>
                  TOTAL KESELURUHAN ({filteredOrders.length} TRANSAKSI)
                </td>
                <td style={{ padding: '1rem' }}>{totalPcsFiltered} pcs</td>
                <td colSpan={2} style={{ padding: '1rem' }}></td>
                <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1rem', color: '#4CAF50' }}>
                  Rp. {totalGrossFiltered.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' }
      });
      fetchOrders();
    } catch (e) {
      alert('Error deleting order');
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>Orders</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => printOrSaveOrdersPDF(orders, 'Daftar Semua Pesanan')}
            disabled={orders.length === 0}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.8rem', opacity: orders.length === 0 ? 0.5 : 1, cursor: orders.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            🖨 CETAK / SIMPAN PDF
          </button>
          <button
            type="button"
            onClick={() => exportOrdersToExcel(orders, 'Daftar-Orders')}
            disabled={orders.length === 0}
            className="btn-primary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.8rem', opacity: orders.length === 0 ? 0.5 : 1, cursor: orders.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            ⬇ UNDUH TABEL EXCEL RAPI ({orders.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <p>Loading...</p> : orders.length === 0 ? <p>No orders found.</p> : orders.map(order => {
          let items = [];
          try { items = JSON.parse(order.order_items); } catch (e) { }

          return (
            <div key={order.id} style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-order-header">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>ORDER #{order.id}</h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    style={{
                      background: order.status === 'selesai' ? '#4CAF50' : order.status === 'dikirim' ? '#9C27B0' : order.status === 'diproses' ? '#2196F3' : 'var(--color-bg-main)',
                      color: order.status === 'menunggu pembayaran' ? 'var(--color-text-main)' : 'white',
                      border: '1px solid var(--color-border)', padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 'bold'
                    }}
                  >
                    <option value="menunggu pembayaran">MENUNGGU PEMBAYARAN</option>
                    <option value="diproses">DIPROSES</option>
                    <option value="dikirim">DIKIRIM</option>
                    <option value="selesai">SELESAI</option>
                  </select>
                  <button onClick={() => handleDelete(order.id)} style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>DELETE</button>
                </div>
              </div>

              <div className="admin-grid-2" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>CUSTOMER INFO</h4>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', margin: '0 0 0.2rem 0' }}><strong>Name:</strong> {order.customer_name}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', margin: '0 0 0.2rem 0' }}><strong>Phone:</strong> {order.customer_phone}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', margin: 0 }}><strong>Address:</strong> {order.customer_address}</p>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>ITEMS ({items.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        <span>{item.quantity}x {item.name} {item.selectedSize ? `(Size: ${item.selectedSize})` : ''}</span>
                        <span>{item.price}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', marginTop: '0.5rem', paddingTop: '0.5rem', fontFamily: 'var(--font-sans)', fontWeight: 900 }}>
                      <span>TOTAL</span>
                      <span>{order.total_price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminProductList({ type = 'origin' }: { type?: 'origin' | 'thrive' }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = React.useCallback(async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const filtered = type === 'thrive'
          ? data.filter(p => p.category.startsWith('thrive_'))
          : data.filter(p => !p.category.startsWith('thrive_'));
        setProducts(filtered);
      }
    } catch {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' }
      });
      fetchProducts();
    } catch (e: any) {
      alert('Error deleting product');
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>
          {type === 'thrive' ? 'Products Megs Thrive' : 'Products Origin'}
        </h2>
        <Link to={type === 'thrive' ? "/products-thrive/new" : "/products/new"} className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>+ ADD NEW</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <p>Loading...</p> : products.length === 0 ? <p>No products yet.</p> : products.map(product => {
          let displayImg = product.img;
          try {
            const parsed = JSON.parse(product.img);
            if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
          } catch (e) { }
          return (
            <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {displayImg && <img src={displayImg} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>{product.name}</h4>
                  <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{product.price} // {product.category.toUpperCase()}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={type === 'thrive' ? `/products-thrive/edit/${product.id}` : `/products/edit/${product.id}`} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>EDIT</Link>
                <button onClick={() => handleDelete(product.id)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>DELETE</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

const MAX_IMAGE_SIZE_MB = 15;
const MAX_IMAGE_DIMENSION_PX = 1600;

/**
 * Mengoptimalkan resolusi/ukuran foto secara otomatis di browser (tetap tajam HD & menjaga transparansi PNG/WebP),
 * lalu mengunggahnya ke endpoint /api/upload (chunked storage) agar tidak membebani baris database produk.
 */
async function optimizeAndUploadImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    const fileMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Ukuran foto "${file.name}" (${fileMb} MB) melebihi batas maksimal ${MAX_IMAGE_SIZE_MB} MB per foto.`
    );
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error(`Gagal membaca file "${file.name}".`));
    reader.readAsDataURL(file);
  });

  const optimizedDataUrl = await new Promise<string>(resolve => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION_PX || height > MAX_IMAGE_DIMENSION_PX) {
        if (width >= height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION_PX) / width);
          width = MAX_IMAGE_DIMENSION_PX;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION_PX) / height);
          height = MAX_IMAGE_DIMENSION_PX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawDataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const isTransparentType = file.type === 'image/png' || file.type === 'image/webp';
      const targetMime = isTransparentType ? 'image/webp' : 'image/jpeg';
      const compressed = canvas.toDataURL(targetMime, 0.86);
      resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });

  // Unggah ke endpoint chunked media storage (/api/upload) agar hanya menyimpan URL ringan
  try {
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787';
    const res = await fetch(`${apiUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || ''
      },
      body: JSON.stringify({ file: optimizedDataUrl })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return `${apiUrl}${data.url}`;
      }
    }
  } catch {
    // Jika gagal menghubungi /api/upload, gunakan hasil kompresi HD sebagai fallback
  }

  return optimizedDataUrl;
}

function AdminProductForm({ type = 'origin' }: { type?: 'origin' | 'thrive' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(type === 'thrive' ? 'thrive_tops' : 'tops');
  const [description, setDescription] = useState('');
  const [stockS, setStockS] = useState(0);
  const [stockM, setStockM] = useState(0);
  const [stockL, setStockL] = useState(0);
  const [stockXL, setStockXL] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [status, setStatus] = useState('');
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit) {
      fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name || '');
          setPrice(data.price || '');
          setCategory(data.category || 'tops');
          setDescription(data.description || '');

          if (data.sizes) {
            try {
              const parsedSizes = JSON.parse(data.sizes);
              if (Array.isArray(parsedSizes)) {
                let s = 0, m = 0, l = 0, xl = 0;
                parsedSizes.forEach(item => {
                  if (typeof item === 'string') {
                    if (item.toUpperCase() === 'S') s = 1;
                    if (item.toUpperCase() === 'M') m = 1;
                    if (item.toUpperCase() === 'L') l = 1;
                    if (item.toUpperCase() === 'XL') xl = 1;
                  } else {
                    const size = item.size?.toUpperCase();
                    if (size === 'S') s = item.stock || 0;
                    if (size === 'M') m = item.stock || 0;
                    if (size === 'L') l = item.stock || 0;
                    if (size === 'XL') xl = item.stock || 0;
                  }
                });
                setStockS(s); setStockM(m); setStockL(l); setStockXL(xl);
              }
            } catch (e) {
              // ignore
            }
          }

          if (data.img) {
            try {
              const parsedImages = JSON.parse(data.img);
              setImages(Array.isArray(parsedImages) ? parsedImages : [data.img]);
            } catch (e) {
              setImages([data.img]);
            }
          }
        });
    } else {
      setName('');
      setPrice('');
      setCategory(type === 'thrive' ? 'thrive_tops' : 'tops');
      setDescription('');
      setStockS(0); setStockM(0); setStockL(0); setStockXL(0);
      setImages([]);
      setStatus('');
    }
  }, [id, isEdit, type]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImages(true);
    setStatus(`Mengoptimalkan & mengunggah ${files.length} foto... Mohon tunggu sebentar.`);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await optimizeAndUploadImage(file);
        uploadedUrls.push(url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
      setStatus(`${files.length} foto berhasil diunggah! Klik tombol simpan di bawah untuk menyimpan produk.`);
    } catch (err: any) {
      setStatus(err.message || 'Gagal mengunggah foto. Pastikan ukuran foto maksimal 15 MB.');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    const sizesArray = [
      { size: 'S', stock: stockS },
      { size: 'M', stock: stockM },
      { size: 'L', stock: stockL },
      { size: 'XL', stock: stockXL }
    ];
    try {
      const url = isEdit ? `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products/${id}` : `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' },
        body: JSON.stringify({
          name,
          price,
          img: JSON.stringify(images),
          category,
          description,
          sizes: JSON.stringify(sizesArray)
        })
      });
      if (res.ok) {
        setStatus(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
        if (!isEdit) {
          setName(''); setPrice(''); setImages([]); setDescription(''); setStockS(0); setStockM(0); setStockL(0); setStockXL(0);
        }
        setTimeout(() => navigate(type === 'thrive' ? '/products-thrive' : '/products'), 1500);
      } else {
        setStatus('Error saving product');
      }
    } catch (e: any) {
      setStatus(e.message);
    }
  };

  const handleDragStart = (idx: number) => setDraggedImageIndex(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (idx: number) => {
    if (draggedImageIndex === null || draggedImageIndex === idx) return;
    const newImages = [...images];
    const draggedImg = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(idx, 0, draggedImg);
    setImages(newImages);
    setDraggedImageIndex(null);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to={type === 'thrive' ? "/products-thrive" : "/products"} style={{ textDecoration: 'none', color: 'var(--color-text-muted)' }}>←</Link>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)' }}>
        <div className="control-group">
          <label>NAME</label>
          <input className="input-text" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. VISCO JERSEY" />
        </div>
        <div className="control-group">
          <label>PRICE</label>
          <input className="input-text" type="text" required value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. IDR 250.000" />
        </div>
        <div className="control-group">
          <label>CATEGORY</label>
          <select className="input-text" value={category} onChange={e => setCategory(e.target.value)} style={{ background: 'var(--color-bg-main)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', padding: '1rem', fontFamily: 'var(--font-mono)' }}>
            {type === 'thrive' ? (
              <>
                <option value="thrive_tops">Tops</option>
                <option value="thrive_bottoms">Bottoms</option>
              </>
            ) : (
              <>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="accessories">Accessories</option>
              </>
            )}
          </select>
        </div>
        <div className="control-group">
          <label>DESCRIPTION</label>
          <textarea className="input-text" required value={description} onChange={e => setDescription(e.target.value)} placeholder="Product description..." style={{ minHeight: '100px' }} />
        </div>
        <div className="control-group">
          <label>STOCK PER SIZE</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Size S</label>
              <input className="input-text" type="number" min="0" value={stockS} onChange={e => setStockS(parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Size M</label>
              <input className="input-text" type="number" min="0" value={stockM} onChange={e => setStockM(parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Size L</label>
              <input className="input-text" type="number" min="0" value={stockL} onChange={e => setStockL(parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Size XL</label>
              <input className="input-text" type="number" min="0" value={stockXL} onChange={e => setStockXL(parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
        <div className="control-group">
          <label>PRODUCT IMAGES (MAKS. {MAX_IMAGE_SIZE_MB} MB / FOTO)</label>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>
            Bisa pilih banyak foto sekaligus (JPG, PNG, WEBP hingga {MAX_IMAGE_SIZE_MB} MB per foto). Sistem otomatis mengoptimalkan resolusi HD &amp; menyimpan ke server agar tidak pernah gagal disimpan.
          </p>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <button type="button" className="btn-secondary" style={{ width: '100%', opacity: isUploadingImages ? 0.6 : 1 }} disabled={isUploadingImages}>
              {isUploadingImages
                ? 'SEDANG MENGUNGGAH & MENGOPTIMALKAN FOTO...'
                : images.length > 0
                  ? `${images.length} FOTO TERUNGGAH ✓ (+ TAMBAH FOTO LAGI)`
                  : '+ PILIH & UPLOAD FOTO PRODUK (BISA BANYAK SEKALIGUS)'}
            </button>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={isUploadingImages}
              onChange={handleImageUpload}
              style={{ fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: isUploadingImages ? 'not-allowed' : 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto' }}>
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx)}
                style={{ position: 'relative', height: '100px', width: '100px', flexShrink: 0, cursor: 'grab', opacity: draggedImageIndex === idx ? 0.5 : 1, border: '1px solid var(--color-border)' }}
              >
                <img src={imgSrc} alt={`Preview ${idx}`} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}>X</button>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={isUploadingImages}
          className="btn-primary"
          style={{ alignSelf: 'flex-start', opacity: isUploadingImages ? 0.5 : 1, cursor: isUploadingImages ? 'not-allowed' : 'pointer' }}
        >
          {isUploadingImages ? 'MENUNGGU UPLOAD FOTO...' : isEdit ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}
        </button>
        {status && <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{status}</p>}
      </form>
    </div>
  );
}

function AdminArticleList() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`);
      const data = await res.json();
      setArticles(data);
    } catch {
      console.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' }
      });
      fetchArticles();
    } catch (e: any) {
      alert('Error deleting article');
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>Journal Articles</h2>
        <Link to="/articles/new" className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>+ ADD NEW</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <p>Loading...</p> : articles.length === 0 ? <p>No articles yet.</p> : articles.map(article => {
          let displayImg = null;
          try {
            const parsed = typeof article.images === 'string' ? JSON.parse(article.images) : article.images;
            if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
          } catch (e) { }
          return (
            <div key={article.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {displayImg && <img src={displayImg} alt={article.title} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>{article.title}</h4>
                  <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/articles/edit/${article.id}`} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>EDIT</Link>
                <button onClick={() => handleDelete(article.id)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>DELETE</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function AdminArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [createdAt, setCreatedAt] = useState('');
  const [status, setStatus] = useState('');
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit) {
      fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles/${id}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          if (data.created_at) {
            setCreatedAt(data.created_at.replace(' ', 'T').substring(0, 16));
          }
          if (data.images) {
            try {
              const parsed = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
              setImages(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
              setImages([]);
            }
          }
        });
    }
  }, [id, isEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setStatus(`Mengoptimalkan & mengunggah ${files.length} foto artikel...`);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await optimizeAndUploadImage(file);
        uploadedUrls.push(url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
      setStatus(`${files.length} foto artikel berhasil diunggah!`);
    } catch (err: any) {
      setStatus(err.message || 'Gagal mengunggah foto artikel.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const url = isEdit ? `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles/${id}` : `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || ''
        },
        body: JSON.stringify({ title, excerpt, content, images, created_at: createdAt ? createdAt.replace('T', ' ') + ':00' : undefined })
      });
      if (res.ok) {
        setStatus(isEdit ? 'Article updated successfully!' : 'Article posted successfully!');
        if (!isEdit) {
          setTitle(''); setExcerpt(''); setContent(''); setImages([]); setCreatedAt('');
        }
        setTimeout(() => navigate('/articles'), 1500);
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          setStatus(`Error: ${error.error}`);
        } catch {
          setStatus(`Error: API not found. Please run the app using wrangler pages dev.`);
        }
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  const handleDragStart = (idx: number) => setDraggedImageIndex(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (idx: number) => {
    if (draggedImageIndex === null || draggedImageIndex === idx) return;
    const newImages = [...images];
    const draggedImg = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(idx, 0, draggedImg);
    setImages(newImages);
    setDraggedImageIndex(null);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/articles" style={{ textDecoration: 'none', color: 'var(--color-text-muted)' }}>←</Link>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>
          {isEdit ? 'Edit Article' : 'New Article'}
        </h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="control-group">
          <label>TITLE</label>
          <input className="input-text" type="text" required value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="control-group">
          <label>DATE (CREATED AT)</label>
          <input className="input-text" type="datetime-local" value={createdAt} onChange={e => setCreatedAt(e.target.value)} />
        </div>
        <div className="control-group">
          <label>IMAGES (GALLERY)</label>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <button type="button" className="btn-secondary" style={{ width: '100%' }}>
              {images.length > 0 ? `${images.length} IMAGES UPLOADED ✓` : '+ UPLOAD PHOTOS'}
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer' }}
            />
          </div>
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginTop: '1rem', paddingBottom: '10px' }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(i)}
                  style={{ position: 'relative', height: '100px', width: '100px', flexShrink: 0, cursor: 'grab', opacity: draggedImageIndex === i ? 0.5 : 1 }}
                >
                  <img src={img} alt={`Preview ${i}`} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="control-group">
          <label>EXCERPT (SHORT DESCRIPTION)</label>
          <textarea className="input-text" required rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)} />
        </div>
        <div className="control-group">
          <label>CONTENT (MARKDOWN)</label>
          <textarea className="input-text" required rows={15} value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>{isEdit ? 'UPDATE ARTICLE' : 'POST ARTICLE'}</button>
        {status && <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>{status}</p>}
      </form>
    </div>
  );
}

// --- ADMIN CREATE YOURS ---
function AdminCreateYoursList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch create yours items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' }
      });
      fetchItems();
    } catch (e) {
      alert('Error deleting item');
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>Create Yours Options</h2>
        <Link to="/create-yours/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>+ ADD ITEM</Link>
      </div>

      {loading ? <p>Loading...</p> : items.length === 0 ? <p>No items found.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>ID</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>IMAGE</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>NAME</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem' }}>{item.id}</td>
                <td style={{ padding: '1rem' }}>
                  {item.image ? <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} /> : 'NO IMG'}
                </td>
                <td style={{ padding: '1rem' }}>{item.name}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to={`/create-yours/edit/${item.id}`} style={{ color: 'var(--color-text-main)', textDecoration: 'underline' }}>EDIT</Link>
                    <button onClick={() => handleDelete(item.id)} style={{ color: '#ff4444', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>DELETE</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AdminCreateYoursForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', image: '', description: '' });
  const [formFields, setFormFields] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const item = data.find(i => i.id === Number(id));
            if (item) {
              setFormData({ name: item.name, image: item.image, description: item.description || '' });
              if (item.form_config) {
                try {
                  setFormFields(JSON.parse(item.form_config));
                } catch(e) {}
              }
            }
          }
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours${id ? `/${id}` : ''}`;

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' },
        body: JSON.stringify({ ...formData, form_config: JSON.stringify(formFields) })
      });
      navigate('/create-yours');
    } catch (err) {
      alert('Error saving item');
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/create-yours" style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', textDecoration: 'none', color: 'var(--color-text-muted)' }}>← BACK</Link>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>
          {id ? 'Edit Item' : 'New Item'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>NAME (E.G. JERSEY)</label>
          <input required type="text" className="input-text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>UPLOAD IMAGE</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                setFormData({ ...formData, image: event.target?.result as string });
              };
              reader.readAsDataURL(file);
            }}
            style={{ color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
          />
          {formData.image && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>PREVIEW:</p>
              <img src={formData.image} alt="Preview" style={{ width: '200px', height: '200px', objectFit: 'cover', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>DESCRIPTION (OPTIONAL)</label>
          <textarea className="input-text" style={{ minHeight: '100px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-bg-main)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>FORM BUILDER & PRICING</h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Tambahkan field (seperti "Bahan", "Paket") dan atur pilihan beserta harga tambahannya (additive pricing).
          </p>

          {formFields.map((field, fieldIdx) => (
            <div key={fieldIdx} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => setFormFields(formFields.filter((_, i) => i !== fieldIdx))}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-border)', color: 'var(--color-white)', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              >
                HAPUS FIELD
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', maxWidth: '300px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>NAMA FIELD (Contoh: PANTS / NAMA PAKET)</label>
                <input 
                  type="text" 
                  className="input-text" 
                  value={field.label} 
                  onChange={e => {
                    const newFields = [...formFields];
                    newFields[fieldIdx].label = e.target.value;
                    setFormFields(newFields);
                  }} 
                />
              </div>

              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '1rem' }}>PILIHAN (OPTIONS)</h4>
              
              {field.options.map((option: any, optIdx: number) => (
                <div key={optIdx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', display: 'block', marginBottom: '0.3rem' }}>LABEL (Contoh: BASIC)</label>
                    <input 
                      type="text" 
                      className="input-text" 
                      value={option.label}
                      onChange={e => {
                        const newFields = [...formFields];
                        newFields[fieldIdx].options[optIdx].label = e.target.value;
                        newFields[fieldIdx].options[optIdx].value = e.target.value;
                        setFormFields(newFields);
                      }}
                    />
                  </div>
                  <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', display: 'block', marginBottom: '0.3rem' }}>HARGA TAMBAHAN (+/- Rp)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Rp</span>
                      <input 
                        type="number" 
                        className="input-text" 
                        value={option.priceModifier === 0 ? '' : option.priceModifier}
                        onChange={e => {
                          const newFields = [...formFields];
                          const val = e.target.value;
                          newFields[fieldIdx].options[optIdx].priceModifier = val === '' ? 0 : parseInt(val, 10);
                          setFormFields(newFields);
                        }}
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      const newFields = [...formFields];
                      newFields[fieldIdx].options = newFields[fieldIdx].options.filter((_: any, i: number) => i !== optIdx);
                      setFormFields(newFields);
                    }}
                    style={{ padding: '0.7rem', color: '#ff4444', borderColor: '#ff4444' }}
                  >
                    X
                  </button>
                </div>
              ))}

              <button 
                type="button" 
                className="btn-secondary"
                style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                onClick={() => {
                  const newFields = [...formFields];
                  newFields[fieldIdx].options.push({ label: '', value: '', priceModifier: 0 });
                  setFormFields(newFields);
                }}
              >
                + TAMBAH PILIHAN
              </button>
            </div>
          ))}

          <button 
            type="button" 
            className="btn-secondary" 
            style={{ width: '100%' }}
            onClick={() => {
              setFormFields([...formFields, { id: `f_${Date.now()}`, label: '', type: 'select', options: [{ label: '', value: '', priceModifier: 0 }] }]);
            }}
          >
            + TAMBAH FIELD BARU
          </button>
        </div>

        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>SAVE ITEM</button>
      </form>
    </div>
  );
}

function ManageAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/admins`, {
        headers: { 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' }
      });
      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem('megs_admin_token');
          window.location.reload();
        }
        return;
      }
      const data = await res.json();
      setAdmins(data);
    } catch {
      console.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Creating...');
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || ''
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Admin added successfully!');
        setUsername('');
        setPassword('');
        fetchAdmins();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this admin?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/admins/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' }
      });
      fetchAdmins();
    } catch (e) {
      alert('Error deleting admin');
    }
  };

  const handleEdit = (admin: any) => {
    setEditingId(admin.id);
    setEditUsername(admin.username);
    setEditPassword('');
  };

  const handleSaveEdit = async (id: number) => {
    if (!editUsername) return alert('Username cannot be empty');
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/admins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || ''
        },
        body: JSON.stringify({ username: editUsername, password: editPassword })
      });
      setEditingId(null);
      fetchAdmins();
    } catch (e) {
      alert('Error updating admin');
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: '0 0 2rem 0' }}>Manage Admins</h2>
      
      <div style={{ background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, marginTop: 0 }}>Add New Admin</h3>
        <form onSubmit={handleAddAdmin} className="admin-form-row">
          <div className="control-group" style={{ flex: 1 }}>
            <label>USERNAME</label>
            <input type="text" className="input-text" required value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="control-group" style={{ flex: 1 }}>
            <label>PASSWORD</label>
            <input type="password" className="input-text" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}>ADD ADMIN</button>
        </form>
        {status && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>{status}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <p>Loading...</p> : admins.length === 0 ? <p>No admins found.</p> : admins.map(admin => (
          <div key={admin.id} className="admin-list-item">
            {editingId === admin.id ? (
              <div className="admin-edit-row">
                <input type="text" className="input-text" value={editUsername} onChange={e => setEditUsername(e.target.value)} style={{ flex: 1 }} />
                <input type="password" className="input-text" placeholder="New password (leave blank)" value={editPassword} onChange={e => setEditPassword(e.target.value)} style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleSaveEdit(admin.id)} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>SAVE</button>
                  <button onClick={() => setEditingId(null)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>CANCEL</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', margin: 0, fontWeight: 'bold' }}>{admin.username}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>ID: {admin.id}</p>
                </div>
                <div className="admin-list-actions">
                  <button onClick={() => handleEdit(admin)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>EDIT</button>
                  {admins.length > 1 && (
                    <button onClick={() => handleDelete(admin.id)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>DELETE</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCoupons = () => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/coupons`)
      .then(res => res.json())
      .then(data => setCoupons(data))
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/coupons`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || ''
        },
        body: JSON.stringify({ 
          code, 
          discount_percentage: parseInt(discountPercent), 
          valid_from: validFrom || null, 
          valid_until: validUntil || null, 
          usage_limit: usageLimit ? parseInt(usageLimit) : null 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Coupon added successfully');
        setCode('');
        setDiscountPercent('');
        setValidFrom('');
        setValidUntil('');
        setUsageLimit('');
        fetchCoupons();
      } else {
        alert('Failed to add coupon: ' + data.error);
      }
    } catch (e) {
      alert('Error adding coupon');
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' }
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
      } else {
        alert('Failed to delete coupon: ' + data.error);
      }
    } catch (e) {
      alert('Error deleting coupon');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '2.5rem' }}>Coupons Management</h1>
      </div>

      <div style={{ background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>Add New Coupon</h2>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>COUPON CODE *</label>
            <input required className="input-text" type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. MEGS10" />
          </div>
          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>DISCOUNT PERCENTAGE *</label>
            <input required className="input-text" type="number" min="1" max="100" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} placeholder="10" />
          </div>
          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>VALID FROM</label>
            <input className="input-text" type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
          </div>
          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>VALID UNTIL</label>
            <input className="input-text" type="datetime-local" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          </div>
          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>USAGE LIMIT</label>
            <input className="input-text" type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="Unlimited" />
          </div>
          <div className="control-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'ADDING...' : 'ADD COUPON'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>CODE</th>
              <th>DISCOUNT</th>
              <th>VALIDITY</th>
              <th>USAGE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td>#{coupon.id}</td>
                <td><span style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-bg-card)', padding: '2px 6px', border: '1px solid var(--color-border)' }}>{coupon.code}</span></td>
                <td>{coupon.discount_percentage}%</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : 'Always'} - {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Forever'}
                </td>
                <td>{coupon.used_count} / {coupon.usage_limit || '∞'}</td>
                <td>
                  <button onClick={() => handleDelete(coupon.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>DELETE</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>NO COUPONS FOUND</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;


function AdminSettings() {
  const defaultPricing = {
    atasan_celana: {
      basic: { non: 120000, half: 135000, full: 145000 },
      standard: { non: 130000, half: 145000, full: 155000 },
      premium: { non: 140000, half: 155000, full: 165000 }
    },
    atasan_saja: {
      basic: { non: 90000, half: 105000, full: 115000 },
      standard: { non: 100000, half: 115000, full: 125000 },
      premium: { non: 110000, half: 125000, full: 135000 }
    }
  };

  const [heroSlides, setHeroSlides] = useState<{ image: string, title: string, subtitle: string, duration?: string }[]>([]);
  const [aboutImage, setAboutImage] = useState('');
  const [aboutText, setAboutText] = useState('We engineer premium technical apparel that bridges the gap between high-performance athletic gear and modern streetwear aesthetics.');
  const [pricing, setPricing] = useState<any>(defaultPricing);
  const [status, setStatus] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'pricing'>('hero');

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.hero_slides) {
          try {
            setHeroSlides(JSON.parse(data.hero_slides));
          } catch (e) { }
        } else if (data.hero_image) {
          setHeroSlides([{ image: data.hero_image, title: data.hero_title || '', subtitle: data.hero_subtitle || '' }]);
        } else {
          setHeroSlides([{ image: '', title: '', subtitle: '' }]);
        }
        if (data.about_image) setAboutImage(data.about_image);
        if (data.about_text) setAboutText(data.about_text);
        if (data.create_yours_pricing) {
          try { setPricing(JSON.parse(data.create_yours_pricing)); } catch(e) {}
        }
      });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFile = async (base64String: string) => {
      setStatus('Mengunggah file... Mohon tunggu.');
      try {
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' },
          body: JSON.stringify({ file: base64String })
        });
        const data = await res.json();
        if (data.url) {
          const newSlides = [...heroSlides];
          const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787';
          newSlides[index].image = apiUrl + data.url;
          setHeroSlides(newSlides);
          setStatus('File berhasil diunggah! Jangan lupa klik SAVE SETTINGS.');
        } else {
          setStatus('Gagal mengunggah: ' + data.error);
        }
      } catch (err: any) {
         setStatus('Error: ' + err.message);
      }
    };

    if (file.type.startsWith('video/')) {
      if (file.size > 25 * 1024 * 1024) {
        alert('Ukuran video terlalu besar! Maksimal 25MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => uploadFile(event.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }
    
    // For images, do not resize to keep HD quality
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadFile(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAboutImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlide = () => {
    setHeroSlides([...heroSlides, { image: '', title: '', subtitle: '' }]);
  };

  const handleRemoveSlide = (index: number) => {
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' },
        body: JSON.stringify({
          hero_slides: JSON.stringify(heroSlides),
          about_image: aboutImage,
          about_text: aboutText,
          create_yours_pricing: JSON.stringify(pricing)
        })
      });
      if (res.ok) {
        setStatus('Settings saved successfully!');
      } else {
        await res.text();
        setStatus(`Error saving settings: File may be too large for database.`);
      }
    } catch (e: any) {
      setStatus(`Network/Payload Error: ${e.message}. Video mungkin terlalu besar.`);
    }
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newSlides = [...heroSlides];
    const draggedSlide = newSlides[draggedIndex];
    newSlides.splice(draggedIndex, 1);
    newSlides.splice(index, 0, draggedSlide);
    setHeroSlides(newSlides);
    setDraggedIndex(null);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: '0 0 2rem 0' }}>Home Settings</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('hero')}
          style={{ padding: '0.8rem 2rem', background: activeTab === 'hero' ? 'var(--color-bg-card)' : 'transparent', color: 'var(--color-white)', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
        >
          HERO SLIDES
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          style={{ padding: '0.8rem 2rem', background: activeTab === 'about' ? 'var(--color-bg-card)' : 'transparent', color: 'var(--color-white)', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
        >
          ABOUT SECTION
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('pricing')}
          style={{ padding: '0.8rem 2rem', background: activeTab === 'pricing' ? 'var(--color-bg-card)' : 'transparent', color: 'var(--color-white)', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
        >
          HARGA JERSEY (CREATE YOURS)
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)' }}>
        
        {activeTab === 'hero' && (
          <>

        {heroSlides.map((slide, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            style={{ border: '1px solid var(--color-border)', padding: '1.5rem', position: 'relative', background: 'var(--color-bg-main)', cursor: 'grab', opacity: draggedIndex === index ? 0.5 : 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ cursor: 'grab', padding: '0.2rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', margin: 0 }}>SLIDE {index + 1}</h3>
            </div>
            {heroSlides.length > 1 && (
              <button type="button" onClick={() => handleRemoveSlide(index)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-border)', color: 'var(--color-text-main)', border: 'none', padding: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>REMOVE</button>
            )}

            <div className="control-group" style={{ marginBottom: '1rem' }}>
              <label>TITLE</label>
              <input className="input-text" type="text" value={slide.title} onChange={e => {
                const newSlides = [...heroSlides];
                newSlides[index].title = e.target.value;
                setHeroSlides(newSlides);
              }} />
            </div>

            <div className="control-group" style={{ marginBottom: '1rem' }}>
              <label>SUBTITLE</label>
              <input className="input-text" type="text" value={slide.subtitle} onChange={e => {
                const newSlides = [...heroSlides];
                newSlides[index].subtitle = e.target.value;
                setHeroSlides(newSlides);
              }} />
            </div>

            <div className="control-group" style={{ marginBottom: '1rem' }}>
              <label>SLIDE DURATION (SECONDS)</label>
              <input className="input-text" type="number" min="1" placeholder="Default: 5" value={slide.duration || ''} onChange={e => {
                const newSlides = [...heroSlides];
                newSlides[index].duration = e.target.value;
                setHeroSlides(newSlides);
              }} />
            </div>

            <div className="control-group">
              <label>BACKGROUND MEDIA (IMAGE / VIDEO / YOUTUBE)</label>
              {slide.image && (
                getYoutubeId(slide.image) ? (
                  <div style={{ position: 'relative', width: '100%', height: '200px', marginBottom: '1rem', overflow: 'hidden', background: '#000' }}>
                    <iframe 
                      src={`https://www.youtube.com/embed/${getYoutubeId(slide.image)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(slide.image)}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3`}
                      style={{ width: '100%', height: '100%', pointerEvents: 'none', transform: 'scale(1.15)' }}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                    />
                  </div>
                ) : slide.image.startsWith('data:video/') || slide.image.endsWith('.mp4') || slide.image.endsWith('.webm') ? (
                  <video src={slide.image} autoPlay loop muted playsInline style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '1rem' }} />
                ) : (
                  <img src={slide.image} alt="Hero Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '1rem' }} />
                )
              )}
              <input type="text" className="input-text" placeholder="Atau paste URL YouTube / Eksternal Video di sini (opsional)" value={slide.image} onChange={e => {
                const newSlides = [...heroSlides];
                newSlides[index].image = e.target.value;
                setHeroSlides(newSlides);
              }} style={{ marginBottom: '1rem' }} />
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <button type="button" className="btn-secondary" style={{ width: '100%' }}>+ UPLOAD NEW BACKGROUND</button>
                <input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => handleImageUpload(e, index)} style={{ fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn-secondary" onClick={handleAddSlide} style={{ alignSelf: 'flex-start' }}>+ ADD NEW SLIDE</button>
          </>
        )}

        {activeTab === 'about' && (
          <>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginBottom: '1rem' }}>ABOUT MEGS SECTION</h3>
            <div className="control-group" style={{ marginBottom: '1rem' }}>
              <label>ABOUT TEXT</label>
              <textarea className="input-text" rows={4} value={aboutText} onChange={e => setAboutText(e.target.value)} />
            </div>
            <div className="control-group">
              <label>ABOUT IMAGE (Left Side)</label>
              {aboutImage && <img src={aboutImage} alt="About Preview" style={{ width: '200px', height: '200px', objectFit: 'cover', marginBottom: '1rem' }} />}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <button type="button" className="btn-secondary" style={{ width: '100%' }}>+ UPLOAD ABOUT IMAGE</button>
                <input type="file" accept="image/*" onChange={handleAboutImageUpload} style={{ fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer' }} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'pricing' && (
          <>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginBottom: '1rem' }}>HARGA JERSEY (CREATE YOURS)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Atasan + Celana */}
              <div>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>ATASAN + CELANA</h4>
                {['basic', 'standard', 'premium'].map((paket) => (
                  <div key={`celana-${paket}`} style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>PAKET {paket}</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {['non', 'half', 'full'].map((print) => (
                        <div key={`celana-${paket}-${print}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <label style={{ width: '120px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{print.toUpperCase()} PRINT</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <span>Rp.</span>
                            <input type="number" className="input-text" style={{ padding: '0.5rem' }} value={pricing.atasan_celana?.[paket]?.[print] || ''} onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setPricing((prev: any) => ({ ...prev, atasan_celana: { ...prev.atasan_celana, [paket]: { ...prev.atasan_celana[paket], [print]: val } } }));
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Atasan Saja */}
              <div>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>ATASAN SAJA</h4>
                {['basic', 'standard', 'premium'].map((paket) => (
                  <div key={`saja-${paket}`} style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>PAKET {paket}</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {['non', 'half', 'full'].map((print) => (
                        <div key={`saja-${paket}-${print}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <label style={{ width: '120px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{print.toUpperCase()} PRINT</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <span>Rp.</span>
                            <input type="number" className="input-text" style={{ padding: '0.5rem' }} value={pricing.atasan_saja?.[paket]?.[print] || ''} onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setPricing((prev: any) => ({ ...prev, atasan_saja: { ...prev.atasan_saja, [paket]: { ...prev.atasan_saja[paket], [print]: val } } }));
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '2rem' }}>SAVE SETTINGS</button>
        {status && <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{status}</p>}
      </form>
    </div>
  );
}

export function AdminMegsThrive() {
  const [config, setConfig] = useState({
    heroTitle: 'ENGINEERED FOR THE ELEMENTS.',
    heroSubtitle: 'Technical fabrics combined with utilitarian design. Premium activewear that moves with you, whatever the environment throws your way.',
    heroBtnText: 'EXPLORE THE COLLECTION',
    heroBgImg: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2000&auto=format&fit=crop',
    heroBgLink: '',
    promoTitle: 'MEGS THRIVE TRAIL RUN',
    promoSubtitle: 'Feel the miles fly by.',
    promo1Img: 'https://images.unsplash.com/photo-1542840410-3092f99611a3?q=80&w=1200&auto=format&fit=crop',
    promo1Link: '',
    promo2Img: 'https://images.unsplash.com/photo-1552674605-15c9ef04305c?q=80&w=1200&auto=format&fit=crop',
    promo2Link: '',
    productTitle: 'Shop Everything MEGS THRIVE',
    product1: { name: 'STORM SHELL JACKET', category: 'Men\'s Outerwear', price: 'Rp 1.899.000', img: 'https://images.unsplash.com/photo-1542840410-3092f99611a3?q=80&w=800&auto=format&fit=crop' },
    product2: { name: 'TRAIL CARGO PANTS', category: 'Men\'s Bottoms', price: 'Rp 1.299.000', img: 'https://images.unsplash.com/photo-1622370725510-9f056d6d84ce?q=80&w=800&auto=format&fit=crop' },
    product3: { name: 'TREK 30L BACKPACK', category: 'Accessories & Gear', price: 'Rp 2.199.000', img: 'https://images.unsplash.com/photo-1575428652377-a2d80b2273fc?q=80&w=800&auto=format&fit=crop' },
    manifestoTitle: "NATURE DOESN'T COMPROMISE.<br/>NEITHER DO WE.",
    manifestoText: 'Every piece in the MEGS THRIVE collection is rigorously tested in the elements. We combine technical fabrics with utilitarian design to create gear that performs anywhere on earth.',
    manifestoBgImg: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2000&auto=format&fit=crop',
    manifestoMobileBgImg: '',
    manifestoLink: '',
    marqueeText: 'GET OUT THERE • ALL CONDITIONS • MEGS THRIVE • GET OUT THERE • ALL CONDITIONS • MEGS THRIVE • '
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.megs_thrive_settings) {
          try {
            setConfig(JSON.parse(data.megs_thrive_settings));
          } catch(e) {}
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, val: string) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading image...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' },
          body: JSON.stringify({ file: event.target?.result })
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        const fullUrl = `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}${data.url}`;
        handleChange(key, fullUrl);
        setStatus('Upload successful!');
        setTimeout(() => setStatus(''), 3000);
      } catch (err) {
        setStatus('Upload error.');
        setTimeout(() => setStatus(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('megs_admin_token') || '' },
        body: JSON.stringify({ megs_thrive_settings: JSON.stringify(config) })
      });
      if (!res.ok) throw new Error('Save failed on server');
      setStatus('Saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (e) {
      setStatus('Error saving settings. Data might be too large.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', marginBottom: '2rem' }}>MEGS THRIVE SETTINGS</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
        
        {/* HERO */}
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>HERO SECTION</h3>
          <div className="control-group" style={{ marginBottom: '1rem' }}><label>Title</label><input type="text" className="input-text" value={config.heroTitle} onChange={e => handleChange('heroTitle', e.target.value)} /></div>
          <div className="control-group" style={{ marginBottom: '1rem' }}><label>Subtitle</label><textarea className="input-text" rows={3} value={config.heroSubtitle} onChange={e => handleChange('heroSubtitle', e.target.value)} /></div>
          <div className="control-group" style={{ marginBottom: '1rem' }}><label>Button Text</label><input type="text" className="input-text" value={config.heroBtnText} onChange={e => handleChange('heroBtnText', e.target.value)} /></div>
          
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label>Background Image URL / Upload</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="text" className="input-text" value={config.heroBgImg} onChange={e => handleChange('heroBgImg', e.target.value)} style={{ flex: 1 }} />
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'heroBgImg')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
            </div>
            {config.heroBgImg && <img src={config.heroBgImg} alt="Hero preview" style={{ height: '80px', objectFit: 'cover', marginTop: '0.5rem', border: '1px solid var(--color-border)' }} />}
          </div>
          
          <div className="control-group"><label>Background Image Link</label><input type="text" className="input-text" value={config.heroBgLink || ''} onChange={e => handleChange('heroBgLink', e.target.value)} placeholder="e.g. /products-thrive" /></div>
        </div>

        {/* PROMO */}
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>PROMO SECTION</h3>
          <div className="control-group" style={{ marginBottom: '1rem' }}><label>Section Title</label><input type="text" className="input-text" value={config.promoTitle} onChange={e => handleChange('promoTitle', e.target.value)} /></div>
          <div className="control-group" style={{ marginBottom: '1rem' }}><label>Subtitle</label><input type="text" className="input-text" value={config.promoSubtitle} onChange={e => handleChange('promoSubtitle', e.target.value)} /></div>
          
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label>Promo 1 Image URL / Upload</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="text" className="input-text" value={config.promo1Img} onChange={e => handleChange('promo1Img', e.target.value)} style={{ flex: 1 }} />
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'promo1Img')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
            </div>
            {config.promo1Img && <img src={config.promo1Img} alt="Promo 1 preview" style={{ height: '80px', objectFit: 'cover', marginTop: '0.5rem', border: '1px solid var(--color-border)' }} />}
          </div>
          <div className="control-group" style={{ marginBottom: '1rem' }}><label>Promo 1 Link</label><input type="text" className="input-text" value={config.promo1Link || ''} onChange={e => handleChange('promo1Link', e.target.value)} placeholder="e.g. /products-thrive/1" /></div>
          
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label>Promo 2 Image URL / Upload</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="text" className="input-text" value={config.promo2Img} onChange={e => handleChange('promo2Img', e.target.value)} style={{ flex: 1 }} />
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'promo2Img')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
            </div>
            {config.promo2Img && <img src={config.promo2Img} alt="Promo 2 preview" style={{ height: '80px', objectFit: 'cover', marginTop: '0.5rem', border: '1px solid var(--color-border)' }} />}
          </div>
          <div className="control-group"><label>Promo 2 Link</label><input type="text" className="input-text" value={config.promo2Link || ''} onChange={e => handleChange('promo2Link', e.target.value)} placeholder="e.g. /products-thrive/2" /></div>
        </div>

        {/* PRODUCTS (Now managed via main Products menu) */}
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>FEATURED PRODUCTS</h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Products are now dynamically loaded. To add a product to the Megs Thrive section, go to the main "Products" menu and set the category to "MEGS THRIVE".
          </p>
        </div>

        {/* MANIFESTO */}
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>MANIFESTO SECTION</h3>
          
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label>Background Image URL / Upload (Desktop)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="text" className="input-text" value={config.manifestoBgImg} onChange={e => handleChange('manifestoBgImg', e.target.value)} style={{ flex: 1 }} />
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'manifestoBgImg')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
            </div>
            {config.manifestoBgImg && <img src={config.manifestoBgImg} alt="Manifesto preview" style={{ height: '80px', objectFit: 'cover', marginTop: '0.5rem', border: '1px solid var(--color-border)' }} />}
          </div>
          
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label>Background Image URL / Upload (Mobile)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="text" className="input-text" value={config.manifestoMobileBgImg || ''} onChange={e => handleChange('manifestoMobileBgImg', e.target.value)} style={{ flex: 1 }} placeholder="Optional mobile override" />
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'manifestoMobileBgImg')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
            </div>
            {config.manifestoMobileBgImg && <img src={config.manifestoMobileBgImg} alt="Manifesto Mobile preview" style={{ height: '80px', objectFit: 'cover', marginTop: '0.5rem', border: '1px solid var(--color-border)' }} />}
          </div>

          <div className="control-group"><label>Background Image Link</label><input type="text" className="input-text" value={config.manifestoLink || ''} onChange={e => handleChange('manifestoLink', e.target.value)} placeholder="e.g. /products-thrive" /></div>
        </div>

        {/* MARQUEE */}
        <div style={{ background: 'var(--color-bg-card)', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>MARQUEE</h3>
          <div className="control-group"><label>Scrolling Text</label><input type="text" className="input-text" value={config.marqueeText} onChange={e => handleChange('marqueeText', e.target.value)} /></div>
        </div>

        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>SAVE MEGS THRIVE SETTINGS</button>
        {status && <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{status}</p>}
      </form>
    </div>
  );
}
