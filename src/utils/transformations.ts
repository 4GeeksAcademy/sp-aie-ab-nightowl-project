import type {
  CountryMetrics,
  CurrencyCode,
  Location,
  MenuItem,
  PaymentMethod,
  PriceByCurrency,
  SaleTransaction,
  WasteReason,
  WasteRecord,
} from "../../packages/shared/types";

function roundToTwo(value: number): number {
  return Number(value.toFixed(2));
}

function getSaleTotalInCurrency(sale: SaleTransaction, currency: CurrencyCode): number {
  return sale.unitPrice[currency] * sale.quantity;
}

function isSameDay(isoDate: string, date: Date): boolean {
  const candidate = new Date(isoDate);
  return (
    candidate.getUTCFullYear() === date.getUTCFullYear() &&
    candidate.getUTCMonth() === date.getUTCMonth() &&
    candidate.getUTCDate() === date.getUTCDate()
  );
}

function getOperatingDaysSinceOpening(openingYear: number): number {
  const openingDate = new Date(Date.UTC(openingYear, 0, 1));
  const now = new Date();
  const diffMs = Math.max(now.getTime() - openingDate.getTime(), 0);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}

function mapCountryToMetricsKey(country: string): "Colombia" | "USA" | null {
  if (country === "CO" || country === "Colombia") {
    return "Colombia";
  }

  if (country === "US" || country === "USA") {
    return "USA";
  }

  return null;
}

export function calculateDailyRevenue(
  sales: SaleTransaction[],
  date: Date,
  currency: CurrencyCode
): number {
  const total = sales.reduce((acc, sale) => {
    if (!isSameDay(sale.soldAt, date)) {
      return acc;
    }

    return acc + getSaleTotalInCurrency(sale, currency);
  }, 0);

  return roundToTwo(total);
}

export function calculateLocationMargin(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  locationId: string,
  currency: CurrencyCode
): number {
  const menuById = new Map<string, MenuItem>();
  menuItems.forEach((item) => {
    menuById.set(item.id, item);
  });

  const locationSales = sales.filter((sale) => sale.locationId === locationId);

  const totalRevenue = locationSales.reduce((acc, sale) => {
    return acc + getSaleTotalInCurrency(sale, currency);
  }, 0);

  if (totalRevenue <= 0) {
    return 0;
  }

  const totalIngredientCost = locationSales.reduce((acc, sale) => {
    const menuItem = menuById.get(sale.menuItemId);
    const ingredientUnitCost = menuItem?.ingredientCost?.[currency] ?? 0;
    return acc + ingredientUnitCost * sale.quantity;
  }, 0);

  const margin = ((totalRevenue - totalIngredientCost) / totalRevenue) * 100;
  const boundedMargin = Math.min(Math.max(margin, 0), 100);
  return roundToTwo(boundedMargin);
}

export function calculateWasteCost(
  wasteRecords: WasteRecord[],
  locationId: string,
  currency: CurrencyCode
): number {
  const total = wasteRecords.reduce((acc, record) => {
    if (record.locationId !== locationId) {
      return acc;
    }

    return acc + record.estimatedCost[currency];
  }, 0);

  return roundToTwo(total);
}

export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const USD_TO_COP_RATE = 4000;

  if (fromCurrency === "USD" && toCurrency === "COP") {
    return roundToTwo(amount * USD_TO_COP_RATE);
  }

  return roundToTwo(amount / USD_TO_COP_RATE);
}

export function scoreLocationPerformance(
  location: Location,
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[]
): number {
  const locationSales = sales.filter((sale) => sale.locationId === location.id);
  const totalRevenueUSD = locationSales.reduce((acc, sale) => {
    return acc + getSaleTotalInCurrency(sale, "USD");
  }, 0);

  const operatingDays = getOperatingDaysSinceOpening(location.openingYear);
  const avgDailyRevenue = totalRevenueUSD / operatingDays;
  const revenueScore = Math.min((avgDailyRevenue / 1000) * 40, 40);

  const seatsEfficiency =
    location.seatingCapacity > 0 ? (locationSales.length / location.seatingCapacity) * 30 : 0;
  const efficiencyScore = Math.min(seatsEfficiency, 30);

  const wasteCostUSD = calculateWasteCost(wasteRecords, location.id, "USD");
  const wastePercentage = totalRevenueUSD > 0 ? (wasteCostUSD / totalRevenueUSD) * 100 : 100;
  const wasteControlScore = Math.max(20 - wastePercentage * 2, 0);

  const margin = calculateLocationMargin(sales, menuItems, location.id, "USD");
  const marginScore = Math.min(margin / 10, 10);

  const totalScore = revenueScore + efficiencyScore + wasteControlScore + marginScore;
  return roundToTwo(Math.min(Math.max(totalScore, 0), 100));
}

