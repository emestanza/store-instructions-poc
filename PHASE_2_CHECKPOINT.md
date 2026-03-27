# Phase 2 Checkpoint: Mobile Integration

**Date**: March 27, 2026  
**Status**: ✅ Complete  
**Branch**: `feat/FOSV2-1178-store-arrival-instructions` (from `develop`)

## What Was Built

### 1. API Integration (Constants & Gateway)

**Updated Files**:
- `src/helpers/Constants.js`: Added `STORE_INSTRUCTIONS: '/api/mobile/store-instructions/'`
- `src/api/Gateway.js`: Added `getStoreInstructions(storeId)` method

**API Method**:
```javascript
export const getStoreInstructions = async (storeId: string) => {
  // Fetches from: ${API_BASE_URL}/api/mobile/store-instructions/${storeId}
  // Returns: { data, error, traceId }
}
```

### 2. React Native Component (Store Arrival Instructions)

**Component Structure**:
```
src/components/StoreArrivalInstructions/
├── StoreArrivalInstructions.tsx  # Main container component
├── InstructionBlock.tsx          # Block type router
├── TextBlock.tsx                 # Text content renderer
├── ImageBlock.tsx                # Image renderer with FastImage
├── VideoBlock.tsx                # Video player with thumbnail
├── styles.ts                     # Zubale design token styles
└── index.ts                      # Exports
```

**Features Implemented**:
- Fetches instructions from CMS API
- Graceful error handling (no instructions = skip to onContinue)
- Loading states with ActivityIndicator
- Analytics tracking (fetch start/success, video play, continue)
- Error tracking with proper error codes
- Scrollable content with sticky footer button
- Video player with play/pause and thumbnail support
- Image rendering with FastImage caching
- Text blocks with Zubale typography

**Component Props**:
```typescript
type Props = {
  storeId: string         // External store ID (e.g., "store_001")
  onContinue?: () => void // Callback when user clicks continue
}
```

**Component Behavior**:
1. Fetches instructions on mount
2. Shows loading spinner while fetching
3. If 404 or no data: automatically calls `onContinue()` (skip gracefully)
4. If error: shows error message with "Continue anyway" button
5. If success: displays instruction title + ordered content blocks + continue button

### 3. Test Screen (POC Validation)

**Location**: `src/screens/storeInstructions/StoreInstructionsTestScreen.tsx`

**Features**:
- Input field to enter store ID (defaults to "store_001")
- "Load" button to fetch instructions for entered store ID
- Full-screen preview of StoreArrivalInstructions component
- Back navigation support
- Analytics tracking

**Navigation Integration**:
- Added to `src/navigation/types.ts`: `StoreInstructionsTestScreen: { storeId?: string }`
- Added to `src/navigation/Root.tsx`: Screen registration with "Store Instructions Test" title

**Access Method**:
- Navigate programmatically: `navigation.navigate('StoreInstructionsTestScreen', { storeId: 'store_001' })`
- Or open from test/development menu

### 4. Design Token Integration

All components use official Zubale design tokens:
- **Colors**: `R.color.brand.primary`, `R.color.neutral.x*`, `R.color.negative.x*`
- **Typography**: `R.font.size.x*`, `R.font.weight.*`, `R.font.family.primary.*`
- **Spacing**: `R.space.x*` (consistent with Zubale mobile app)

**Visual Style**:
- Text blocks: Light gray background with blue left border
- Images: Rounded corners with captions
- Videos: Black background with play button overlay
- Continue button: Full-width sticky footer

## Files Created/Modified

**New Files** (7):
```
src/components/StoreArrivalInstructions/
  - StoreArrivalInstructions.tsx (main component)
  - InstructionBlock.tsx (block router)
  - TextBlock.tsx (text renderer)
  - ImageBlock.tsx (image renderer)
  - VideoBlock.tsx (video player)
  - styles.ts (design tokens)
  - index.ts (exports)

src/screens/storeInstructions/
  - StoreInstructionsTestScreen.tsx (test screen)
  - styles.ts (test screen styles)
```

**Modified Files** (4):
```
src/api/Gateway.js (added getStoreInstructions method)
src/helpers/Constants.js (added STORE_INSTRUCTIONS endpoint)
src/navigation/types.ts (added StoreInstructionsTestScreen type)
src/navigation/Root.tsx (registered test screen)
```

## Dependencies Used

All dependencies already exist in zubale-app:
- ✅ `react-native-fast-image` - Image caching and performance
- ✅ `react-native-video` - Video playback
- ✅ `react-native-vector-icons` - Play button icon
- ✅ `@zubale/design-tokens` - Design system
- ✅ Existing analytics/error tracking helpers

**No new dependencies needed!**

## Testing Instructions

