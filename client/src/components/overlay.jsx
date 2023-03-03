import theme from "@jdboris/css-themes/space-station";

function Overlay({ children }) {
  return <div className={theme.overlay}>{children}</div>;
}

export default Overlay;
