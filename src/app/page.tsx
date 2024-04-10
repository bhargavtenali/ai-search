"use client";

import React, { useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import fieldsArray from "../../Fields.json";

const Home = () => {
  const [input, setInput] = useState("");
  const wordsToUnderline: any = [];
  fieldsArray.forEach((field) => {
    wordsToUnderline.push(field.uiFieldName);
    wordsToUnderline.push(field.filterFieldName);
  });
  const divRef = useRef<HTMLDivElement>(null);
  let matchedWords = [];

  // useEffect(() => {
  //   fetch("http://localhost:8080/api/home")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setMessage(data.message);
  //     });
  // }, []);

  const handleInputKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      renderInputWithUnderline();
    }
  };

  const renderInputWithUnderline = () => {
    // Create a regular expression pattern to match all phrases
    const pattern = new RegExp(wordsToUnderline.join("|"), "gi");
    matchedWords = [];
    // Replace all occurrences of the matched phrases with themselves wrapped in <u> tags
    const newTextContent = input.replace(pattern, (matched) => {
      matchedWords.push(matched);
      return `<u>${matched}</u>`;
    });
    if (divRef.current) {
      divRef.current.innerHTML = newTextContent;
    }
  };

  return (
    <div className="bg-container">
      <div className="w-full h-full flex justify-center items-center">
        <div className="relative w-[60%]">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <CiSearch />
          </div>
          <div
            ref={divRef}
            contentEditable="true"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
            onKeyUp={(e: any) => setInput(e.target.innerText)}
            onKeyDown={handleInputKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
