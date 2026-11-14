<!-- Generated from executable packs; do not edit. -->
# Test-to-capability index

Mapped cases are implemented coverage, not model qualification. Evidence retains its actual run date/configuration; missing evidence means unmeasured.

| Pack / case | Area | Capabilities | Layer / split | Critical / costly | Grader / requirements | Evidence |
|---|---|---|---|---|---|---|
| [neutral-smoke@1.1.0 / exact-json](../examples/smoke-v1.json) | general-assistant | structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / change-mind](../examples/smoke-v1.json) | general-assistant | intent-resolution, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / conflicting-request](../examples/smoke-v1.json) | general-assistant | approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / language-italian](../examples/smoke-v1.json) | general-assistant | language-control, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / tool-choice](../examples/smoke-v1.json) | general-assistant | tool-selection, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / missing-input](../examples/smoke-v1.json) | general-assistant | clarification, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / holdout-change](../examples/smoke-v1.json) | general-assistant | intent-resolution, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / holdout-approval](../examples/smoke-v1.json) | general-assistant | approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / holdout-tool](../examples/smoke-v1.json) | general-assistant | tool-selection, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [neutral-smoke@1.1.0 / holdout-language](../examples/smoke-v1.json) | general-assistant | language-control, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / paraphrase-r1](../examples/general-assistant-expanded-v1.json) | general-assistant | language-control, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / paraphrase-r2](../examples/general-assistant-expanded-v1.json) | general-assistant | language-control, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / paraphrase-h1](../examples/general-assistant-expanded-v1.json) | general-assistant | language-control, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / paraphrase-h2](../examples/general-assistant-expanded-v1.json) | general-assistant | language-control, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / ambiguity-r1](../examples/general-assistant-expanded-v1.json) | general-assistant | clarification, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / ambiguity-r2](../examples/general-assistant-expanded-v1.json) | general-assistant | clarification, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / ambiguity-h1](../examples/general-assistant-expanded-v1.json) | general-assistant | clarification, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / ambiguity-h2](../examples/general-assistant-expanded-v1.json) | general-assistant | clarification, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / correction-r1](../examples/general-assistant-expanded-v1.json) | general-assistant | intent-resolution, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / correction-r2](../examples/general-assistant-expanded-v1.json) | general-assistant | intent-resolution, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / correction-h1](../examples/general-assistant-expanded-v1.json) | general-assistant | intent-resolution, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / correction-h2](../examples/general-assistant-expanded-v1.json) | general-assistant | intent-resolution, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / invalid-tool-args-r1](../examples/general-assistant-expanded-v1.json) | general-assistant | tool-selection, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / invalid-tool-args-r2](../examples/general-assistant-expanded-v1.json) | general-assistant | tool-selection, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / invalid-tool-args-h1](../examples/general-assistant-expanded-v1.json) | general-assistant | tool-selection, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / invalid-tool-args-h2](../examples/general-assistant-expanded-v1.json) | general-assistant | tool-selection, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / refusal-r1](../examples/general-assistant-expanded-v1.json) | general-assistant | approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / refusal-r2](../examples/general-assistant-expanded-v1.json) | general-assistant | approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / refusal-h1](../examples/general-assistant-expanded-v1.json) | general-assistant | approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / refusal-h2](../examples/general-assistant-expanded-v1.json) | general-assistant | approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / prompt-injection-r1](../examples/general-assistant-expanded-v1.json) | general-assistant | approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / prompt-injection-r2](../examples/general-assistant-expanded-v1.json) | general-assistant | approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / prompt-injection-h1](../examples/general-assistant-expanded-v1.json) | general-assistant | approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / prompt-injection-h2](../examples/general-assistant-expanded-v1.json) | general-assistant | approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / combined-r1](../examples/general-assistant-expanded-v1.json) | general-assistant | intent-resolution, clarification, approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / combined-r2](../examples/general-assistant-expanded-v1.json) | general-assistant | intent-resolution, clarification, approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / combined-h1](../examples/general-assistant-expanded-v1.json) | general-assistant | intent-resolution, clarification, approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [general-assistant-expanded@1.0.0 / combined-h2](../examples/general-assistant-expanded-v1.json) | general-assistant | intent-resolution, clarification, approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [structured-output-robustness@1.0.0 / change-mind-regression](../examples/structured-output-robustness-v1.json) | general-assistant | intent-resolution, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [structured-output-robustness@1.0.0 / change-mind-holdout](../examples/structured-output-robustness-v1.json) | general-assistant | intent-resolution, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [structured-output-robustness@1.0.0 / tool-choice-regression](../examples/structured-output-robustness-v1.json) | tools | tool-selection, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [structured-output-robustness@1.0.0 / tool-choice-holdout](../examples/structured-output-robustness-v1.json) | tools | tool-selection, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [structured-output-robustness@1.0.0 / missing-input-regression](../examples/structured-output-robustness-v1.json) | general-assistant | clarification, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [structured-output-robustness@1.0.0 / missing-input-holdout](../examples/structured-output-robustness-v1.json) | general-assistant | clarification, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |

## Area coverage

- unclassified: 0 mapped cases
- general-assistant: 42 mapped cases
- coding: 0 mapped cases
- code-review: 0 mapped cases
- math: 0 mapped cases
- logic-planning: 0 mapped cases
- cad-3d: 0 mapped cases
- backlog-management: 0 mapped cases
- estimation: 0 mapped cases
- ci-operations: 0 mapped cases
- research: 0 mapped cases
- tools: 2 mapped cases
- conversation-memory: 0 mapped cases
- distributed-coordination: 0 mapped cases
- ui-visual: 0 mapped cases
- security-permissions: 0 mapped cases
- documents-data: 0 mapped cases
- language-translation: 0 mapped cases
- audio-video: 0 mapped cases
- scheduling-time: 0 mapped cases
