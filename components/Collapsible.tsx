import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, List } from 'react-native-paper';
import { ThemedView } from './ThemedView';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  initialExpanded?: boolean;
}

export function Collapsible({ title, children, initialExpanded = false }: CollapsibleProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <ThemedView>
      <List.Item
        title={title}
        onPress={() => setExpanded(!expanded)}
        right={props => (
          <IconButton
            icon={expanded ? 'chevron-up' : 'chevron-down'}
            onPress={() => setExpanded(!expanded)}
            {...props}
          />
        )}
      />
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
});
