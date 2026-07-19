# 8. Operator-Based Filter System

**Status:** Accepted

## Context

Modules need to support flexible querying — filtering by fields, combining conditions, pattern matching. Options:

- **Ad-hoc repository methods:** Each query is a hand-written method (`findByEmail`, `findByStatusAndDate`). Simple but explodes in combinatorics.
- **Query builder passthrough:** Expose Drizzle's query builder directly to services. Flexible but leaks ORM details into the service layer.
- **Operator-based filters:** A structured filter object (`{ email: { $like: "%@gmail.com" }, status: { $in: ["active", "pending"] } }`) that the repository translates to SQL. Inspired by Medusa's filter system.

## Decision

BaseRepository accepts filter objects using a fixed set of operators:

```typescript
// Scalar operators
$eq, $ne, $gt, $gte, $lt, $lte, $like, $ilike, $in, $nin

// Logical operators
$and, $or
```

Each filterable entity defines a `FilterableXxxProps` interface in `core/types/` that declares which fields are filterable and what operators they accept:

```typescript
interface FilterableCustomerProps extends BaseFilterable<FilterableCustomerProps> {
  id?: string | string[]
  email?: string | OperatorMap<string>
  status?: string | string[]
}
```

BaseRepository's `find` method translates these to Drizzle SQL conditions via a `buildFilters` utility.

## Consequences

- Services express queries declaratively without knowing SQL or Drizzle internals
- The filter contract is typed — invalid filter combinations are caught at compile time
- New filterable fields require only a type change, not a new repository method
- Complex queries (joins, subqueries, aggregations) still need custom repository methods — the filter system handles the common 80%
- The `buildFilters` utility is a single point of translation — ORM changes only affect this one file
- API routes can pass user-provided filters directly to services (after validation) without manual mapping
