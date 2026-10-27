import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View, type TextStyle } from 'react-native';

import { BRAND } from '@/components/auth-form';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatMessage } from '@/lib/query';

// Port of frontend/components/ai/MessageFormatter.tsx: **bold**, *italic*, `code`,
// plus "* " / "- " list lines rendered as bullets
function FormattedText({ content, color }: { content: string; color: string }) {
  const theme = useTheme();
  const lines = content.replace(/^[ \t]*[*-][ \t]+/gm, '• ');
  const parts = lines.split(/(\*\*.*?\*\*|\*[^*\n]+?\*|`[^`\n]+?`)/g);

  return (
    <Text style={[styles.messageText, { color }]}>
      {parts.map((part, i) => {
        let style: TextStyle | undefined;
        let text = part;
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          style = styles.bold;
          text = part.slice(2, -2);
        } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          style = { ...styles.code, backgroundColor: theme.backgroundSelected };
          text = part.slice(1, -1);
        } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          style = styles.italic;
          text = part.slice(1, -1);
        }
        return (
          <Text key={i} style={style}>
            {text}
          </Text>
        );
      })}
    </Text>
  );
}

function Avatar() {
  const theme = useTheme();
  return (
    <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}>
      <SymbolView
        name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
        tintColor={BRAND}
        size={16}
      />
    </View>
  );
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && <Avatar />}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: BRAND }]
            : [styles.modelBubble, { backgroundColor: theme.backgroundElement }],
        ]}>
        {isUser ? (
          <ThemedText style={[styles.messageText, { color: '#ffffff' }]}>{message.content}</ThemedText>
        ) : (
          <FormattedText content={message.content} color={theme.text} />
        )}
      </View>
    </View>
  );
}

export function TypingIndicator() {
  const theme = useTheme();
  const [dots] = useState(() => [0, 1, 2].map(() => new Animated.Value(0.3)));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.stagger(
        150,
        dots.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ])
        )
      )
    );
    animation.start();
    return () => animation.stop();
  }, [dots]);

  return (
    <View style={styles.row}>
      <Avatar />
      <View
        style={[
          styles.bubble,
          styles.modelBubble,
          styles.typing,
          { backgroundColor: theme.backgroundElement },
        ]}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    flexShrink: 1,
  },
  userBubble: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 700,
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 13,
  },
  typing: {
    flexDirection: 'row',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRAND,
  },
});