export function rankLocationsByPerformance(
  locations: Location[],
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[]
): Array<{ location: Location; score: number }> {
  return locations
    .map((location) => ({
      location,
      score: scoreLocationPerformance(location, sales, wasteRecords, menuItems),
    }))
    .sort((a, b) => b.score - a.score);
}

export function countSalesByPaymentMethod(sales: SaleTransaction[]): Record<PaymentMethod, number> {
  const counts: Record<PaymentMethod, number> = {};

  sales.forEach((sale) => {
    const key = sale.paymentMethod ?? "Unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  });

  return counts;
}

export function calculateAverageTicket(sales: SaleTransaction[], currency: CurrencyCode): number {
  if (sales.length === 0) {
    return 0;
  }

  const total = sales.reduce((acc, sale) => {
    return acc + getSaleTotalInCurrency(sale, currency);
  }, 0);

  return roundToTwo(total / sales.length);
}

export function findTopSellingItems(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  topN: number
): Array<{ item: MenuItem; totalSold: number }> {
  const soldByItemId = new Map<string, number>();

  sales.forEach((sale) => {
    soldByItemId.set(sale.menuItemId, (soldByItemId.get(sale.menuItemId) ?? 0) + sale.quantity);
  });

  return menuItems
    .map((item) => ({
      item,
      totalSold: soldByItemId.get(item.id) ?? 0,
    }))
    .filter((entry) => entry.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, Math.max(topN, 0));
}

export function groupWasteByReason(wasteRecords: WasteRecord[]): Record<WasteReason, WasteRecord[]> {
  const grouped: Record<WasteReason, WasteRecord[]> = {};

  wasteRecords.forEach((record) => {
    const key = record.reason;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(record);
  });

  return grouped;
}

export function calculateCountryComparison(
  sales: SaleTransaction[],
  locations: Location[],
  _menuItems: MenuItem[]
): { Colombia: CountryMetrics; USA: CountryMetrics } {
  const baseMetrics = (): CountryMetrics => ({
    totalLocations: 0,
    totalRevenue: { USD: 0, COP: 0 },
    averageRevenuePerLocation: { USD: 0, COP: 0 },
    totalSales: 0,
  });

  const result: { Colombia: CountryMetrics; USA: CountryMetrics } = {
    Colombia: baseMetrics(),
    USA: baseMetrics(),
  };

  locations.forEach((location) => {
    const key = mapCountryToMetricsKey(location.country);
    if (!key) {
      return;
    }
    result[key].totalLocations += 1;
  });

  sales.forEach((sale) => {
    const key = mapCountryToMetricsKey(sale.country);
    if (!key) {
      return;
    }

    result[key].totalSales += 1;
    result[key].totalRevenue.USD += getSaleTotalInCurrency(sale, "USD");
    result[key].totalRevenue.COP += getSaleTotalInCurrency(sale, "COP");
  });

  (["Colombia", "USA"] as const).forEach((countryKey) => {
    const metrics = result[countryKey];
    const divisor = metrics.totalLocations > 0 ? metrics.totalLocations : 1;

    metrics.totalRevenue.USD = roundToTwo(metrics.totalRevenue.USD);
    metrics.totalRevenue.COP = roundToTwo(metrics.totalRevenue.COP);
    metrics.averageRevenuePerLocation = {
      USD: roundToTwo(metrics.totalRevenue.USD / divisor),
      COP: roundToTwo(metrics.totalRevenue.COP / divisor),
    };
  });

  return result;
}
