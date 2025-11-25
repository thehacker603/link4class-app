import { useEffect, useState } from "react";
import { Stack, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        setLogged(true);
      }
      setIsLoading(false);
    };
    checkLogin();
  }, []);

  if (isLoading) return null; // schermata nera temporanea

  return (
    <>
      {logged ? <Redirect href="/dashboard" /> : <Redirect href="/login" />}
      <Stack />
    </>
  );
}
