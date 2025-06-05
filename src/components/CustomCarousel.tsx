import { Dimensions, View } from "react-native";
import React from "react";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { NAV_THEME } from "../lib/constants";
import { useColorScheme } from "../lib/useColorScheme";
interface CarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  pagingEnabled?: boolean;
  showDots?: boolean;
}

export function CustomCarousel<T>({
  data,
  renderItem,
  width = Dimensions.get("window").width,
  height = 200,
  autoPlay = false,
  loop = false,
  pagingEnabled = true,
  showDots = true,
}: CarouselProps<T>) {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const { colorScheme } = useColorScheme();

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  if (data.length === 1) {
    return (
      <View
        style={{
          width,
          height,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderItem(data[0], 0)}
      </View>
    );
  }
  return (
    <>
      <Carousel
        ref={ref}
        width={width}
        height={height}
        autoPlay={autoPlay}
        loop={loop}
        pagingEnabled={pagingEnabled}
        data={data}
        scrollAnimationDuration={500}
        renderItem={({ item, index }) => renderItem(item, index)}
        onProgressChange={progress}
      ></Carousel>
      {showDots && (
        <Pagination.Basic
          progress={progress}
          data={data.map((x, index) => {
            return index;
          })}
          dotStyle={{
            width: 25,
            height: 4,
            backgroundColor: NAV_THEME[colorScheme].border,
          }}
          activeDotStyle={{
            overflow: "hidden",
            backgroundColor: NAV_THEME[colorScheme].primary,
          }}
          containerStyle={{ gap: 10, marginTop: 5 }}
          onPress={onPressPagination}
        />
      )}
    </>
  );
}

export default CustomCarousel;
