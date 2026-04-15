import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export const MissionMap = ({
  path = [],
  pois = [],
  userLocation = null,
  expanded = false,
  onToggleExpand,
  loading = false,
  theme = 'day',
}) => {
  // Default region (centered on user or fallback)
  const region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={[styles.container, expanded && styles.fullScreen]}>  
      <MapView
        provider={PROVIDER_GOOGLE}
        style={expanded ? styles.mapFull : styles.map}
        region={region}
        showsUserLocation={!!userLocation}
        followsUserLocation={!!userLocation}
        mapType={theme === 'night' ? 'standard' : 'standard'}
      >
        {/* Path polyline */}
        {path.length > 1 && (
          <Polyline
            coordinates={path}
            strokeColor={theme === 'night' ? '#00eaff' : '#2ecc40'}
            strokeWidth={4}
          />
        )}
        {/* POI markers */}
        {pois.map((poi, idx) => (
          <Marker
            key={idx}
            coordinate={poi.coordinate}
            title={poi.label}
            description={poi.label}
          />
        ))}
      </MapView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#888" />
        </View>
      )}
      <TouchableOpacity
        style={styles.expandBtn}
        onPress={onToggleExpand}
        accessibilityLabel={expanded ? 'Collapse map' : 'Expand map'}
      >
        <View style={styles.expandBtnInner}>
          {/* Simple icon: ^ or v */}
          <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
            <View style={{ width: 24, height: 4, backgroundColor: '#888', borderRadius: 2 }} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 100,
    borderRadius: 0,
  },
  mapFull: {
    width: width,
    height: height,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  expandBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    elevation: 2,
    zIndex: 20,
  },
  expandBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
