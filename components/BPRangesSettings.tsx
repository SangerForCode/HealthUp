import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Collapsible } from './Collapsible';
import { ThemedText } from './ThemedText';

interface BPRange {
  systolic: { min: number; max: number };
  diastolic: { min: number; max: number };
}

interface BPRangesSettingsProps {
  ranges: {
    normal: BPRange;
    high: BPRange;
  };
  onRangeChange: (type: 'normal' | 'high', range: BPRange) => void;
}

export function BPRangesSettings({ ranges, onRangeChange }: BPRangesSettingsProps) {
  const handleChange = (
    type: 'normal' | 'high',
    measure: 'systolic' | 'diastolic',
    bound: 'min' | 'max',
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    onRangeChange(type, {
      ...ranges[type],
      [measure]: {
        ...ranges[type][measure],
        [bound]: numValue,
      },
    });
  };

  return (
    <Collapsible title="Blood Pressure Ranges">
      <View style={styles.container}>
        <ThemedText style={styles.sectionTitle}>Normal Range</ThemedText>
        <View style={styles.rangeRow}>
          <View style={styles.measureContainer}>
            <ThemedText>Systolic</ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ranges.normal.systolic.min.toString()}
                onChangeText={(value) => handleChange('normal', 'systolic', 'min', value)}
                label="Min"
              />
              <ThemedText style={styles.separator}>-</ThemedText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ranges.normal.systolic.max.toString()}
                onChangeText={(value) => handleChange('normal', 'systolic', 'max', value)}
                label="Max"
              />
            </View>
          </View>
          <View style={styles.measureContainer}>
            <ThemedText>Diastolic</ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ranges.normal.diastolic.min.toString()}
                onChangeText={(value) => handleChange('normal', 'diastolic', 'min', value)}
                label="Min"
              />
              <ThemedText style={styles.separator}>-</ThemedText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ranges.normal.diastolic.max.toString()}
                onChangeText={(value) => handleChange('normal', 'diastolic', 'max', value)}
                label="Max"
              />
            </View>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>High Range</ThemedText>
        <View style={styles.rangeRow}>
          <View style={styles.measureContainer}>
            <ThemedText>Systolic</ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ranges.high.systolic.min.toString()}
                onChangeText={(value) => handleChange('high', 'systolic', 'min', value)}
                label="Min"
              />
              <ThemedText style={styles.separator}>-</ThemedText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ranges.high.systolic.max.toString()}
                onChangeText={(value) => handleChange('high', 'systolic', 'max', value)}
                label="Max"
              />
            </View>
          </View>
          <View style={styles.measureContainer}>
            <ThemedText>Diastolic</ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ranges.high.diastolic.min.toString()}
                onChangeText={(value) => handleChange('high', 'diastolic', 'min', value)}
                label="Min"
              />
              <ThemedText style={styles.separator}>-</ThemedText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ranges.high.diastolic.max.toString()}
                onChangeText={(value) => handleChange('high', 'diastolic', 'max', value)}
                label="Max"
              />
            </View>
          </View>
        </View>
      </View>
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  measureContainer: {
    flex: 1,
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
  },
  separator: {
    fontSize: 20,
  },
});