import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';

function resolveCandidateGameUrls() {
  const candidates: string[] = [];
  const envUrl = process.env.EXPO_PUBLIC_GAME_URL;
  if (envUrl && envUrl.trim().length > 0) {
    candidates.push(envUrl.trim());
  }

  const maybeHost: unknown =
    (Constants as any)?.expoGoConfig?.debuggerHost ??
    (Constants as any)?.manifest?.debuggerHost ??
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (typeof maybeHost === 'string' && maybeHost.length > 0) {
    const host = maybeHost.split(':')[0];
    candidates.push(
      `http://${host}:5173`,
      `http://${host}:5174`,
      `http://${host}:5175`,
      `http://${host}:5176`,
      `http://${host}:5177`,
      `http://${host}:5178`
    );
  }

  candidates.push(
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176'
  );

  return Array.from(new Set(candidates));
}

export default function App() {
  const webRef = useRef<WebView>(null);
  const [failed, setFailed] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);
  const gameUrls = useMemo(() => resolveCandidateGameUrls(), []);
  const gameUrl = gameUrls[urlIndex] ?? gameUrls[0];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Gather The Crown</Text>
        <Text style={styles.sub}>Expo Go wrapper</Text>
      </View>

      {failed ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Could not reach your game server.</Text>
          <Text style={styles.errorBody}>Tried URLs: {gameUrls.join(', ')}</Text>
          <Text style={styles.errorBody}>Run the web game dev server first: pnpm --filter @game/client dev</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => {
              setFailed(false);
              setUrlIndex(0);
              webRef.current?.reload();
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webRef}
          source={{ uri: gameUrl }}
          onError={() => {
            const nextIndex = urlIndex + 1;
            if (nextIndex < gameUrls.length) {
              setUrlIndex(nextIndex);
              return;
            }
            setFailed(true);
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text style={styles.loadingText}>Loading from {gameUrl}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1220'
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    backgroundColor: '#111827'
  },
  title: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: '700'
  },
  sub: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#0b1220'
  },
  loadingText: {
    color: '#cbd5e1',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  errorBody: {
    color: '#cbd5e1',
    fontSize: 13,
    textAlign: 'center'
  },
  retryBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f59e0b'
  },
  retryText: {
    color: '#111827',
    fontWeight: '700'
  }
});
