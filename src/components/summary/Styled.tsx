import styled from 'styled-components';

export const ModalContainer = styled.div`
  padding: 20px;
  border: 1px solid rgb(221, 221, 221);
  border-radius: 10px;
  position: fixed;
  width: 80vw;
  height: 80vh;
  max-width: 700px;
  background-color: #fff;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  color: #000;
  overflow: auto;
  font-size: 14px;

  /* 중앙 정렬 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  h3 {
    margin-bottom: 10px;
  }

  .result-area {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    h4 {
      font-size: 16px;
    }
    ul {
      margin-top: 0px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 14px;
    }
  }
`;

/* 🔥 클로즈 버튼 스타일 */
export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #333;

  &:hover {
    color: red;
    background-color: transparent;
  }
`;
