const shiki = require("shiki");
const visit = require("unist-util-visit");
const {
  commonLangIds,
  commonLangAliases,
  otherLangIds,
} = require("shiki-languages");
const hastToString = require("hast-util-to-string");
const u = require("unist-builder");

const languages = [...commonLangIds, ...commonLangAliases, ...otherLangIds];

module.exports = attacher;

function attacher(options) {
  let settings = options || {};
  let theme = settings.theme || "monokai";
  let style = settings.style || "";
  let shikiTheme;
  let highlighter;

  try {
    shikiTheme = shiki.getTheme(theme);
  } catch (_) {
    try {
      shikiTheme = shiki.loadTheme(theme);
    } catch (_) {
      throw new Error("Unable to load theme: " + theme);
    }
  }

  return transformer;

  async function transformer(tree) {
    highlighter = await shiki.getHighlighter({
      theme: shikiTheme,
      langs: languages,
    });
    visit(tree, "element", visitor);
  }

  function visitor(node, index, parent) {
    if (!parent || parent.tagName !== "pre" || node.tagName !== "code") {
      return;
    }

    addStyle(parent, `background: ${shikiTheme.bg};${style}`);

    const lang = codeLanguage(node) || "js";

    if (!lang) {
      // Unknown language, fall back to a foreground colour
      addStyle(node, "color: " + shikiTheme.settings.foreground);
      return;
    }

    const tokens = highlighter.codeToThemedTokens(hastToString(node), lang);
    const tree = tokensToHast(tokens);

    node.children = tree;
  }
}

function tokensToHast(lines) {
  let tree = [];

  for (const line of lines) {
    if (line.length === 0) {
      tree.push(u("text", "\n"));
    } else {
      for (const token of line) {
        tree.push(
          u(
            "element",
            {
              tagName: "span",
              properties: { style: "color: " + token.color },
            },
            [u("text", token.content)]
          )
        );
      }

      tree.push(u("text", "\n"));
    }
  }

  // Remove the last \n
  tree.pop();

  return tree;
}

function addStyle(node, style) {
  let props = node.properties || {};
  props.style = `${props.style || ""}${style}`;
  node.properties = props;
}

function codeLanguage(node) {
  const className = node.properties.className || [];
  let value;

  for (const element of className) {
    value = element;

    if (value.slice(0, 9) === "language-") {
      return value.slice(9);
    }
  }

  return null;
}
