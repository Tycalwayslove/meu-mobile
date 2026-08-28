"use client";

import { MeuIconCheck, MeuIconSearch } from "@meu/icons-react";
import { Cell, List } from "@meu/mobile";
import { useState } from "react";

export function InformationDemo({ focus }: { focus?: "cell" | "list" } = {}) {
  const [lastAction, setLastAction] = useState("尚未操作");

  const cells = (
    <>
      <Cell
        title="搜索商品"
        description="按名称或货号查找"
        prefix={<MeuIconSearch size={22} />}
        onClick={() => setLastAction("打开商品搜索")}
      />
      <Cell title="订单中心" extra="3 个待处理" href="#orders" />
      <Cell title="实名认证" prefix={<MeuIconCheck size={22} />} extra="已完成" arrow={false} />
      <Cell title="停用店铺" disabled onClick={() => setLastAction("停用店铺")} />
    </>
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {focus === "cell" ? (
        <List aria-label="店铺入口" divider="none">
          {cells}
        </List>
      ) : (
        <List header="店铺入口" footer="信息行不会接管路由或业务数据" mode="card">
          {cells}
        </List>
      )}
      <output aria-live="polite">{lastAction}</output>
    </div>
  );
}
