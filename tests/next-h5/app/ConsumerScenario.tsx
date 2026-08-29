"use client";

import {
  MeuForm,
  MeuFormCalendar,
  MeuFormCheckbox,
  MeuFormCheckboxGroup,
  MeuFormCascadePicker,
  MeuFormDatePicker,
  MeuFormDateRangePicker,
  MeuFormImageUploader,
  MeuFormNumberKeyboard,
  MeuFormPasscodeInput,
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
  MeuFormTimePicker,
  MeuFormTreeSelect,
  useMeuForm
} from "@meu/form-react";
import { applyMeuFormErrors } from "@meu/form-react/server";
import { MeuIconCheck, MeuIconSearch } from "@meu/icons-react";
import {
  ActionMenu,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  Carousel,
  Cell,
  Checkbox,
  Collapse,
  ConfigProvider,
  Dialog,
  DialogProvider,
  Divider,
  Ellipsis,
  Empty,
  FloatingPanel,
  Image,
  ImageViewer,
  IconButton,
  IndexList,
  InfiniteList,
  List,
  Mask,
  NavBar,
  PaginationDots,
  Progress,
  PullToRefresh,
  Popover,
  Popup,
  Radio,
  Result,
  SafeArea,
  SearchField,
  SegmentedControl,
  SideNav,
  Skeleton,
  Space,
  Steps,
  SwipeActions,
  TabBar,
  Tabs,
  Tag,
  ThemeProvider,
  ToastProvider,
  VirtualList,
  Watermark,
  useDialog,
  useToast
} from "@meu/mobile";
import { Portal, VisuallyHidden } from "@meu/primitives-react";
import type { NumberKeyboardInputDetails, VirtualListRange, VirtualListRef } from "@meu/mobile";
import { useRef, useState, useSyncExternalStore } from "react";
import { z } from "zod";

