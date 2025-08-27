import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';

interface Props {
  uri: string;
  type: 'image' | 'video';
}

export const MediaPreview: React.FC<Props> = ({ uri, type }) => {
  return (
    <View style={styles.container}>
      {type === 'image' ? (
        <Image source={{ uri }} style={styles.mediaPreview} resizeMode="cover" />
      ) : (
        <ExpoVideo source={{ uri }} style={styles.mediaPreview} useNativeControls isLooping resizeMode={ResizeMode.COVER} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 8, borderRadius: 12, overflow: 'hidden', maxWidth: '80%' },
  mediaPreview: { width: 250, height: 200, borderRadius: 12 },
});
