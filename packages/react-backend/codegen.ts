import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:3001/graphql",
  generates: {
    "./src/types.ts": {
      plugins: ["typescript"],
    },
  },
};
export default config;
