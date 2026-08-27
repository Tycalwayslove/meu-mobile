"use client";

import {
  MeuForm,
  MeuFormCheckbox,
  MeuFormCheckboxGroup,
  MeuFormCascadePicker,
  MeuFormDatePicker,
  MeuFormPicker,
  MeuFormRate,
  MeuFormRadioGroup,
  MeuFormSegmentedControl,
  MeuFormSelector,
  MeuFormSlider,
  MeuFormStepper,
  MeuFormSwitch,
  MeuFormTextArea,
  MeuFormTextInput,
  useMeuForm
} from "@meu/form-react";
import { MeuIconCheck, MeuIconSearch } from "@meu/icons-react";
import {
  ActionMenu,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  Cell,
  Checkbox,
  Collapse,
  ConfigProvider,
  Dialog,
  DialogProvider,
  Ellipsis,
  Empty,
  Image,
  List,
  Mask,
  NavBar,
  PaginationDots,
  Progress,
  Popover,
  Popup,
  Radio,
  Result,
  SearchField,
  SegmentedControl,
  Skeleton,
  Steps,
  TabBar,
  Tabs,
  Tag,
  ToastProvider,
  useDialog,
  useToast
} from "@meu/mobile";
import { useRef, useState } from "react";
import { z } from "zod";

const schema = z.object({
  agreement: z.boolean().refine((value) => value, "请同意服务协议"),
  description: z.string().min(6, "店铺介绍至少输入 6 个字符"),
  deliveryDate: z.date(),
  notifications: z.boolean(),
  region: z.array(z.string()).length(3, "请选择完整配送地区"),
  fulfillment: z.array(z.string()).min(1, "请选择履约方案"),
  appointment: z.array(z.union([z.string(), z.number(), z.null()])).length(2, "请选择完整预约时间"),
  quantity: z.number().min(1).max(5),
  rating: z.number().min(1, "请完成评分"),
  services: z.array(z.string()).min(1, "至少选择一项服务"),
  shipping: z.string().min(1, "请选择配送方式"),
  storeName: z.string().min(2, "店铺名称至少输入 2 个字符"),
  volume: z.number().min(0).max(100),
  viewMode: z.string().min(1, "请选择展示方式")
});

type FormValues = z.infer<typeof schema>;

const displayDescription =
  "Meu Mobile 面向 Next.js 移动网页提供稳定的设计令牌、原生交互语义、图片回退和完整表单集成，同时为后续 uni-app 适配保留清晰边界。";

const regions = [
  {
    label: "浙江省",
    value: "zhejiang",
    children: [
      {
        label: "杭州市",
        value: "hangzhou",
        children: [
          { label: "西湖区", value: "xihu" },
          { label: "滨江区", value: "binjiang" }
        ]
      },
      {
        label: "宁波市",
        value: "ningbo",
        children: [{ label: "海曙区", value: "haishu" }]
      }
    ]
  },
  {
    label: "江苏省",
    value: "jiangsu",
    children: [
      {
        label: "南京市",
        value: "nanjing",
        children: [{ label: "玄武区", value: "xuanwu" }]
      },
      {
        label: "苏州市",
        value: "suzhou",
        children: [{ label: "姑苏区", value: "gusu" }]
      }
    ]
  }
] as const;

function formatLocalDate(value: Date) {
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

function DialogCommandDemo({ onResult }: { onResult: (message: string) => void }) {
  const dialog = useDialog();
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <Button
      ref={triggerRef}
      variant="outline"
      tone="neutral"
      onClick={() => {
        void dialog
          .confirm({
            title: "确认提交订单？",
            description: "确认后订单将进入履约流程。",
            returnFocusRef: triggerRef
          })
          .then((confirmed) => onResult(confirmed ? "命令式确认：已提交" : "命令式确认：已取消"));
      }}
    >
      命令式确认订单
    </Button>
  );
}

function ToastCommandDemo({ onResult }: { onResult: (message: string) => void }) {
  const toast = useToast();
  return (
    <>
      <Button
        variant="outline"
        tone="neutral"
        onClick={() => {
          toast.warning({
            action: {
              label: "撤销调整",
              onPress: () => onResult("Toast 操作：已撤销")
            },
            duration: 0,
            message: "库存不足，已调整购买数量",
            position: "bottom"
          });
          toast.success({ duration: 0, message: "队列中的第二条消息", position: "top" });
        }}
      >
        显示 Toast 队列
      </Button>
      <Button variant="outline" tone="neutral" onClick={toast.clear}>
        清空 Toast
      </Button>
    </>
  );
}

