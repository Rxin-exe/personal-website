/** One icon set: 16px, 24-unit grid, 2px round strokes, no fills. */
type Props = { size?: number };

const Svg = ({ size = 16, children }: Props & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="icon"
  >
    {children}
  </svg>
);

export const ArrowRight = (p: Props) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const ArrowUpRight = (p: Props) => (
  <Svg {...p}>
    <path d="M7 17L17 7M8 7h9v9" />
  </Svg>
);

export const ArrowDown = (p: Props) => (
  <Svg {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Svg>
);

export const Copy = (p: Props) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" />
  </Svg>
);

export const Check = (p: Props) => (
  <Svg {...p}>
    <path className="check-path" d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const LinkIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </Svg>
);

export const Close = (p: Props) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
