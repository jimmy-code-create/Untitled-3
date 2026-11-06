/**
 * Original inline line icons for the JMD storefront.
 * All shapes are drawn for this project — no third-party icon fonts or logos.
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconMenu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 6.5h17" />
    <path d="M3.5 12h11" />
    <path d="M3.5 17.5h17" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="m15.5 15.5 4.3 4.3" />
  </Icon>
);

export const IconStore = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10.5V19h16v-8.5" />
    <path d="M3 9.5 4.6 5h14.8L21 9.5c0 1.4-1 2.5-2.4 2.5a2.4 2.4 0 0 1-2.4-2.5A2.4 2.4 0 0 1 13.8 12a2.4 2.4 0 0 1-2.4-2.5A2.4 2.4 0 0 1 9 12a2.4 2.4 0 0 1-2.4-2.5A2.4 2.4 0 0 1 4.2 12C3 12 3 10.5 3 9.5Z" />
    <path d="M9.5 19v-4.5h5V19" />
  </Icon>
);

export const IconHeart = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20s-7.4-4.6-7.4-9.6A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.4 2.8C19.4 15.4 12 20 12 20Z" />
  </Icon>
);

export const IconBag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 8.5h14l-1 11.5H6L5 8.5Z" />
    <path d="M8.7 8.5V7a3.3 3.3 0 0 1 6.6 0v1.5" />
  </Icon>
);

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8.2" r="3.4" />
    <path d="M5.2 20c.5-3.6 3.2-5.6 6.8-5.6s6.3 2 6.8 5.6" />
  </Icon>
);

export const IconChevron = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 5.5 6.5 6.5L9 18.5" />
  </Icon>
);

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12H4.5M10 5.5 3.5 12l6.5 6.5" />
  </Icon>
);

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12h15.5M14 5.5 20.5 12 14 18.5" />
  </Icon>
);

export const IconCamera = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8.5h3l1.5-2h7L17 8.5h3v10H4v-10Z" />
    <circle cx="12" cy="13" r="3.2" />
  </Icon>
);

export const IconMic = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="3.5" width="6" height="10" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
  </Icon>
);

export const IconPhone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 3.5 9.2 8 7.4 9.7c1 2 2.9 3.9 4.9 4.9l1.7-1.8 4.5 2.2-.8 3.2c-.2.8-1 1.3-1.8 1.2C9.7 19 5 14.3 3.6 6.1c-.1-.8.4-1.6 1.2-1.8L7 3.5Z" />
  </Icon>
);

export const IconMail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4.5 7 7.5 6 7.5-6" />
  </Icon>
);

export const IconChat = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5.5h11.5A3.5 3.5 0 0 1 19 9v3.5a3.5 3.5 0 0 1-3.5 3.5H10l-4 3v-3.2A3.5 3.5 0 0 1 4 12.5v-7Z" />
    <path d="M8 9h6M8 12h4" />
  </Icon>
);

export const IconWhatsApp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.6Z" />
    <path d="M9 8.4c.4-.1.7 0 .9.4l.8 1.5c.1.3 0 .6-.2.8l-.5.4c.5 1.1 1.3 1.9 2.4 2.4l.4-.5c.2-.2.5-.3.8-.2l1.5.8c.4.2.5.5.4.9-.2.8-.9 1.4-1.7 1.3-3-.4-5.2-2.6-5.6-5.6-.1-.8.5-1.5 1.3-1.7Z" />
  </Icon>
);

export const IconInstagram = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.6" />
    <circle cx="17" cy="7" r=".8" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconFacebook = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 21v-7h2.6l.4-3h-3V9.1c0-.9.3-1.6 1.7-1.6H17V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V11H8v3h2.5v7" />
  </Icon>
);

export const IconYouTube = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="6" width="18" height="12" rx="4" />
    <path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconDiya = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 14.5h16c-.8 3-3.6 5-8 5s-7.2-2-8-5Z" />
    <path d="M12 11.5c-1.5-1.2-1.2-3 0-4.5 1.2 1.5 1.5 3.3 0 4.5Z" />
    <path d="M12 11.5c.9.2 1.5.7 1.8 1.3M12 11.5c-.9.2-1.5.7-1.8 1.3" />
  </Icon>
);

export const IconSparkle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5c.6 4.5 2 5.9 6.5 6.5-4.5.6-5.9 2-6.5 6.5-.6-4.5-2-5.9-6.5-6.5 4.5-.6 5.9-2 6.5-6.5Z" />
    <path d="M18.5 16.5c.2 1.6.7 2.1 2.3 2.3-1.6.2-2.1.7-2.3 2.3-.2-1.6-.7-2.1-2.3-2.3 1.6-.2 2.1-.7 2.3-2.3Z" />
  </Icon>
);

export const IconDirections = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3.5 8.5 8.5-8.5 8.5L3.5 12 12 3.5Z" />
    <path d="M9.5 14v-2.2c0-1 .8-1.8 1.8-1.8h3.2" />
    <path d="m12.8 8.3 1.7 1.7-1.7 1.7" />
  </Icon>
);

export const IconRibbon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 13c-2.5-1.4-5.5-3.4-5.5-5.6C6.5 5.6 8 4.5 9.7 5c1.2.4 1.9 1.3 2.3 2.2.4-.9 1.1-1.8 2.3-2.2 1.7-.5 3.2.6 3.2 2.4 0 2.2-3 4.2-5.5 5.6Z" />
    <path d="M12 13v7M9 20l3-2 3 2" />
  </Icon>
);

export const IconGoldEmblem = ({ size = 64, ...p }: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    <path d="M22 54V36a18 18 0 0 1 36 0v18" />
    <path d="M18 54h44" />
    <path d="M40 26v10" />
    <circle cx="40" cy="22" r="2.6" />
    <path d="M30 48a10 10 0 0 1 4-13.2" />
    <path d="m33.5 35 1 4.5-4.2 1.1" />
    <path d="M50 48a10 10 0 0 0-4-13.2" />
    <path d="m46.5 35-1 4.5 4.2 1.1" />
  </svg>
);

export const IconShopfront = ({ size = 120, ...p }: IconProps) => (
  <svg
    viewBox="0 0 160 120"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    <path d="M28 54h104v52H28z" />
    <path d="M36 54V38l10-12h68l10 12v16" />
    <path d="M24 54h112" />
    <path d="M24 54c0 6 4 10 10 10s10-4 10-10c0 6 4 10 10 10s10-4 10-10c0 6 4 10 10 10s10-4 10-10c0 6 4 10 10 10s10-4 10-10c0 6 4 10 10 10s10-4 10-10" />
    <path d="M46 106V74h20v32M94 106V86h22v20" />
    <path d="M64 64h32" />
    <path d="M70 34h20v12H70z" />
    <path d="M12 106h136" />
  </svg>
);
