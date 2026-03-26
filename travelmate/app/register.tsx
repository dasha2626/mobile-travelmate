import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function Register(){

  const [login,setLogin] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleRegister = async () => {

  try {

 const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
      body: JSON.stringify({
        login,
        email,
        password
      })
    });

    const data = await res.json();

    console.log(data);

    if(res.ok){
      Alert.alert("OK","Konto utworzone!");
      router.replace("/login" as any);
    }
    else{
      Alert.alert("Błąd", data.message || "Rejestracja nieudana");
    }

  } catch(e){
    console.log(e);
    Alert.alert("Błąd","Serwer offline");
  }
};

  return(
    <View style={{flex:1, justifyContent:"center", padding:25}}>

      <Text style={{fontSize:30,textAlign:"center",marginBottom:30}}>
        Rejestracja ✨
      </Text>

      <TextInput 
        placeholder="Login" 
        placeholderTextColor="#000"
        value={login} 
        onChangeText={setLogin}
        style={{borderWidth:1,padding:12,marginBottom:15,borderRadius:10}}
      />

      <TextInput 
        placeholder="Email" 
        placeholderTextColor="#000"
        value={email} 
        onChangeText={setEmail}
        style={{borderWidth:1,padding:12,marginBottom:15,borderRadius:10}}
      />

      <TextInput 
        placeholder="Hasło" 
        placeholderTextColor="#000"
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
        style={{borderWidth:1,padding:12,marginBottom:20,borderRadius:10}}
      />

      <TouchableOpacity
        onPress={handleRegister}
        style={{backgroundColor:"#333",padding:15,borderRadius:10}}
      >
        <Text style={{color:"white",textAlign:"center"}}>
          Załóż konto
        </Text>
      </TouchableOpacity>

    </View>
  );
}