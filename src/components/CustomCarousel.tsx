import { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { DotStyle } from "react-native-reanimated-carousel/lib/typescript/components/Pagination/Basic/PaginationItem";
import { useTheme } from "@react-navigation/native";
interface CarouselProps {
  data: any[];
  width: number;
  height: number;
  vertical?: boolean;
  loop?: boolean;
  carouselStyle?: StyleProp<ViewStyle>;
  dotStyle?: DotStyle;
  activeDotStyle?: DotStyle;
  renderFunction: (item: any, index?: number) => any;
}

const CustomCarousel = ({
  data,
  width,
  height,
  vertical = false,
  loop = false,
  carouselStyle: style,
  dotStyle,
  activeDotStyle,
  renderFunction: renderItem,
}: CarouselProps) => {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const { colors } = useTheme();

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  return (
    <>
      <Carousel
        ref={ref}
        vertical={vertical}
        loop={loop}
        data={data}
        width={width}
        height={height}
        renderItem={({ item, index }) => renderItem(item, index)}
        style={style}
        onProgressChange={progress}
      ></Carousel>
      {data.length > 1 && (
        <Pagination.Basic
          progress={progress}
          data={data}
          dotStyle={{
            borderRadius: 100,
            backgroundColor: colors.border,
            ...dotStyle,
          }}
          activeDotStyle={{
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: colors.primary,
            ...activeDotStyle,
          }}
          containerStyle={{ gap: 5, marginTop: 5 }}
          onPress={onPressPagination}
        />
      )}
    </>
  );
};

export default CustomCarousel;