const schema = z.object({
  agreement: z.boolean().refine((value) => value, "请同意服务协议"),
  campaignDates: z.array(z.date()).min(1, "请至少选择一个活动日期"),
  description: z.string().min(6, "店铺介绍至少输入 6 个字符"),
  deliveryDate: z.date(),
  deliveryWindow: z.tuple([z.date(), z.date()]),
  deliveryTime: z.object({
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    second: z.number().int().min(0).max(59)
  }),
  notifications: z.boolean(),
  paymentAmount: z
    .string()
    .refine((value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value), "请输入有效金额"),
  verificationCode: z
    .string()
    .refine((value) => value === "" || /^\d{4}$/.test(value), "请输入 4 位验证码"),
  productImages: z
    .array(z.object({ alt: z.string(), url: z.string() }))
    .min(1, "请至少上传一张商品图片"),
  productCategories: z.array(z.string()).min(1, "请至少选择一个商品类目"),
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

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

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

const productCategories = [
  {
    label: "数码家电",
    value: "digital",
    children: [
      {
        label: "手机通讯",
        value: "phone",
        children: [
          { label: "智能手机", value: "smartphone" },
          { label: "手机配件", value: "phone-accessories" }
        ]
      },
      { label: "电脑整机", value: "computer" }
    ]
  },
  {
    label: "家居生活",
    value: "home",
    children: [
      { label: "厨房用品", value: "kitchen" },
      { label: "收纳清洁", value: "storage" }
    ]
  }
] as const;

const virtualOrders = Array.from({ length: 10_000 }, (_, index) => ({
  description:
    index % 8 === 0
      ? "动态高度配送说明会在真实 DOM 挂载后重新测量。"
      : `预计 ${15 + (index % 30)} 分钟送达`,
  id: `VIRTUAL-${String(index + 1).padStart(5, "0")}`
}));

function formatLocalDate(value: Date) {
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

function formatLocalTime(value: { hour: number; minute: number; second: number }) {
  return `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;
}

function appendPaymentAmount(current: string, input: string, details: NumberKeyboardInputDetails) {
  if (details.source === "decimal") {
    if (current.indexOf(".") >= 0) return current;
    return current ? `${current}.` : "0.";
  }
  const decimalIndex = current.indexOf(".");
  if (decimalIndex >= 0 && current.length - decimalIndex > 2) return current;
  return `${current}${input}`;
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
            id: "inventory-adjustment",
            message: "库存不足，已调整购买数量",
            position: "bottom"
          });
          toast.success({
            duration: 0,
            id: "inventory-success",
            message: "队列中的第二条消息",
            position: "top"
          });
        }}
      >
        显示 Toast 队列
      </Button>
      <Button
        variant="outline"
        tone="neutral"
        onClick={() => {
          toast.show({
            duration: 0,
            id: "overflow-message",
            message: "不应进入队列的消息",
            onClose: (details) => {
              if (details.reason === "overflow") onResult("Toast 容量：已拒绝溢出消息");
            }
          });
        }}
      >
        显示溢出 Toast
      </Button>
      <Button variant="outline" tone="neutral" onClick={toast.clear}>
        清空 Toast
      </Button>
    </>
  );
}

function BottomSheetToastDemo({ onResult }: { onResult: (message: string) => void }) {
  const toast = useToast();
  return (
    <Button
      tone="neutral"
      variant="outline"
      onClick={() => {
        toast.warning({
          action: {
            label: "撤销筛选",
            onPress: () => onResult("BottomSheet Toast：已撤销")
          },
          duration: 0,
          id: "bottom-sheet-feedback",
          message: "库存筛选已保存"
        });
      }}
    >
      在面板中显示 Toast
    </Button>
  );
}

export function ConsumerScenario() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [foundationMessage, setFoundationMessage] = useState("等待基础组件操作");
  const [savedName, setSavedName] = useState("");
  const [savedSettings, setSavedSettings] = useState("");
  const [savedAdvanced, setSavedAdvanced] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedFor, setSearchedFor] = useState("");
  const [nativeSearchSubmit, setNativeSearchSubmit] = useState("原生搜索尚未提交");
  const [selectedEntry, setSelectedEntry] = useState("等待列表操作");
  const [cellLoading, setCellLoading] = useState(true);
  const [displayAction, setDisplayAction] = useState("等待展示组件操作");
  const [watermarkMessage, setWatermarkMessage] = useState("水印未发生 DOM 变更");
  const [openHelp, setOpenHelp] = useState<readonly string[]>(["delivery"]);
  const [navigationMessage, setNavigationMessage] = useState("等待导航操作");
  const [indexedNavigationMessage, setIndexedNavigationMessage] =
    useState("索引 A / 分类 featured");
  const [activeIndexKey, setActiveIndexKey] = useState("A");
  const [sideNavKey, setSideNavKey] = useState("featured");
  const [previewMode, setPreviewMode] = useState<"summary" | "detail">("summary");
  const [previewPage, setPreviewPage] = useState(1);
  const [contentTab, setContentTab] = useState("overview");
  const [primarySection, setPrimarySection] = useState("home");
  const [feedbackProgress, setFeedbackProgress] = useState(64);
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshRequestCount, setRefreshRequestCount] = useState(0);
  const [refreshPending, setRefreshPending] = useState(false);
  const [infinitePage, setInfinitePage] = useState(1);
  const [infiniteRequestStatus, setInfiniteRequestStatus] = useState("分页请求：空闲");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [imageViewerResult, setImageViewerResult] = useState("图片预览尚未打开");
  const [swipeOpenSide, setSwipeOpenSide] = useState<"left" | "right" | null>(null);
  const [swipeMenuOpen, setSwipeMenuOpen] = useState(false);
  const [swipeMessage, setSwipeMessage] = useState("等待滑动操作");
  const [floatingPanelHeight, setFloatingPanelHeight] = useState(160);
  const [virtualRange, setVirtualRange] = useState<VirtualListRange | null>(null);
  const [numberKeyboardResult, setNumberKeyboardResult] = useState("等待数字键盘输入");
  const [numberKeyboardClose, setNumberKeyboardClose] = useState("键盘尚未关闭");
  const [passcodeResult, setPasscodeResult] = useState("等待验证码输入");
  const [imageUploadResult, setImageUploadResult] = useState("图片上传尚未操作");
  const [savedImages, setSavedImages] = useState("");
  const [sliderPointerValue, setSliderPointerValue] = useState(40);
  const [sliderCompleteCount, setSliderCompleteCount] = useState(0);
  const [sliderCancelCount, setSliderCancelCount] = useState(0);
  const [sliderPointerSource, setSliderPointerSource] = useState("none");
  const [sliderCancelSource, setSliderCancelSource] = useState("none");
  const [ratePointerValue, setRatePointerValue] = useState(3);
  const [rateCancelCount, setRateCancelCount] = useState(0);
  const [ratePointerSource, setRatePointerSource] = useState("none");
  const [rateCancelSource, setRateCancelSource] = useState("none");
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
  const imageViewerTriggerRef = useRef<HTMLButtonElement>(null);
  const virtualListRef = useRef<VirtualListRef>(null);
  const portalTargetRef = useRef<HTMLDivElement>(null);
  const refreshResolveRef = useRef<(() => void) | null>(null);
  const form = useMeuForm<FormValues>({
    schema,
    defaultValues: {
      agreement: true,
      appointment: ["today", 9],
      campaignDates: [new Date(2026, 7, 8), new Date(2026, 7, 18)],
      description: "",
      deliveryDate: new Date(2026, 7, 28),
      deliveryWindow: [new Date(2026, 7, 8), new Date(2026, 7, 18)],
      deliveryTime: { hour: 10, minute: 30, second: 0 },
      fulfillment: ["standard"],
      notifications: true,
      paymentAmount: "",
      productCategories: ["smartphone"],
      productImages: [{ alt: "已有商品主图", url: "/demo-media.svg" }],
      quantity: 1,
      rating: 3,
      region: ["zhejiang", "hangzhou", "xihu"],
      services: ["delivery"],
      shipping: "standard",
      storeName: "",
      volume: 40,
      verificationCode: "",
      viewMode: "list"
    },
    mode: "onSubmit"
  });

  return (
    <ConfigProvider theme={theme}>
      <section
        className="integration-card"
        aria-label="组件消费场景"
        data-hydrated={hydrated || undefined}
      >
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

        <section className="integration-foundations" aria-label="基础布局与原语">
          <VisuallyHidden id="foundation-status-label">基础布局状态</VisuallyHidden>
          <Divider align="start">基础布局</Divider>
          <Space block gap={3} wrap>
            <Button
              size="small"
              variant="outline"
              tone="neutral"
              onClick={() => setFoundationMessage("普通按钮已执行")}
            >
              普通操作
            </Button>
            <IconButton
              aria-label="刷新基础组件"
              tone="accent"
              variant="outline"
              onClick={() => setFoundationMessage("图标按钮已执行")}
            >
              <MeuIconSearch size={20} />
            </IconButton>
          </Space>
          <output aria-labelledby="foundation-status-label">{foundationMessage}</output>
          <div ref={portalTargetRef} data-testid="foundation-portal-target" />
          <Portal container={() => portalTargetRef.current}>
            <span data-testid="foundation-portal-content">自定义容器 Portal 内容</span>
          </Portal>
          <SafeArea data-testid="foundation-safe-area" fallback={12} position="bottom" />
        </section>

        <section aria-label="系统主题与动效">
          <ThemeProvider theme="system" motion="system">
            <span data-testid="system-theme-swatch">跟随系统主题</span>
          </ThemeProvider>
        </section>

        <div className="integration-search">
          <SearchField
            aria-label="搜索组件"
            dir="rtl"
            placeholder="搜索 Meu 组件"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setSearchedFor}
          />
          <output aria-live="polite">
            {searchedFor ? `正在搜索：${searchedFor}` : "等待搜索"}
          </output>
          <form
            aria-label="原生搜索表单"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const query = data.get("nativeQuery");
              setNativeSearchSubmit(`原生搜索提交：${typeof query === "string" ? query : ""}`);
            }}
          >
            <SearchField aria-label="可重置原生搜索" defaultValue="订单" name="nativeQuery" />
            <Button size="small" type="reset" tone="neutral" variant="outline">
              恢复默认搜索
            </Button>
            <output aria-live="polite">{nativeSearchSubmit}</output>
          </form>
        </div>

        <section className="integration-refresh" aria-label="下拉刷新">
          <PullToRefresh
            actionLabel="刷新订单数据"
            onRefresh={async () => {
              setRefreshRequestCount((current) => current + 1);
              setRefreshPending(true);
              await new Promise<void>((resolve) => {
                refreshResolveRef.current = resolve;
              });
              setRefreshCount((current) => current + 1);
            }}
          >
            <div className="integration-refresh-content">
              <strong>可刷新订单摘要</strong>
              <p>刷新次数：{refreshCount}</p>
              <p>请求开始次数：{refreshRequestCount}</p>
              <Button
                size="small"
                type="button"
                variant="outline"
                disabled={!refreshPending}
                onClick={() => {
                  const resolve = refreshResolveRef.current;
                  refreshResolveRef.current = null;
                  setRefreshPending(false);
                  if (resolve) resolve();
                }}
              >
                完成刷新请求
              </Button>
              {Array.from({ length: 6 }, (_, index) => (
                <div className="integration-refresh-row" key={index}>
                  刷新订单 {index + 1}
                </div>
              ))}
            </div>
          </PullToRefresh>
        </section>

        <section className="integration-infinite-list" aria-label="无限列表">
          <div role="list" aria-label="分页订单">
            {Array.from({ length: infinitePage * 2 }, (_, index) => (
              <div role="listitem" key={index}>
                分页订单 {index + 1}
              </div>
            ))}
          </div>
          <InfiniteList
            autoLoad={false}
            hasMore={infinitePage < 3}
            loadedAnnouncement="已加载下一页订单"
            loadMore={({ signal, trigger }) =>
              new Promise<void>((resolve, reject) => {
                setInfiniteRequestStatus(`分页请求：${trigger}`);
                const handleAbort = () => {
                  window.clearTimeout(timer);
                  setInfiniteRequestStatus(`分页请求已取消：${trigger}`);
                  reject(new DOMException("Aborted", "AbortError"));
                };
                const timer = window.setTimeout(() => {
                  signal.removeEventListener("abort", handleAbort);
                  setInfinitePage((current) => current + 1);
                  setInfiniteRequestStatus(`分页请求已完成：${trigger}`);
                  resolve();
                }, 100);
                signal.addEventListener("abort", handleAbort, { once: true });
              })
            }
          />
          <Button
            size="small"
            type="button"
            variant="outline"
            tone="neutral"
            onClick={() => setInfinitePage(3)}
          >
            结束分页并取消请求
          </Button>
          <output aria-live="polite">{infiniteRequestStatus}</output>
        </section>

        <section className="integration-virtual-list" aria-label="虚拟列表">
          <div className="integration-virtual-list-toolbar">
            <strong>10,000 条本地订单</strong>
            <Button
              size="small"
              variant="outline"
              tone="neutral"
              onClick={() => {
                const list = virtualListRef.current;
                if (list) list.scrollToIndex(9_000, { align: "start" });
              }}
            >
              跳到第 9001 项
            </Button>
          </div>
          <VirtualList
            ref={virtualListRef}
            aria-label="万条虚拟订单"
            estimateSize={(order) => (order.description.length > 24 ? 72 : 56)}
            getItemKey={(order) => order.id}
            height={320}
            items={virtualOrders}
            onRangeChange={setVirtualRange}
            overscan={3}
            renderItem={(order, index) => (
              <div
                className="integration-virtual-list-row"
                style={{ minHeight: index % 8 === 0 ? 72 : 56 }}
              >
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.description}</span>
                </div>
                <Button size="small" variant="text" tone="neutral">
                  查看虚拟订单 {index + 1}
                </Button>
              </div>
            )}
          />
          <output aria-live="polite">
            {virtualRange
              ? `虚拟范围：${virtualRange.visibleStartIndex + 1}-${virtualRange.visibleEndIndex + 1}`
              : "虚拟范围：计算中"}
          </output>
        </section>

        <section className="integration-carousel" aria-label="内容轮播">
          <ConfigProvider dir="rtl" motion="reduced">
            <Carousel
              aria-label="推荐活动"
              autoplay
              autoplayInterval={1000}
              index={carouselIndex}
              items={[
                {
                  key: "new",
                  ariaLabel: "本周新品",
                  content: (
                    <Button variant="outline" tone="neutral">
                      查看本周新品
                    </Button>
                  )
                },
                {
                  key: "member",
                  ariaLabel: "会员礼遇",
                  content: (
                    <a
                      href="#member-offer"
                      style={{ display: "inline-flex", minHeight: 44, alignItems: "center" }}
                    >
                      查看会员礼遇
                    </a>
                  )
                },
                {
                  key: "weekend",
                  ariaLabel: "周末活动",
                  content: (
                    <Button variant="outline" tone="neutral">
                      查看周末活动
                    </Button>
                  )
                }
              ]}
              loop
              onIndexChange={setCarouselIndex}
            />
            <output aria-live="polite">当前轮播：{carouselIndex + 1}</output>
          </ConfigProvider>
        </section>

        <section className="integration-image-viewer" aria-label="图片预览">
          <Button ref={imageViewerTriggerRef} onClick={() => setImageViewerOpen(true)}>
            预览商品图片
          </Button>
          <output aria-live="polite">
            {imageViewerResult} · 当前图片：{imageViewerIndex + 1} / 3
          </output>
          <ImageViewer
            aria-label="商品图片预览"
            images={[
              { alt: "商品正面图片", key: "front", src: "/demo-media.svg" },
              { alt: "商品侧面图片", key: "side", src: "/demo-media.svg" },
              { alt: "商品场景图片", key: "scene", src: "/demo-media.svg" }
            ]}
            index={imageViewerIndex}
            open={imageViewerOpen}
            returnFocusRef={imageViewerTriggerRef}
            renderFooter={(item) => item.alt}
            onIndexChange={(nextIndex, details) => {
              setImageViewerIndex(nextIndex);
              setImageViewerResult(`图片切换：${details.reason}`);
            }}
            onOpenChange={(nextOpen, details) => {
              setImageViewerOpen(nextOpen);
              setImageViewerResult(nextOpen ? "图片预览已打开" : `图片预览关闭：${details.reason}`);
            }}
          />
        </section>

        <section className="integration-swipe-actions" aria-label="滑动操作">
          <SwipeActions
            openSide={swipeOpenSide}
            onOpenSideChange={setSwipeOpenSide}
            leftActions={[
              {
                key: "pin",
                label: "置顶",
                tone: "accent",
                onPress: () => setSwipeMessage("滑动操作：已置顶")
              }
            ]}
            rightActions={[
              {
                key: "archive",
                label: "归档",
                onPress: () => setSwipeMessage("滑动操作：已归档")
              },
              {
                key: "delete",
                label: "删除",
                tone: "danger",
                onPress: async () => {
                  await new Promise<void>((resolve) => window.setTimeout(resolve, 100));
                  setSwipeMessage("滑动操作：已删除");
                }
              }
            ]}
          >
            <Cell
              title="订单 MEU-0828"
              description="横向滑动显示操作"
              suffix={
                <Button
                  size="small"
                  variant="text"
                  tone="neutral"
                  onClick={() => setSwipeMenuOpen(true)}
                >
                  更多操作
                </Button>
              }
            />
          </SwipeActions>
          <output aria-live="polite">{swipeMessage}</output>
          <ActionMenu
            open={swipeMenuOpen}
            title="滑动操作的等价菜单"
            description="不使用手势也能完成相同操作"
            actions={[
              {
                key: "archive",
                label: "归档",
                onPress: () => setSwipeMessage("更多菜单：已归档")
              },
              {
                key: "delete",
                label: "删除",
                tone: "danger",
                onPress: () => setSwipeMessage("更多菜单：已删除")
              }
            ]}
            onOpenChange={setSwipeMenuOpen}
          />
        </section>

        <section className="integration-floating-panel" aria-label="浮动面板">
          <div className="integration-floating-panel-map" role="img" aria-label="本地地图占位">
            页面背景保持可见
          </div>
          <FloatingPanel
            anchors={[160, 300, 480]}
            height={floatingPanelHeight}
            onHeightChange={setFloatingPanelHeight}
            style={{ position: "absolute" }}
          >
            <List header="附近行程">
              <Cell title="安静早晨路线" description="2.8 km · 预计 35 分钟" />
              <Cell title="城市散步路线" description="4.2 km · 预计 52 分钟" />
              <Cell title="完整路线详情" suffix={<Button size="small">查看</Button>} />
            </List>
            <p>最高点后内容区域恢复原生滚动。</p>
          </FloatingPanel>
          <output aria-live="polite">面板高度：{floatingPanelHeight}px</output>
        </section>

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
            stretch={false}
            value={contentTab}
            onChange={setContentTab}
            items={[
              { key: "overview", label: "概览", content: "订单经营概览" },
              { key: "activity", label: "动态", content: "订单动态", disabled: true },
              { key: "settings", label: "设置", content: "订单设置" },
              { key: "delivery", label: "履约管理", content: "订单履约管理" },
              { key: "after-sales", label: "售后服务", content: "订单售后服务" }
            ]}
          />
          <Button size="small" variant="outline" onClick={() => setContentTab("after-sales")}>
            外部切换售后
          </Button>
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

        <section className="integration-indexed-navigation" aria-label="索引与侧边导航">
          <IndexList
            aria-label="路线索引列表"
            sections={[
              {
                key: "A",
                content: (
                  <List divider="full">
                    <Cell title="安静早晨路线" />
                    <Cell title="奥体中心路线" />
                  </List>
                )
              },
              {
                key: "B",
                content: (
                  <List divider="full">
                    <Cell title="滨江夜跑路线" />
                    <Cell title="北山散步路线" />
                  </List>
                )
              },
              {
                key: "C",
                content: (
                  <List divider="full">
                    <Cell title="城市绿道路线" />
                    <Cell title="茶园轻徒步" />
                  </List>
                )
              }
            ]}
            onIndexChange={(key) => {
              setActiveIndexKey(key);
              setIndexedNavigationMessage(`索引 ${key} / 分类 ${sideNavKey}`);
            }}
          />
          <SideNav
            aria-label="商品侧边分类"
            value={sideNavKey}
            items={[
              { key: "featured", label: "精选", content: "精选活动与限时推荐" },
              { key: "food", label: "食品", badge: 3, content: "食品与饮品分类" },
              { key: "home", label: "家居", content: "家居与生活分类" },
              { key: "service", label: "服务", content: "服务分类", disabled: true }
            ]}
            onChange={(key) => {
              setSideNavKey(key);
              setIndexedNavigationMessage(`索引 ${activeIndexKey} / 分类 ${key}`);
            }}
          />
          <output aria-live="polite">{indexedNavigationMessage}</output>
        </section>

        <div className="integration-list">
          <List
            aria-describedby="shop-entry-help"
            header="店铺入口"
            footer={<span id="shop-entry-help">用于验证原生按钮、链接、加载与列表语义</span>}
            mode="card"
          >
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
            <Cell
              title="同步库存"
              loading={cellLoading}
              loadingLabel="正在同步库存"
              onClick={() => setSelectedEntry("已打开库存同步")}
            />
          </List>
          <Button size="small" variant="outline" onClick={() => setCellLoading(false)}>
            完成库存同步
          </Button>
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

        <section className="integration-watermark" aria-label="内容水印">
          <Watermark
            content={["Meu Mobile", "订单 MEU-20260828"]}
            onRemove={() => setWatermarkMessage("水印已恢复")}
          >
            <Card>
              <h2>带来源标识的订单凭证</h2>
              <p>水印不阻断真实内容和原生交互。</p>
              <Button
                size="small"
                variant="outline"
                tone="neutral"
                onClick={() => setWatermarkMessage("水印内操作可用")}
              >
                查看水印凭证
              </Button>
            </Card>
          </Watermark>
          <output aria-live="polite">{watermarkMessage}</output>
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
            <Progress
              announce
              label="资料上传"
              value={feedbackProgress}
              valueText={`已上传 ${feedbackProgress}%`}
              showValue
            />
            <Button
              size="small"
              variant="outline"
              tone="neutral"
              onClick={() => setFeedbackProgress((current) => Math.min(100, current + 12))}
            >
              推进上传
            </Button>
            <ConfigProvider dir="rtl" motion="reduced">
              <Progress announce aria-label="低动态 RTL 同步" indeterminate />
            </ConfigProvider>
          </div>
          <div
            className="integration-loading"
            role="status"
            aria-label="订单摘要加载中"
            aria-busy="true"
          >
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

        <ToastProvider maxToasts={2}>
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
              <ConfigProvider dir="rtl" motion="reduced">
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
              </ConfigProvider>
              <ConfigProvider dir="rtl" motion="reduced">
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
                    <BottomSheetToastDemo onResult={setOverlayMessage} />
                  </div>
                </BottomSheet>
              </ConfigProvider>
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
              `quantity:${values.quantity} / volume:${values.volume} / rating:${values.rating} / picker:${values.appointment.join(",")} / cascade:${values.region.join(",")} / date:${formatLocalDate(values.deliveryDate)} / range:${values.deliveryWindow.map(formatLocalDate).join("–")} / time:${formatLocalTime(values.deliveryTime)} / calendar:${values.campaignDates.map(formatLocalDate).join(",")} / selector:${values.fulfillment.join(",")} / segmented:${values.viewMode}`
            );
            setSavedImages(`已保存图片：${values.productImages.length}`);
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
          <section className="integration-range-gestures" aria-label="滑块与评分手势验证">
            <MeuFormSlider<FormValues>
              name="volume"
              label="提示音量"
              showValue
              formatValue={(value) => `${value}%`}
              onChange={(nextValue) => setSliderPointerValue(nextValue)}
              onChangeComplete={() => setSliderCompleteCount((count) => count + 1)}
              onPointerDown={(event) =>
                setSliderPointerSource(event.nativeEvent.isTrusted ? "trusted" : "synthetic")
              }
              onPointerCancel={(event) => {
                setSliderCancelCount((count) => count + 1);
                setSliderCancelSource(event.nativeEvent.isTrusted ? "trusted" : "synthetic");
              }}
            />
            <output aria-live="polite">滑块当前值：{sliderPointerValue}</output>
            <output aria-live="polite">滑块完成次数：{sliderCompleteCount}</output>
            <output aria-live="polite">滑块取消次数：{sliderCancelCount}</output>
            <output aria-live="polite">滑块 pointerdown：{sliderPointerSource}</output>
            <output aria-live="polite">滑块 pointercancel：{sliderCancelSource}</output>
            <MeuFormRate<FormValues>
              name="rating"
              label="服务评分"
              onChange={(nextValue) => setRatePointerValue(nextValue)}
              onPointerDown={(event) =>
                setRatePointerSource(event.nativeEvent.isTrusted ? "trusted" : "synthetic")
              }
              onPointerCancel={(event) => {
                setRateCancelCount((count) => count + 1);
                setRateCancelSource(event.nativeEvent.isTrusted ? "trusted" : "synthetic");
              }}
            />
            <output aria-live="polite">评分当前值：{ratePointerValue}</output>
            <output aria-live="polite">评分取消次数：{rateCancelCount}</output>
            <output aria-live="polite">评分 pointerdown：{ratePointerSource}</output>
            <output aria-live="polite">评分 pointercancel：{rateCancelSource}</output>
          </section>
          <section className="integration-number-keyboard" aria-label="数字键盘表单集成">
            <ConfigProvider dir="rtl" motion="reduced">
              <MeuFormNumberKeyboard<FormValues>
                name="paymentAmount"
                label="交易金额"
                description="值、dirty、校验和提交由表单层持有；键盘不锁滚动或转移鼠标焦点。"
                mode="decimal"
                maxLength={8}
                confirmLabel="完成金额输入"
                transformInput={appendPaymentAmount}
                formatValue={(value) => (value ? `¥ ${value}` : undefined)}
                onConfirm={(value) => setNumberKeyboardResult(`金额确认：${value}`)}
                onOpenChange={(nextOpen, details) => {
                  if (!nextOpen) setNumberKeyboardClose(`键盘关闭：${details.reason}`);
                }}
              />
              <output aria-live="polite">{numberKeyboardResult}</output>
              <output aria-live="polite">{numberKeyboardClose}</output>
            </ConfigProvider>
          </section>
          <section className="integration-passcode-input" aria-label="密码输入表单集成">
            <MeuFormPasscodeInput<FormValues>
              name="verificationCode"
              label="短信验证码"
              description="真实 input 负责值与自动填充；视觉格和非模态数字键盘不重复持有表单状态。"
              length={4}
              separated
              keyboard={{ closeOnComplete: true, title: "验证码键盘" }}
              onComplete={(value) => setPasscodeResult(`验证码完成：${value}`)}
            />
            <output aria-live="polite">{passcodeResult}</output>
          </section>
          <section className="integration-image-uploader" aria-label="图片上传表单集成">
            <MeuFormImageUploader<FormValues>
              name="productImages"
              label="商品图片"
              description="成功元数据归表单持有；File、进度、失败与取消只属于本地 Web 上传任务。"
              maxCount={2}
              required
              upload={async (file, context) => {
                context.onProgress(35);
                await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
                context.onProgress(82);
                await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
                return {
                  alt: file.name,
                  key: `${file.name}-${file.lastModified}`,
                  name: file.name,
                  url: "/demo-media.svg"
                };
              }}
              onChange={(items, details) => {
                setImageUploadResult(
                  `${details.reason === "upload" ? "图片上传完成" : "图片已删除"}：${details.item.alt}；当前 ${items.length} 张`
                );
              }}
            />
            <output aria-live="polite">{imageUploadResult}</output>
          </section>
          <section className="integration-tree-select" aria-label="树形选择表单集成">
            <MeuFormTreeSelect<FormValues, string>
              multiple
              name="productCategories"
              label="商品类目"
              description="搜索和展开只修改面板状态；确定后才将叶子节点数组写入表单。"
              options={productCategories}
              defaultExpandedValues={["digital", "phone", "home"]}
              maxCount={3}
              required
              triggerProps={{ placeholder: "选择商品类目" }}
              virtual={false}
            />
          </section>
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
          <MeuFormDateRangePicker<FormValues>
            name="deliveryWindow"
            label="配送日期范围"
            description="取消丢弃草稿，确定后才提交完整范围。"
            defaultMonth={new Date(2026, 7, 1)}
            min={new Date(2026, 7, 1)}
            max={new Date(2026, 7, 31)}
            presets={[
              {
                key: "week",
                label: "未来 7 天",
                value: [new Date(2026, 7, 10), new Date(2026, 7, 16)]
              }
            ]}
            required
            serializeValue={(value) => JSON.stringify(value.map(formatLocalDate))}
            triggerProps={{ placeholder: "选择配送日期范围" }}
          />
          <MeuFormTimePicker<FormValues>
            name="deliveryTime"
            label="送达时间"
            description="时间值不绑定日期或时区，确定后才提交选择。"
            min={{ hour: 9, minute: 0, second: 0 }}
            max={{ hour: 18, minute: 0, second: 0 }}
            minuteStep={15}
            required
            triggerProps={{ placeholder: "选择送达时间" }}
          />
          <MeuFormCalendar<FormValues>
            name="campaignDates"
            label="活动日期"
            description="直接选择多个日期；键盘方向键可以跨日期和月份移动。"
            selectionMode="multiple"
            defaultMonth={new Date(2026, 7, 1)}
            min={new Date(2026, 7, 3)}
            max={new Date(2026, 8, 30)}
            required
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
          <output aria-label="店铺表单状态" aria-live="polite">
            {form.formState.isDirty ? "dirty" : "pristine"}/
            {Object.keys(form.formState.touchedFields).length > 0 ? "touched" : "untouched"}/
            {Object.keys(form.formState.errors).length > 0 ? "error" : "valid"}
          </output>
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            onClick={() => {
              applyMeuFormErrors(form, {
                description: "服务端拒绝了当前店铺介绍",
                storeName: "服务端提示店铺名称已存在"
              });
            }}
          >
            应用服务端错误
          </Button>
          <Button type="reset" variant="outline" tone="neutral">
            原生重置店铺表单
          </Button>
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
        <output className="integration-result" aria-live="polite">
          {savedImages || "等待图片提交"}
        </output>
      </section>
    </ConfigProvider>
  );
}
