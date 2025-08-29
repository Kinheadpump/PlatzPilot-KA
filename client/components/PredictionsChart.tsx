import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart } from 'react-native-chart-kit';
import Section from './Section';

const screenWidth = Dimensions.get('window').width;

interface PredictionsChartProps {
  predictions: number[];
  currentFreeSeats: number;
}

export default function PredictionsChart({ predictions, currentFreeSeats }: PredictionsChartProps) {
  const { colors } = useTheme();

  // Create chart data for predictions
  const createChartData = () => {
    // Start with current free seats
    const currentTime = new Date();
    const data = [currentFreeSeats, ...predictions];
    
    // Create labels for time intervals (5-minute intervals)
    const labels = [];
    for (let i = 0; i < data.length; i++) {
      const time = new Date(currentTime.getTime() + i * 5 * 60000); // 5 minutes intervals
      labels.push(time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
    }

    return {
      labels: labels.filter((_, index) => index % 2 === 0), // Show every other label to avoid crowding
      datasets: [{
        data: data,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green color
        strokeWidth: 2
      }]
    };
  };

  const chartData = createChartData();

  const styles = StyleSheet.create({
    chartContainer: {
      alignItems: 'center',
      marginTop: 10,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 10,
    },
  });

  return (
    <Section title="Vorhersage (nächste Stunden)">
      <Text style={styles.chartTitle}>Freie Plätze über Zeit</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 70}
          height={200}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => colors.textSecondary,
            style: {
              borderRadius: 10,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#4CAF50'
            }
          }}
          bezier
          style={{
            borderRadius: 10,
          }}
        />
      </View>
    </Section>
  );
}
