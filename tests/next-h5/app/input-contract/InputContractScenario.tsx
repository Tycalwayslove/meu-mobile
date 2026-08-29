"use client";

import { Button, ConfigProvider, SearchField, TextArea, TextInput } from "@meu/mobile";
import { useRef, useState } from "react";

function readFormData(form: HTMLFormElement) {
  return JSON.stringify(Object.fromEntries(new FormData(form).entries()));
}

export function InputContractScenario() {
  const [ownerMounted, setOwnerMounted] = useState(false);
  const [cancelReset, setCancelReset] = useState(true);
  const [formSnapshot, setFormSnapshot] = useState("尚未提交");
  const [rejectedTextInputCount, setRejectedTextInputCount] = useState(0);
  const [rejectedSearchCount, setRejectedSearchCount] = useState(0);
  const [rejectedAreaCount, setRejectedAreaCount] = useState(0);
  const [textInputLoading, setTextInputLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchStarted, setSearchStarted] = useState(0);
  const [searchAborted, setSearchAborted] = useState(0);
  const [searchCompleted, setSearchCompleted] = useState(0);
  const [lastChangeSource, setLastChangeSource] = useState("none");
  const [lastSearchSource, setLastSearchSource] = useState("none");
  const activeRequestRef = useRef(false);
  const [nativeSubmitCount, setNativeSubmitCount] = useState(0);
  const [pasteInputType, setPasteInputType] = useState("none");
  const [pasteChangeCount, setPasteChangeCount] = useState(0);
  const [narrowArea, setNarrowArea] = useState(false);

  function resetExternalOwner() {
    const form = document.getElementById("late-input-owner");
    if (form instanceof HTMLFormElement) form.reset();
  }

  function finishSearch() {
    if (!activeRequestRef.current) return;
    activeRequestRef.current = false;
    setSearchCompleted((count) => count + 1);
    setSearchLoading(false);
  }

  return (
    <ConfigProvider locale="zh-CN">
      <div className="input-contract-grid" data-hydrated="true">
        <section className="input-contract-card" aria-labelledby="external-owner-title">
          <h2 id="external-owner-title">晚挂载外部表单</h2>
          <p>三个控件先挂载，owner form 随后出现；reset 可被业务取消。</p>
          <TextInput
            aria-label="外部表单姓名"
            clearable
            defaultValue="text-default"
            form="late-input-owner"
            name="name"
          />
          <SearchField
            aria-label="外部表单搜索"
            defaultValue="search-default"
            form="late-input-owner"
            name="query"
          />
          <TextArea
            aria-label="外部表单说明"
            autoSize={{ minRows: 2, maxRows: 5 }}
            defaultValue="area-default"
            form="late-input-owner"
            name="description"
            showCount
          />
          <div className="input-contract-actions">
            <Button type="button" onClick={() => setOwnerMounted(true)}>
              挂载外部表单
            </Button>
            <Button type="button" variant="outline" onClick={resetExternalOwner}>
              重置外部表单
            </Button>
            <Button type="button" variant="outline" onClick={() => setCancelReset(false)}>
              允许下一次重置
            </Button>
          </div>
          {ownerMounted ? (
            <form
              id="late-input-owner"
              aria-label="晚挂载输入表单"
              onReset={(event) => {
                if (cancelReset) event.preventDefault();
              }}
              onSubmit={(event) => {
                event.preventDefault();
                setFormSnapshot(readFormData(event.currentTarget));
              }}
            >
              <Button type="submit">提交外部表单</Button>
            </form>
          ) : null}
          <output data-testid="external-form-data">{formSnapshot}</output>
        </section>

        <section className="input-contract-card" aria-labelledby="controlled-title">
          <h2 id="controlled-title">受控拒绝与 loading 焦点</h2>
          <TextInput
            aria-label="受控拒绝单行输入"
            clearable
            value="text-locked"
            onInput={() => setRejectedTextInputCount((count) => count + 1)}
          />
          <SearchField
            aria-label="受控拒绝搜索"
            value="search-locked"
            onChange={() => setRejectedSearchCount((count) => count + 1)}
          />
          <TextArea
            aria-label="受控拒绝多行输入"
            autoSize
            value="area-locked"
            onChange={() => setRejectedAreaCount((count) => count + 1)}
          />
          <TextInput
            aria-label="loading 焦点输入"
            clearable
            defaultValue="focus-value"
            loading={textInputLoading}
          />
          <Button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              setTextInputLoading(true);
            }}
          >
            开始单行加载
          </Button>
          <output data-testid="controlled-rejections">
            {rejectedTextInputCount}:{rejectedSearchCount}:{rejectedAreaCount}
          </output>
        </section>

        <section className="input-contract-card" aria-labelledby="search-title">
          <h2 id="search-title">搜索请求单一所有权</h2>
          <SearchField
            aria-label="请求搜索"
            defaultValue="orders"
            loading={searchLoading}
            onChange={(_value, details) => {
              setLastChangeSource(details.source);
              if (activeRequestRef.current) {
                activeRequestRef.current = false;
                setSearchAborted((count) => count + 1);
                setSearchLoading(false);
              }
            }}
            onSearch={(_value, details) => {
              activeRequestRef.current = true;
              setLastSearchSource(details.source);
              setSearchStarted((count) => count + 1);
              setSearchLoading(true);
            }}
          />
          <Button type="button" onClick={finishSearch}>
            完成当前搜索
          </Button>
          <output data-testid="search-request-metrics">
            started:{searchStarted};aborted:{searchAborted};completed:{searchCompleted};change:
            {lastChangeSource};search:{lastSearchSource}
          </output>
          <form
            aria-label="原生搜索表单"
            onSubmit={(event) => {
              event.preventDefault();
              setNativeSubmitCount((count) => count + 1);
            }}
          >
            <SearchField aria-label="原生提交搜索" defaultValue="native-query" name="query" />
          </form>
          <output data-testid="native-submit-count">{nativeSubmitCount}</output>
        </section>

        <section className="input-contract-card" aria-labelledby="area-title">
          <h2 id="area-title">粘贴与响应式自动高度</h2>
          <div style={{ width: narrowArea ? 220 : "100%" }}>
            <TextArea
              aria-label="粘贴自动高度说明"
              autoSize
              onChange={() => setPasteChangeCount((count) => count + 1)}
              onInput={(event) => {
                setPasteInputType(event.nativeEvent.inputType || "unknown");
              }}
              showCount
            />
          </div>
          <Button type="button" variant="outline" onClick={() => setNarrowArea(true)}>
            模拟 viewport 收窄
          </Button>
          <output data-testid="paste-metrics">
            inputType:{pasteInputType};changes:{pasteChangeCount}
          </output>
        </section>
      </div>
    </ConfigProvider>
  );
}
