/* =====================================================
   CODE DATA
===================================================== */

const codeExamples = {

    /* ---------------- PACKAGE MANAGER ---------------- */

    npm: `npm install express
npm install @google/genai
npm run dev`,

    yarn: `yarn add express
yarn add @google/genai
yarn dev`,

    pnpm: `pnpm add express
pnpm add @google/genai
pnpm dev`,


    /* ---------------- HTML ---------------- */

    html: `<!-- Simple HTML structure -->
<div class="card">
  <h2>Hello World</h2>
  <button id="button">Click Me</button>
</div>`,

    /* ---------------- CSS ---------------- */

    css: `/* Card styling */
.card {
  padding: 24px;
  border-radius: 12px;
  background: #11141b;
}

.card h2 {
  color: white;
}`,

    /* ---------------- JAVASCRIPT ---------------- */

    js: `// Add click interaction
const button = document.querySelector("#button");

button.addEventListener("click", () => {
  console.log("Button clicked!");
});`
};


/* =====================================================
   STORAGE KEY
===================================================== */

const STORAGE_PREFIX = "code-tabs-";


/* =====================================================
   GET SAVED TAB
===================================================== */

function getSavedTab(groupName) {

    return localStorage.getItem(
        STORAGE_PREFIX + groupName
    );
}


/* =====================================================
   SAVE TAB
===================================================== */

