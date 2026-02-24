import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

const UniSafeAreaView = withUniwind(SafeAreaView);
export default function StyledSafeAreaView(props: any) {
  return <UniSafeAreaView {...props} />;
}
