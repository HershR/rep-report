import { View, Text } from "react-native";
import React, { useEffect, useRef } from "react";
import { Image, ImageContentFit, ImageSource, ImageStyle } from "expo-image";
import ImageNotFound from "@/src/assets/images/image-not-found.png";
interface Props {
  image_uri: string | null;
  containerClassname?: string;
  imageStyle?: ImageStyle;
  contextFit?: ImageContentFit;
}
const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const ExerciseImage = ({
  image_uri,
  containerClassname = "",
  imageStyle = {},
  contextFit = "cover",
}: Props) => {
  const ref = useRef<Image>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.stopAnimating();
    }
  }, [ref]);
  return (
    <View
      className={`flex-1 justify-center items-center ${containerClassname}`}
    >
      <Image
        ref={ref}
        source={image_uri}
        placeholder={ImageNotFound}
        contentFit={contextFit}
        autoplay={false}
        style={{
          flex: 1,
          width: "100%",
          borderRadius: 8,
          backgroundColor: "#ffffff",
          ...imageStyle,
        }}
      />
    </View>
  );
};

export default ExerciseImage;
