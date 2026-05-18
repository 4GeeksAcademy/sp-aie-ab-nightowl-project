import type {
  CurrencyCode,
  Location,
  MenuCategory,
  MenuItem,
  SaleTransaction,
} from "../../packages/shared/types";

export function filterSalesByLocation(sales: SaleTransaction[], locationId: string): SaleTransaction[] {
  return sales.filter((sale) => sale.locationId === locationId);
}

export function filterSalesByDateRange(
  sales: SaleTransaction[],
  startDate: Date,
  endDate: Date
): SaleTransaction[] {
  const start = startDate.getTime();
  const end = endDate.getTime();

  return sales.filter((sale) => {
    const saleTime = new Date(sale.soldAt).getTime();
    return saleTime >= start && saleTime <= end;
  });
}

export function filterMenuItemsByCategory(items: MenuItem[], category: MenuCategory): MenuItem[] {
  return items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
}

export function filterActiveLocations(locations: Location[]): Location[] {
  return locations.filter((location) => location.isOpen);
}

export function sortLocationsByCapacity(locations: Location[], order: "asc" | "desc"): Location[] {
  const sorted = [...locations];
  sorted.sort((a, b) => {
    const diff = a.seatingCapacity - b.seatingCapacity;
    return order === "asc" ? diff : -diff;
  });
  return sorted;
}

export function sortMenuItemsByPrice(
  items: MenuItem[],
  currency: CurrencyCode,
  order: "asc" | "desc"
): MenuItem[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const diff = a.prices[currency] - b.prices[currency];
    return order === "asc" ? diff : -diff;
  });
  return sorted;
}
