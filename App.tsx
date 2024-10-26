/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef} from 'react';
import {
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import VIForegroundService from '@voximplant/react-native-foreground-service';

function App(): React.JSX.Element {
  const watchId = useRef<number | null>(null);
  useEffect(() => {
    getPermissions();

    return () => {
      stopLocationsUpdate();
    };
  }, []);
  async function getPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
    if (Platform.OS === 'android' && Platform.Version >= 29) {
      const permissionAccess = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );
      if (permissionAccess !== 'granted') {
        Linking.openSettings();
      }
      await startForegroundService();

      watchMyPosition();
    }
  }
  const startForegroundService = async () => {
    if (parseInt(Platform.Version.toString()) >= 26) {
      await VIForegroundService.getInstance().createNotificationChannel({
        id: 'locationChannel',
        name: 'Location Tracking Channel',
        description: 'Channel for tracking location',
        enableVibration: false,
      });
    }
    return VIForegroundService.getInstance().startService({
      channelId: 'locationChannel',
      id: 420,
      title: 'Teste track Location',
      text: 'Tracking location in the background',
      icon: 'ic_launcher',
    });
  };

  const stopLocationsUpdate = () => {
    if (Platform.OS === 'android') {
      VIForegroundService.getInstance()
        .stopService()
        .catch((err: any) => err);
    }
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  const watchMyPosition = () => {
    watchId.current = Geolocation.watchPosition(
      position => {
        const now = new Date();
        const time = now.toLocaleTimeString('pt-BR', {timeStyle: 'long', hourCycle: 'h23'});
        const date = now.toLocaleDateString('pt-BR', {day: 'numeric', month: 'long', year: 'numeric'});
        console.log(`${date} ${time}`);
        console.log('watchMyPosition', +Date.now());
        console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');
        console.log(position);
      },
      error => {
        console.log(error);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        distanceFilter: 500,
        interval: 10000,
        fastestInterval: 1000,
        forceLocationManager: false,
      },
    );
  };
  return <SafeAreaView />;
}

export default App;
