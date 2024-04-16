import React, { useState } from "react";
import Chip from "../Chip";
import { apiStatusConstants } from "../../../constants";
import { TailSpin } from "react-loader-spinner";

const AutoComplete = ({
  openaiApiState,
  setOpenaiApiState,
  isOpen,
  setIsOpen,
  setJsxElements,
  setSelectedFields,
  setUserInput,
}: any) => {
  const autocompleteArray = openaiApiState.autocomplete;
  const jsxArray = autocompleteArray.map((acItem: any) => {
    const matchedFieldsArray = acItem.matchedFields.map(
      (field: any) => field.matchedSubString
    );
    const regexPattern = "(" + matchedFieldsArray.join("|") + ")";
    const regex = new RegExp(regexPattern, "gi");
    const splittedArray = acItem.prediction.split(regex);
    const elementsArray = splittedArray.map((substr: any, index: any) => {
      if (regex.test(substr)) {
        return <Chip key={index} subString={substr} />;
      }
      return <span key={index}>{substr}</span>;
    });
    return {
      elementsArray,
      matchedFields: acItem.matchedFields,
      userInput: acItem.prediction,
    };
  });

  const renderAutoCompleteDiv = () => {
    const { apiStatus } = openaiApiState;
    if (apiStatus === apiStatusConstants.success && isOpen) {
      return renderAutoCompletListView();
    } else if (apiStatus === apiStatusConstants.inProgress && isOpen) {
      return renderLoadingView();
    } else if (!isOpen || apiStatus === apiStatusConstants.initial) {
      return null;
    }
  };

  const renderLoadingView = () => {
    return (
      <div className="bg-gray-50 flex justify-center items-center h-[200px]">
        <TailSpin
          visible={true}
          height="50"
          width="50"
          color="#4fa94d"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  };

  const renderAutoCompletListView = () => {
    return (
      <div className="bg-gray-50 flex-col items-center h-auto">
        {jsxArray.map((jsxElementsObject: any, index: any) => {
          const {
            elementsArray: jsxElements,
            matchedFields,
            userInput,
          } = jsxElementsObject;
          return (
            <div
              key={index}
              onClick={() => {
                setJsxElements([...jsxElements]);
                setSelectedFields(matchedFields);
                setIsOpen(false);
                setUserInput(userInput);
              }}
              className="cursor-pointer hover:bg-gray-200 flex justify-start items-center h-[50px] bg-gray-50  text-gray-900 text-sm  w-full ps-10 pe-10 p-2.5"
            >
              {jsxElements}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="absolute left-0 top-[50px] h-auto w-[100%]">
      {renderAutoCompleteDiv()}
    </div>
  );
};
export default AutoComplete;
