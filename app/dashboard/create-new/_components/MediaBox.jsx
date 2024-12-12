import React, { useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * MediaBox component that allows users to upload multiple images and display them in a grid.
 *
 * @param {Object} props
 * @param {Function} props.handleImageUpload - Function to handle image upload.
 */
function MediaBox({ handleImageUpload }) {
  const [images, setImages] = useState([]);
  const [imageList, setImageList] = useState([]);

  /**
   * Handle deleting an image from the images array and corresponding file object from imageList.
   *
   * @param {number} index - Index of the image to delete.
   */
  const handleImageDelete = (index) => {
    setImages((prevImages) => prevImages.filter((img, i) => i !== index));

    // Delete corresponding file object from imageList
    setImageList((prevImageList) => prevImageList.filter((file, i) => i !== index));
  };

  /**
   * Handle image upload.
   *
   * @param {Event} event - Event triggered when the user selects an image.
   */
  const handleImageChange = (event) => {
    const files = event.target.files;
    const newImages = [];
    const newImageList = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        newImages.push(reader.result);
        newImageList.push(file);
        setImages((prevImages) => [...prevImages, ...newImages]);
        setImageList((prevImageList) => [...prevImageList, ...newImageList]);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid w-full items-center gap-4">
      <div className="mt-5">
        <h2 className="font-bold text-2xl text-primary">Media</h2>
        {/* Image file input */}
        <Input
          id="picture"
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          multiple
          className="w-full mt-3"
          placeholder="Click here to add manually"
        />
      </div>

      {/* Render images */}
      <div
        className={`mt-4 p-4 border-2 border-dashed rounded-lg ${
          images.length === 0 ? "flex items-center justify-center h-32" : ""
        }`}
      >
        {images.length > 0 ? (
          <div>
            <h3 className="mb-2 font-semibold text-lg">Selected Images</h3>
            <div className="flex flex-wrap gap-2">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Selected Image ${index + 1}`}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => handleImageDelete(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No images selected.</p>
        )}
      </div>
    </div>
  );
}

export default MediaBox;