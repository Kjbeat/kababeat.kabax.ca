# Licenses — Abiola

## Purpose & User Value

The Licenses module manages beat licensing options, pricing, and usage rights. Users can configure different license types (MP3, WAV, Exclusive, etc.) with custom pricing and usage restrictions. The module provides comprehensive license management for producers and clear licensing information for buyers.

## Current Frontend Flow

### Main routes/components involved:
- **License Dialog**: `src/components/beat-card/LicenseDialog.tsx` - license selection interface
- **User License Settings**: `src/modules/user/userLicenseSettings.controller.ts` - license configuration
- **Beat Detail**: `src/modules/beat/components/BeatDetailLayout.tsx` - license display
- **Upload Flow**: `src/modules/upload/components/` - license setup during upload

### State management and key hooks:
- License data managed through API calls and local state
- User license settings stored in user profile
- License pricing calculated dynamically based on beat base price
- License selection integrated with cart and checkout flow

### How the UI calls services/handlers:
- License data fetched from `/api/v1/license/*` endpoints
- User license settings managed through `/api/v1/user-license-settings/*` endpoints
- License pricing calculated through `/api/v1/license/calculate-price` endpoint
- License selection integrated with beat detail and cart functionality

## Current Backend/API Flow

### Handlers/routes involved:
- **License Routes**: `src/routes/v1/license.routes.ts` - license management endpoints
- **User License Settings Routes**: `src/routes/v1/userLicenseSettings.routes.ts` - user configuration
- **License Controller**: `src/modules/license/license.controller.ts` - license operations
- **License Service**: `src/modules/license/license.service.ts` - business logic
- **User License Settings Controller**: `src/modules/user/userLicenseSettings.controller.ts` - user settings
- **User License Settings Service**: `src/modules/user/userLicenseSettings.service.ts` - user logic

### Auth/ownership checks expected:
- JWT token validation for license management
- User ownership verification for license settings
- Public access for license information display
- Admin access for license type management

