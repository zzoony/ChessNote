import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatItemProps {
  label: string;
  value: string | number;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color = '#4CAF50' }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, { color }]}>
      {typeof value === 'number' ? Math.round(value) : value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

interface PuzzleStatsCardProps {
  title: string;
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

const PuzzleStatsCard: React.FC<PuzzleStatsCardProps> = ({ title, stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default PuzzleStatsCard;