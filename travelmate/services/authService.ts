import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToken = async (token:string) => {
  await AsyncStorage.setItem("token", token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

export const removeToken = async () => {
  await AsyncStorage.removeItem("token");
};