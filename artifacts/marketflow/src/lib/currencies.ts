export interface CurrencyOption {
  code: string;
  nameAr: string;
  symbolAr: string;
  symbolEn: string;
  country: string;
  flag: string;
  decimals: number;
}

export const ALL_CURRENCIES: CurrencyOption[] = [
  { code: 'SAR', nameAr: 'ريال سعودي', symbolAr: 'ر.س', symbolEn: 'SAR', country: 'المملكة العربية السعودية', flag: '🇸🇦', decimals: 2 },
  { code: 'EGP', nameAr: 'جنيه مصري', symbolAr: 'ج.م', symbolEn: 'EGP', country: 'جمهورية مصر العربية', flag: '🇪🇬', decimals: 2 },
  { code: 'AED', nameAr: 'درهم إماراتي', symbolAr: 'د.إ', symbolEn: 'AED', country: 'الإمارات العربية المتحدة', flag: '🇦🇪', decimals: 2 },
  { code: 'KWD', nameAr: 'دينار كويتي', symbolAr: 'د.ك', symbolEn: 'KWD', country: 'دولة الكويت', flag: '🇰🇼', decimals: 3 },
  { code: 'QAR', nameAr: 'ريال قطري', symbolAr: 'ر.ق', symbolEn: 'QAR', country: 'دولة قطر', flag: '🇶🇦', decimals: 2 },
  { code: 'BHD', nameAr: 'دينار بحريني', symbolAr: 'د.ب', symbolEn: 'BHD', country: 'مملكة البحرين', flag: '🇧🇭', decimals: 3 },
  { code: 'OMR', nameAr: 'ريال عماني', symbolAr: 'ر.ع', symbolEn: 'OMR', country: 'سلطنة عمان', flag: '🇴🇲', decimals: 3 },
  { code: 'JOD', nameAr: 'دينار أردني', symbolAr: 'د.أ', symbolEn: 'JOD', country: 'المملكة الأردنية الهاشمية', flag: '🇯🇴', decimals: 3 },
  { code: 'IQD', nameAr: 'دينار عراقي', symbolAr: 'د.ع', symbolEn: 'IQD', country: 'جمهورية العراق', flag: '🇮🇶', decimals: 0 },
  { code: 'LYD', nameAr: 'دينار ليبي', symbolAr: 'د.ل', symbolEn: 'LYD', country: 'دولة ليبيا', flag: '🇱🇾', decimals: 3 },
  { code: 'DZD', nameAr: 'دينار جزائري', symbolAr: 'د.ج', symbolEn: 'DZD', country: 'الجمهورية الجزائرية', flag: '🇩🇿', decimals: 2 },
  { code: 'MAD', nameAr: 'درهم مغربي', symbolAr: 'د.م', symbolEn: 'MAD', country: 'المملكة المغربية', flag: '🇲🇦', decimals: 2 },
  { code: 'TND', nameAr: 'دينار تونسي', symbolAr: 'د.ت', symbolEn: 'TND', country: 'الجمهورية التونسية', flag: '🇹🇳', decimals: 3 },
  { code: 'SDG', nameAr: 'جنيه سوداني', symbolAr: 'ج.س', symbolEn: 'SDG', country: 'جمهورية السودان', flag: '🇸🇩', decimals: 2 },
  { code: 'YER', nameAr: 'ريال يمني', symbolAr: 'ر.ي', symbolEn: 'YER', country: 'الجمهورية اليمنية', flag: '🇾🇪', decimals: 2 },
  { code: 'LBP', nameAr: 'ليرة لبنانية', symbolAr: 'ل.ل', symbolEn: 'LBP', country: 'الجمهورية اللبنانية', flag: '🇱🇧', decimals: 0 },
  { code: 'SYP', nameAr: 'ليرة سورية', symbolAr: 'ل.س', symbolEn: 'SYP', country: 'الجمهورية العربية السورية', flag: '🇸🇾', decimals: 0 },
  { code: 'MRU', nameAr: 'أوقية موريتانية', symbolAr: 'أ.م', symbolEn: 'MRU', country: 'موريتانيا', flag: '🇲🇷', decimals: 2 },
  { code: 'SOS', nameAr: 'شلن صومالي', symbolAr: 'ش.ص', symbolEn: 'SOS', country: 'جمهورية الصومال', flag: '🇸🇴', decimals: 2 },
  { code: 'DJF', nameAr: 'فرنك جيبوتي', symbolAr: 'ف.ج', symbolEn: 'DJF', country: 'جمهورية جيبوتي', flag: '🇩🇯', decimals: 0 },
  { code: 'KMF', nameAr: 'فرنك قمري', symbolAr: 'ف.ق', symbolEn: 'KMF', country: 'جزر القمر', flag: '🇰🇲', decimals: 0 },
  { code: 'ILS', nameAr: 'شيكل (فلسطين)', symbolAr: '₪', symbolEn: 'ILS', country: 'دولة فلسطين', flag: '🇵🇸', decimals: 2 },
  { code: 'USD', nameAr: 'دولار أمريكي', symbolAr: '$', symbolEn: 'USD', country: 'الولايات المتحدة الأمريكية', flag: '🇺🇸', decimals: 2 },
  { code: 'EUR', nameAr: 'يورو أوروبي', symbolAr: '€', symbolEn: 'EUR', country: 'الاتحاد الأوروبي', flag: '🇪🇺', decimals: 2 },
];

export function getActiveCurrencies(): string[] {
  try {
    const raw = localStorage.getItem('mf_store_active_currencies');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return ['SAR', 'USD', 'EGP', 'AED'];
}

export function getPrimaryCurrency(): CurrencyOption {
  try {
    const code = localStorage.getItem('mf_store_primary_currency') || 'SAR';
    const found = ALL_CURRENCIES.find(c => c.code === code);
    if (found) return found;
  } catch {}
  return ALL_CURRENCIES[0]; // SAR default
}

export function formatCurrency(amount: number | string, currencyCode?: string): string {
  const num = Number(amount) || 0;
  const currency = currencyCode
    ? ALL_CURRENCIES.find(c => c.code === currencyCode) || getPrimaryCurrency()
    : getPrimaryCurrency();

  return `${num.toLocaleString('ar-SA', { minimumFractionDigits: currency.decimals, maximumFractionDigits: currency.decimals })} ${currency.symbolAr}`;
}
