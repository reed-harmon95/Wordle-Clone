document.addEventListener("DOMContentLoaded", () => {

    createSquares();            //init game board
    getWord();                  //init goal word




    let guessedWords = [[]];    //holds the guessed words in current game
                                //each letter has its own index
    
    let availableSpace = 1;     //default available letters left in word guess
    let goalWord;               //the word that the user is trying to find
    let guessedWordCount = 0;   //used for animation of letters when word is guessed

    const keys = document.querySelectorAll('.keyboard-row button')  //used for key/button interaction


    //this function gets the goal word to be guessed by the user
    //this function does so by calling the WordsAPI with a GET request
    function getWord() {

        fetch(
            `https://wordsapiv1.p.rapidapi.com/words/?random=true&lettersMin=5&lettersMax=5`,
            {
              method: "GET",
              headers: {
                "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
                "x-rapidapi-key": "Put_API_Key_Here",
              },
            }
          )
            .then((response) => {
              return response.json();
            })
            .then((res) => {
              goalWord = res.word;
            })
            .catch((err) => {
              console.error(err);
            });
    }


    //helper function for the updateGuessedWords function
    //this returns an array with the words guessed in the current game
    function getCurrentWordArray() {
        const numberOfGuessedWords = guessedWords.length
        return guessedWords[numberOfGuessedWords - 1]
    }

    

    //this function handles the word guessing by the user
    //checks for correctness of guess
    function updateGuessedWords (letter) {
        const currentWordArray = getCurrentWordArray()
        

        //make sure that the array of guessed words is valid
        //if valid, push the letter into the array
        if(currentWordArray && currentWordArray.length < 5) {
            currentWordArray.push(letter)


            //handles the letters left in the current word guess
            //max space for guess is 5 letters
            const availableSpaceElement = document.getElementById(String(availableSpace))
            availableSpace += 1;
            availableSpaceElement.textContent = letter;
        }
    }

    


    //this function handles the changing of the tile colors 
    //tile colors change upon comparing the guessed word to the goal word
    function getTileColor (letter, index) {
        const isCorrect = goalWord.includes(letter);

        //if letter is not in word
        if(!isCorrect) {
            return "rgb(58,58,60)";
        }


        const goalLetterPosition = goalWord.charAt(index)
        const isCorrectPosition = (letter === goalLetterPosition)

        //if letter is in word in correct position
        if(isCorrectPosition) {
            return "rgb(83,141,78)"
        }
        
        //if letter is in word at incorrect position
        return "rgb(181,159,59)"
    }


    //this function handles submitting the word once the 'enter' key is selected
    function handleSubmitWord() {
        const currentWordArray = getCurrentWordArray();

        //ensure word submitted by user is 5 letters
        if(currentWordArray.length !== 5) {
            window.alert("Word must be 5 letters");
        }


        //add the gussed word to the guessed words array
        const currentWord = currentWordArray.join("");



        fetch(`https://wordsapiv1.p.rapidapi.com/words/${currentWord}`, {
            method: "GET",
            headers: {
              "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
              "x-rapidapi-key": "Put_API_Key_Here",
            },
          })
            .then((res) => {
              if (!res.ok) {
                throw Error();
              }

                //this gets the starting index for the animation
                //the array holding the squares is a single array of 30
                //so this finds the position in that array to start the animation
                const firstLetterId = (guessedWordCount * 5) + 1;

                //wordle animation
                const interval = 200;
                currentWordArray.forEach((letter, index) => {
                    setTimeout(() => {
                        const tileColor = getTileColor(letter, index);

                        const letterId = firstLetterId + index;
                        const letterElement = document.getElementById(letterId);
                        letterElement.classList.add("animate__flipInX");
                        letterElement.style = `background-color:${tileColor};border-color:${tileColor}`


                    }, interval * index)
                })

                guessedWordCount += 1;

                //if guess is correct, you win
                if(currentWord === goalWord) {
                    window.alert("Congratulations You Won");
                }

                //if run out of guesses, you lose
                if(guessedWords.length === 6) {
                    window.alert(`No guesses left. Word: ${goalWord}`);
                }

                //if not correct, but still have guesses, guess again
                //jumps to next row on screen
                guessedWords.push([]);
            })
            .catch(() => {
                window.alert("word is not recognized");
            });
    }

    //this function creates the squares for the guessed words
    //this is done insteadd of manually entering them in html
    function createSquares() {
        const gameBoard = document.getElementById("board");

        //loop through and create 30 squares for game board
        //create 6 rows for 5 letter words
        for( let index = 0; index < 30; index++) {
            let square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated");
            square.setAttribute("id", index + 1);
            gameBoard.appendChild(square);
        }
    }


    //this function handles the functionality for the 'delete' key
    function handleDeleteWord () {
        const currentWordArray = getCurrentWordArray()
        const removedLetter = currentWordArray.pop()


        //update the word in the array by removing the last typed letter
        guessedWords[guessedWords.length - 1] = currentWordArray

        //updating on the screen
        const lastLetterElement = document.getElementById(String(availableSpace - 1))
        lastLetterElement.textContent = ''
        availableSpace -= 1
    }

    //this loop registers the key/button clicks by the user
    //calls updateGuessedWords when user tries to guess a word
    for (let i = 0; i < keys.length; i++) {
        keys[i].onclick = ({ target}) => {
            const letter = target.getAttribute("data-key");


            //handling the enter key
            if(letter === 'enter') {
                handleSubmitWord()
                return;
            }

            //handling the delete key
            if(letter === 'del'){
                handleDeleteWord()
                return;
            }



            updateGuessedWords(letter);
        };
    }
 
});