import { useState } from "react";
import { sendMessage } from "./helpers/gemini";
import { LoaderCircle } from "lucide-react";
import GoogleLogo from "./components/GoogleLogo";

function App() {
  const [areColorsSuggestedByAI, setAreColorsSuggestedByAI] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [shouldButtonBeDisabled, setShouldButtonBeDisabled] = useState(false);

  const handleGetColorsSuggestedByAIClick = () => {
    const color = document.getElementById('hex').value

    setIsButtonLoading(true)
    try {
      sendMessage(
        `#${color}`,
        document.querySelector("#tailwind-colors").children.length - 1
      ).then(cores_proximas => {
        switch (cores_proximas) {
          case "error-429":
            alert("Você está realizando muitas requisições. Aguarde alguns segundos e tente novamente.")
            setIsButtonLoading(false)

            setShouldButtonBeDisabled(true)
            setTimeout(() => setShouldButtonBeDisabled(false), 5000)
            break;
          case "error":
            alert("Ocorreu um erro ao consultar o Gemini. Aguarde alguns segundos e tente novamente.")
            setIsButtonLoading(false)
            
            setShouldButtonBeDisabled(true)
            setTimeout(() => setShouldButtonBeDisabled(false), 4000)
            break;
          default:
            setIsButtonLoading(false)
    
            cores_proximas = cores_proximas.replace("\n", "").trim().split(' ')

            const coresProximasPossuiAlgumaCorErrada = 
              cores_proximas.some(cor => {
                return !Object.keys(window.cores_tailwind).includes(cor)
              })

            if (coresProximasPossuiAlgumaCorErrada || !(3 <= cores_proximas.length <= 5)) {
              alert("Ocorreu um erro ao consultar o Gemini. Aguarde alguns segundos e tente novamente.")
              return
            }
            
            document.querySelectorAll("input").forEach(input => {
              input.disabled = true
            })
            window.createTailwindColorsDivs(cores_proximas, window.cores_tailwind)
            setAreColorsSuggestedByAI(true)
            break;
        }
      })
    } catch (error) {
      setIsButtonLoading(false)
      alert("Ocorreu um erro ao consultar o Gemini. Aguarde alguns segundos e tente novamente.")
    }
  }

  const handleGoBackClick = () => {
    window.acharCores()
    document.querySelectorAll("input").forEach(input => {
      input.disabled = false
    })
    setAreColorsSuggestedByAI(false)
  }

  return (
    <>
      {!areColorsSuggestedByAI ? (
        <button
          onClick={handleGetColorsSuggestedByAIClick}
          className={`ai-button ${isButtonLoading && "loading"}`}
          disabled={isButtonLoading || shouldButtonBeDisabled}
          id="gemini"
        >
          {(isButtonLoading || shouldButtonBeDisabled) && (
            <LoaderCircle size={18} className="loading-icon" />
          )}
          See suggestions from <GoogleLogo /> <span>GeminiAI</span>
        </button>
      ) : (
        <>
          <button
            onClick={handleGoBackClick}
            className="ai-button"
            id="goback"
          >
            Go back to reenable color swapping
          </button>
          <div className="gemini-info">
            <span>
              You are viewing <GoogleLogo />Gemini's suggestions.
            </span>
          </div>
        </>
      )}
    </>
  );
}

export default App;
