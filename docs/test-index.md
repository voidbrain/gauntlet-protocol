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
| [tool-use@1.0.0 / choose-tool-regression](../examples/tool-use-v1.json) | tools | tool-selection, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [tool-use@1.0.0 / unknown-tool-regression](../examples/tool-use-v1.json) | tools | tool-selection, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [tool-use@1.0.0 / arguments-regression](../examples/tool-use-v1.json) | tools | tool-selection, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [tool-use@1.0.0 / choose-tool-holdout](../examples/tool-use-v1.json) | tools | tool-selection, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [tool-use@1.0.0 / unknown-tool-holdout](../examples/tool-use-v1.json) | tools | tool-selection, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [tool-use@1.0.0 / arguments-holdout](../examples/tool-use-v1.json) | tools | tool-selection, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [bilingual-it-en@1.0.0 / summarize-en-regression](../examples/bilingual-it-en-v1.json) | language-translation | language-control, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [bilingual-it-en@1.0.0 / summarize-it-regression](../examples/bilingual-it-en-v1.json) | language-translation | language-control, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [bilingual-it-en@1.0.0 / clarify-en-holdout](../examples/bilingual-it-en-v1.json) | language-translation | language-control, clarification, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [bilingual-it-en@1.0.0 / clarify-it-holdout](../examples/bilingual-it-en-v1.json) | language-translation | language-control, clarification, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [multi-step-agent@1.0.0 / inspect-then-update-regression](../examples/multi-step-agent-v1.json) | tools | tool-selection, multi-step-agent | end-to-end / regression | true / false | registered:scripted-agent / scripted-environment, step-limit-4 | Unmeasured |
| [multi-step-agent@1.0.0 / recover-observation-regression](../examples/multi-step-agent-v1.json) | tools | tool-selection, multi-step-agent | end-to-end / regression | true / false | registered:scripted-agent / scripted-environment, step-limit-4 | Unmeasured |
| [multi-step-agent@1.0.0 / inspect-then-update-holdout](../examples/multi-step-agent-v1.json) | tools | tool-selection, multi-step-agent | end-to-end / holdout | true / false | registered:scripted-agent / scripted-environment, step-limit-4 | Unmeasured |
| [multi-step-agent@1.0.0 / stop-at-limit-holdout](../examples/multi-step-agent-v1.json) | tools | tool-selection, multi-step-agent | end-to-end / holdout | true / false | registered:scripted-agent / scripted-environment, step-limit-4 | Unmeasured |
| [refusal-permission@1.0.0 / permission-escalation-regression](../examples/refusal-permission-v1.json) | security-permissions | approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [refusal-permission@1.0.0 / tool-injection-regression](../examples/refusal-permission-v1.json) | security-permissions | approval-boundaries, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [refusal-permission@1.0.0 / permission-escalation-holdout](../examples/refusal-permission-v1.json) | security-permissions | approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [refusal-permission@1.0.0 / tool-injection-holdout](../examples/refusal-permission-v1.json) | security-permissions | approval-boundaries, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [long-context@1.0.0 / fact-near-start-regression](../examples/long-context-v1.json) | documents-data | context-retrieval, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime, context-32768 | Unmeasured |
| [long-context@1.0.0 / fact-near-middle-regression](../examples/long-context-v1.json) | documents-data | context-retrieval, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime, context-32768 | Unmeasured |
| [long-context@1.0.0 / fact-after-quarter-holdout](../examples/long-context-v1.json) | documents-data | context-retrieval, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime, context-32768 | Unmeasured |
| [long-context@1.0.0 / fact-near-end-holdout](../examples/long-context-v1.json) | documents-data | context-retrieval, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime, context-32768 | Unmeasured |
| [coding@1.0.0 / parse-duration-regression](../examples/coding-v1.json) | coding | code-generation, python | coding / regression | true / false | registered:coding-reference / coding-sandbox, python3 | Unmeasured |
| [coding@1.0.0 / slugify-regression](../examples/coding-v1.json) | coding | code-generation, typescript | coding / regression | true / false | registered:coding-reference / coding-sandbox, node-24 | Unmeasured |
| [coding@1.0.0 / merge-intervals-holdout](../examples/coding-v1.json) | coding | code-generation, python | coding / holdout | true / false | registered:coding-reference / coding-sandbox, python3 | Unmeasured |
| [coding@1.0.0 / dependency-order-holdout](../examples/coding-v1.json) | coding | code-generation, typescript | coding / holdout | true / false | registered:coding-reference / coding-sandbox, node-24 | Unmeasured |
| [logic-math@1.0.0 / jars-total-regression](../examples/logic-math-v1.json) | math | arithmetic, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [logic-math@1.0.0 / price-change-regression](../examples/logic-math-v1.json) | math | arithmetic, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [logic-math@1.0.0 / multiples-sum-holdout](../examples/logic-math-v1.json) | math | arithmetic, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [logic-math@1.0.0 / fraction-sum-holdout](../examples/logic-math-v1.json) | math | arithmetic, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [logic-math@1.0.0 / race-order-regression](../examples/logic-math-v1.json) | logic-planning | logic-reasoning, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [logic-math@1.0.0 / task-schedule-regression](../examples/logic-math-v1.json) | logic-planning | planning, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [logic-math@1.0.0 / digit-swap-holdout](../examples/logic-math-v1.json) | logic-planning | logic-reasoning, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [logic-math@1.0.0 / key-box-holdout](../examples/logic-math-v1.json) | logic-planning | logic-reasoning, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [embedded@1.0.0 / blink-millis-esp32-regression](../examples/embedded-v1.json) | embedded | code-generation, embedded-cpp, esp32 | coding / regression | true / true | registered:embedded-reference / arduino-cli | Unmeasured |
| [embedded@1.0.0 / debounce-toggle-uno-regression](../examples/embedded-v1.json) | embedded | code-generation, embedded-cpp, arduino-avr | coding / regression | true / true | registered:embedded-reference / arduino-cli | Unmeasured |
| [embedded@1.0.0 / pwm-fade-esp32-holdout](../examples/embedded-v1.json) | embedded | code-generation, embedded-cpp, esp32 | coding / holdout | true / true | registered:embedded-reference / arduino-cli | Unmeasured |
| [embedded@1.0.0 / serial-command-uno-holdout](../examples/embedded-v1.json) | embedded | code-generation, embedded-cpp, arduino-avr | coding / holdout | true / true | registered:embedded-reference / arduino-cli | Unmeasured |
| [embedded@1.0.0 / led-blink-gpiozero-regression](../examples/embedded-v1.json) | embedded | code-generation, python, raspberry-pi | coding / regression | true / false | registered:embedded-reference / python3 | Unmeasured |
| [embedded@1.0.0 / pwm-servo-rpigpio-regression](../examples/embedded-v1.json) | embedded | code-generation, python, raspberry-pi | coding / regression | true / false | registered:embedded-reference / python3 | Unmeasured |
| [embedded@1.0.0 / button-toggle-gpiozero-holdout](../examples/embedded-v1.json) | embedded | code-generation, python, raspberry-pi | coding / holdout | true / false | registered:embedded-reference / python3 | Unmeasured |
| [embedded@1.0.0 / edge-counter-rpigpio-holdout](../examples/embedded-v1.json) | embedded | code-generation, python, raspberry-pi | coding / holdout | true / false | registered:embedded-reference / python3 | Unmeasured |
| [cad-3d@1.0.0 / slicer-wall-layers-regression](../examples/cad-3d-v1.json) | cad-3d | slicing-parameters, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [cad-3d@1.0.0 / slicer-flow-limit-holdout](../examples/cad-3d-v1.json) | cad-3d | slicing-parameters, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [cad-3d@1.0.0 / material-outdoor-bracket-regression](../examples/cad-3d-v1.json) | cad-3d | printing-materials, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [cad-3d@1.0.0 / material-damp-isolation-holdout](../examples/cad-3d-v1.json) | cad-3d | printing-materials, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [cad-3d@1.0.0 / tolerance-clearance-pin-regression](../examples/cad-3d-v1.json) | cad-3d | dimensional-tolerances, structured-output | model / regression | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [cad-3d@1.0.0 / tolerance-shrinkage-compensation-holdout](../examples/cad-3d-v1.json) | cad-3d | dimensional-tolerances, structured-output | model / holdout | true / false | exact-json-v1 / local-model-runtime | Unmeasured |
| [italian-quality@1.0.0 / summary-service-regression](../examples/italian-quality-v1.json) | language-translation | italian-quality, summarization | model / regression | true / false | rubric-v1 / local-model-runtime | Unmeasured |
| [italian-quality@1.0.0 / summary-report-holdout](../examples/italian-quality-v1.json) | language-translation | italian-quality, summarization | model / holdout | true / false | rubric-v1 / local-model-runtime | Unmeasured |
| [italian-quality@1.0.0 / rewrite-anglicisms-regression](../examples/italian-quality-v1.json) | language-translation | italian-quality, rewriting | model / regression | true / false | rubric-v1 / local-model-runtime | Unmeasured |
| [italian-quality@1.0.0 / rewrite-bureaucratic-holdout](../examples/italian-quality-v1.json) | language-translation | italian-quality, rewriting | model / holdout | true / false | rubric-v1 / local-model-runtime | Unmeasured |
| [italian-quality@1.0.0 / register-formal-regression](../examples/italian-quality-v1.json) | language-translation | italian-quality, register-control | model / regression | true / false | rubric-v1 / local-model-runtime | Unmeasured |
| [italian-quality@1.0.0 / register-informal-holdout](../examples/italian-quality-v1.json) | language-translation | italian-quality, register-control | model / holdout | true / false | rubric-v1 / local-model-runtime | Unmeasured |
| [code-review@1.0.0 / sql-and-bounds-regression](../examples/code-review-v1.json) | code-review | defect-detection, security-review, structured-output | model / regression | true / false | defects-v1 / local-model-runtime | Unmeasured |
| [code-review@1.0.0 / race-and-leak-regression](../examples/code-review-v1.json) | code-review | defect-detection, concurrency-review, structured-output | model / regression | true / false | defects-v1 / local-model-runtime | Unmeasured |
| [code-review@1.0.0 / path-and-nan-regression](../examples/code-review-v1.json) | code-review | defect-detection, security-review, structured-output | model / regression | true / false | defects-v1 / local-model-runtime | Unmeasured |
| [code-review@1.0.0 / command-and-retry-holdout](../examples/code-review-v1.json) | code-review | defect-detection, security-review, structured-output | model / holdout | true / false | defects-v1 / local-model-runtime | Unmeasured |
| [code-review@1.0.0 / listener-and-mutation-holdout](../examples/code-review-v1.json) | code-review | defect-detection, concurrency-review, structured-output | model / holdout | true / false | defects-v1 / local-model-runtime | Unmeasured |
| [code-review@1.0.0 / token-and-cache-holdout](../examples/code-review-v1.json) | code-review | defect-detection, security-review, concurrency-review, structured-output | model / holdout | true / false | defects-v1 / local-model-runtime | Unmeasured |

## Area coverage

- unclassified: 0 mapped cases
- general-assistant: 42 mapped cases
- coding: 4 mapped cases
- embedded: 8 mapped cases
- code-review: 6 mapped cases
- math: 4 mapped cases
- logic-planning: 4 mapped cases
- cad-3d: 6 mapped cases
- backlog-management: 0 mapped cases
- estimation: 0 mapped cases
- ci-operations: 0 mapped cases
- research: 0 mapped cases
- tools: 12 mapped cases
- conversation-memory: 0 mapped cases
- distributed-coordination: 0 mapped cases
- ui-visual: 0 mapped cases
- security-permissions: 4 mapped cases
- documents-data: 4 mapped cases
- language-translation: 10 mapped cases
- audio-video: 0 mapped cases
- scheduling-time: 0 mapped cases
