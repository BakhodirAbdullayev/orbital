import { Orbit } from "lucide-react";
import type { FC } from "react";

const Logo: FC = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="p-2 bg-gradient-to-br from-primary to-purple-700 rounded-lg shadow-lg">
        <Orbit className="h-6 w-6 text-white" />
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Orbital
      </h1>
    </div>
  );
};

export default Logo;
