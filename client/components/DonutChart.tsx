import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface DonutChartProps {
  freeSeats: number;
  totalSeats: number;
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({ 
  freeSeats, 
  totalSeats, 
  size = 100, 
  strokeWidth = 8 
}: DonutChartProps) {
  const occupiedSeats = totalSeats - freeSeats;
  const freePercentage = totalSeats > 0 ? (freeSeats / totalSeats) * 100 : 0;
  const occupiedPercentage = totalSeats > 0 ? (occupiedSeats / totalSeats) * 100 : 0;
  
  // Donut chart parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const freeStrokeDasharray = `${(freePercentage / 100) * circumference} ${circumference}`;
  const occupiedOffset = (freePercentage / 100) * circumference;
  const occupiedStrokeDasharray = `${(occupiedPercentage / 100) * circumference} ${circumference}`;

  return (
    <View style={styles.chartContainer}>
      <Svg width={size} height={size} style={styles.chart}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Free seats arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2196F3"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={freeStrokeDasharray}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Occupied seats arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ff0000ff"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={occupiedStrokeDasharray}
          strokeDashoffset={-occupiedOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.chartCenter}>
        <Text style={styles.chartPercentage}>{freeSeats}</Text>
        <Text style={styles.chartLabel}>Freie Plätze</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    transform: [{ rotate: '0deg' }],
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  chartLabel: {
    fontSize: 10,
    color: '#666',
  },
});
