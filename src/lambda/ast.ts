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
