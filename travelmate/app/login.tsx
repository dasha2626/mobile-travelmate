import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveToken } from "../services/authService";

export default function Login(){

  const [login,setLogin] = useState("");
  const [password,setPassword] = useState("");


  const handleLogin = async () => {
try {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      login,
      password
    })
  });

      const data = await res.json();

      if(res.ok && data.token){

        await saveToken(data.token);

        
        await AsyncStorage.setItem("username", data.user.login);
        await AsyncStorage.setItem("userId", String(data.user.id));

        Alert.alert("OK","Zalogowano!");

        router.replace("/dashboard");

      }else{
        Alert.alert("Błąd","Złe dane");
      }

    }catch(e){
      Alert.alert("Błąd","Serwer offline");
    }
  };

  return(
    <View style={{flex:1, justifyContent:"center", padding:25}}>

      <Text style={{fontSize:30,textAlign:"center",marginBottom:30}}>
        Login 
      </Text>

      <TextInput
        placeholder="Login"
        value={login}
        onChangeText={setLogin}
        style={{borderWidth:1,padding:12,marginBottom:15,borderRadius:10}}
      />

      <TextInput
        placeholder="Hasło"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{borderWidth:1,padding:12,marginBottom:20,borderRadius:10}}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor:"#333",
          padding:15,
          borderRadius:10
        }}
      >
        <Text style={{color:"white",textAlign:"center"}}>
          Zaloguj
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={()=>router.push("/register")}
        style={{marginTop:20}}
      >
        <Text style={{textAlign:"center"}}>
          Nie masz konta? Rejestracja
        </Text>
      </TouchableOpacity>

    </View>
  );
}