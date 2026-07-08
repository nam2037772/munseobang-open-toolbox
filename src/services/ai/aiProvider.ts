export interface AiSearchRequest {
  query: string;
}

export interface AiSearchResponse {
  answer: string;
  providerName: string;
}

export interface AiSearchProvider {
  search(request: AiSearchRequest): Promise<AiSearchResponse>;
}

/**
 * Mock AI Provider for testing layout and interaction.
 * Prints the default standby message as specified in requirements.
 */
export class MockAiProvider implements AiSearchProvider {
  async search(request: AiSearchRequest): Promise<AiSearchResponse> {
    if (!request.query.trim()) {
      return {
        answer: "질문할 내용을 입력해 주세요.",
        providerName: "MockProvider"
      };
    }

    return {
      answer: "AI 질문 기능은 준비 중입니다. 현재는 문서방 도구와 기준검색 연결을 위한 인터페이스입니다.",
      providerName: "MockProvider"
    };
  }
}

/**
 * Factory to retrieve the desired AI search provider.
 * Keeps the application decoupled from a specific AI SDK or API vendor.
 */
export class AiProviderFactory {
  static getProvider(type: 'mock' | 'gemini' | 'openai' | 'claude' = 'mock'): AiSearchProvider {
    switch (type) {
      case 'gemini':
        // return new GeminiProvider();
      case 'openai':
        // return new OpenAIProvider();
      case 'claude':
        // return new ClaudeProvider();
      case 'mock':
      default:
        return new MockAiProvider();
    }
  }
}
