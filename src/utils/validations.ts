import type {
  Location,
  MenuItem,
  PriceByCurrency,
  SaleTransaction,
} from "../../packages/shared/types";

export interface EntityValidationResult {
  valid: boolean;
  errors: string[];
}

function hasPositivePrice(prices: PriceByCurrency): boolean {
  return prices.USD > 0 && prices.COP > 0;
}

function buildValidationResult(errors: string[]): EntityValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateMenuItem(menuItem: MenuItem): EntityValidationResult {
  const errors: string[] = [];

  if (!hasPositivePrice(menuItem.prices)) {
    errors.push("Both USD and COP prices must be greater than 0.");
  }

  if (menuItem.prepTimeMinutes <= 0 || menuItem.prepTimeMinutes > 60) {
    errors.push("prepTimeMinutes must be greater than 0 and less than or equal to 60.");
  }

  if (menuItem.name.trim().length === 0) {
    errors.push("name must not be empty.");
  }

  if (menuItem.availableInCountries.length === 0) {
    errors.push("Item must be available in at least one country.");
  }

  return buildValidationResult(errors);
}

export function validateSaleTransaction(transaction: SaleTransaction): EntityValidationResult {
  const errors: string[] = [];

  if (transaction.quantity <= 0) {
    errors.push("quantity must be greater than 0.");
  }

  if (!hasPositivePrice(transaction.unitPrice)) {
    errors.push("Both USD and COP prices must be greater than 0.");
  }

  if (transaction.waiterName.trim().length === 0) {
    errors.push("waiterName must not be empty.");
  }

  return buildValidationResult(errors);
}

export function validateLocation(location: Location): EntityValidationResult {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  if (location.openingYear < 2008 || location.openingYear > currentYear) {
    errors.push("openingYear must be between 2008 and the current year.");
  }

  if (location.seatingCapacity <= 0) {
    errors.push("seatingCapacity must be greater than 0.");
  }

  if (location.staffCount <= 0) {
    errors.push("staffCount must be greater than 0.");
  }

  if (!hasPositivePrice(location.operatingCosts.rent)) {
    errors.push("Both USD and COP rent costs must be greater than 0.");
  }

  if (!hasPositivePrice(location.operatingCosts.utilities)) {
    errors.push("Both USD and COP utilities costs must be greater than 0.");
  }

  return buildValidationResult(errors);
}
