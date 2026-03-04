import { Image } from 'expo-image';
import React from 'react';
import { withUniwind } from 'uniwind';

const UniImage = withUniwind(Image);
function StyledImage(props: any) {
  return <UniImage {...props} />;
}

export default StyledImage;
