import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function MediaBox({ images, setImages }) {
  // Handle adding a new image
  const handleImageUpload = (event) => {
    const newImage = event.target.files[0]; // Get the first image file selected
    if (newImage) {
      const imageUrl = URL.createObjectURL(newImage); // Create a temporary URL for the image
      setImages((prevImages) => [...prevImages, imageUrl]); // Add the image URL to the images state
    }
  };

  // Handle deleting an image
  const handleImageDelete = (imageUrl) => {
    setImages((prevImages) => prevImages.filter((img) => img !== imageUrl)); // Remove the image from the state
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <div>
        <h2>Media</h2>
        {/* Image file input */}
        <Input
          id="picture"
          type="file"
          onChange={handleImageUpload}
          accept="image/*"
        />
      </div>

      {/* Render images */}
      <div className="mt-4">
        {images.length > 0 ? (
          <div>
            <h3>Selected Images</h3>
            <div className="flex flex-wrap gap-2">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Selected Image ${index + 1}`}
                    className="w-32 h-32 object-cover"
                  />
                  <button
                    onClick={() => handleImageDelete(imageUrl)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No images selected.</p>
        )}
      </div>
    </div>
  );
}

export default MediaBox;
