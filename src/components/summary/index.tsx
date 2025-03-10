import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import DOMPurify from "dompurify";
import { ModalContainer, CloseButton } from "./Styled";
import { AiOutlineClose } from "react-icons/ai";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ClipLoader } from "react-spinners";

interface Message {
  speaker: number;
  text: string;
}

interface SummaryProps {
  messages: Message[];
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const GEMINI_API_KEY = "AIzaSyDdRYnw510V_OuJJ1bGrclYQpGZtuG3gck";

/** ✅ 대화 분석 함수 */
const summarizeText = async (text: string) => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analyze the following conversation by speaker:
    1. Classify only the actual speakers present in the conversation.
    2. The conversation may contain speakers labeled from A to E. Include only the ones that appear in the given text. Do not add missing speakers.
    3. Analyze the frequently used words and speech patterns for each speaker.
    4. Provide feedback on how each speaker communicates to encourage smooth and respectful dialogue.
    5. Ensure accurate speaker classification and avoid any incorrect mapping.
    6. Strictly return the result in HTML format using only <h4>, <ul>, and <li> tags.
    7. Do not include any backticks, code blocks, Markdown formatting, or unnecessary headers.
    8. Only return the pure HTML structure without additional explanations.
    9. Each speaker is already marked using the <strong> tag. Ensure high accuracy in speaker classification.
    10. Avoid listing speakers who are not in the conversation.
    
    Respond in Korean.
    
    Conversation content:
    ${text}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    console.log("📝 대화 분석 응답:", result.response);

    return (
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "요약 없음"
    );
  } catch (error) {
    console.error("대화 분석 오류:", error);
    return "요약 실패";
  }
};

/** ✅ 감정 분석 (긍정/부정 단어 개수) */
const analyzeSentiment = async (text: string) => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `다음 대화에서 감정 분석을 수행하세요.
    - 긍정적인 단어와 부정적인 단어를 각각 리스트로 반환하세요.
    - JSON 형식으로만 반환하세요.
    - 예: {"positive_count": 12, "negative_count": 5, "positive_words": ["행복", "좋다", "기쁘다"], "negative_words": ["싫다", "불행", "화난다"]}
    - 추가 설명, 백틱, 코드 블록 없이 오직 JSON 데이터만 반환하세요.

    대화 내용:
    ${text}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let responseText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(responseText);

    return {
      positive: analysis.positive_count || 0,
      negative: analysis.negative_count || 0,
      positiveWords: analysis.positive_words || [],
      negativeWords: analysis.negative_words || [],
    };
  } catch (error) {
    console.error("감정 분석 오류:", error);
    return { positive: 0, negative: 0, positiveWords: [], negativeWords: [] };
  }
};

const Summary: React.FC<SummaryProps> = ({ messages, setOpenModal }) => {
  const [summarizedData, setSummarizedData] = useState<{
    [key: number]: string;
  }>({});
  const [sentimentData, setSentimentData] = useState<{
    [key: number]: {
      positive: number;
      negative: number;
      positiveWords: string[];
      negativeWords: string[];
    };
  }>({});

  const [loading, setLoading] = useState<boolean>(true); // ✅ 로딩 상태 추가

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const speakerTextMap: { [key: number]: string } = {};

      messages.forEach((msg) => {
        if (!speakerTextMap[msg.speaker]) speakerTextMap[msg.speaker] = "";
        speakerTextMap[msg.speaker] += msg.text + " ";
      });

      const summaryPromises = Object.entries(speakerTextMap).map(
        async ([speaker, text]) => {
          return {
            speaker: Number(speaker),
            summary: await summarizeText(text),
          };
        }
      );

      const analysisPromises = Object.entries(speakerTextMap).map(
        async ([speaker, text]) => {
          return {
            speaker: Number(speaker),
            analysis: await analyzeSentiment(text),
          };
        }
      );

      const [summaryResults, analysisResults] = await Promise.all([
        Promise.all(summaryPromises),
        Promise.all(analysisPromises),
      ]);

      const summaryMap: { [key: number]: string } = {};
      summaryResults.forEach(({ speaker, summary }) => {
        summaryMap[speaker] = summary || "<h4>요약 없음</h4>";
      });

      const analysisMap: {
        [key: number]: {
          positive: number;
          negative: number;
          positiveWords: string[];
          negativeWords: string[];
        };
      } = {};
      analysisResults.forEach(({ speaker, analysis }) => {
        analysisMap[speaker] = analysis;
      });

      setSummarizedData(summaryMap);
      setSentimentData(analysisMap);
      setLoading(false);
    };

    fetchData();
  }, [messages]);

  const COLORS = ["#00C49F", "#FF4444"];

  return (
    <div className="background">
      <ModalContainer>
        <CloseButton onClick={() => setOpenModal(false)}>
          <AiOutlineClose />
        </CloseButton>

        {loading ? (
          <div
            className="chart-wrapper v2"
            style={{ textAlign: "center", padding: "20px" }}
          >
            <ClipLoader size={50} color="#8884d8" /> {/* ✅ 로딩 써클 */}
            <p>분석 중입니다...</p>
          </div>
        ) : (
          <>
            <h3>📊 감정 분석 그래프</h3>
            {Object.entries(sentimentData).map(([speaker, data]) => (
              <div
                className="chart-wrapper"
                key={speaker}
                style={{ marginBottom: "20px", textAlign: "center" }}
              >
                <PieChart width={250} height={250} style={{ margin: "0 auto" }}>
                  <Pie
                    data={[
                      { name: "긍정 단어", value: data.positive },
                      { name: "부정 단어", value: data.negative },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell key="positive" fill={COLORS[0]} />
                    <Cell key="negative" fill={COLORS[1]} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
                {/* 🔥 긍정적 단어와 부정적 단어 목록 추가 */}
                <div
                  style={{
                    marginTop: "10px",
                    textAlign: "left",
                    padding: "10px",
                  }}
                >
                  <p>
                    <strong>😊 긍정적인 단어:</strong>{" "}
                    {data.positiveWords.length > 0
                      ? data.positiveWords.join(", ")
                      : "없음"}
                  </p>
                  <p>
                    <strong>😡 부정적인 단어:</strong>{" "}
                    {data.negativeWords.length > 0
                      ? data.negativeWords.join(", ")
                      : "없음"}
                  </p>
                </div>
              </div>
            ))}

            <h3>📝 대화 분석</h3>
            {Object.entries(summarizedData).map(([speaker, summary]) => (
              <div
                className="result-area"
                key={speaker}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(summary),
                }}
              />
            ))}
          </>
        )}
      </ModalContainer>
    </div>
  );
};

export default Summary;
