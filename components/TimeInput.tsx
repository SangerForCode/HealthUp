import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';

interface TimeInputProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}

export function TimeInput({ value, onChange, label = 'Time' }: TimeInputProps) {
  const [show, setShow] = useState(false);
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0);

  const onTimeChange = (_: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShow(true)}>
        <TextInput
          label={label}
          value={value}
          editable={false}
          right={<TextInput.Icon icon="clock" onPress={() => setShow(true)} />}
        />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={true}
          onChange={onTimeChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    maxWidth: 80,
  },
  separator: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  helper: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
});