function saveTab(groupName, tabName) {

    localStorage.setItem(
        STORAGE_PREFIX + groupName,
        tabName
    );
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   BASIC SYNTAX HIGHLIGHTING
===================================================== */

function highlightCode(code, language) {

    let highlighted = escapeHtml(code);


    /* Comments */

    highlighted = highlighted.replace(
        /(\/\/.*|&lt;!--[\s\S]*?--&gt;)/g,
        '<span class="token-comment">$1</span>'
    );


    /* Strings */

    highlighted = highlighted.replace(
        /(".*?"|'.*?'|`.*?`)/g,
        '<span class="token-string">$1</span>'
    );


    /* Keywords */

    highlighted = highlighted.replace(
        /\b(const|let|var|function|return|if|else|new|class|import|from|export|async|await)\b/g,
        '<span class="token-keyword">$1</span>'
    );


    /* Numbers */

    highlighted = highlighted.replace(
        /\b\d+(\.\d+)?\b/g,
        '<span class="token-number">$&</span>'
    );


    /* Function names */

    highlighted = highlighted.replace(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\(/g,
        '<span class="token-function">$1</span>('
    );


    /* HTML tags */

    if (language === "html") {

        highlighted = highlighted.replace(
            /(&lt;\/?)([a-zA-Z0-9-]+)/g,
            '$1<span class="token-tag">$2</span>'
        );
    }


    return highlighted;
}


/* =====================================================
   CREATE LINE NUMBERS
===================================================== */

function createLines(element, highlightedCode) {

    const lines = highlightedCode.split("\n");


    element.innerHTML = lines
        .map((line, index) => {

            return `
                <span
                    class="code-line"
                    data-line="${index + 1}"
                >${line || " "}</span>
            `;

        })
        .join("");
}


/* =====================================================
   DISPLAY CODE
===================================================== */

function displayCode(preElement, tabName) {

    const codeElement = preElement.querySelector("code");

    const rawCode = codeExamples[tabName] || "";


    const highlightedCode = highlightCode(
        rawCode,
        tabName
    );


    if (preElement.hasAttribute("data-line-numbers")) {

        preElement.classList.add("line-numbers");

        createLines(
            codeElement,
            highlightedCode
        );

    } else {

        codeElement.innerHTML = highlightedCode;
    }


    /* Store raw code for copying */

    preElement.dataset.rawCode = rawCode;
}


/* =====================================================
   UPDATE FILE NAME
===================================================== */

function updateFileName(card, tabName) {

    const fileName = card.querySelector(".file-name");

    if (!fileName) {
        return;
    }


    const groupName = card.dataset.group;


    if (groupName === "package-manager") {

        if (tabName === "npm") {
            fileName.textContent = "install.sh";
        }

        if (tabName === "yarn") {
            fileName.textContent = "install.sh";
        }

        if (tabName === "pnpm") {
            fileName.textContent = "install.sh";
        }

    } else {

        if (tabName === "html") {
            fileName.textContent = "index.html";
        }

        if (tabName === "css") {
            fileName.textContent = "style.css";
        }

        if (tabName === "js") {
            fileName.textContent = "script.js";
        }
    }
}


/* =====================================================
   ACTIVATE TAB IN ONE CARD
===================================================== */

function activateTab(card, tabName) {

    const tabs = card.querySelectorAll(".tab");

    const codeBlocks = card.querySelectorAll(".code-block");


    /* Update buttons */

    tabs.forEach((tab) => {

        const isActive =
            tab.dataset.tab === tabName;

        tab.classList.toggle(
            "active",
            isActive
        );
    });


    /* Update code blocks */

    codeBlocks.forEach((block) => {

        const shouldShow =
            block.dataset.code === tabName;

        block.hidden = !shouldShow;


        if (shouldShow) {

            displayCode(
                block,
                tabName
            );
        }
    });


    updateFileName(
        card,
        tabName
    );
}


/* =====================================================
   SYNCHRONIZE ALL GROUPS
===================================================== */

function activateGroup(groupName, tabName) {

    const cards = document.querySelectorAll(
        `.code-card[data-group="${groupName}"]`
    );


    cards.forEach((card) => {

        activateTab(
            card,
            tabName
        );
    });


    saveTab(
        groupName,
        tabName
    );
}


/* =====================================================
   FIND DEFAULT TAB
===================================================== */

function getDefaultTab(card) {

    const activeTab =
        card.querySelector(".tab.active");

    if (activeTab) {
        return activeTab.dataset.tab;
    }


    const firstTab =
        card.querySelector(".tab");

    return firstTab
        ? firstTab.dataset.tab
        : null;
}


/* =====================================================
   INITIALIZE CODE CARDS
===================================================== */

function initializeCards() {

    const cards =
        document.querySelectorAll(".code-card");


    const groups = new Set();


    cards.forEach((card) => {

        groups.add(
            card.dataset.group
        );
    });


    groups.forEach((groupName) => {

        const firstCard =
            document.querySelector(
                `.code-card[data-group="${groupName}"]`
            );


        if (!firstCard) {
            return;
        }


        const firstTab =
            getDefaultTab(firstCard);


        const savedTab =
            getSavedTab(groupName);


        const availableTab =
            document.querySelector(
                `.code-card[data-group="${groupName}"] .tab[data-tab="${savedTab}"]`
            );


        const selectedTab =
            availableTab
                ? savedTab
                : firstTab;


        activateGroup(
            groupName,
            selectedTab
        );
    });
}


/* =====================================================
   TAB CLICK EVENTS
===================================================== */

function setupTabEvents() {

    const tabs =
        document.querySelectorAll(".tab");


    tabs.forEach((tab) => {

        tab.addEventListener(
            "click",
            () => {

                const card =
                    tab.closest(".code-card");


                const groupName =
                    card.dataset.group;


                const tabName =
                    tab.dataset.tab;


                activateGroup(
                    groupName,
                    tabName
                );
            }
        );
    });
}


/* =====================================================
   COPY FALLBACK
===================================================== */

function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");


    textarea.value = text;


    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    let successful = false;


    try {

        successful =
            document.execCommand("copy");

    } catch (error) {

        successful = false;
    }


    document.body.removeChild(
        textarea
    );


    return successful;
}


/* =====================================================
   COPY CODE
===================================================== */

async function copyCode(card, button) {

    const visibleBlock =
        card.querySelector(
            ".code-block:not([hidden])"
        );


    if (!visibleBlock) {
        return;
    }


    const rawCode =
        visibleBlock.dataset.rawCode || "";


    let copied = false;


    /* Modern clipboard API */

    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        try {

            await navigator.clipboard.writeText(
                rawCode
            );

            copied = true;

        } catch (error) {

            copied = false;
        }
    }


    /* Fallback */

    if (!copied) {

        copied =
            fallbackCopy(rawCode);
    }


    if (copied) {

        const originalText =
            button.textContent;


        button.textContent =
            "Copied!";


        button.classList.add(
            "copied"
        );


        setTimeout(() => {

            button.textContent =
                originalText;

            button.classList.remove(
                "copied"
            );

        }, 1500);
    }
}


/* =====================================================
   COPY BUTTON EVENTS
===================================================== */

function setupCopyEvents() {

    const buttons =
        document.querySelectorAll(
            ".copy-button"
        );


    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const card =
                    button.closest(".code-card");


                copyCode(
                    card,
                    button
                );
            }
        );
    });
}


/* =====================================================
   START APPLICATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeCards();

        setupTabEvents();

        setupCopyEvents();
    }
);