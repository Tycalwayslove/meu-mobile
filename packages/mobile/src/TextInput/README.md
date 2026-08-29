# TextInput

完整 V2 行为、事件、表单边界、兼容性与验证证据见
[`TextInput.docs.mdx`](./TextInput.docs.mdx)。

- 使用真实 native input；`value/onChange` 与 `defaultValue` 保持 React 原生受控/非受控语义。
- 非受控值支持祖先/外部 form reset，包括外部 owner 晚挂载或替换；受控 reset 保持最新 value；disabled/readOnly 遵循原生 FormData。
- clear 只在非空可编辑值时出现，通过 input event 请求空值，并恢复 input focus/selection。
- loading 只表达调用方异步工作，不禁用编辑、不阻止 form submit，也不拥有或取消请求。
- IME、autofill、password、inputMode、autoComplete 与 enterKeyHint 保持原生平台所有权。
- 嵌套于 Field 布局 wrapper 时继承 label 与原生 required；clear/reset 使用 input 自身 Document realm。
- 所有尺寸的输入字号至少 16 px，避免 iOS Safari/WKWebView 聚焦时自动缩放页面。
