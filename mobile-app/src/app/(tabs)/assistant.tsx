import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BRAND, DANGER } from '@/components/auth-form';
import { ChatBubble, TypingIndicator } from '@/components/chat-message';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { aiChat, type ChatMessage } from '@/lib/query';

// Same prompts as frontend/components/ai/ChatPanel.tsx
const SUGGESTED_PROMPTS = [
  'What does my day look like?',
  'Do I have any meetings this week?',
  'Who is my next meeting with?',
  'How many meetings do I have scheduled?',
];

export default function AssistantScreen() {
  const theme = useTheme();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const next: ChatMessage[] = [...history, { role: 'user', content: msg }];
    setHistory(next);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const { reply } = await aiChat(msg, history);
      setHistory([...next, { role: 'model', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setHistory([]);
    setError(null);
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <View style={styles.header}>
            <View style={styles.flex}>
              <ThemedText style={styles.title}>AI Assistant</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Ask about your schedule, get summaries, or send reminders to invitees.
              </ThemedText>
            </View>
            {history.length > 0 && !loading && (
              <Pressable onPress={newChat} hitSlop={8}>
                <ThemedText type="small" style={{ color: BRAND }}>
                  New chat
                </ThemedText>
              </Pressable>
            )}
          </View>

          <FlatList
            ref={listRef}
            data={history}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => <ChatBubble message={item} />}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={<EmptyState onPick={send} />}
            ListFooterComponent={
              <>
                {loading && <TypingIndicator />}
                {error && (
                  <View style={styles.errorBox}>
                    <ThemedText type="small" style={{ color: DANGER }}>
                      {error}
                    </ThemedText>
                  </View>
                )}
              </>
            }
          />

          <View style={[styles.inputBar, { borderTopColor: theme.backgroundSelected }]}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
              value={input}
              onChangeText={setInput}
              placeholder="Message Calenderly AI..."
              placeholderTextColor={theme.textSecondary}
              multiline
              editable={!loading}
            />
            <Pressable
              onPress={() => send()}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={[styles.sendButton, { opacity: canSend ? 1 : 0.5 }]}>
              <SymbolView
                name={{ ios: 'arrow.up', android: 'send', web: 'send' }}
                tintColor="#ffffff"
                size={18}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundElement }]}>
        <SymbolView
          name={{ ios: 'bubble.left.and.bubble.right', android: 'forum', web: 'forum' }}
          tintColor={BRAND}
          size={24}
        />
      </View>
      <ThemedText type="smallBold" style={styles.emptyTitle}>
        How can I help today?
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        I can help you manage your schedule, summarize upcoming events, or check your
        availability.
      </ThemedText>
      <View style={styles.prompts}>
        {SUGGESTED_PROMPTS.map((p) => (
          <Pressable
            key={p}
            onPress={() => onPick(p)}
            style={({ pressed }) => [
              styles.prompt,
              { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText type="small">{p}</ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  messages: {
    flexGrow: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  errorBox: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
  },
  center: {
    textAlign: 'center',
  },
  prompts: {
    alignSelf: 'stretch',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  prompt: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
