import { createGlobalStyle } from "styled-components";

// ✅ 글로벌 스타일 정의
export const GlobalStyle = createGlobalStyle`
  /* 기본 리셋 */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 전체 배경 및 폰트 설정 */
  body {
    font-family: 'Pretendard', Arial, sans-serif;  /* 원하는 폰트 적용 */
    background-color:rgb(138, 138, 236);  /* 다크모드 계열 배경 */
    color: #ffffff;  /* 기본 텍스트 색상 (흰색) */
    line-height: 1.6;
  }

  /* 스크롤바 스타일 */
  ::-webkit-scrollbar {
    display: none;
  }

  ::-webkit-scrollbar-thumb {
    background: #9333EA; /* 보라색 스크롤바 */
    border-radius: 4px;
  }

  ::-webkit-scrollbar-track {
    background: #2e2e3e; /* 다크모드 배경 */
  }

  /* 링크 스타일 */
  a {
    color: #A855F7; /* 연한 보라 */
    text-decoration: none;
    transition: color 0.3s ease-in-out;
  }

  a:hover {
    color: #C084FC; /* 더 밝은 보라 */
  }

  /* 기본 버튼 스타일 */
  button {
    background-color: #7C3AED;
    color: #fff;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s ease-in-out;
  }
`;
