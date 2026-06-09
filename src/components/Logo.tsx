type Props = { size?: "sm" | "md" | "lg" | "xl"; suffix?: string };
const sizes = { sm: "text-2xl", md: "text-3xl", lg: "text-5xl", xl: "text-7xl md:text-8xl" };

export function Logo({ size = "md", suffix = "GARAGEM" }: Props) {
  return (
    <span className={`mega-wordmark ${sizes[size]}`}>
      <span className="mega">MEGA</span>
      <span className="suffix">{suffix}</span>
    </span>
  );
}
