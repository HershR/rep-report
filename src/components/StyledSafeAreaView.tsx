import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

const UniSafeAreaView = withUniwind(SafeAreaView);
function StyledSafeAreaView(props: any) {
  return <UniSafeAreaView {...props} />;
}

export default StyledSafeAreaView;
