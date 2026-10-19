import {
  Cpu, Zap, Package, Trophy, Layers, Circle, Tag,
  Radio, Settings, Microchip, Wrench, Bot,
  CircuitBoard, Battery, Gauge, Wifi, Camera,
} from "lucide-react";

// Picks an icon for a product category from its name.
export const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("robot") || n.includes("arm") || n.includes("chassis")) return Bot;
  if (n.includes("competition")) return Trophy;
  if (n.includes("kit") || n.includes("starter") || n.includes("package")) return Package;
  if (n.includes("sensor")) return Gauge;
  if (n.includes("motor") || n.includes("servo")) return Settings;
  if (n.includes("wheel")) return Circle;
  if (n.includes("power") || n.includes("battery")) return Battery;
  if (n.includes("transistor") || n.includes("mosfet")) return Cpu;
  if (n.includes("capacitor") || n.includes("resistor") || n.includes("diode")) return CircuitBoard;
  if (n.includes("esp") || n.includes("wifi") || n.includes("bluetooth") || n.includes("wireless")) return Wifi;
  if (n.includes("arduino") || n.includes("raspberry") || n.includes("micro")) return Microchip;
  if (n.includes("camera") || n.includes("display") || n.includes("screen")) return Camera;
  if (n.includes("module") || n.includes("board") || n.includes("ic")) return Radio;
  if (n.includes("tool") || n.includes("wire") || n.includes("cable") || n.includes("accessor")) return Wrench;
  if (n.includes("3d") || n.includes("print")) return Layers;
  if (n.includes("iot") || n.includes("smart")) return Zap;
  return Tag;
};
