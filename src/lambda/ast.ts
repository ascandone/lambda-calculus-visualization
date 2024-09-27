export type AliasDefinition = {
  name: string;
  value: LambdaExpr;
};
export type Program = {
  aliases: AliasDefinition[];
  expr: LambdaExpr;
};

export type LambdaExpr =
  | {
      type: "var";
      name: string;
    }
  | {
      type: "appl";
      f: LambdaExpr;
      x: LambdaExpr;
    }
  | {
      type: "lambda";
      binding: string;
      body: LambdaExpr;
    };
