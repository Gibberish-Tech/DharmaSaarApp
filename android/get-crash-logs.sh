#!/bin/bash
# Script to capture crash logs from Android device

echo "Connecting to Android device and capturing crash logs..."
echo "Make sure your device is connected via USB and USB debugging is enabled"
echo ""
echo "Installing APK and capturing logs..."
echo "Press Ctrl+C to stop logging"
echo ""

# Clear logcat
adb logcat -c

# Install the APK
echo "Installing APK..."
adb install -r app/build/outputs/apk/release/app-release.apk

# Start the app
echo "Starting the app..."
adb shell am start -n com.dharmasaar/.MainActivity

# Wait a moment for the app to start
sleep 2

# Capture logs
echo "Capturing crash logs (filtering for errors and React Native)..."
adb logcat | grep -E "(AndroidRuntime|ReactNative|ReactNativeJS|FATAL|ERROR|Exception|Crash)" --color=always

