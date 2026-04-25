import { Redirect, type Href } from "expo-router";

/** Valid route; typed routes union updates after `expo start` generates `.expo/types`. */
const HOME = "/(tabs)/home" as Href;

export default function Index() {
  return <Redirect href={HOME} />;
}
