/**
 * Shared types for transversal project apps.
 * Includes core Brasaland business entities and helpers.
 */

export type Id = string;

export type ISODateString = string;

export type CountryCode = "CO" | "US";

export type CurrencyCode = "COP" | "USD";

export type MenuCategory = string;

export type PaymentMethod = string;

export type WasteReason = string;

export interface PriceByCurrency {
  USD: number;
  COP: number;
}

export interface BaseEntity {
  id: Id;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface MenuItem extends BaseEntity {
  name: string;
  description: string;
  category: MenuCategory;
  prices: PriceByCurrency;
  ingredientCost?: PriceByCurrency;
  prepTimeMinutes: number;
  availableInCountries: CountryCode[];
  isActive: boolean;
}

export interface SaleTransaction extends BaseEntity {
  locationId: Id;
  menuItemId: Id;
  quantity: number;
  unitPrice: PriceByCurrency;
  paymentMethod?: PaymentMethod;
  waiterName: string;
  soldAt: ISODateString;
  country: CountryCode;
}

export interface LocationOperatingCosts {
  rent: PriceByCurrency;
  utilities: PriceByCurrency;
}

export interface Location extends BaseEntity {
  name: string;
  city: string;
  country: CountryCode;
  openingYear: number;
  seatingCapacity: number;
  staffCount: number;
  operatingCosts: LocationOperatingCosts;
  isOpen: boolean;
}

export interface WasteRecord extends BaseEntity {
  locationId: Id;
  menuItemId?: Id;
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedCost: PriceByCurrency;
  reason: WasteReason;
  recordedAt: ISODateString;
  country: CountryCode;
}

export interface CountryMetrics {
  totalLocations: number;
  totalRevenue: PriceByCurrency;
  averageRevenuePerLocation: PriceByCurrency;
  totalSales: number;
}

export interface SalesTotals {
  USD: number;
  COP: number;
}

export interface WasteTotals {
  quantity: number;
  estimatedCost: PriceByCurrency;
}

export const ZERO_TOTALS: SalesTotals = {
  USD: 0,
  COP: 0,
};

export function getPriceByCurrency(prices: PriceByCurrency, currency: CurrencyCode): number {
  return prices[currency];
}

export function isMenuItemAvailableInCountry(item: MenuItem, country: CountryCode): boolean {
  return item.availableInCountries.includes(country);
}

export function calculateTransactionTotal(transaction: SaleTransaction): PriceByCurrency {
  return {
    USD: transaction.unitPrice.USD * transaction.quantity,
    COP: transaction.unitPrice.COP * transaction.quantity,
  };
}

export function sumSalesTransactions(transactions: SaleTransaction[]): SalesTotals {
  return transactions.reduce<SalesTotals>((acc, transaction) => {
    const total = calculateTransactionTotal(transaction);
    return {
      USD: acc.USD + total.USD,
      COP: acc.COP + total.COP,
    };
  }, ZERO_TOTALS);
}

export function calculateLocationMonthlyOperatingCost(location: Location): PriceByCurrency {
  return {
    USD: location.operatingCosts.rent.USD + location.operatingCosts.utilities.USD,
    COP: location.operatingCosts.rent.COP + location.operatingCosts.utilities.COP,
  };
}

export function sumWasteRecords(records: WasteRecord[]): WasteTotals {
  return records.reduce<WasteTotals>(
    (acc, record) => {
      return {
        quantity: acc.quantity + record.quantity,
        estimatedCost: {
          USD: acc.estimatedCost.USD + record.estimatedCost.USD,
          COP: acc.estimatedCost.COP + record.estimatedCost.COP,
        },
      };
    },
    {
      quantity: 0,
      estimatedCost: {
        USD: 0,
        COP: 0,
      },
    }
  );
}
