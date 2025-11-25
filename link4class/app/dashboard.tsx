import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
    <View style={styles.container}>
      <Text style={styles.title}>Ciao {user?.username}</Text>
      <Text style={styles.subtitle}>Benvenuto nella tua Dashboard</Text>

      {/* GRID 2×2 */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.box} onPress={() => router.push("/groups")}>
          <Text style={styles.boxText}>Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => router.push("/lessons")}>
          <Text style={styles.boxText}>Lessons</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => router.push("/bookswap")}>
          <Text style={styles.boxText}>BookSwap</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={logout}>
          <Text style={styles.boxText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
  },

  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },

  box: {
    width: 140,
    height: 140,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    elevation: 5,
  },
  boxText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
