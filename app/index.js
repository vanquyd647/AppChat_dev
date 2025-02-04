import React, { useEffect } from "react";
import { StatusBar, Text, View, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import StackNavigator from "../src/navigation/StackNavigator";
import { ChatsProvider } from '../src/contextApi/ChatContext'; // Sửa lại nếu cần thiết

export default function Index() {
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }
  
  useEffect(() => {
    requestUserPermission().then(() => {
      messaging().getToken().then(token => {
        console.log(token);
      });
    }).catch(() => {
      console.log("Permission not granted");
    });
  
    messaging().getInitialNotification().then(async (remoteMessage) => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
      }
    }
    );
    
    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage.notification);
    }
    );
  
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    }
    );
  
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    }   
    );
  
    return unsubscribe;
  } , []);  
  return (
    <>
      <ChatsProvider>
        <StackNavigator />
      </ChatsProvider>
    </>
  );
}
