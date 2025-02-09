import { convertToCoreMessages, Message, streamText, CoreMessage, CoreUserMessage } from 'ai';
import { z } from 'zod';
import { list } from '@vercel/blob';

import { customModel } from '@/ai';
import { auth } from '@/app/(auth)/auth';
import { deleteChatById, getChatById, saveChat } from '@/db/queries';
import { Model, models } from '@/lib/model';

interface TextPart {
  type: 'text';
  text: string;
}

interface FilePart {
  type: 'file';
  data: Buffer;
  mimeType: string;
}

type MessageContent = TextPart | FilePart;

export async function POST(request: Request) {
  const {
    id,
    messages,
    model,
    fileUrl,
  }: { 
    id: string; 
    messages: Array<Message>; 
    model: Model['name'];
    fileUrl?: string;
  } = await request.json();

  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!models.find((m) => m.name === model)) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  let finalMessages: CoreMessage[] = [...coreMessages];

  // Handle PDF file if present
  if (fileUrl) {
    try {
      const { blobs } = await list();
      const blob = blobs.find(b => b.url === fileUrl);
      if (!blob) {
        throw new Error('File not found');
      }
      
      const response = await fetch(fileUrl);
      const pdfBuffer = Buffer.from(await response.arrayBuffer());
      
      // Add PDF content to the last user message
      const lastMessage = finalMessages[finalMessages.length - 1];
      if (lastMessage && lastMessage.role === 'user') {
        const textPart: TextPart = {
          type: 'text',
          text: lastMessage.content
        };
        
        const filePart: FilePart = {
          type: 'file',
          data: pdfBuffer,
          mimeType: 'application/pdf'
        };

        const userMessage: CoreUserMessage = {
          role: 'user',
          content: [textPart, filePart]
        };
        
        finalMessages[finalMessages.length - 1] = userMessage;
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      return new Response('Error processing PDF file', { status: 500 });
    }
  }

  const result = await streamText({
    model: customModel(model),
    system:
      'you are a friendly assistant! keep your responses concise and helpful.',
    messages: finalMessages,
    maxSteps: 5,
    tools: {
      getWeather: {
        description: 'Get the current weather at a location',
        parameters: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...finalMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error('Failed to save chat');
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'stream-text',
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
