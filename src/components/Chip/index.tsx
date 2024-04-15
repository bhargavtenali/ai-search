import React, { useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

const Chip = ({ subString, removeSelectedField }: any) => {
  const [renderPlainText, setRenderPlainText] = useState(false);
  const clickHandler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setRenderPlainText(true);
    removeSelectedField(subString);
  };
  if (!renderPlainText) {
    return (
      <div className="inline-flex">
        <span>&nbsp;</span>
        <div className="rounded-lg flex justify-start align-center w-auto bg-slate-300 px-1 py-1 gap-1 cursor-pointer">
          <span>{subString}</span>
          <div
            className="flex justify-start items-center text-slate-600"
            onClick={clickHandler}
          >
            <IoMdCloseCircle />
          </div>
        </div>
        <span>&nbsp;</span>
      </div>
    );
  } else {
    return (
      <span>
        <span>&nbsp;</span>
        {subString}
        <span>&nbsp;</span>
      </span>
    );
  }
};

export default Chip;
