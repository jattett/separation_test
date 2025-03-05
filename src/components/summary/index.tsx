import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  speaker: number;
  text: string;
}

interface SummaryProps {
  messages: Message[];
}

// 🔥 Google Gemini API 키 입력 (직접 사용)
const GEMINI_API_KEY = ''; // 🔥 발급받은 API 키 입력

// 🔥 Gemini API 호출 함수
const summarizeText = async (text: string) => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `다음 대화를 화자별 대화형식으로 요약해 주세요 :\n\n${text}`;
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });

    console.log('📝 API 응답 데이터:', result.response); // 응답 데이터 확인

    // 🔥 올바른 데이터에 접근
    const summary = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '요약 없음';

    return summary;
  } catch (error) {
    console.error('요약 중 오류 발생:', error);
    return '요약 실패';
  }
};

const Summary: React.FC<SummaryProps> = ({ messages }) => {
  const [summarizedData, setSummarizedData] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchSummaries = async () => {
      const speakerTextMap: { [key: number]: string } = {};

      messages.forEach((msg) => {
        if (!speakerTextMap[msg.speaker]) speakerTextMap[msg.speaker] = '';
        speakerTextMap[msg.speaker] += msg.text + ' ';
      });

      const summaryPromises = Object.entries(speakerTextMap).map(async ([speaker, text]) => {
        return { speaker: Number(speaker), summary: await summarizeText(text) };
      });

      const results = await Promise.all(summaryPromises);
      const summaryMap: { [key: number]: string } = {};

      results.forEach(({ speaker, summary }) => {
        summaryMap[speaker] = summary || '요약 없음';
      });

      setSummarizedData(summaryMap);
    };

    fetchSummaries();
  }, [messages]);

  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h3>📝 대화 요약 (Gemini AI)</h3>
      {Object.entries(summarizedData).map(([speaker, summary]) => (
        <p key={speaker} style={{ whiteSpace: 'pre' }}>
          {summary}
        </p>
      ))}
    </div>
  );
};

export default Summary;
