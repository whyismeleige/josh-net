"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePageTitle } from "@/src/hooks/usePageTitle";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const semesters = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const charts = ["Heat Map", "Bar Chart", "Line Chart"];

export default function StudentAttendance() {
  usePageTitle("Attendance");
  return (
    <section className="p-2">
      <h1 className="text-3xl text-center">Attendance Page</h1>
      <div>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select The Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Semesters</SelectLabel>
              {semesters.map((semester, index) => (
                <SelectItem
                  key={index}
                  value={`Semester - ${semester}`}
                >{`Semester - ${semester}`}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <HeatmapComponent />
    </section>
  );
}

export function HeatmapComponent() {
  // Generate sample data for the heatmap
  const generateData = (
    count: number,
    yrange: { min: number; max: number }
  ) => {
    const series = [];
    for (let i = 0; i < count; i++) {
      const x = `W${i + 1}`;
      // eslint-disable-next-line react-hooks/purity
      const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      series.push({ x, y });
    }
    return series;
  };

  const [series] = useState([
    { name: "Jul", data: generateData(12, { min: 0, max: 90 }) },
    { name: "Aug", data: generateData(12, { min: 0, max: 90 }) },
    { name: "Sep", data: generateData(12, { min: 0, max: 90 }) },
    { name: "Oct", data: generateData(12, { min: 0, max: 90 }) },
    { name: "Nov", data: generateData(12, { min: 0, max: 90 }) },
    { name: "Dec", data: generateData(12, { min: 0, max: 90 }) },
  ]);

  const [options] = useState<ApexOptions>({
    chart: {
      height: 450,
      type: "heatmap",
      toolbar: {
        show: true,
      },
      background: "var(--card)",
      foreColor: "var(--card-foreground)",
      fontFamily: "var(--font-sans)",
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            { from: 0, to: 20, name: "Low", color: "#00A100" },
            { from: 21, to: 40, name: "Medium", color: "#128FD9" },
            { from: 41, to: 60, name: "High", color: "#FFB200" },
            { from: 61, to: 80, name: "Very High", color: "#FF6B00" },
            { from: 81, to: 90, name: "Extreme", color: "#FF0000" },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
    },

    title: {
      text: "Monthly Attendance Heatmap",
      align: "center",
      style: {
        fontSize: "20px",
        fontWeight: "bold",
      },
    },
    xaxis: {
      title: {
        text: "Weeks",
      },
    },
    yaxis: {
      title: {
        text: "Months",
      },
    },
    legend: {
      show: true,
      position: "bottom",
    },
  });

  return (
    <div className="max-w-6xl p-10 mx-auto">
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold text-card-foregroud mb-2">
            Attendance Heat Map
          </h1>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Visualization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Visualization Mode</SelectLabel>
                {charts.map((map, index) => (
                  <SelectItem key={index} value={map}>
                    {map}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-lg p-4">
          <ReactApexChart
            options={options}
            series={series}
            type="heatmap"
            height={450}
          />
        </div>
      </div>
    </div>
  );
}
