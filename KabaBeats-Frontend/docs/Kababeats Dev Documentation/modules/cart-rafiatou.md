# Cart — Rafiatou

## Purpose & User Value

The Cart module enables users to collect beats for purchase, manage quantities, and proceed to checkout. Users can add beats with different license types to their cart, review their selections, and complete purchases. This module provides a seamless shopping experience for beat licensing and downloads.

## Current Frontend Flow

### Main routes/components involved:
- **Cart Context**: `src/contexts/CartContext.tsx` - manages cart state and operations
- **Cart Interface**: `src/interface-types/cart/index.ts` - defines cart data structures
- **TopBar Cart**: `src/components/TopBar.tsx` - cart icon with item count and dropdown
- **Checkout Layout**: `src/modules/checkout/components/CheckoutLayout.tsx` - checkout process
- **Order Summary**: `src/modules/checkout/components/OrderSummary.tsx` - order details display
- **Payment Form**: `src/modules/checkout/components/PaymentForm.tsx` - payment processing
- **License Dialog**: `src/components/beat-card/LicenseDialog.tsx` - license selection for cart

### State management and key hooks:
- `useCart()` hook provides cart operations (add, remove, update, clear)
- Cart state managed in React context with local storage persistence
- Cart items include beat ID, license type, price, and quantity
- Total price and item count calculated dynamically

### How the UI calls services/handlers:
- Cart operations currently use local state (no backend integration yet)
- Checkout process simulates payment with mock processing
- License selection integrated with beat detail pages
- Cart persistence handled through React context

## Current Backend/API Flow

### Handlers/routes involved:
- **No backend cart routes currently implemented**
- Cart functionality exists only in frontend context
- Checkout process uses mock payment simulation
- No cart persistence across sessions

### Auth/ownership checks expected:
- User authentication required for cart operations
- Cart ownership verification for checkout
- License validation for beat purchases
- Payment processing security measures

### DB collections/documents touched:
- **No cart collection currently exists**
- Cart data not persisted to database
- No purchase history tracking implemented

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/cart/` | GET | Required | Get user cart | Pending | Not implemented |
| `/cart/` | POST | Required | Add item to cart | Pending | Not implemented |
| `/cart/:itemId` | PUT | Required | Update cart item | Pending | Not implemented |
| `/cart/:itemId` | DELETE | Required | Remove cart item | Pending | Not implemented |
| `/cart/clear` | DELETE | Required | Clear cart | Pending | Not implemented |
| `/checkout/` | POST | Required | Process checkout | Pending | Not implemented |
| `/purchases/` | GET | Required | Get purchase history | Pending | Not implemented |
| `/purchases/:purchaseId` | GET | Required | Get purchase details | Pending | Not implemented |

## Stories & Status

### Story: Add beat to cart
- **Status**: Partially Implemented
- **Current behavior**: Frontend cart functionality implemented with React context. Users can add beats to cart with license selection through LicenseDialog component. Cart state managed locally with add/remove/update operations. Cart icon in TopBar shows item count and provides cart dropdown view.
- **How it should work**: Complete implementation requires backend API integration for cart persistence, user authentication, and proper license validation. Cart should persist across sessions and integrate with payment processing.
- **Acceptance criteria**: 
  - Beats can be added to cart with license type selection
  - Cart persists across browser sessions
  - Cart items can be updated or removed
  - Cart integrates with checkout process
  - License validation ensures proper pricing

## Data & Validation

### Required inputs and constraints:
- **Beat ID**: Valid beat identifier, must exist in system
- **License Type**: Valid license type (MP3, WAV, Exclusive, etc.)
- **Quantity**: Positive integer, maximum quantity limits
- **Price**: Calculated based on beat base price and license type
- **User ID**: Authenticated user identifier for cart ownership

### Key error cases the UI must handle:
- **Authentication errors**: User not logged in, expired tokens
- **Validation errors**: Invalid beat ID, invalid license type, quantity limits
- **Availability errors**: Beat no longer available, license type not offered
- **Network errors**: API failures, connection issues, timeout handling
- **Payment errors**: Payment processing failures, insufficient funds

## Open Risks / Decisions

- **Backend integration**: Cart functionality needs complete backend API implementation
- **Session persistence**: Cart data not persisted across browser sessions
- **Payment integration**: Mock payment processing needs real payment gateway integration
- **License validation**: No backend validation of license availability and pricing
- **Inventory management**: No stock tracking for exclusive licenses
- **Purchase history**: No tracking of completed purchases and downloads
- **Cart abandonment**: No recovery mechanisms for abandoned carts

## Test Scenarios

- **Add to cart**: User adds beat with license type, item appears in cart with correct pricing
- **Update quantity**: User changes quantity of cart item, total price updates correctly
- **Remove from cart**: User removes item from cart, item disappears and total updates
- **Clear cart**: User clears entire cart, all items removed and total resets
- **Cart persistence**: Cart items persist across browser sessions (when backend implemented)
- **Checkout process**: User proceeds to checkout, order summary displays correctly
- **Payment processing**: Payment form processes successfully, cart cleared after purchase
- **Error handling**: Invalid operations show appropriate error messages
- **License validation**: Invalid license types rejected with proper error messages
- **Authentication**: Unauthenticated users redirected to login before cart operations
