import { View, Text, StyleSheet, ScrollView } from "react-native";
import { motor } from "./motorData";
import ServiceHistory from "./ServiceHistory";
import ServiceReminder from "./ServiceReminder";

export default function HomeScreen() {
  const calculateMileageSinceService = (
    currentMileage: number,
    lastServiceMileage: number
  ): number => {
    return currentMileage - lastServiceMileage;
  };

  const mileageSinceService = calculateMileageSinceService(
    motor.currentMileage,
    motor.lastServiceMileage
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>MotoCare</Text>
        <Text style={styles.subtitle}>
          Pengingat Servis Motor
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{motor.name}</Text>
          <Text>{motor.brand}</Text>

          <Text style={styles.label}>Kilometer Saat Ini</Text>
          <Text style={styles.mileage}>
            {motor.currentMileage.toLocaleString()} km
          </Text>

          <Text style={styles.label}>Sejak Servis Terakhir</Text>
          <Text style={styles.mileage}>
            {mileageSinceService.toLocaleString()} km
          </Text>
        </View>

        <ServiceHistory />

        <ServiceReminder />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  label: {
    marginTop: 20,
    color: "#666",
  },
  mileage: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
});