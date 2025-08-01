import { View, Text } from "react-native";
import React, { useEffect, useRef } from "react";
import { Image, ImageContentFit, ImageSource, ImageStyle } from "expo-image";
import ImageNotFound from "@/src/assets/images/image-not-found.png";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ImageOff } from "@/src/lib/icons/ImageOff";
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
      {image_uri && image_uri.length > 0 ? (
        <Image
          ref={ref}
          source={image_uri}
          placeholder={{ blurhash }}
          contentFit={contextFit}
          placeholderContentFit="cover"
          autoplay={false}
          style={{
            flex: 1,
            width: "100%",
            borderRadius: 6,
            backgroundColor: "#ffffff",
            ...imageStyle,
          }}
        />
      ) : (
        <ImageOff size={50} className="color-primary" />
      )}
    </View>
  );
};

export default ExerciseImage;
