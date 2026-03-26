import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function Index(){

  return(
    <View style={{
      flex:1,
      justifyContent:"center",
      alignItems:"center",
      padding:20
    }}>

      <Text style={{ fontSize:32, marginBottom:40 }}>
        TravelMate 
      </Text>

      <Button
        title="Logowanie"
        onPress={()=>router.push("/login" as any)}
      />

      <View style={{ height:20 }}/>

      <Button
        title="Rejestracja"
        onPress={()=>router.push("/register" as any)}
      />

    </View>
  );
}