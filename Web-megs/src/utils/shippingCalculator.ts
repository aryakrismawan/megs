export interface RegionOption {
  id: string;
  name: string;
}

export interface ShippingServiceOption {
  id: string;
  agentCode: 'JNT' | 'JNE' | 'SICEPAT' | 'NINJA' | 'POS';
  agentName: string;
  serviceName: string;
  serviceDesc: string;
  etd: string;
  pricePerKg: number;
  totalCost: number;
  badge?: string;
}

export const SHIPPING_ORIGIN = {
  subdistrict: 'Cicurug',
  city: 'Kab. Sukabumi',
  province: 'Jawa Barat',
  postalCode: '43359',
  label: 'Cicurug, Kab. Sukabumi, Jawa Barat'
};

// Fallback Provinsi & Kota/Kabupaten se-Indonesia jika koneksi lambat / API eksternal gangguan
export const FALLBACK_PROVINCES: RegionOption[] = [
  { id: '32', name: 'JAWA BARAT' },
  { id: '31', name: 'DKI JAKARTA' },
  { id: '36', name: 'BANTEN' },
  { id: '33', name: 'JAWA TENGAH' },
  { id: '34', name: 'DI YOGYAKARTA' },
  { id: '35', name: 'JAWA TIMUR' },
  { id: '51', name: 'BALI' },
  { id: '11', name: 'ACEH' },
  { id: '12', name: 'SUMATERA UTARA' },
  { id: '13', name: 'SUMATERA BARAT' },
  { id: '14', name: 'RIAU' },
  { id: '15', name: 'JAMBI' },
  { id: '16', name: 'SUMATERA SELATAN' },
  { id: '17', name: 'BENGKULU' },
  { id: '18', name: 'LAMPUNG' },
  { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { id: '21', name: 'KEPULAUAN RIAU' },
  { id: '52', name: 'NUSA TENGGARA BARAT' },
  { id: '53', name: 'NUSA TENGGARA TIMUR' },
  { id: '61', name: 'KALIMANTAN BARAT' },
  { id: '62', name: 'KALIMANTAN TENGAH' },
  { id: '63', name: 'KALIMANTAN SELATAN' },
  { id: '64', name: 'KALIMANTAN TIMUR' },
  { id: '65', name: 'KALIMANTAN UTARA' },
  { id: '71', name: 'SULAWESI UTARA' },
  { id: '72', name: 'SULAWESI TENGAH' },
  { id: '73', name: 'SULAWESI SELATAN' },
  { id: '74', name: 'SULAWESI TENGGARA' },
  { id: '75', name: 'GORONTALO' },
  { id: '76', name: 'SULAWESI BARAT' },
  { id: '81', name: 'MALUKU' },
  { id: '82', name: 'MALUKU UTARA' },
  { id: '91', name: 'PAPUA BARAT' },
  { id: '94', name: 'PAPUA' },
  { id: '93', name: 'PAPUA SELATAN' },
  { id: '95', name: 'PAPUA TENGAH' },
  { id: '96', name: 'PAPUA PEGUNUNGAN' },
  { id: '92', name: 'PAPUA BARAT DAYA' }
];

export const FALLBACK_CITIES_BY_PROVINCE: Record<string, RegionOption[]> = {
  '32': [
    { id: '3202', name: 'KABUPATEN SUKABUMI' },
    { id: '3272', name: 'KOTA SUKABUMI' },
    { id: '3201', name: 'KABUPATEN BOGOR' },
    { id: '3271', name: 'KOTA BOGOR' },
    { id: '3276', name: 'KOTA DEPOK' },
    { id: '3203', name: 'KABUPATEN CIANJUR' },
    { id: '3273', name: 'KOTA BANDUNG' },
    { id: '3204', name: 'KABUPATEN BANDUNG' },
    { id: '3217', name: 'KABUPATEN BANDUNG BARAT' },
    { id: '3277', name: 'KOTA CIMAHI' },
    { id: '3275', name: 'KOTA BEKASI' },
    { id: '3216', name: 'KABUPATEN BEKASI' },
    { id: '3215', name: 'KABUPATEN KARAWANG' },
    { id: '3214', name: 'KABUPATEN PURWAKARTA' },
    { id: '3213', name: 'KABUPATEN SUBANG' },
    { id: '3211', name: 'KABUPATEN SUMEDANG' },
    { id: '3205', name: 'KABUPATEN GARUT' },
    { id: '3278', name: 'KOTA TASIKMALAYA' },
    { id: '3206', name: 'KABUPATEN TASIKMALAYA' },
    { id: '3207', name: 'KABUPATEN CIAMIS' },
    { id: '3279', name: 'KOTA BANJAR' },
    { id: '3218', name: 'KABUPATEN PANGANDARAN' },
    { id: '3274', name: 'KOTA CIREBON' },
    { id: '3209', name: 'KABUPATEN CIREBON' },
    { id: '3208', name: 'KABUPATEN KUNINGAN' },
    { id: '3210', name: 'KABUPATEN MAJALENGKA' },
    { id: '3212', name: 'KABUPATEN INDRAMAYU' }
  ],
  '31': [
    { id: '3171', name: 'KOTA ADM. JAKARTA SELATAN' },
    { id: '3172', name: 'KOTA ADM. JAKARTA TIMUR' },
    { id: '3173', name: 'KOTA ADM. JAKARTA PUSAT' },
    { id: '3174', name: 'KOTA ADM. JAKARTA BARAT' },
    { id: '3175', name: 'KOTA ADM. JAKARTA UTARA' },
    { id: '3101', name: 'KAB. ADM. KEP. SERIBU' }
  ],
  '36': [
    { id: '3671', name: 'KOTA TANGERANG' },
    { id: '3674', name: 'KOTA TANGERANG SELATAN' },
    { id: '3603', name: 'KABUPATEN TANGERANG' },
    { id: '3673', name: 'KOTA SERANG' },
    { id: '3604', name: 'KABUPATEN SERANG' },
    { id: '3672', name: 'KOTA CILEGON' },
    { id: '3601', name: 'KABUPATEN PANDEGLANG' },
    { id: '3602', name: 'KABUPATEN LEBAK' }
  ]
};

export const FALLBACK_DISTRICTS_SUKABUMI: RegionOption[] = [
  { id: '3202170', name: 'CICURUG' },
  { id: '3202180', name: 'CIDAHU' },
  { id: '3202160', name: 'PARUNGKUDA' },
  { id: '3202150', name: 'BOJONGGENTENG' },
  { id: '3202190', name: 'KALAPANUNGGAL' },
  { id: '3202200', name: 'KABANDUNGAN' },
  { id: '3202140', name: 'PARAKANSALAK' },
  { id: '3202210', name: 'CIAMBAR' },
  { id: '3202220', name: 'NAGRAK' },
  { id: '3202230', name: 'CIBADAK' },
  { id: '3202240', name: 'CARINGIN' },
  { id: '3202250', name: 'CISAAT' },
  { id: '3202260', name: 'KADUDAMPIT' },
  { id: '3202270', name: 'SUKABUMI' },
  { id: '3202280', name: 'SUKARAJA' },
  { id: '3202010', name: 'PALABUHANRATU' },
  { id: '3202090', name: 'JAMPANGTENGAH' },
  { id: '3202060', name: 'SURADE' }
];

/**
 * Menghitung berat pengiriman dalam Kg dari jumlah item di keranjang.
 * Rata-rata berat 1 potong pakaian + packaging = 350 gram (0.35 kg).
 * Toleransi ekspedisi Indonesia: <= 1.30 kg dihitung 1 kg.
 */
export function calculateChargeableWeight(totalQuantity: number): {
  actualWeightKg: number;
  chargeableKg: number;
} {
  const actualGrams = Math.max(1, totalQuantity) * 350;
  const actualWeightKg = Number((actualGrams / 1000).toFixed(2));
  if (actualWeightKg <= 1.3) {
    return { actualWeightKg, chargeableKg: 1 };
  }
  const integerPart = Math.floor(actualWeightKg);
  const decimalPart = actualWeightKg - integerPart;
  const chargeableKg = decimalPart <= 0.3 ? integerPart : integerPart + 1;
  return { actualWeightKg, chargeableKg: Math.max(1, chargeableKg) };
}

/**
 * Menghasilkan daftar opsi ekspedisi & tarif realistis dari Cicurug, Kab. Sukabumi
 * berdasarkan Provinsi, Kota/Kabupaten, Kecamatan, dan Berat (Kg).
 */
export function calculateShippingOptions(
  provinceName: string,
  cityName: string,
  districtName: string,
  chargeableKg: number
): ShippingServiceOption[] {
  if (!provinceName || !cityName) return [];

  const prov = provinceName.toUpperCase();
  const city = cityName.toUpperCase();
  const dist = (districtName || '').toUpperCase();

  // Tentukan zona jarak dari Cicurug, Kab. Sukabumi
  const isCicurugNearby =
    city.includes('SUKABUMI') &&
    (dist.includes('CICURUG') ||
      dist.includes('CIDAHU') ||
      dist.includes('PARUNGKUDA') ||
      dist.includes('CIAMBAR') ||
      dist.includes('CIBADAK') ||
      dist.includes('BOJONGGENTENG'));

  const isLocalSukabumiBogorCianjur =
    city.includes('SUKABUMI') ||
    city.includes('BOGOR') ||
    city.includes('CIANJUR') ||
    city.includes('DEPOK');

  const isJabodetabekJabar =
    prov.includes('DKI JAKARTA') ||
    prov.includes('JAWA BARAT') ||
    city.includes('TANGERANG') ||
    city.includes('BEKASI');

  const isBantenJatengDIY =
    prov.includes('BANTEN') ||
    prov.includes('JAWA TENGAH') ||
    prov.includes('YOGYAKARTA');

  const isJatimBali =
    prov.includes('JAWA TIMUR') || prov.includes('BALI');

  const isSouthSumatraNTB =
    prov.includes('LAMPUNG') ||
    prov.includes('SUMATERA SELATAN') ||
    prov.includes('BENGKULU') ||
    prov.includes('JAMBI') ||
    prov.includes('BANGKA BELITUNG') ||
    prov.includes('NUSA TENGGARA BARAT');

  const isNorthSumatraKalimantan =
    prov.includes('SUMATERA UTARA') ||
    prov.includes('SUMATERA BARAT') ||
    prov.includes('RIAU') ||
    prov.includes('ACEH') ||
    prov.includes('KALIMANTAN');

  const isSulawesiNTT =
    prov.includes('SULAWESI') ||
    prov.includes('GORONTALO') ||
    prov.includes('NUSA TENGGARA TIMUR');

  let baseRegPerKg = 55000;
  let baseEtdReg = '3–5 Hari';
  let baseEtdEco = '5–7 Hari';
  let hasNextDay = false;

  if (isCicurugNearby) {
    baseRegPerKg = 8000;
    baseEtdReg = '1 Hari';
    baseEtdEco = '1–2 Hari';
    hasNextDay = true;
  } else if (isLocalSukabumiBogorCianjur) {
    baseRegPerKg = 9000;
    baseEtdReg = '1–2 Hari';
    baseEtdEco = '2–3 Hari';
    hasNextDay = true;
  } else if (isJabodetabekJabar) {
    baseRegPerKg = 12000;
    baseEtdReg = '1–2 Hari';
    baseEtdEco = '2–4 Hari';
    hasNextDay = true;
  } else if (isBantenJatengDIY) {
    baseRegPerKg = 19000;
    baseEtdReg = '2–3 Hari';
    baseEtdEco = '3–5 Hari';
    hasNextDay = city.includes('KOTA');
  } else if (isJatimBali) {
    baseRegPerKg = 25000;
    baseEtdReg = '2–4 Hari';
    baseEtdEco = '4–6 Hari';
    hasNextDay = city.includes('SURABAYA') || city.includes('DENPASAR') || city.includes('MALANG');
  } else if (isSouthSumatraNTB) {
    baseRegPerKg = 32000;
    baseEtdReg = '3–5 Hari';
    baseEtdEco = '5–7 Hari';
  } else if (isNorthSumatraKalimantan) {
    baseRegPerKg = 44000;
    baseEtdReg = '3–6 Hari';
    baseEtdEco = '6–9 Hari';
  } else if (isSulawesiNTT) {
    baseRegPerKg = 54000;
    baseEtdReg = '4–7 Hari';
    baseEtdEco = '7–10 Hari';
  } else {
    // Maluku & Papua
    baseRegPerKg = 82000;
    baseEtdReg = '5–9 Hari';
    baseEtdEco = '9–14 Hari';
  }

  // Penyesuaian Kabupaten vs Kota di luar wilayah lokal
  if (!isLocalSukabumiBogorCianjur && city.includes('KABUPATEN')) {
    baseRegPerKg += 2000;
  }

  const options: ShippingServiceOption[] = [
    // J&T EXPRESS
    {
      id: 'jnt-ez',
      agentCode: 'JNT',
      agentName: 'J&T Express',
      serviceName: 'EZ (Reguler)',
      serviceDesc: 'Pengiriman reguler ke seluruh Indonesia',
      etd: baseEtdReg,
      pricePerKg: baseRegPerKg,
      totalCost: baseRegPerKg * chargeableKg,
      badge: 'POPULAR'
    },
    {
      id: 'jnt-eco',
      agentCode: 'JNT',
      agentName: 'J&T Express',
      serviceName: 'J&T ECO (Hemat)',
      serviceDesc: 'Opsi ekonomis untuk pengiriman lebih hemat',
      etd: baseEtdEco,
      pricePerKg: Math.max(7000, Math.round((baseRegPerKg * 0.8) / 500) * 500),
      totalCost: Math.max(7000, Math.round((baseRegPerKg * 0.8) / 500) * 500) * chargeableKg,
      badge: 'HEMAT'
    },

    // JNE EXPRESS
    {
      id: 'jne-reg',
      agentCode: 'JNE',
      agentName: 'JNE Express',
      serviceName: 'REG (Layanan Reguler)',
      serviceDesc: 'Jaringan pengiriman luas & terpercaya',
      etd: baseEtdReg,
      pricePerKg: baseRegPerKg + 1000,
      totalCost: (baseRegPerKg + 1000) * chargeableKg
    },
    {
      id: 'jne-oke',
      agentCode: 'JNE',
      agentName: 'JNE Express',
      serviceName: 'OKE (Ongkos Kirim Ekonomis)',
      serviceDesc: 'Tarif ekonomis untuk kiriman non-darurat',
      etd: baseEtdEco,
      pricePerKg: Math.max(7500, Math.round((baseRegPerKg * 0.85) / 500) * 500),
      totalCost: Math.max(7500, Math.round((baseRegPerKg * 0.85) / 500) * 500) * chargeableKg
    },

    // SICEPAT EKSPRES
    {
      id: 'sicepat-reg',
      agentCode: 'SICEPAT',
      agentName: 'SiCepat Ekspres',
      serviceName: 'SIUNTUNG (Reguler)',
      serviceDesc: 'Pengiriman reguler cepat & tepat waktu',
      etd: baseEtdReg,
      pricePerKg: baseRegPerKg,
      totalCost: baseRegPerKg * chargeableKg
    },
    {
      id: 'sicepat-halu',
      agentCode: 'SICEPAT',
      agentName: 'SiCepat Ekspres',
      serviceName: 'HALU (Harga Mulai Lima Ribu)',
      serviceDesc: 'Layanan ekonomis unggulan SiCepat',
      etd: baseEtdEco,
      pricePerKg: Math.max(6500, Math.round((baseRegPerKg * 0.78) / 500) * 500),
      totalCost: Math.max(6500, Math.round((baseRegPerKg * 0.78) / 500) * 500) * chargeableKg
    },

    // NINJA XPRESS
    {
      id: 'ninja-std',
      agentCode: 'NINJA',
      agentName: 'Ninja Xpress',
      serviceName: 'Ninja Standard',
      serviceDesc: 'Pengiriman standar dengan pelacakan real-time',
      etd: baseEtdReg,
      pricePerKg: Math.max(7500, baseRegPerKg - 500),
      totalCost: Math.max(7500, baseRegPerKg - 500) * chargeableKg
    },

    // POS INDONESIA
    {
      id: 'pos-reg',
      agentCode: 'POS',
      agentName: 'Pos Indonesia',
      serviceName: 'Pos Reguler',
      serviceDesc: 'Menjangkau hingga pelosok kecamatan di Indonesia',
      etd: baseEtdReg,
      pricePerKg: Math.max(7500, baseRegPerKg - 1000),
      totalCost: Math.max(7500, baseRegPerKg - 1000) * chargeableKg
    }
  ];

  // Tambahkan layanan Next Day (JNE YES & SiCepat BEST) jika area terjangkau
  if (hasNextDay) {
    const nextDayPerKg = Math.round((baseRegPerKg * 1.65) / 1000) * 1000;
    options.splice(3, 0, {
      id: 'jne-yes',
      agentCode: 'JNE',
      agentName: 'JNE Express',
      serviceName: 'YES (Yakin Esok Sampai)',
      serviceDesc: 'Prioritas sampai keesokan hari',
      etd: '1 Hari',
      pricePerKg: nextDayPerKg,
      totalCost: nextDayPerKg * chargeableKg,
      badge: 'NEXT DAY'
    });
    options.splice(6, 0, {
      id: 'sicepat-best',
      agentCode: 'SICEPAT',
      agentName: 'SiCepat Ekspres',
      serviceName: 'BEST (Besok Sampai Tujuan)',
      serviceDesc: 'Layanan ekspres prioritas 1 hari sampai',
      etd: '1 Hari',
      pricePerKg: nextDayPerKg - 1000,
      totalCost: (nextDayPerKg - 1000) * chargeableKg,
      badge: 'NEXT DAY'
    });
  }

  return options;
}
