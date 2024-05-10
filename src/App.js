import { useState } from "react";
import { sendMessage } from "./helpers/gemini";
import { LoaderCircle } from "lucide-react";
import GoogleLogo from "./components/GoogleLogo";

function App() {
  const [areColorsSuggestedByAI, setAreColorsSuggestedByAI] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const handleGetColorsSuggestedByAIClick = () => {
    const color = document.getElementById('hex').value

    setIsButtonLoading(true)
    try {
      sendMessage(
        `#${color}`,
        document.querySelector("#tailwind-colors").childNodes.length - 2
      ).then(cores_proximas => {
        setIsButtonLoading(false)

        cores_proximas = cores_proximas.replace("\n", "").trim().split(' ')
        window.createTailwindColorsDivs(cores_proximas, window.cores_tailwind)

        setAreColorsSuggestedByAI(true)
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleGoBackClick = () => {
    window.acharCores()
    setAreColorsSuggestedByAI(false)
  }

  return (
    <>
      {!areColorsSuggestedByAI ? (
        <button
          onClick={handleGetColorsSuggestedByAIClick}
          className="ai-button"
          disabled={isButtonLoading}
        >
          {isButtonLoading && (
            <LoaderCircle size={18} className="loading-icon" />
          )}
          See suggestions from <GoogleLogo size={"fill"} /> <span>GeminiAI</span>
        </button>
      ) : (
        <button
          onClick={handleGoBackClick}
          className="ai-button"
        >
          Go back
        </button>
      )}
    </>
  );
}

export default App;
