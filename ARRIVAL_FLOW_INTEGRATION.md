# Store Instructions Integration - Arrival Flow

## Overview
Integrated the `StoreArrivalInstructions` component into the real task flow, displaying store instructions automatically when Zubaleros click "I arrived at the store".

## Changes Made

### 1. New Modal Screen
**File**: `/var/www/zubale-app/src/screens/storeInstructions/StoreInstructionsModalScreen.tsx`

A modal screen that wraps the `StoreArrivalInstructions` component, receives `storeId` and `onContinue` callback from navigation params.

```typescript
export function StoreInstructionsModalScreen(props: Props) {
  const { route, navigation } = props
  const { storeId, onContinue } = route.params

  const handleContinue = () => {
    navigation.goBack()
    if (onContinue) {
      onContinue()
    }
  }

  return (
    <View style={styles.container}>
      <StoreArrivalInstructions storeId={storeId} onContinue={handleContinue} />
    </View>
  )
}
```

### 2. Navigation Types
**File**: `/var/www/zubale-app/src/navigation/types.ts`

Added `StoreInstructionsModalScreen` to `AppParamsNavigator`:

```typescript
StoreInstructionsModalScreen: {
  storeId: string
  onContinue: () => void
}
```

### 3. Navigation Registration
**File**: `/var/www/zubale-app/src/navigation/Root.tsx`

- Imported `StoreInstructionsModalScreen`
- Registered it in the Modal group with modal presentation style

### 4. PolygonTaskSummaryScreen Integration
**File**: `/var/www/zubale-app/src/screens/form/PolygonTaskSummaryScreen.tsx`

Modified `onArrivedAtTheStore()` to:
1. Extract `storeId` from the first quest in batch
2. Navigate to `StoreInstructionsModalScreen` with the store ID
3. Pass an `onContinue` callback that:
   - Calls `continueToForms()` to proceed to the form
   - Updates status to 'started'
   - Tracks analytics for task start
4. Falls back to direct form navigation if no storeId found

```typescript
async function onArrivedAtTheStore() {
  const quest = batchedQuests[0]
  const storeId = quest?.store?.storeId || quest?.store?.id

  if (storeId) {
    navigation.navigate('StoreInstructionsModalScreen', {
      storeId: String(storeId),
      onContinue: () => {
        continueToForms()
        setStatus('started')
        analyticsTrack('SELECT_START_TASK', { ... })
      },
    })
  } else {
    // Fallback to direct navigation
  }
}
```

### 5. DeliverySummary Integration
**File**: `/var/www/zubale-app/src/screens/form/components/delivery/DeliverySummary.tsx`

Modified the "Go to Store" step action (line 430) to:
1. Extract `storeId` from the first quest in batch
2. Show store instructions modal before navigating to pickup order screen
3. Pass an `onContinue` callback that:
   - Updates quest status to `AT_STORE`
   - Dispatches `setAtStore` action
   - Navigates to `DELIVERY_PICKUP_ORDER` screen
4. Falls back to direct navigation if no storeId found

```typescript
action: () => {
  if (nearStore) {
    const storeId = _.get(_.head(batchedQuests), 'store.storeId') || 
                   _.get(_.head(batchedQuests), 'store.id')
    
    if (storeId) {
      navigation.navigate('StoreInstructionsModalScreen', {
        storeId: String(storeId),
        onContinue: () => {
          // Update quest status and navigate to pickup
        },
      })
    }
  }
}
```

### 6. Localized Strings
Added translations for "Store Instructions":

**English** (`EnglishStrings.js`):
```javascript
store_instructions: 'Store Instructions',
```

**Spanish** (`MexicoStrings.js`):
```javascript
store_instructions: 'Instrucciones de la tienda',
```

**Portuguese** (`BrazilStrings.js`):
```javascript
store_instructions: 'Instruções da loja',
```

## User Flow

### Before Integration:
1. User sees "I arrived at the store" button
2. User clicks button
3. App immediately proceeds to next screen (form or pickup)

### After Integration:
1. User sees "I arrived at the store" button
2. User clicks button
3. **App shows store instructions modal with rich content (text, images, videos)**
4. User reads instructions and clicks "Continue"
5. App proceeds to next screen (form or pickup)

## Technical Details

### Store ID Extraction
The integration checks two possible locations for store ID:
- `quest.store.storeId` (primary)
- `quest.store.id` (fallback)

If no store ID is found, the flow bypasses the instructions modal and continues directly (graceful degradation).

### Navigation Pattern
Uses React Navigation's modal presentation, which:
- Slides up from bottom on iOS
- Fades in on Android
- Shows a dismiss gesture
- Maintains clean navigation stack

### Callback Pattern
The `onContinue` callback preserves the original navigation logic, ensuring:
- Quest status updates happen at the right time
- Analytics tracking continues to work
- State management (Redux) remains consistent
- Navigation flow doesn't break

## Testing Instructions

1. Start the CMS backend:
   ```bash
   cd /var/www/store-instructions-cms
   npm run dev
   ```

2. Create instructions for a test store:
   - Open http://localhost:3000
   - Add a store with a known `storeId` (e.g., "store_001")
   - Create instructions with text, images, and/or video blocks

3. Run the mobile app:
   ```bash
   cd /var/www/zubale-app
   npm run android  # or npm run ios
   ```

4. Test the flow:
   - Accept a task with store pickup
   - Navigate to the task summary screen
   - Click "I arrived at the store" button
   - Verify the store instructions modal appears
   - Review the content (should show all blocks created in CMS)
   - Click "Continue" button
   - Verify the app proceeds to the next screen correctly

## Integration Points

This implementation touches two main flows:

1. **Polygon Task Flow** (`PolygonTaskSummaryScreen`):
   - New tasks from polygon/batching system
   - "I arrived at the store" button triggers modal

2. **Delivery Summary Flow** (`DeliverySummary`):
   - Multi-step delivery process
   - "I arrived at the store" button in step progression triggers modal

Both flows now show store instructions before continuing to their respective next steps.

## Fallback Behavior

If the CMS API is unavailable or returns a 404 (no instructions for that store):
- The `StoreArrivalInstructions` component automatically calls `onContinue()`
- User proceeds directly to the next screen without interruption
- No blocking errors or crashes

This ensures the POC doesn't break existing functionality if instructions aren't available.

## Next Steps (Optional Enhancements)

1. Add analytics tracking for instruction views
2. Track which blocks users actually view (scroll tracking)
3. Add ability to dismiss/skip instructions
4. Cache instructions locally for offline access
5. Add A/B testing to measure impact on completion rates
6. Expand to other arrival flows (return to store, etc.)
