import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { StyleSheet } from 'react-native';
import { useRef } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function ESPNLogin() {
    const webViewRef = useRef<WebView | null>(null);
    const router = useRouter();
    
    const handleNavigationStateChange = (navState: WebViewNavigation) => {
      if (navState.url === 'https://www.espn.com/') {
        // Login successful, capture cookies
        webViewRef.current?.injectJavaScript(`
             window.ReactNativeWebView.postMessage(document.cookie);
        `);
      }
    }

    const handleMessage = async (event: WebViewMessageEvent) => {
      const cookieString = event.nativeEvent.data;
      const cookiePairs = cookieString.split('; ');
      const extractedCookies: { SWID?: string, espn_s2?: string } = {};

      cookiePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key === 'SWID' || key === 'espn_s2') {
          extractedCookies[key] = value;
        }
      });

      // Store cookies securely
      await SecureStore.setItemAsync('espnCookies', JSON.stringify(extractedCookies));

      // Navigate back to the previous screen
      router.back();
    }


    return (
        <WebView
          ref={webViewRef}
          style={styles.container}
          source={{ uri: 'https://espn.com/login' }}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
        />
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        // marginTop: Constants.statusBarHeight,
      },
    });