"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  Fragment,
  useEffect,
} from "react";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { apiStatusConstants } from "../../constants";
import Chip from "@/components/Chip";
import AutoComplete from "@/components/AutoComplete";

const Home = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const [jsxElements, setJsxElements] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");
  const [selectedFields, setSelectedFields] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [openaiApiState, setOpenaiApiState] = useState({
    errorMsg: "",
    apiStatus: apiStatusConstants.initial,
    matchedFields: [],
    mongoDBQuery: [],
    autocomplete: [],
  });

  const [dbApiState, setDbApiState] = useState({
    errorMsg: "",
    apiStatus: apiStatusConstants.initial,
    data: "",
  });

  useEffect(() => {
    if (openaiApiState.apiStatus === apiStatusConstants.success) {
      const fetchDbData = async () => {
        {
          const dbQuery = openaiApiState.mongoDBQuery;
          const payload = { dbQuery };
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/db/query`;
          setDbApiState({
            errorMsg: "",
            apiStatus: apiStatusConstants.inProgress,
            data: "",
          });
          try {
            const response = await axios.post(apiUrl, payload);
            setDbApiState({
              errorMsg: "",
              apiStatus: apiStatusConstants.success,
              data: response.data,
            });
          } catch (error) {
            console.error(error);
            setDbApiState({
              errorMsg: "",
              apiStatus: apiStatusConstants.failure,
              data: "",
            });
          }
        }
      };
      fetchDbData();
    }
  }, [openaiApiState]);

  const fetchDebounce = (callback: any, delay: any) => {
    let timer: any;
    return function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        callback();
      }, delay);
    };
  };

  const removeSelectedField = useCallback(
    (subString: string) => {
      const newSelectedFields = selectedFields.filter(
        (field) => field.matchedSubString !== subString
      );
      setSelectedFields(newSelectedFields);
    },
    [selectedFields]
  );

  const debounceApiCall = useMemo(
    () =>
      fetchDebounce(async () => {
        const userInput = inputRef?.current?.value;
        const payload = { userInput };
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/openai/search`;
        setIsOpen(true);
        setOpenaiApiState({
          errorMsg: "",
          apiStatus: apiStatusConstants.inProgress,
          matchedFields: [],
          mongoDBQuery: [],
          autocomplete: [],
        });
        try {
          const response = await axios.post(apiUrl, payload);
          const data = response.data;
          setOpenaiApiState({
            errorMsg: "",
            apiStatus: apiStatusConstants.success,
            matchedFields: data.message.matchedFields,
            mongoDBQuery: data.message.mongoDBQuery,
            autocomplete: data.message.autocomplete,
          });
          if (data.message.matchedFields.length > 0) {
            const matchedFieldsArray = data.message.matchedFields.map(
              (field: any) => field.matchedSubString
            );
            const regexPattern = "(" + matchedFieldsArray.join("|") + ")";
            const regex = new RegExp(regexPattern, "gi");
            // wrap matched phrases in CHIP
            if (userInput) {
              const splittedArray = userInput.split(regex);
              const elementsArray = splittedArray.map((substr, index) => {
                if (regex.test(substr)) {
                  return (
                    <Chip
                      key={index}
                      subString={substr}
                      removeSelectedField={removeSelectedField}
                    />
                  );
                }
                return <span key={index}>{substr}</span>;
              });
              // if (divRef.current) {
              //   divRef.current.innerHTML = "";
              // }
              setJsxElements([...elementsArray]);
              setSelectedFields(data.message.matchedFields);
            }
          }
        } catch (error) {
          console.error(error);
          setOpenaiApiState({
            errorMsg: `Error logging in due to ${error}`,
            apiStatus: apiStatusConstants.failure,
            matchedFields: [],
            mongoDBQuery: [],
            autocomplete: [],
          });
        }
      }, 1000),
    [removeSelectedField]
  );

  const handleInputChange = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setUserInput(e.target.value);
    //use debouncing and do openai call
    debounceApiCall();
  };
  console.log(jsxElements, "jsxElements");
  console.log(selectedFields, "selectedFields");

  const renderInputField = () => {
    if (
      openaiApiState.apiStatus === apiStatusConstants.success &&
      jsxElements.length > 0
    ) {
      return (
        <div
          onClick={() => {
            setOpenaiApiState({
              errorMsg: "",
              apiStatus: apiStatusConstants.initial,
              matchedFields: [],
              mongoDBQuery: [],
              autocomplete: [],
            });
          }}
          ref={divRef}
          className="cursor-text flex justify-start items-center h-[50px] bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 w-full ps-10 pe-10 p-2.5"
        >
          {jsxElements}
        </div>
      );
    } else {
      return (
        <input
          autoFocus
          value={userInput}
          ref={inputRef}
          className="flex justify-start items-center h-[50px] bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 w-full ps-10 pe-10 p-2.5"
          onChange={handleInputChange}
        />
      );
    }
  };
  console.log(dbApiState.data, "dbApiState.data");
  return (
    <div className="bg-container">
      <div className="relative w-full h-full flex justify-center items-center">
        <div className="relative w-[60%]">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <CiSearch />
          </div>
          {renderInputField()}
          <div
            className="absolute inset-y-0 end-0 flex items-center pe-3 cursor-pointer"
            onClick={(e) => {
              setUserInput("");
              if (divRef.current) divRef.current.innerHTML = "";
            }}
          >
            <IoMdClose />
          </div>
          <AutoComplete
            openaiApiState={openaiApiState}
            setOpenaiApiState={setOpenaiApiState}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setJsxElements={setJsxElements}
            setSelectedFields={setSelectedFields}
            setUserInput={setUserInput}
          />
        </div>
        {dbApiState.data && dbApiState.data}
      </div>
    </div>
  );
};

export default Home;
