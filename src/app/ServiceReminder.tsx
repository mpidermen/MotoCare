import { View, Text, StyleSheet } from "react-native";

interface Reminder {
  id: number;
  service: string;
  targetMileage: number;
  description: string;
}

const reminders: Reminder[] = [
  {
    id: 1,
    service: "Ganti Oli",
    targetMileage: 13000,
    description: "Segera lakukan penggantian oli mesin.",
  },
  {
    id: 2,
    service: "Servis CVT",
    targetMileage: 15000,
    description: "Periksa dan bersihkan komponen CVT.",
  },
];

export default function ServiceReminder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Reminder Servis
      </Text>

      {reminders.map((reminder) => (
        <View
          key={reminder.id}
          style={styles.card}
        >
          <Text style={styles.service}>
            {reminder.service}
          </Text>

          <Text>
            Target:{" "}
            {reminder.targetMileage.toLocaleString()} km
          </Text>

          <Text style={styles.description}>
            {reminder.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  service: {
    fontSize: 18,
    fontWeight: "bold",
  },

  description: {
    marginTop: 8,
    color: "#666",
  },
});