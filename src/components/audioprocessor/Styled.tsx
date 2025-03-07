import styled from 'styled-components';

export const Button = styled.button`
  border: none;
  padding: 20px 10px;
  color: #fff;
  border-radius: 15px;
  background-color: #7c3aed;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    background-color: #573396;
  }
`;

export const FileForm = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  max-width: 400px;
  .form-wrapper {
    display: flex;
    flex-direction: row;
    gap: 10px;
    /* 선택한 파일 이름 표시 */
    .fileUploadlabel {
      font-size: 14px;
      color: #fff;
      background: #2e2e3e;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        background: #7f7f7f;
      }
    }
  }

  /* 숨겨진 기본 파일 입력 필드 */
  input[type='file'] {
    display: none;
  }
`;
