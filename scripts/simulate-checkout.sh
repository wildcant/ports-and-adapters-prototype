#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

step=0
step() {
  step=$((step + 1))
  echo ""
  echo -e "${GREEN}━━━ Step ${step}: $1 ━━━${NC}"
}

request() {
  local method=$1 path=$2 body=${3:-}
  echo -e "${DIM}${method} ${path}${NC}"
  if [ -n "$body" ]; then
    echo -e "${DIM}Body: ${body}${NC}"
  fi
}

response() {
  echo -e "${CYAN}$1${NC}"
}

# Ensure jq is available
if ! command -v jq &>/dev/null; then
  echo "Error: jq is required. Install it with: brew install jq"
  exit 1
fi

echo -e "${YELLOW}╔══════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║     Checkout Flow Simulation             ║${NC}"
echo -e "${YELLOW}║     ${DIM}${BASE_URL}${YELLOW}              ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════╝${NC}"

# ──────────────────────────────────────────
step "Browse products"
request GET /store/products

PRODUCTS=$(curl -sf "${BASE_URL}/store/products")
PRODUCT_ID=$(echo "$PRODUCTS" | jq -r '.products[0].id')
PRODUCT_TITLE=$(echo "$PRODUCTS" | jq -r '.products[0].title')
PRODUCT_COUNT=$(echo "$PRODUCTS" | jq '.products | length')
response "Found ${PRODUCT_COUNT} products. Picking: ${PRODUCT_TITLE} (${PRODUCT_ID})"

# ──────────────────────────────────────────
step "View product details + variants"
request GET "/store/products/${PRODUCT_ID}"

PRODUCT=$(curl -sf "${BASE_URL}/store/products/${PRODUCT_ID}")
VARIANT_ID=$(echo "$PRODUCT" | jq -r '.product.variants[0].id')
VARIANT_SKU=$(echo "$PRODUCT" | jq -r '.product.variants[0].sku')
VARIANT_TITLE=$(echo "$PRODUCT" | jq -r '.product.variants[0].title')
VARIANT_COUNT=$(echo "$PRODUCT" | jq '.product.variants | length')
response "Product has ${VARIANT_COUNT} variants. Picking: ${VARIANT_TITLE} / ${VARIANT_SKU} (${VARIANT_ID})"

# ──────────────────────────────────────────
step "Create cart"
CART_BODY='{"currencyCode":"usd"}'
request POST /store/carts "$CART_BODY"

CART_RESPONSE=$(curl -sf -X POST "${BASE_URL}/store/carts" \
  -H "Content-Type: application/json" \
  -d "$CART_BODY")
CART_ID=$(echo "$CART_RESPONSE" | jq -r '.cart.id')
response "Created cart: ${CART_ID}"

# ──────────────────────────────────────────
step "Add line item to cart"
ADD_ITEM_BODY=$(jq -n \
  --arg title "${PRODUCT_TITLE} (${VARIANT_TITLE})" \
  --arg variantId "$VARIANT_ID" \
  --arg productId "$PRODUCT_ID" \
  --arg productTitle "$PRODUCT_TITLE" \
  --arg variantSku "$VARIANT_SKU" \
  '{title: $title, quantity: 2, unitPrice: 2500, variantId: $variantId, productId: $productId, productTitle: $productTitle, variantSku: $variantSku}')
request POST "/store/carts/${CART_ID}/line-items" "$ADD_ITEM_BODY"

LINE_ITEM_RESPONSE=$(curl -sf -X POST "${BASE_URL}/store/carts/${CART_ID}/line-items" \
  -H "Content-Type: application/json" \
  -d "$ADD_ITEM_BODY")
LINE_ITEM_ID=$(echo "$LINE_ITEM_RESPONSE" | jq -r '.lineItem.id')
response "Added line item: ${LINE_ITEM_ID} (2x @ \$25.00)"

# ──────────────────────────────────────────
step "View cart"
request GET "/store/carts/${CART_ID}"

CART=$(curl -sf "${BASE_URL}/store/carts/${CART_ID}")
ITEM_COUNT=$(echo "$CART" | jq '.cart.items | length')
response "Cart has ${ITEM_COUNT} item(s):"
echo "$CART" | jq -r '.cart.items[] | "  - \(.title) x\(.quantity) @ $\(.unitPrice / 100)"'

