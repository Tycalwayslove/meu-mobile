"use client";

import { ConfigProvider, Popover } from "@meu/mobile";
import { useEffect, useRef, useState } from "react";
import type { PopoverPlacement } from "@meu/mobile";

const placements: PopoverPlacement[] = [
  "top",
  "top-start",
  "top-end",
  "right",
  "right-start",
  "right-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end"
];

export function PopoverContractScenario() {
  const [placement, setPlacement] = useState<PopoverPlacement>("top");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 200;
  }, []);

  return (
    <ConfigProvider locale="en-US" motion="reduced" theme="dark">
      <main style={{ minHeight: "100vh", padding: 20 }}>
        <h1>Popover placement contract</h1>
        <label>
          Requested placement
          <select
            aria-label="Requested placement"
            value={placement}
            onChange={(event) => setPlacement(event.currentTarget.value as PopoverPlacement)}
          >
            {placements.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div
          ref={scrollRef}
          data-testid="popover-scroll-container"
          style={{
            height: 420,
            marginTop: 20,
            overflow: "auto",
            overscrollBehavior: "contain",
            position: "relative"
          }}
        >
          <div style={{ display: "grid", height: 820, placeItems: "center" }}>
            <Popover
              aria-label="Placement probe"
              // This is the Popover focus policy, not the native HTML autofocus attribute.
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={false}
              closeOnEscape={false}
              closeOnOutsideClick={false}
              content={<span style={{ display: "block", width: 72 }}>Probe</span>}
              offset={8}
              open
              placement={placement}
              trigger="manual"
              viewportPadding={8}
            >
              <button type="button">Placement anchor</button>
            </Popover>
          </div>
        </div>
      </main>
    </ConfigProvider>
  );
}
