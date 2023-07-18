const pickerBtn = document.getElementById("picker-btn");
const clearBtn = document.getElementById("clear-btn");
const colourList = document.querySelector(".all-colours");
const exportBtn = document.getElementById("export-btn");

let pickedColours = JSON.parse(localStorage.getItem("colours-list")) || [];
let currentPopup = null;

// Copy text to clipboard
const copyToClipboard = async (text, element) => {
  try {
    await navigator.clipboard.writeText(text);
    element.innerText = "Copied!";
    setTimeout(() => {
      element.innerText = text;
    }, 1000);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

// Export colours as text file
const exportColours = () => {
  const colourText = pickedColours.join("\n");
  const blob = new Blob([colourText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "colours.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Create colour popup
const createPopup = (colour) => {
  const popup = document.createElement("div");
  popup.classList.add("colour-popup");
  popup.innerHTML = `
        <div class="colour-popup-content">
            <span class="close-popup"></span>
            <div class="colour-info">
                <div class="colour-preview" style="background-color: ${colour}"></div>
                <div class="colour-details">
                    <div class="colour-value">
                        <span class="label">Hex: </span>
                        <span class="value hex" data-color="${colour}">${colour}</span>
                    </div>
                    <div class="colour-value">
                        <span class="label">RGB: </span>
                        <span class="value rgb" data-color="${colour}">${hexToRgb(
    colour
  )}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

  const closeBtn = popup.querySelector(".close-popup");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(popup);
    currentPopup = null;
  });

  const colourValue = popup.querySelectorAll(".value");
  colourValue.forEach((value) => {
    value.addEventListener("click", (e) => {
      const text = e.currentTarget.innerText;
      copyToClipboard(text, e.currentTarget);
    });
  });

  return popup;
};

const showColours = () => {
  colourList.innerHTML = pickedColours
    .map(
      (colour) =>
        `
        <li class="color">
            <span class="rect" style="background: ${colour}; border: 1px solid; ${
          colour === "#ffffff" ? "#ccc" : colour
        }"></span>
            <span class="value hex" data-color="${colour}">${colour}</span>
        </li>
        `
    )
    .join("");

  const colourElements = colourList.querySelectorAll(".color");
  colourElements.forEach((li) => {
    const colourHex = li.querySelector(".value.hex");
    colourHex.addEventListener("click", (e) => {
      const colour = e.currentTarget.dataset.color;
      if (currentPopup) {
        document.body.removeChild(currentPopup);
      }
      const popup = createPopup(colour);
      document.body.appendChild(popup);
      currentPopup = popup;
    });
  });

  const pickedColoursContianer = document.querySelector(".colours-list");
  pickedColoursContianer.classList.toggle("hide", pickedColours.length === 0);
};

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
};

const activateEyeDropper = async () => {
  document.body.style.display = "none";
  try {
    const { sRGBHex } = await new EyeDropper().open();

    if (!pickedColours.includes(sRGBHex)) {
      pickedColours.push(sRGBHex);
      localStorage.setItem("colours-list", JSON.stringify(pickedColours));
    }

    showColours();
  } catch (err) {
    alert("Failed to pick colour");
  } finally {
    document.body.style.display = "block";
  }
};

const clearAllColours = () => {
  pickedColours = [];
  localStorage.removeItem("colours-list");
  showColours();
};

clearBtn.addEventListener("click", clearAllColours);
pickerBtn.addEventListener("click", activateEyeDropper);
exportBtn.addEventListener("click", exportColours);

showColours();
