export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenAI(
  messages: OpenAIMessage[],
  model: string = 'gpt-3.5-turbo'
): Promise<OpenAIResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: OpenAIResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

export async function getAIResponse(
  prompt: string,
  systemPrompt: string = 'Eres un asistente educativo experto en español y literatura. Responde de manera clara, útil y amigable.',
  model: string = 'gpt-3.5-turbo'
): Promise<string> {
  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];

  const response = await callOpenAI(messages, model);
  return response.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
}

export async function generateCourseDescription(
  courseTitle: string,
  courseTopics: string[]
): Promise<string> {
  const prompt = `Genera una descripción atractiva para un curso titulado "${courseTitle}" que cubre los siguientes temas: ${courseTopics.join(', ')}. La descripción debe ser en español, motivadora y destacar los beneficios del curso.`;

  const systemPrompt = 'Eres un experto en marketing educativo y creación de contenido para cursos online. Genera descripciones persuasivas y profesionales.';

  return await getAIResponse(prompt, systemPrompt);
}

export async function generateLessonContent(
  lessonTitle: string,
  lessonObjectives: string[]
): Promise<string> {
  const prompt = `Genera contenido educativo para una lección titulada "${lessonTitle}" con los siguientes objetivos: ${lessonObjectives.join(', ')}. El contenido debe ser en español, bien estructurado, y adecuado para estudiantes de español.`;

  const systemPrompt = 'Eres un profesor experto en español como lengua extranjera. Genera contenido educativo claro, preciso y pedagógicamente sólido.';

  return await getAIResponse(prompt, systemPrompt);
}
