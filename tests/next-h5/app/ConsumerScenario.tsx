"use client";

import {
  MeuForm,
  MeuFormCheckbox,
  MeuFormCheckboxGroup,
  MeuFormRadioGroup,
  MeuFormSwitch,
  MeuFormTextArea,
  MeuFormTextInput,
  useMeuForm
} from "@meu/form-react";
import { MeuIconCheck } from "@meu/icons-react";
import { Button, Checkbox, ConfigProvider, Radio, SearchField } from "@meu/mobile";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  agreement: z.boolean().refine((value) => value, "请同意服务协议"),
  description: z.string().min(6, "店铺介绍至少输入 6 个字符"),
  notifications: z.boolean(),
  services: z.array(z.string()).min(1, "至少选择一项服务"),
  shipping: z.string().min(1, "请选择配送方式"),
  storeName: z.string().min(2, "店铺名称至少输入 2 个字符")
});

type FormValues = z.infer<typeof schema>;

export function ConsumerScenario() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [savedName, setSavedName] = useState("");
  const [savedSettings, setSavedSettings] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedFor, setSearchedFor] = useState("");
  const form = useMeuForm<FormValues>({
    schema,
    defaultValues: {
      agreement: true,
      description: "",
      notifications: true,
      services: ["delivery"],
      shipping: "standard",
      storeName: ""
    },
    mode: "onSubmit"
  });

  return (
    <ConfigProvider theme={theme}>
      <section className="integration-card" aria-label="组件消费场景">
        <div className="integration-toolbar">
          <p>当前主题：{theme === "light" ? "浅色" : "深色"}</p>
          <Button
            variant="outline"
            tone="neutral"
            size="small"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          >
            切换主题
          </Button>
        </div>

        <div className="integration-search">
          <SearchField
            aria-label="搜索组件"
            placeholder="搜索 Meu 组件"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setSearchedFor}
          />
          <output aria-live="polite">
            {searchedFor ? `正在搜索：${searchedFor}` : "等待搜索"}
          </output>
        </div>

        <MeuForm
          className="integration-form"
          form={form}
          onSubmit={(values) => {
            setSavedName(values.storeName);
            setSavedSettings(
              `${values.services.join(",")} / ${values.shipping} / notifications:${values.notifications ? "true" : "false"} / agreement:${values.agreement ? "true" : "false"}`
            );
          }}
        >
          <MeuFormTextInput<FormValues>
            name="storeName"
            label="店铺名称"
            description="用于验证受控字段、Zod 校验、清除按钮和错误关联。"
            placeholder="例如：喵呜体验店"
            autoComplete="organization"
            clearable
            required
          />
          <MeuFormTextArea<FormValues>
            name="description"
            label="店铺介绍"
            description="用于验证多行输入、计数、自动高度和表单错误关联。"
            placeholder="请简要介绍店铺特色"
            autoSize={{ minRows: 3, maxRows: 5 }}
            maxLength={120}
            showCount
            required
          />
          <MeuFormCheckboxGroup<FormValues, string>
            name="services"
            label="服务范围"
            direction="horizontal"
            required
          >
            <Checkbox value="delivery">配送</Checkbox>
            <Checkbox value="pickup">到店自提</Checkbox>
          </MeuFormCheckboxGroup>
          <MeuFormRadioGroup<FormValues, string>
            name="shipping"
            label="配送方式"
            direction="horizontal"
            required
          >
            <Radio value="standard">标准配送</Radio>
            <Radio value="express">急速配送</Radio>
          </MeuFormRadioGroup>
          <MeuFormSwitch<FormValues> name="notifications" label="消息通知" />
          <MeuFormCheckbox<FormValues> name="agreement">同意服务协议</MeuFormCheckbox>
          <Button type="submit" block leadingIcon={<MeuIconCheck size={18} />}>
            保存店铺
          </Button>
        </MeuForm>

        <output className="integration-result" aria-live="polite">
          {savedName ? `已保存：${savedName}` : "等待提交"}
        </output>
        <output className="integration-result" aria-live="polite">
          {savedSettings ? `已保存设置：${savedSettings}` : "等待设置提交"}
        </output>
      </section>
    </ConfigProvider>
  );
}
