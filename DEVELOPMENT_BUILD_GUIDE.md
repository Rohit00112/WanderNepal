# Development Build Guide for WanderNepal

## Issue Summary

Your app is encountering errors because some features (like push notifications) are not available in Expo Go starting from SDK 53. To use the full functionality of WanderNepal, you'll need to create a development build.

## What I've Fixed

✅ **Notifications**: Made expo-notifications conditionally imported so the app won't crash in Expo Go
✅ **FileSystem**: Updated to use the legacy API to avoid deprecation warnings  
✅ **Navigation**: Fixed the layout navigation context issues
✅ **Error Handling**: Added proper error handling for missing features

## Current Status

Your app should now run in Expo Go with these limitations:
- Push notifications will be logged to console instead of showing as notifications
- All other features should work normally

## To Get Full Functionality

### Option 1: Create a Development Build (Recommended)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

4. **Create a development build**:
   ```bash
   # For iOS (requires Apple Developer account)
   eas build --profile development --platform ios
   
   # For Android
   eas build --profile development --platform android
   ```

5. **Install the development build** on your device and use it instead of Expo Go

### Option 2: Use Expo Dev Client

1. **Add dev client to your project**:
   ```bash
   npx expo install expo-dev-client
   ```

2. **Create a development build with dev client**:
   ```bash
   eas build --profile development
   ```

### Option 3: Continue with Expo Go (Limited Features)

If you want to continue using Expo Go for now, the app will work but:
- Notifications will only show in console logs
- Some advanced features may be limited

## Benefits of Development Builds

- ✅ Full push notification support
- ✅ All native modules work properly
- ✅ Better debugging capabilities
- ✅ Custom native code if needed
- ✅ Production-like environment

## Next Steps

1. **Immediate**: Your app should now run without crashing in Expo Go
2. **Short term**: Consider creating a development build for full functionality
3. **Long term**: Set up EAS Build for production releases

## Resources

- [Expo Development Builds Documentation](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Dev Client](https://docs.expo.dev/clients/introduction/)

## Testing the Fixes

Try running your app again with:
```bash
npm run dev
```

The errors should be resolved, and you should see console logs instead of crashes for notification-related features.