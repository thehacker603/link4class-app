import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleRegister = async () => {
    const res = await fetch("http://192.168.0.160:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      alert("Registrazione completata!");
      router.replace("/login");
    } else {
      alert("Errore: email già registrata");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24 }}>Registrazione</Text>

      <TextInput placeholder="Username" onChangeText={(t) => setForm({ ...form, username: t })} style={{ borderWidth: 1, padding: 10, marginVertical: 10 }} />
      <TextInput placeholder="Email" onChangeText={(t) => setForm({ ...form, email: t })} style={{ borderWidth: 1, padding: 10, marginVertical: 10 }} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={(t) => setForm({ ...form, password: t })} style={{ borderWidth: 1, padding: 10, marginVertical: 10 }} />

      <Button title="Crea account" onPress={handleRegister} />
    </View>
  );
}
