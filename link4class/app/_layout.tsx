import { useEffect, useState } from "react";
import { Stack, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const check = async () => {
      const user = await AsyncStorage.getItem("user");
      setLogged(!!user);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return null;

  return (
    <>
      {logged ? <Redirect href="/dashboard" /> : <Redirect href="/login" />}
      <Stack />
    </>
  );
}