export function ConsumerScenario() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [savedName, setSavedName] = useState("");
  const [savedSettings, setSavedSettings] = useState("");
  const [savedAdvanced, setSavedAdvanced] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedFor, setSearchedFor] = useState("");
  const [selectedEntry, setSelectedEntry] = useState("等待列表操作");
  const [displayAction, setDisplayAction] = useState("等待展示组件操作");
  const [openHelp, setOpenHelp] = useState<readonly string[]>(["delivery"]);
  const [navigationMessage, setNavigationMessage] = useState("等待导航操作");
  const [previewMode, setPreviewMode] = useState<"summary" | "detail">("summary");
  const [previewPage, setPreviewPage] = useState(1);
  const [contentTab, setContentTab] = useState("overview");
  const [primarySection, setPrimarySection] = useState("home");
  const [feedbackProgress, setFeedbackProgress] = useState(64);
  const [feedbackMessage, setFeedbackMessage] = useState("等待反馈组件操作");
  const [popupOpen, setPopupOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("等待浮层操作");
  const popupTriggerRef = useRef<HTMLButtonElement>(null);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const form = useMeuForm<FormValues>({
    schema,
    defaultValues: {
      agreement: true,
      appointment: ["today", 9],
      description: "",
      deliveryDate: new Date(2026, 7, 28),
      fulfillment: ["standard"],
      notifications: true,
      quantity: 1,
      rating: 3,
      region: ["zhejiang", "hangzhou", "xihu"],
      services: ["delivery"],
      shipping: "standard",
      storeName: "",
      volume: 40,
      viewMode: "list"
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

        <section className="integration-navigation" aria-label="导航组件">
          <NavBar
            title="订单中心"
            onBack={() => setNavigationMessage("已触发返回")}
            right={<span>帮助</span>}
          />
          <SegmentedControl
            aria-label="预览内容"
            block
            options={[
              { label: "摘要", value: "summary" },
              { label: "详情", value: "detail" }
            ]}
            value={previewMode}
            onChange={setPreviewMode}
          />
          <Tabs
            aria-label="订单内容"
            value={contentTab}
            onChange={setContentTab}
            items={[
              { key: "overview", label: "概览", content: "订单经营概览" },
              { key: "activity", label: "动态", content: "订单动态", disabled: true },
              { key: "settings", label: "设置", content: "订单设置" }
            ]}
          />
          <Steps
            current={1}
            items={[
              { title: "提交订单", description: "08:30" },
              { title: "商家发货", description: "处理中" },
              { title: "确认收货" }
            ]}
          />
          <div className="integration-pagination">
            <Button
              size="small"
              variant="outline"
              tone="neutral"
              onClick={() => setPreviewPage((current) => Math.max(0, current - 1))}
            >
              上一页
            </Button>
            <PaginationDots count={4} activeIndex={previewPage} variant="line" />
            <Button
              size="small"
              variant="outline"
              tone="neutral"
              onClick={() => setPreviewPage((current) => Math.min(3, current + 1))}
            >
              下一页
            </Button>
          </div>
          <output aria-live="polite">
            {navigationMessage} / {previewMode === "summary" ? "摘要" : "详情"}
          </output>
          <TabBar
            aria-label="底部主导航"
            value={primarySection}
            onChange={setPrimarySection}
            items={[
              { key: "home", label: "首页", icon: <MeuIconCheck size={22} />, href: "#home" },
              { key: "orders", label: "订单", icon: <MeuIconSearch size={22} />, badge: 3 },
              { key: "profile", label: "我的", icon: <MeuIconCheck size={22} />, disabled: true }
            ]}
          />
        </section>

        <div className="integration-list">
          <List header="店铺入口" footer="用于验证原生按钮、链接与列表语义" mode="card">
            <Cell
              title="商品搜索"
              description="按名称或货号查找"
              prefix={<MeuIconSearch size={22} />}
              onClick={() => setSelectedEntry("已打开商品搜索")}
            />
            <Cell title="订单中心" extra="3 个待处理" href="#orders" />
            <Cell
              title="实名认证"
              prefix={<MeuIconCheck size={22} />}
              extra="已完成"
              arrow={false}
            />
            <Cell title="停用店铺" disabled onClick={() => setSelectedEntry("不应触发")} />
          </List>
          <output aria-live="polite">{selectedEntry}</output>
        </div>

        <section className="integration-display" aria-label="信息展示组件">
          <div className="integration-tags">
            <Tag tone="accent" variant="solid">
              新品
            </Tag>
            <Tag tone="success">已上架</Tag>
            <Tag tone="warning" variant="outline">
              库存偏低
            </Tag>
            <Tag tone="danger" rounded onClick={() => setDisplayAction("已筛选待处理商品")}>
              仅看待处理
            </Tag>
          </div>
          <div className="integration-avatars">
            <Badge content={128} max={99} bordered>
              <Avatar src="/demo-avatar.svg" alt="Meu 示例店铺" size="large" />
            </Badge>
            <Badge dot tone="success" label="店铺在线">
              <Avatar src="" alt="林夏" />
            </Badge>
          </div>
          <Image
            src="/demo-media.svg"
            alt="绿色植物与商品包装插画"
            width="100%"
            height={160}
            radius="surface"
            loading="lazy"
          />
          <Ellipsis content={displayDescription} rows={2} />
          <output aria-live="polite">{displayAction}</output>
        </section>

        <section className="integration-containers" aria-label="卡片与折叠内容">
          <Card
            title={<h2>履约摘要</h2>}
            description="使用明确的内容槽位"
            extra={<Tag tone="success">可配送</Tag>}
            footer={
              <Button
                size="small"
                variant="outline"
                tone="neutral"
                onClick={() => setDisplayAction("已查看履约详情")}
              >
                查看详情
              </Button>
            }
          >
            标准配送预计 2 至 3 个工作日送达。
          </Card>
          <Collapse
            aria-label="履约帮助"
            variant="card"
            accordion
            value={openHelp}
            onChange={setOpenHelp}
            items={[
              {
                value: "delivery",
                title: "配送范围",
                content: "支持中国大陆大部分城市配送。",
                extra: "全国"
              },
              {
                value: "returns",
                title: "退换规则",
                content: "签收后 7 天内可申请退换。"
              },
              {
                value: "invoice",
                title: "发票服务",
                content: "暂不支持纸质发票。",
                disabled: true
              }
            ]}
          />
          <output aria-live="polite">
            {openHelp.length ? `已展开：${openHelp.join(",")}` : "全部收起"}
          </output>
        </section>

        <section className="integration-feedback" aria-label="反馈状态组件">
          <div className="integration-progress-demo">
            <Progress label="资料上传" value={feedbackProgress} showValue />
            <Button
              size="small"
              variant="outline"
              tone="neutral"
              onClick={() => setFeedbackProgress((current) => Math.min(100, current + 12))}
            >
              推进上传
            </Button>
          </div>
          <div className="integration-loading" aria-label="订单摘要加载中" aria-busy="true">
            <Skeleton variant="rectangle" height={88} animated />
            <Skeleton lines={3} lineWidths={["100%", "86%", "58%"]} animated />
          </div>
          <Empty
            title="没有待处理订单"
            description="当前筛选条件下没有可处理的订单。"
            action={
              <Button
                size="small"
                variant="outline"
                tone="neutral"
                onClick={() => setFeedbackMessage("已清除订单筛选")}
              >
                清除筛选
              </Button>
            }
          />
          <Result
            status="success"
            title="订单提交成功"
            description="订单编号 MEU-2026-0827 已进入履约流程。"
            actions={
              <Button size="small" onClick={() => setFeedbackMessage("已打开订单详情")}>
                查看订单
              </Button>
            }
          />
          <output aria-live="polite">{feedbackMessage}</output>
        </section>

        <ToastProvider>
          <DialogProvider>
            <section className="integration-overlays" aria-label="浮层基础组件">
              <div className="integration-mask-preview">
                <Mask
                  container={null}
                  lockScroll={false}
                  opacity="thin"
                  style={{ position: "absolute", zIndex: 0 }}
                >
                  <span className="integration-mask-label">Mask 预览</span>
                </Mask>
              </div>
              <Button ref={popupTriggerRef} onClick={() => setPopupOpen(true)}>
                打开配送浮层
              </Button>
              <Button
                ref={sheetTriggerRef}
                tone="neutral"
                variant="outline"
                onClick={() => setSheetOpen(true)}
              >
                打开筛选面板
              </Button>
              <Popover
                aria-label="订单快捷操作"
                open={popoverOpen}
                placement="bottom-end"
                content={
                  <div style={{ display: "grid", gap: 8, minWidth: 176 }}>
                    <strong>订单快捷操作</strong>
                    <span>浮层会自动避开视口边缘。</span>
                    <Button
                      size="small"
                      onClick={() => {
                        setPopoverOpen(false);
                        setOverlayMessage("Popover 操作：已复制订单号");
                      }}
                    >
                      复制订单号
                    </Button>
                  </div>
                }
                onOpenChange={(nextOpen, details) => {
                  setPopoverOpen(nextOpen);
                  if (!nextOpen) setOverlayMessage(`Popover 已关闭：${details.reason}`);
                }}
              >
                <Button tone="neutral" variant="outline">
                  打开订单快捷操作
                </Button>
              </Popover>
              <Button
                ref={dialogTriggerRef}
                tone="danger"
                variant="outline"
                onClick={() => setDialogOpen(true)}
              >
                打开删除确认
              </Button>
              <Button
                ref={actionMenuTriggerRef}
                tone="neutral"
                variant="outline"
                onClick={() => setActionMenuOpen(true)}
              >
                打开订单操作菜单
              </Button>
              <DialogCommandDemo onResult={setOverlayMessage} />
              <ToastCommandDemo onResult={setOverlayMessage} />
              <output aria-live="polite">{overlayMessage}</output>
              <Popup
                aria-label="配送方式"
                open={popupOpen}
                closeOnMaskClick
                showCloseButton
                returnFocusRef={popupTriggerRef}
                onOpenChange={(nextOpen, details) => {
                  setPopupOpen(nextOpen);
                  if (!nextOpen) setOverlayMessage(`浮层已关闭：${details.reason}`);
                }}
              >
                <div className="integration-popup-content">
                  <h2>配送方式</h2>
                  <p>选择适合当前订单的配送方式。</p>
                  <Button
                    onClick={() => {
                      setPopupOpen(false);
                      setOverlayMessage("已确认标准配送");
                    }}
                  >
                    确认标准配送
                  </Button>
                </div>
              </Popup>
              <BottomSheet
                open={sheetOpen}
                title="订单筛选"
                showCloseButton
                snapPoints={[0.35, 0.6, 0.9]}
                returnFocusRef={sheetTriggerRef}
                onOpenChange={(nextOpen, details) => {
                  setSheetOpen(nextOpen);
                  if (!nextOpen) setOverlayMessage(`BottomSheet 已关闭：${details.reason}`);
                }}
              >
                <div className="integration-popup-content">
                  <p>拖动手柄或使用键盘调整可见高度。</p>
                  <Button
                    onClick={() => {
                      setSheetOpen(false);
                      setOverlayMessage("BottomSheet 操作：已应用筛选");
                    }}
                  >
                    应用库存筛选
                  </Button>
                </div>
              </BottomSheet>
              <ActionMenu
                open={actionMenuOpen}
                title="订单操作"
                description="选择一个操作继续"
                returnFocusRef={actionMenuTriggerRef}
                actions={[
                  {
                    key: "copy",
                    label: "复制订单号",
                    description: "MEU-2026-0828",
                    onPress: async () => {
                      await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
                      setOverlayMessage("ActionMenu 操作：已复制订单号");
                    }
                  },
                  { key: "share", label: "分享订单" },
                  {
                    key: "delete",
                    label: "永久删除订单",
                    tone: "danger",
                    confirmation: {
                      title: "删除测试订单？",
                      description: "订单及关联记录将被永久删除，此操作无法撤销。",
                      confirmText: "永久删除"
                    },
                    onPress: () => setOverlayMessage("ActionMenu 操作：已删除订单")
                  }
                ]}
                onOpenChange={(nextOpen, details) => {
                  setActionMenuOpen(nextOpen);
                  if (!nextOpen && details.reason !== "action") {
                    setOverlayMessage(`ActionMenu 已关闭：${details.reason}`);
                  }
                }}
              />
              <Dialog
                open={dialogOpen}
                title="删除测试订单？"
                description="订单及关联记录将被永久删除，此操作无法撤销。"
                returnFocusRef={dialogTriggerRef}
                actions={[
                  { autoFocus: true, key: "cancel", label: "取消" },
                  {
                    key: "delete",
                    label: "永久删除",
                    tone: "danger",
                    onPress: async () => {
                      await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
                      setOverlayMessage("已删除测试订单");
                    }
                  }
                ]}
                onOpenChange={(nextOpen, details) => {
                  setDialogOpen(nextOpen);
                  if (details.reason === "escape") setOverlayMessage("Dialog 已关闭：escape");
                  if (details.reason === "action" && details.actionKey === "cancel") {
                    setOverlayMessage("Dialog 已取消");
                  }
                }}
              />
            </section>
          </DialogProvider>
        </ToastProvider>

        <MeuForm
          className="integration-form"
          form={form}
          onSubmit={(values) => {
            setSavedName(values.storeName);
            setSavedSettings(
              `${values.services.join(",")} / ${values.shipping} / notifications:${values.notifications ? "true" : "false"} / agreement:${values.agreement ? "true" : "false"}`
            );
            setSavedAdvanced(
              `quantity:${values.quantity} / volume:${values.volume} / rating:${values.rating} / picker:${values.appointment.join(",")} / cascade:${values.region.join(",")} / date:${formatLocalDate(values.deliveryDate)} / selector:${values.fulfillment.join(",")} / segmented:${values.viewMode}`
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
          <MeuFormStepper<FormValues> name="quantity" label="购买数量" min={1} max={5} />
          <MeuFormSlider<FormValues>
            name="volume"
            label="提示音量"
            showValue
            formatValue={(value) => `${value}%`}
          />
          <MeuFormRate<FormValues> name="rating" label="服务评分" />
          <MeuFormPicker<FormValues>
            name="appointment"
            label="预约时间"
            description="取消不修改表单，确定后才提交选择。"
            columnLabels={["日期", "时段"]}
            columns={[
              [
                { label: "今天", value: "today" },
                { label: "明天", value: "tomorrow" },
                { label: "后天", value: "after-tomorrow" },
                { label: "周六", value: "saturday" },
                { label: "周日", value: "sunday" }
              ],
              [
                { label: "09:00", value: 9 },
                { label: "10:00", value: 10 },
                { disabled: true, label: "11:00（约满）", value: 11 },
                { label: "12:00", value: 12 },
                { label: "13:00", value: 13 }
              ]
            ]}
            required
            triggerProps={{ placeholder: "选择日期和时段" }}
          />
          <MeuFormCascadePicker<FormValues, string>
            name="region"
            label="配送地区"
            description="父级变化会重建后续路径，确定后才提交选择。"
            columnLabels={["省份", "城市", "区县"]}
            options={regions}
            required
            triggerProps={{ placeholder: "选择省市区" }}
          />
          <MeuFormDatePicker<FormValues>
            name="deliveryDate"
            label="送达日期"
            description="日期边界由 DateAdapter 解析，确定后才提交选择。"
            min={new Date(2026, 7, 1)}
            max={new Date(2026, 8, 30, 23, 59, 59, 999)}
            required
            triggerProps={{ placeholder: "选择送达日期" }}
          />
          <MeuFormSelector<FormValues, string>
            name="fulfillment"
            label="履约方案"
            options={[
              { value: "standard", label: "经济配送" },
              { value: "fast", label: "优先配送" }
            ]}
          />
          <MeuFormSegmentedControl<FormValues, string>
            name="viewMode"
            label="列表布局"
            block
            options={[
              { value: "list", label: "列表" },
              { value: "card", label: "卡片" }
            ]}
          />
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
        <output className="integration-result" aria-live="polite">
          {savedAdvanced ? `已保存录入：${savedAdvanced}` : "等待录入提交"}
        </output>
      </section>
    </ConfigProvider>
  );
}
