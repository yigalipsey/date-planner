import React from "react";
import styled from "styled-components";
import Image from "next/image";

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <Image
          src="/icons/logoyigalandtali.png"
          alt="Tali & Yigal"
          width={80}
          height={80}
          className="logo"
        />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
    background: transparent;
    border: 3px solid rgba(255, 192, 203, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  }

  .logo {
    z-index: 2;
    opacity: 0.9;
  }

  .loader::before {
    content: "";
    position: absolute;
    top: -3px;
    left: -3px;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top: 3px solid #ff9eb5;
    border-right: 3px solid #ff9eb5;
    border-radius: 50%;
    animation: animateC 2s linear infinite;
  }

  @keyframes animateC {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Loader;
