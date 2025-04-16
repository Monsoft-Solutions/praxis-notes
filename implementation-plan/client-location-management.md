# Client Location Management - Implementation Plan

## Overview

This document outlines the implementation plan for Issue #4: Client Location Management. The feature will allow users to manage and associate locations with clients for therapy sessions.

## Architecture

The implementation will follow the module pattern established in the codebase, creating a new module in `/praxis-notes-app/src/location` with a structure similar to the existing `antecedent` module:

```
/location
  /api
    - location.api.ts
    - create-location.mutation.ts
    - get-locations.query.ts
    - add-client-location.mutation.ts
    - get-client-locations.query.ts
    - remove-client-location.mutation.ts
    - index.ts
  /components
    - LocationForm.tsx
    - LocationSelector.tsx
    - ClientLocationList.tsx
  /db
    - location.table.ts
    - client-location.table.ts
    - index.ts
  /schemas
    - location.schema.ts
    - client-location.schema.ts
    - index.ts
  /seed
    - location.seed.ts
    - index.ts
  /views
    - ClientLocationEdit.tsx
```

Additionally, we'll need to update the client module to integrate location management.

## Implementation Tasks

1. **Database Schema**

    - Create location table with fields: id, name, description, organizationId
    - Create client_location junction table to establish many-to-many relationship
    - Update database exports to include new tables

2. **Schemas**

    - Define Zod schemas for location and client-location relationships
    - Create appropriate validation rules for location data

3. **API Endpoints**

    - Implement CRUD operations for locations:
        - Create location
        - Get locations (filtered by organization)
        - Update location
        - Delete location
    - Implement client-location relationship operations:
        - Add location to client
        - Remove location from client
        - Get locations for a specific client

4. **Seed Data**

    - Create seed file with common therapy locations:
        - Home
        - School
        - Therapy center
        - Daycare
        - Clinic
        - Community center
        - Park
        - Library
        - Other

5. **UI Components**

    - Create LocationForm component for adding/editing locations
    - Create LocationSelector component for selecting client locations
    - Create ClientLocationList component for displaying client locations

6. **Client Integration**

    - Update client creation form to include location selection
    - Implement client edit view to manage associated locations
    - Modify session creation to only show locations associated with selected client

## Implementation Order

The implementation will proceed in the following order to ensure incremental value delivery:

1. Database schema and migrations (Tables, relationships)
2. Seed data for predefined locations
3. Basic API endpoints for location management
4. UI components for location management
5. Client-location relationship functionality
6. Client creation/edit form updates
7. Session creation integration
8. Testing and refinement

## Technical Considerations

- Ensure proper foreign key relationships between clients and locations
- Implement appropriate indexes for query performance
- Handle edge cases like duplicate locations
- Ensure proper validation for all user inputs
- Consider soft deletion for locations that might be referenced by historical data

## Acceptance Criteria Verification

- Location table is properly defined with necessary fields
- Predefined location seeds are available in the system
- Users can associate multiple locations with a client
- Client creation includes optional location selection
- Client edit functionality allows updating location associations
- Session creation only displays locations relevant to the selected client
- All CRUD operations for locations work properly
