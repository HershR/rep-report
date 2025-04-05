import { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { DotStyle } from "react-native-reanimated-carousel/lib/typescript/components/Pagination/Basic/PaginationItem";

interface CarouselProps {
  width: number;
  height: number;
  loop: boolean;
  style?: StyleProp<ViewStyle>;
  data: any[];
  dotStyle: DotStyle;
  renderItem: (item: any, index?: number) => any;
}

const CustomCarousel = ({
  width,
  height,
  loop,
  style,
  data,
  dotStyle,
  renderItem,
}: CarouselProps) => {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };
  return (
    <>
      <Carousel
        ref={ref}
        loop={loop}
        data={data}
        width={width}
        height={height}
        renderItem={({ item, index }) => renderItem(item, index)}
        style={style}
      ></Carousel>
      <Pagination.Basic
        progress={progress}
        data={data}
        dotStyle={dotStyle}
        containerStyle={{ gap: 5, marginTop: 10 }}
        onPress={onPressPagination}
      />
    </>
  );
};

export default CustomCarousel;
