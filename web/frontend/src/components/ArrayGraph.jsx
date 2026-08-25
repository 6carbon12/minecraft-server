import { useMemo } from "react";

export default function ArrayGraph({ data, className }) {
  // Use useMemo to avoid recalculating the path if the data hasn't changed
  const pathData = useMemo(() => {
    if (!data || data.length === 0) return { linePath: "", areaPath: "" };

    // Calculate the horizontal pixel distance between each data point
    const INTERNAL_W = 1000;
    const INTERNAL_H = 100;
    const stepX = INTERNAL_W / (data.length - 1 || 1);

    // Map the array values to exact SVG coordinates
    const points = data.map((value, index) => {
      const x = index * stepX;

      // Invert the Y axis: (100% -> Y=0), (0% -> Y=height)
      const y = INTERNAL_H - (value / 100) * INTERNAL_H;

      return `${x},${y}`;
    });

    // Construct the primary line path
    const linePath =
      `M ${points[0]} ` +
      points
        .slice(1)
        .map((p) => `L ${p}`)
        .join(" ");

    const areaPath = `${linePath} L ${INTERNAL_W},${INTERNAL_H} L 0,${INTERNAL_H} Z`;

    return { linePath, areaPath };
  }, [data]);

  return (
    <div
      className={
        "bg-tokyo-bg relative h-full w-full overflow-hidden" + " " + className
      }
      style={{
        // Creates a grid background
        backgroundImage: `
             linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
             linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
           `,
        backgroundSize: "10px 10px",
      }}
    >
      <svg
        viewBox={`0 0 1000 100`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <path
          d={pathData.areaPath}
          fill="#7aa2f7"
          opacity={0.5}
          stroke="none"
        />

        <path
          d={pathData.linePath}
          fill="none"
          stroke="#7aa2f7"
          vectorEffect="non-scaling-stroke"
          strokeWidth={2}
          strokeLinejoin="round" // Rounds the corners of the jagged line
        />
      </svg>
    </div>
  );
}
