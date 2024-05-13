import { useState } from "react";
import { sendMessage } from "./helpers/gemini";
import { LoaderCircle, CornerDownLeft } from "lucide-react";
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
      ).then(suggested_colors => {
        switch (suggested_colors) {
          case "error-429":
            alert("You are making too many requests. Please wait a few seconds, refresh the page and try again.")
            setIsButtonLoading(false)

            setShouldButtonBeDisabled(true)
            setTimeout(() => setShouldButtonBeDisabled(false), 5000)
            break;
          case "error":
            alert("An error occurred while querying Gemini. Please wait a few seconds and try again.")
            setIsButtonLoading(false)
            
            setShouldButtonBeDisabled(true)
            setTimeout(() => setShouldButtonBeDisabled(false), 4000)
            break;
          default:
            setIsButtonLoading(false)

            var filtered_suggested_colors =
              suggested_colors
              .replace("\n", "")
              .replace("  ", " ")
              .replace(/[!"#$%&'()*+,./:;<=>?@[\]^_`{|}~]/g, "")
              .trim()
              .split(' ')

            const doSuggestedColorsHaveAnyIncorrentColor = 
              filtered_suggested_colors.some(color => 
                !Object.keys(window.tailwind_colors).includes(color)
              )

            if (doSuggestedColorsHaveAnyIncorrentColor) {
              filtered_suggested_colors = []
              Object.keys(window.tailwind_colors).forEach(color => {
                if (suggested_colors.includes(color)) {
                  filtered_suggested_colors.push(color)
                }
              })

              const doSuggestedColorsHaveAny500Color =
                filtered_suggested_colors.some(color => {
                  return color.includes("-500")
                })

              if (doSuggestedColorsHaveAny500Color) {
                filtered_suggested_colors = filtered_suggested_colors.filter(color => {
                  return color.slice(color.length-3, color.length) !== "-50"
                })
              }
            }
              
            if (filtered_suggested_colors.length < 3) {
              alert("An error occurred while querying Gemini. Please wait a few seconds and try again.")
              return
            }

            document.querySelectorAll("input").forEach(input => {
              input.disabled = true
            })
            document.querySelector("#form-div").style.opacity = 0.75;
            window.createTailwindColorsDivs(filtered_suggested_colors, window.tailwind_colors)
            setAreColorsSuggestedByAI(true)
            break;
        }
      })
    } catch (error) {
      setIsButtonLoading(false)
      alert("An error occurred while querying Gemini. Please wait a few seconds and try again.")
    }
  }

  const handleGoBackClick = () => {
    window.findColors()
    document.querySelectorAll("input").forEach(input => {
      input.disabled = false
    })
    document.querySelector("#form-div").style.opacity = 1;
    setAreColorsSuggestedByAI(false)
  }

  return (
    <>
      {!areColorsSuggestedByAI ? (
        <button
          onClick={handleGetColorsSuggestedByAIClick}
          className={`ai-button ${isButtonLoading && "loading"}`}
          disabled={isButtonLoading || shouldButtonBeDisabled}
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
            <CornerDownLeft size={18} className="goback-icon" />
            Go back to re-enable color changing
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
