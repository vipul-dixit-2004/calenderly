import { getModel } from './gemini.js';
import { toolDeclarations } from './tools/schemas.js';
import { runTool } from './tools/index.js';
import { buildSystemPrompt } from './prompts/system.js';

const MAX_STEPS = Number(process.env.AI_AGENT_MAX_STEPS || 6);

export async function runAgent({ ctx, history, userMessage }) {
  const systemPrompt = buildSystemPrompt({
    user: ctx.user,
    nowIso: new Date().toISOString(),
  });

  const model = getModel(systemPrompt, toolDeclarations);

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }],
    })),
  });

  const toolCalls = [];
  let reply = '';
  let nextMessage = userMessage;

  for (let step = 0; step < MAX_STEPS; step++) {
    const result = await chat.sendMessage(nextMessage);
    const response = result.response;

    const calls = response.functionCalls?.() || [];
    if (calls.length === 0) {
      reply = response.text();
      break;
    }

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      calls.map(async (call) => {
        try {
          const output = await runTool({ name: call.name, args: call.args, ctx });
          toolCalls.push({ name: call.name, args: call.args, output });
          return {
            functionResponse: {
              name: call.name,
              response: { result: output },
            },
          };
        } catch (err) {
          toolCalls.push({ name: call.name, args: call.args, error: err.message });
          return {
            functionResponse: {
              name: call.name,
              response: { error: err.message },
            },
          };
        }
      }),
    );

    nextMessage = toolResults;
  }

  if (!reply) {
    reply = "I wasn't able to finish within the step budget. Try rephrasing or asking a narrower question.";
  }

  return { reply, toolCalls };
}
