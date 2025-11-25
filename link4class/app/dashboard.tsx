import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem("user");
      setUser(JSON.parse(data!));
    };
    load();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 26 }}>Benvenuto {user?.username}</Text>
      <Text>Email: {user?.email}</Text>

      <Button title="Logout" onPress={logout} />
    </View>
  );
}
