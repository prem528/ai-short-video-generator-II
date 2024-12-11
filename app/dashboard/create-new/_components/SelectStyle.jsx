import Image from "next/image";
import React, { useState } from "react";

function SelectStyle({ onUserSelect }) {
  const styleOptions = [
    {
      id: 1,
      name: "Realistic",
      image: "/realistic.png",
    },
    {
      id: 2,
      name: "Cartoon",
      image: "/cartoon.webp",
    },
  ];

  const [selectedOption, setSelectedOption] = useState();

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl text-primary">Style</h2>
      <p className="text-gray-500">Select your avatar style:</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-3">
        {styleOptions.map((item) => (
          <div
            key={item.id}
            className={`relative rounded-xl hover:scale-105 transition-all cursor-pointer ${
              selectedOption === item.name ? "border-4 border-primary" : ""
            }`}
            onClick={() => {
              setSelectedOption(item.name);
              onUserSelect("imageStyle", item.name);
            }}
          >
            <Image
              src={item.image}
              alt={item.name}
              width={100}
              height={100}
              className="h-48 object-cover rounded-lg w-full"
            />
            <h2 className="absolute p-1 bg-black/70 text-white text-sm bottom-0 w-full text-center rounded-b-lg">
              {item.name}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectStyle;