### DB collections/documents touched:
- **licenses** collection - license types, pricing, features, restrictions
- **userlicensesettings** collection - user-specific license configurations
- **beats** collection - license availability and pricing

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/license/` | GET | None | Get all licenses | Implemented | Public access |
| `/license/active` | GET | None | Get active licenses | Implemented | Public access |
| `/license/:id` | GET | None | Get license by ID | Implemented | Public access |
| `/license/type/:type` | GET | None | Get license by type | Implemented | Public access |
| `/license/` | POST | Admin | Create license | Implemented | Admin only |
| `/license/:id` | PUT | Admin | Update license | Implemented | Admin only |
| `/license/:id` | DELETE | Admin | Delete license | Implemented | Admin only |
| `/license/calculate-price` | POST | None | Calculate license price | Implemented | Public access |
| `/user-license-settings/` | GET | Required | Get user settings | Implemented | User access |
| `/user-license-settings/` | PUT | Required | Update user settings | Implemented | User access |
| `/user-license-settings/default` | POST | Required | Create default settings | Implemented | User access |
| `/user-license-settings/user/:userId` | GET | Required | Get user settings by ID | Implemented | User access |

## Stories & Status

### Story: Edit beat's license
- **Status**: Implemented
- **Current behavior**: Users can edit license settings for their beats through user license settings endpoints. License configurations include pricing, territory, usage rights, and restrictions for different license types (MP3, WAV, Trackout, Unlimited, Exclusive).
- **Acceptance criteria**: ✅ License editing working, pricing configuration, usage rights management

### Story: Export beat license
- **Status**: Implemented
- **Current behavior**: License information can be exported and displayed through license API endpoints. Users can view license details, pricing, and usage rights for beats.
- **Acceptance criteria**: ✅ License export working, detailed information available

### Story: Change the beat's license
- **Status**: Implemented
- **Current behavior**: Users can modify license configurations for their beats through user license settings. Changes include pricing updates, territory modifications, and usage right adjustments.
- **Acceptance criteria**: ✅ License changes working, configuration updates, validation

### Story: Currency Synchronization
- **Status**: Pending
- **How it should work**: When a user changes the currency for any license type (MP3, WAV, Trackout, Unlimited, Exclusive), the system should automatically update the currency for all other license types to maintain consistency. This ensures all licenses use the same currency for a user's beats.
- **Acceptance criteria**: 
  - Currency change for one license type updates all license types
  - Price conversion handled automatically when currency changes
  - User receives confirmation of currency change across all licenses
  - Historical pricing preserved with currency conversion notes

### Story: Show beat license
- **Status**: Implemented
- **Current behavior**: License information displayed on beat detail pages and in license dialogs. Users can view available license types, pricing, and usage restrictions for each beat.
- **Acceptance criteria**: ✅ License display working, clear information, pricing visible

### Story: Toggles License
- **Status**: Implemented
- **Current behavior**: Users can enable/disable different license types for their beats through user license settings. License toggles control availability and pricing for each license type.
- **Acceptance criteria**: ✅ License toggles working, enable/disable functionality, availability control

### Story: Update license's info (attributes)
- **Status**: Implemented
- **Current behavior**: License attributes can be updated through license management endpoints. Changes include features, usage rights, restrictions, and pricing information.
- **Acceptance criteria**: ✅ License updates working, attribute modification, validation

### Story: Display licenses
- **Status**: Implemented
- **Current behavior**: License information displayed throughout the platform including beat detail pages, license dialogs, and user settings. Comprehensive license information available for all license types.
- **Acceptance criteria**: ✅ License display working, comprehensive information, clear presentation

## Data & Validation

### Required inputs and constraints:
- **License types**: MP3, WAV, Trackout, Unlimited, Exclusive
- **Pricing**: Base price, territory-specific pricing, usage-based pricing
- **Currency**: Unified currency across all license types for a user
- **Usage rights**: Distribution, videos, radio, live performance rights
- **Restrictions**: Usage limitations, territory restrictions, exclusivity terms
- **Features**: License-specific features and capabilities

### Key error cases the UI must handle:
- **Validation errors**: Invalid pricing, conflicting usage rights, invalid territory
- **Permission errors**: Unauthorized license modification, insufficient privileges
- **Configuration errors**: Invalid license settings, missing required fields
- **Pricing errors**: Invalid price calculations, currency conversion issues
- **Availability errors**: License type not available, conflicting exclusivity
- **Currency errors**: Invalid currency codes, conversion rate failures, currency synchronization errors

## Open Risks / Decisions

- **License complexity**: Complex license configurations may need simplified UI
- **Pricing calculations**: Dynamic pricing may need optimization for performance
- **Territory management**: Geographic restrictions may need enhanced validation
- **Usage tracking**: License usage monitoring and compliance tracking
- **Legal compliance**: License terms and legal requirements validation
- **International pricing**: Currency conversion and regional pricing strategies
- **Currency synchronization**: Need reliable currency conversion rates and real-time updates
- **Currency consistency**: Ensure all license types maintain same currency for user
- **Price conversion accuracy**: Accurate conversion rates and handling of currency fluctuations

## Test Scenarios

- **License display**: User views license information, all details displayed correctly
- **License editing**: User edits license settings, changes saved and validated
- **Pricing calculation**: License prices calculated correctly based on beat base price
- **License toggles**: User enables/disables license types, availability updated
- **Usage rights**: License usage rights displayed and configured correctly
- **Territory settings**: Geographic restrictions configured and enforced
- **License export**: License information exported in proper format
- **Error handling**: Invalid license configurations show appropriate errors
- **Permission checks**: Unauthorized license modifications properly blocked
- **Integration**: License system integrates properly with cart and checkout
- **Currency synchronization**: User changes currency for one license, all licenses update automatically
- **Currency conversion**: Price conversion handled accurately when currency changes
- **Currency consistency**: All license types maintain same currency for user
- **Currency validation**: Invalid currency codes rejected with appropriate error messages
