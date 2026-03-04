import StyledSafeAreaView from '@/components/StyledSafeAreaView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Cake, ChevronRight, Ruler, User, Weight } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
export default function Profile() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <StyledSafeAreaView className="flex-1 p-6 pb-2">
        <View>
          <Text className="text-primary text-3xl font-bold sm:text-lg lg:text-xl">My Profile</Text>
        </View>
        <Card className="mt-8 mb-4 flex">
          <CardContent>
            <View className="flex items-center">
              <View className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow-lg">
                <Icon as={User} size={60}></Icon>
              </View>
              <Text variant={'h2'} className="flex-col border-0">
                User Name
              </Text>
              <Text variant={'p'} className="text-muted-foreground mb-4">
                email@test.com
              </Text>
            </View>
            <View className="flex flex-row justify-around">
              <View>
                <Text className="text-muted-foreground mb-1 block text-center text-base font-bold uppercase">
                  Age
                </Text>
                <Text className="text-primary w-full text-xl font-medium">25 yo</Text>
              </View>
              <View>
                <Text className="text-muted-foreground mb-1 block text-center text-base font-bold uppercase">
                  Height
                </Text>
                <Text className="text-primary w-full text-xl font-medium">175 cm</Text>
              </View>
              <View>
                <Text className="text-muted-foreground mb-1 block text-center text-base font-bold uppercase">
                  Weight
                </Text>
                <Text className="text-primary w-full text-xl font-medium">70 kg</Text>
              </View>
            </View>
          </CardContent>
        </Card>
        <ScrollView>
          <View className="bg-background h-14 flex-1 flex-row items-center justify-between rounded-md px-4">
            <Text className="text-xl font-medium">My Weight</Text>
            <Button
              variant={'ghost'}
              size="icon"
              className="w-14 flex-row"
              //   onPress={() => router.push("/weight")}
            >
              <Icon as={Weight} size={24} className="color-primary" />
              <ChevronRight size={24} className="color-primary" />
            </Button>
          </View>
          <Separator />
          <View className="bg-background h-14 flex-1 flex-row items-center justify-between rounded-md px-4">
            <Text className="text-xl font-medium">Update Height</Text>
            <Button
              variant={'ghost'}
              size="icon"
              className="w-14 flex-row"
              // onPress={() => setHeightModalVisibility(true)}
            >
              <Icon as={Ruler} size={24} className="color-primary" />
              <ChevronRight size={24} className="color-primary" />
            </Button>
          </View>
          <Separator />
          <View className="bg-background h-14 flex-1 flex-row items-center justify-between rounded-md px-4">
            <Text className="text-xl font-medium">Update Age</Text>
            <Button
              variant={'ghost'}
              size="icon"
              className="w-14 flex-row"
              //   onPress={() => setDatePickerVisibility(true)}
            >
              <Icon as={Cake} size={24} className="color-primary" />
              <ChevronRight size={24} className="color-primary" />
            </Button>
          </View>
        </ScrollView>
      </StyledSafeAreaView>
    </View>
  );
}
