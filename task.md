PS C:\Users\AYUSH\Downloads\BrowserOS-Kernel> npm run dev

> Error64 Os@0.0.0 dev
> vite


  VITE v7.3.2  ready in 324 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.56.1:5173/
  ➜  Network: http://192.168.43.227:5173/
  ➜  press h + enter to show help
10:36:01 AM [vite] Internal server error: C:\Users\AYUSH\Downloads\BrowserOS-Kernel\src\apps\Minecraft.tsx: Missing semicolon. (60:48)

  58 |           };
  59 |         }
> 60 |         let container = document.querySelector(`#${window.eaglercraftXOpts.container}`);
     |                                                 ^
  61 |         if (!container) {
  62 |           console.error("Container element not found.");
  63 |           container = document.createElement("div");
  Plugin: vite:react-babel
  File: C:/Users/AYUSH/Downloads/BrowserOS-Kernel/src/apps/Minecraft.tsx:60:48
  58 |            };
  59 |          }
  60 |          let container = document.querySelector(`#${window.eaglercraftXOpts.container}`);
     |                                                  ^
  61 |          if (!container) {
  62 |            console.error("Container element not found.");
      at constructor (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:365:19)
      at TypeScriptParserMixin.raise (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:6599:19)
      at TypeScriptParserMixin.semicolon (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:6895:10)
      at TypeScriptParserMixin.parseExpressionStatement (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:13285:10)
      at TypeScriptParserMixin.parseStatementContent (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12899:19)
      at TypeScriptParserMixin.parseStatementContent (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:9508:18)
      at TypeScriptParserMixin.parseStatementLike (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12767:17)
      at TypeScriptParserMixin.parseStatementListItem (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12747:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:13316:61)
      at TypeScriptParserMixin.parseBlockBody (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:13309:10)
      at TypeScriptParserMixin.parseBlock (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:13297:10)
      at TypeScriptParserMixin.parseFunctionBody (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12100:24)
      at TypeScriptParserMixin.parseArrowExpression (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12075:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11687:12)
      at TypeScriptParserMixin.parseExprAtom (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11331:23)
      at TypeScriptParserMixin.parseExprAtom (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:4764:20)
      at TypeScriptParserMixin.parseExprSubscripts (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11081:23)
      at TypeScriptParserMixin.parseUpdate (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11066:21)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11046:23)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:9837:18)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10899:61)
      at TypeScriptParserMixin.parseExprOps (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10904:23)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10881:23)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10831:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:9786:20)
      at C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10800:39
      at TypeScriptParserMixin.allowInAnd (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12426:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10800:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12493:17)
      at TypeScriptParserMixin.parseExprListItem (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12175:18)
      at TypeScriptParserMixin.parseCallExpressionArguments (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11252:22)
      at TypeScriptParserMixin.parseCoverCallAndAsyncArrowHead (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11186:29)
      at TypeScriptParserMixin.parseSubscript (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11120:19)
      at TypeScriptParserMixin.parseSubscript (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:9272:18)
      at TypeScriptParserMixin.parseSubscripts (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11094:19)
      at TypeScriptParserMixin.parseExprSubscripts (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11085:17)
      at TypeScriptParserMixin.parseUpdate (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11066:21)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:11046:23)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:9837:18)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10899:61)
      at TypeScriptParserMixin.parseExprOps (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10904:23)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10881:23)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10831:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:9786:20)
      at TypeScriptParserMixin.parseExpressionBase (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10784:23)
      at C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10780:39
      at TypeScriptParserMixin.allowInAnd (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12421:16)
      at TypeScriptParserMixin.parseExpression (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:10780:17)
      at TypeScriptParserMixin.parseStatementContent (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:12895:23)
      at TypeScriptParserMixin.parseStatementContent (C:\Users\AYUSH\Downloads\BrowserOS-Kernel\node_modules\.pnpm\@babel+parser@7.29.0\node_modules\@babel\parser\lib\index.js:9508:18)cleaec;ea