### Option 1: Via Test Screen
1. Start React Native app: `cd /var/www/zubale-app && yarn android`
2. Navigate to test screen (add button in dev menu or navigate programmatically)
3. Enter store ID (e.g., "store_001", "store_002", "store_003")
4. Click "Load" to fetch instructions
5. Verify content displays correctly
6. Click "Continuar" button

### Option 2: Integrate Into Existing Flow
Use `StoreArrivalInstructions` component in any screen:
```typescript
import { StoreArrivalInstructions } from '~/components/StoreArrivalInstructions'

<StoreArrivalInstructions 
  storeId="store_001"
  onContinue={() => {
    // Navigate to next screen or dismiss modal
  }}
/>
```

### CMS Server Must Be Running
Ensure the CMS is accessible at the API endpoint. For local testing:
- CMS running on `http://localhost:3000`
- Update `Constants.js` `API_BASE_URL` to point to CMS or use proxy/tunnel

## API Response Format (Expected by Component)

```json
{
  "success": true,
  "data": {
    "store_id": "store_001",
    "store_name": "Walmart Polanco",
    "instruction": {
      "id": "1",
      "title": "Instrucciones de llegada - Walmart Polanco",
      "blocks": [
        {
          "id": "1",
          "type": "text",
          "position": 1,
          "content": {
            "text": "Bienvenido a Walmart Polanco..."
          }
        },
        {
          "id": "2",
          "type": "image",
          "position": 2,
          "content": {
            "image_url": "/uploads/image.jpg",
            "image_caption": "Entrance photo",
            "image_alt": "Store entrance"
          }
        },
        {
          "id": "3",
          "type": "video",
          "position": 3,
          "content": {
            "video_url": "/uploads/video.mp4",
            "video_thumbnail_url": "/uploads/thumb.jpg",
            "video_duration": 45
          }
        }
      ]
    }
  }
}
```

## Analytics Events

The component tracks:
- `STORE_INSTRUCTIONS_FETCH_START` - When fetch begins
- `STORE_INSTRUCTIONS_FETCH_SUCCESS` - When instructions load (includes blocks_count)
- `STORE_INSTRUCTIONS_CONTINUE` - When user clicks continue button
- `STORE_INSTRUCTIONS_VIDEO_PLAY` - When user plays a video
- `STORE_INSTRUCTIONS_TEST_LOAD` - When test screen loads instructions
- `STORE_INSTRUCTIONS_TEST_CONTINUE` - When test screen continues

Errors tracked via `errorTrack()` helper with proper error codes.

## Git Branch Status

**Branch**: `feat/FOSV2-1178-store-arrival-instructions`  
**Base**: `develop` (clean, up to date)  
**Modified**: 4 files  
**New**: 9 files  
**Status**: Ready for testing

Previous work from `feat/FOSV2-1174-mobile-location-batching` was stashed and kept separate.

## What's Next (Phase 3: End-to-End Testing)

### Testing Checklist:
1. ✅ CMS backend API works
2. ✅ Admin UI works with design tokens
3. ✅ Mobile preview in CMS works
4. ✅ Mobile component built with design tokens
5. ⏸️ Test mobile component in React Native app
6. ⏸️ Verify all three block types render correctly
7. ⏸️ Test error states (no instructions, network error)
8. ⏸️ Verify analytics tracking
9. ⏸️ Test with different store IDs

### How to Test End-to-End:
1. Ensure CMS server running: `http://localhost:3000`
2. Create/verify instructions in CMS for test stores
3. Configure mobile app to point to CMS API (localhost or tunnel)
4. Run mobile app: `cd /var/www/zubale-app && yarn android`
5. Navigate to `StoreInstructionsTestScreen`
6. Test with store IDs: `store_001`, `store_002`, `store_003`
7. Verify text, images, and videos display correctly
8. Check analytics in logs

### Integration Options for Production:
1. **Before store checkin**: Show instructions before "Check-in" button
2. **After store selection**: Display when user selects a store
3. **In-app notification**: Trigger when near store geofence
4. **Task details**: Show in quest/task flow when status is `ARRIVING`

## Technical Notes

- Component is self-contained and can be dropped into any screen
- Gracefully handles missing instructions (continues silently)
- All media loads asynchronously with proper error handling
- Video thumbnails improve UX (no black screens)
- FastImage caching reduces bandwidth
- Design tokens ensure visual consistency

## Ready for Review

Phase 2 is complete. The mobile integration:
- ✅ Has API endpoint configured
- ✅ Has Gateway method for fetching
- ✅ Has full component implementation
- ✅ Uses Zubale design tokens
- ✅ Handles all block types (text/image/video)
- ✅ Has test screen for validation
- ✅ Includes analytics and error tracking
- ✅ Clean separation from other features

**Next: End-to-end testing in React Native app**
