"use client";

import { Button, Field, Radio, Slider, Switch } from "@meu/mobile";
import { useState } from "react";

export function ControlHardeningScenario() {
  const [blockedClickCount, setBlockedClickCount] = useState(0);
  const [radioChangeCount, setRadioChangeCount] = useState(0);
  const [submittedValues, setSubmittedValues] = useState("等待基础控件提交");

  return (
    <section className="integration-section" aria-label="基础控件边界验证">
      <form
        className="integration-form"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setSubmittedValues(
            ["busySwitch", "standaloneRadio", "readonlyVolume"]
              .map((name) => {
                const submittedValue = formData.get(name);
                return `${name}:${
                  typeof submittedValue === "string"
                    ? submittedValue
                    : submittedValue
                      ? submittedValue.name
                      : "null"
                }`;
              })
              .join(" / ")
          );
        }}
      >
        <Button loading onClick={() => setBlockedClickCount((currentCount) => currentCount + 1)}>
          正在保存
        </Button>
        <Switch
          aria-label="保存中的通知"
          defaultChecked
          loading
          name="busySwitch"
          onClick={() => setBlockedClickCount((currentCount) => currentCount + 1)}
        />
        <output aria-live="polite">被阻止点击次数：{blockedClickCount}</output>

        <fieldset>
          <legend>独立配送 Radio</legend>
          <Radio defaultChecked name="standaloneRadio" value="economy">
            经济配送（独立）
          </Radio>
          <Radio
            name="standaloneRadio"
            value="priority"
            onChange={() => setRadioChangeCount((currentCount) => currentCount + 1)}
          >
            优先配送（独立）
          </Radio>
        </fieldset>
        <output aria-live="polite">独立 Radio 变化次数：{radioChangeCount}</output>

        <p id="readonly-volume-external">外部只读音量说明</p>
        <Field label="只读音量" description="值可提交，但用户不能修改。">
          <Slider
            aria-describedby="readonly-volume-external"
            defaultValue={40}
            name="readonlyVolume"
            readOnly
            showValue
          />
        </Field>

        <Button type="submit" variant="outline" tone="neutral">
          检查基础控件提交值
        </Button>
      </form>
      <output className="integration-result" aria-live="polite">
        {submittedValues}
      </output>
    </section>
  );
}
