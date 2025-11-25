import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://192.168.0.160:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      await AsyncStorage.setItem("user", JSON.stringify(data));
      router.replace("/dashboard");
    } else {
      alert("Credenziali errate");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24 }}>Accedi</Text>

      <TextInput placeholder="Email" onChangeText={setEmail} style={{ borderWidth: 1, padding: 10, marginVertical: 10 }} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} style={{ borderWidth: 1, padding: 10, marginVertical: 10 }} />

      <Button title="Login" onPress={handleLogin} />
      <Button title="Registrati" onPress={() => router.push("/register")} />
    </View>
  );
}
