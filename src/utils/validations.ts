import type {
  Location,
  MenuItem,
  PriceByCurrency,
  SaleTransaction,
  ValidationError,
  ValidationResult,
  WasteRecord,
} from "../../packages/shared/types";

function hasPositivePrice(prices: PriceByCurrency): boolean {
  return prices.USD > 0 && prices.COP > 0;
}

function buildValidationResult(errors: ValidationError[]): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMenuItem(menuItem: MenuItem): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasPositivePrice(menuItem.prices)) {
    errors.push({
      field: "prices",
      message: "Both USD and COP prices must be greater than 0.",
    });
  }

  if (menuItem.prepTimeMinutes <= 0 || menuItem.prepTimeMinutes > 60) {
    errors.push({
      field: "prepTimeMinutes",
      message: "prepTimeMinutes must be greater than 0 and less than or equal to 60.",
    });
  }

  if (menuItem.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "name must not be empty.",
    });
  }

  if (menuItem.availableInCountries.length === 0) {
    errors.push({
      field: "availableInCountries",
      message: "Item must be available in at least one country.",
    });
  }

  return buildValidationResult(errors);
}

export function validateSaleTransaction(transaction: SaleTransaction): ValidationResult {
  const errors: ValidationError[] = [];

  if (transaction.quantity <= 0) {
    errors.push({
      field: "quantity",
      message: "quantity must be greater than 0.",
    });
  }

  if (!hasPositivePrice(transaction.unitPrice)) {
    errors.push({
      field: "unitPrice",
      message: "Both USD and COP prices must be greater than 0.",
    });
  }

  if (transaction.waiterName.trim().length === 0) {
    errors.push({
      field: "waiterName",
      message: "waiterName must not be empty.",
    });
  }

  return buildValidationResult(errors);
}

export function validateLocation(location: Location): ValidationResult {
  const errors: ValidationError[] = [];
  const currentYear = new Date().getFullYear();

  if (location.openingYear < 2008 || location.openingYear > currentYear) {
    errors.push({
      field: "openingYear",
      message: "openingYear must be between 2008 and the current year.",
    });
  }

  if (location.seatingCapacity <= 0) {
    errors.push({
      field: "seatingCapacity",
      message: "seatingCapacity must be greater than 0.",
    });
  }

  if (location.staffCount <= 0) {
    errors.push({
      field: "staffCount",
      message: "staffCount must be greater than 0.",
    });
  }

  if (!hasPositivePrice(location.operatingCosts.rent)) {
    errors.push({
      field: "operatingCosts.rent",
      message: "Both USD and COP rent costs must be greater than 0.",
    });
  }

  if (!hasPositivePrice(location.operatingCosts.utilities)) {
    errors.push({
      field: "operatingCosts.utilities",
      message: "Both USD and COP utilities costs must be greater than 0.",
    });
  }

  return buildValidationResult(errors);
}

export function validateWasteRecord(_record: WasteRecord): ValidationResult {
  return buildValidationResult([]);
}
