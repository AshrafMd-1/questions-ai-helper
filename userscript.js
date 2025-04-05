// ==UserScript==
// @name         Sanfoundry Answer Checker + AI Explanation
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adds answer input for MCQs, shows AI-based explanation when incorrect
// @author       You
// @match        https://www.sanfoundry.com/*
// @grant        GM_xmlhttpRequest
// @connect      generativelanguage.googleapis.com
// @connect      YOUR_LOGGING_SERVER_HERE.com
// ==/UserScript==

(function () {
  "use strict";

  // === CONFIG ===
  const API_KEY = "<YOUR_GEMINI_API_KEY>"; // Replace locally
  const logging = true; // Toggle server logging
  const serverUrl = "<YOUR_SERVER_URL>"; // Replace locally

  const entries = document.querySelectorAll(".entry-content p");

  entries.forEach((entry) => {
    const span = entry.querySelector("span.collapseomatic");
    if (!span) return;

    const answerId = span.id.replace("id", "target-id");
    const answerDiv = document.getElementById(answerId);
    if (!answerDiv) return;

    const answerMatch = answerDiv.textContent.match(/Answer:\s*([a-d])/i);
    const correctAnswer = answerMatch ? answerMatch[1].toLowerCase() : null;
    if (!correctAnswer) return;

    const optionsMatch = entry.innerHTML.match(
      /a\)[^\n<]+|b\)[^\n<]+|c\)[^\n<]+|d\)[^\n<]+/gi
    );
    const optionsMap = {};
    optionsMatch?.forEach((opt) => {
      const key = opt[0].toLowerCase();
      const value = opt.slice(2).trim();
      optionsMap[key] = value;
    });

    const originalHTML = entry.innerHTML;

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.placeholder = "a-d";
    input.style.margin = "10px";
    input.style.padding = "5px";
    input.style.fontSize = "16px";

    const button = document.createElement("button");
    button.innerText = "Submit";
    button.style.marginLeft = "10px";
    button.style.padding = "6px 12px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";

    const resultDiv = document.createElement("div");
    resultDiv.style.marginTop = "10px";
    resultDiv.style.fontSize = "15px";

    entry.appendChild(input);
    entry.appendChild(button);
    entry.appendChild(resultDiv);

    button.addEventListener("click", () => {
      const userAnswer = input.value.trim().toLowerCase();
      if (!["a", "b", "c", "d"].includes(userAnswer)) {
        alert("Please enter a valid option: a, b, c, or d");
        return;
      }

      if (userAnswer === correctAnswer) {
        resultDiv.innerHTML = "✅ <strong>Correct!</strong>";
        resultDiv.style.color = "green";
        button.disabled = true;
        input.disabled = true;
        return;
      }

      resultDiv.innerHTML = "⏳ <em>Incorrect. Fetching explanation...</em>";
      resultDiv.style.color = "#b30000";

      const lines = originalHTML.split("<br>");
      const qText = lines
        .map((line) => line.replace(/<\/?[^>]+(>|$)/g, "").trim())
        .join("\n");

      const prompt = `
You are a Linux OS teacher helping a student learn through MCQs.

Question:
${qText}

The student answered: "${userAnswer}"
The correct answer is: "${correctAnswer}"

Explain in 2-3 sentences:
1. Why the correct answer is conceptually better.
2. Why the user's answer is incorrect or less appropriate.

Make sure to base your reasoning on core Linux concepts or behaviors.
            `.trim();

      GM_xmlhttpRequest({
        method: "POST",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        onload: function (response) {
          try {
            const res = JSON.parse(response.responseText);
            const explanation =
              res?.candidates?.[0]?.content?.parts?.[0]?.text ||
              "⚠️ No explanation available.";

            const explanationBox = document.createElement("details");
            explanationBox.style.marginTop = "10px";
            explanationBox.style.background = "#f0f0f0";
            explanationBox.style.padding = "10px";
            explanationBox.style.borderRadius = "5px";

            const summary = document.createElement("summary");
            summary.innerText = "AI Explanation";
            summary.style.fontWeight = "bold";
            summary.style.cursor = "pointer";

            const text = document.createElement("div");
            text.innerText = explanation;
            text.style.marginTop = "5px";

            explanationBox.appendChild(summary);
            explanationBox.appendChild(text);

            resultDiv.innerHTML = "❌ <strong>Incorrect.</strong>";
            resultDiv.appendChild(explanationBox);

            // ✅ Send to server if logging enabled
            if (logging) {
              const questionOnly = lines[0]
                .replace(/<\/?[^>]+(>|$)/g, "")
                .replace(/^\d+[\.\)]\s*/, "")
                .trim();

              const actualAnswerText = optionsMap[correctAnswer] || "N/A";

              GM_xmlhttpRequest({
                method: "POST",
                url: `${serverUrl}`,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({
                  question: questionOnly,
                  answer: actualAnswerText,
                }),
                onload: function (res) {
                  console.log("✅ Logged to server:", res.responseText);
                },
                onerror: function () {
                  console.warn("❌ Failed to log to server");
                },
              });
            }
          } catch (e) {
            resultDiv.innerHTML = "⚠️ Failed to parse AI response.";
          }
        },
        onerror: function () {
          resultDiv.innerHTML = "⚠️ Failed to fetch AI explanation.";
        },
      });
    });
  });
})();
