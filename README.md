# Sanfoundry AI Answer Helper 🧠✨

A Tampermonkey userscript that enhances Sanfoundry MCQ pages with:

- ✅ Answer input field
- ❌ AI-based explanation for incorrect answers using Gemini API
- 🧾 Optional logging of question and correct answer to your own Express + MongoDB server

---

## 🔧 Features

- Instantly check your answer for any MCQ on Sanfoundry
- Get clear AI-generated explanations if your answer is incorrect
- Automatically (and optionally) log questions you get wrong to your server to review later

---

## 🖥️ Tech Stack

- **Frontend Script**: Vanilla JS (Tampermonkey userscript)
- **AI API**: Google Gemini (via Gemini 1.5 Flash)
- **Backend**: Express.js + MongoDB (for logging Q&A)

---

## 🧪 How It Works

1. The script adds an input box and submit button to each MCQ on the page.
2. If your answer is correct ✅ – it shows a green check.
3. If incorrect ❌ – it:
   - Queries Gemini for an explanation
   - (Optionally) logs the question + correct answer to your backend

---

## ⚙️ Installation

### 1. Userscript

- Install [Tampermonkey](https://tampermonkey.net/)
- Create a new script and paste the code from [`userscript.js`](./userscript.js)

### 2. Backend

1. Clone this repo:

   ```bash
   git clone https://github.com/yourusername/questions-ai-helper.git
   cd questions-ai-helper
   ```