# ──────────────────────────────────────────
step "Update line item quantity (2 → 3)"
UPDATE_BODY='{"quantity":3}'
request POST "/store/carts/${CART_ID}/line-items/${LINE_ITEM_ID}" "$UPDATE_BODY"

UPDATED_ITEM=$(curl -sf -X POST "${BASE_URL}/store/carts/${CART_ID}/line-items/${LINE_ITEM_ID}" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_BODY")
NEW_QTY=$(echo "$UPDATED_ITEM" | jq -r '.lineItem.quantity')
response "Updated quantity to ${NEW_QTY}"

# ──────────────────────────────────────────
step "Update cart (set email)"
UPDATE_CART_BODY='{"email":"customer@example.com"}'
request POST "/store/carts/${CART_ID}" "$UPDATE_CART_BODY"

UPDATED_CART=$(curl -sf -X POST "${BASE_URL}/store/carts/${CART_ID}" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_CART_BODY")
EMAIL=$(echo "$UPDATED_CART" | jq -r '.cart.email')
response "Set email to: ${EMAIL}"

# ──────────────────────────────────────────
step "Create payment collection for cart"
PAY_COL_BODY=$(jq -n --arg cartId "$CART_ID" '{cartId: $cartId}')
request POST /store/payment-collections "$PAY_COL_BODY"

PAY_COL_RESPONSE=$(curl -sf -X POST "${BASE_URL}/store/payment-collections" \
  -H "Content-Type: application/json" \
  -d "$PAY_COL_BODY")
PAY_COL_ID=$(echo "$PAY_COL_RESPONSE" | jq -r '.paymentCollection.id')
PAY_COL_AMOUNT=$(echo "$PAY_COL_RESPONSE" | jq -r '.paymentCollection.amount')
response "Created payment collection: ${PAY_COL_ID} (amount: \$$(echo "scale=2; ${PAY_COL_AMOUNT}/100" | bc))"

# ──────────────────────────────────────────
step "List payment providers"
request GET /store/payment-providers

PROVIDERS=$(curl -sf "${BASE_URL}/store/payment-providers")
PROVIDER_COUNT=$(echo "$PROVIDERS" | jq '.paymentProviders | length')
response "Available providers: ${PROVIDER_COUNT}"
echo "$PROVIDERS" | jq -r '.paymentProviders[] | "  - \(.id)"'

# ──────────────────────────────────────────
step "Initialize payment session (system provider)"
SESSION_BODY='{"providerId":"pp_system_default"}'
request POST "/store/payment-collections/${PAY_COL_ID}/payment-sessions" "$SESSION_BODY"

SESSION_RESPONSE=$(curl -sf -X POST "${BASE_URL}/store/payment-collections/${PAY_COL_ID}/payment-sessions" \
  -H "Content-Type: application/json" \
  -d "$SESSION_BODY")
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.paymentSession.id')
SESSION_STATUS=$(echo "$SESSION_RESPONSE" | jq -r '.paymentSession.status')
response "Created payment session: ${SESSION_ID} (status: ${SESSION_STATUS})"

# ──────────────────────────────────────────
step "Complete cart (authorize + capture + complete)"
request POST "/store/carts/${CART_ID}/complete"

COMPLETE_RESPONSE=$(curl -sf -X POST "${BASE_URL}/store/carts/${CART_ID}/complete" \
  -H "Content-Type: application/json")
CART_STATUS=$(echo "$COMPLETE_RESPONSE" | jq -r '.cart.status')
COMPLETED_AT=$(echo "$COMPLETE_RESPONSE" | jq -r '.cart.completedAt')
response "Cart completed! Status: ${CART_STATUS}, completedAt: ${COMPLETED_AT}"

# ──────────────────────────────────────────
step "Verify: get payment collection (admin)"
request GET "/admin/payment-collections/${PAY_COL_ID}"

FINAL_COL=$(curl -sf "${BASE_URL}/admin/payment-collections/${PAY_COL_ID}")
COL_STATUS=$(echo "$FINAL_COL" | jq -r '.paymentCollection.status')
CAPTURED=$(echo "$FINAL_COL" | jq -r '.paymentCollection.capturedAmount')
response "Payment collection status: ${COL_STATUS}, captured: \$$(echo "scale=2; ${CAPTURED}/100" | bc)"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Checkout complete!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
