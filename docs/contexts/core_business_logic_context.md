## Business Entities

### MenuItem

Represents an item on Brasaland's menu.

**Validation Rules:**

- Both `USD` and `COP` prices must be > 0
- `prepTimeMinutes` must be > 0 and <= 60
- `name` must not be empty
- Item must be available in at least one country

---

### SaleTransaction

Represents a sale made at a Brasaland location.

**Validation Rules:**

- `quantity` must be > 0
- Both price values must be > 0
- `waiterName` must not be empty

---

### Location

Represents a Brasaland restaurant location.

**Validation Rules:**

- `openingYear` must be >= 2008 and <= current year
- `seatingCapacity` must be > 0
- `staffCount` must be > 0
- Both rent and utilities costs must be > 0

---

### WasteRecord

Tracks food waste at a location.
