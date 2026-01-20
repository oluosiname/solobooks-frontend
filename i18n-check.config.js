module.exports = {
  // Directory containing your translation files
  localesDir: "src/messages",

  // File extension of your translation files
  localesFileExtension: "json",

  // Directory to scan for usage of translation keys
  srcDir: "src",

  // File extensions to scan
  srcFileExtensions: ["ts", "tsx", "js", "jsx"],

  // Translation function names to look for
  translationFunctions: ["t"],

  // Ignore patterns
  ignore: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.config.*",
    "eslint.config.mjs",
    "vitest.config.ts",
    "next.config.ts",
  ],

  // Custom parser for JSON files with nested structure
  parser: {
    parse: (content) => JSON.parse(content),
    flatten: (obj, _prefix = "") => {
      const result = {};

      function flatten(obj, prefix = "") {
        Object.keys(obj).forEach((key) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            flatten(obj[key], fullKey);
          } else {
            result[fullKey] = obj[key];
          }
        });
      }

      flatten(obj);
      return result;
    },
  },
};
