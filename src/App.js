import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import axios from "axios";

const checkWord = (checkWord, actualWord) => {
  let flags = [0, 0, 0, 0, 0];
  for (let i = 0; i < actualWord.length; i++) {
    if (checkWord[i] === actualWord[i]) {
      flags[i] = 1;
    }
  }
  return flags;
};

const enterFunc = async (wordLength, itemsRef, currRow, infoSpan, word, setCurrRow) => {
  let submittedWord = "";
  for (let i = 0; i < wordLength; i++) {
    submittedWord = submittedWord.concat(
      itemsRef.current[i + currRow * 5].value
    );
  }
  let resp = await axios.get(`https://words.bookheroapp.com/checkWord?word=${submittedWord}`);
  let check = false;
  if (resp) check = resp.data;
  if (!check) {
    infoSpan.current.innerText = "That is not a valid word";
    return;
  } else {
    infoSpan.current.innerText = "";
  }
  let result = checkWord(submittedWord.toLowerCase(), word);
  console.log(result);
  for (let i = 0; i < result.length; i++) {
    if (word.includes(submittedWord[i])) {
      itemsRef.current[i + currRow * 5].style.backgroundColor =
        "yellow";
    }
    if (result[i] === 1) {
      itemsRef.current[i + currRow * 5].style.backgroundColor = "green";
    }
  }
  if (!result.includes(0)) {
    infoSpan.current.innerText = "WINNER!";
  } else if (currRow < 5) {
    setCurrRow(currRow + 1);
  } else {
    infoSpan.current.innerText = "Game Over";
  }
}

function App() {
  const itemsRef = useRef([]);
  const infoSpan = useRef(null);
  const [wordLength] = useState(5);
  const [word, setWord] = useState("");
  const [currRow, setCurrRow] = useState(0);
  const enterButton = useRef(null);
  useEffect(() => {
    function downHandler({ key }) {
      if (key === "Enter") {
        if (enterButton.current)
          enterButton.current.click()
      }
    }
    window.addEventListener("keydown", downHandler);
    itemsRef.current = itemsRef.current.slice(0, 30);
    axios.get('https://words.bookheroapp.com/generateWord').then((resp) => {
      console.log(resp.data)
      setWord(resp.data)
    });
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, []);
  useEffect(() => {
    itemsRef.current[currRow * 5].focus();
  }, [currRow]);
  return (
    <div className="App">
      <div className="">
        {[...Array(6).keys()].map((row, i) => {
          return (
            <div className="w-full flex" key={`row-${i}`}>
              {[...Array(5).keys()].map((cell, index) => {
                return (
                  <div
                    key={`cell-${index}`}
                    className="bg-gray-200 border-2 border-gray-900 w-12 h-12 m-2"
                  >
                    <input
                      disabled={row !== currRow}
                      ref={(el) => (itemsRef.current[index + row * 5] = el)}
                      maxLength="1"
                      className="w-full h-full bg-transparent text-lg text-center"
                      onKeyDown={(e) => {
                        if (e.nativeEvent.keyCode === 8) {
                          // console.log(e.)
                          if (index === 0) {
                            return;
                          } else if (index === 4 && e.target.value) {
                            e.target.value = "";
                            return;
                          }
                          itemsRef.current[index + row * 5 - 1].focus();
                        }
                      }}
                      onChange={(e) => {
                        if (e.nativeEvent.data && index < 4) {
                          itemsRef.current[index + row * 5 + 1].focus();
                        }
                      }}
                    ></input>
                  </div>
                );
              })}
            </div>
          );
        })}{" "}
      </div>
      <button
        className="mt-8 float-left ml-4 border-2 border-gray-500 px-8 rounded-lg bg-slate-300"
        ref={enterButton}
        onClick={() => {
          enterFunc(wordLength, itemsRef, currRow, infoSpan, word, setCurrRow);
        }}
      >
        Enter
      </button>
      <button
        className="mt-8 float-left ml-4 border-2 border-gray-500 px-8 rounded-lg bg-slate-300"
        onClick={() => {
          window.location.reload();
        }}
      >
        Restart
      </button>
      <p className="mt-20 text-left" ref={infoSpan}></p>
    </div>
  );
}

export default App;
