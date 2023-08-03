import styled, { css } from "styled-components";
import { useState } from "react";
import Loader from "./loader";

export default function LoadingComponent({
  children,
  overlayChildren,
  isLoading,
  loaderText,
  className,
}: {
  children: JSX.Element;
  overlayChildren?: JSX.Element;
  isLoading: boolean;
  loaderText?: string;
  className?: string;
}): JSX.Element {
  //return a form component with the state and the functions to update the state
  return (
    <LoadingWrap className={className}>
      {children}
      <Overlay isLoading={isLoading}>
        <Loader text={loaderText} />
        {overlayChildren}
      </Overlay>
    </LoadingWrap>
  );
}

const LoadingWrap = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 5px 10px;
`;

const Overlay = styled.div<{ isLoading?: boolean }>`
  position: absolute;
  overflow: visibile;
  display: ${(props) => (props.isLoading ? "flex" : "none")};
  top: 0;
  left: 0;
  background-color: rgba(200, 200, 200, 0.2);
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
  border-radius: 5px;
`;
