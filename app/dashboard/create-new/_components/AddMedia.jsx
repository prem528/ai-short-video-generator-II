import { Button } from "@/components/ui/button";
import { useState } from "react";

const AddMedia = ({ onMediaChange }) => {
  const [imageList, setImageList] = useState([]);

  // Handle file selection
  const handleFileChange = (event) => {
    const files = event.target.files;
    const fileArray = Array.from(files); // Convert FileList to an array of File objects
    setImageList((prevList) => [...prevList, ...fileArray]);
    onMediaChange([...imageList, ...fileArray]); // Pass updated image list to parent
  };

  // Remove an image from the list
  const removeImage = (imageToRemove) => {
    const updatedList = imageList.filter((image) => image !== imageToRemove);
    setImageList(updatedList);
    onMediaChange(updatedList); // Pass updated image list to parent
  };

  return (
    <div className="mt-5">
      <h2 className="font-normal text-xl text-primary ">Product Images</h2>

      {/* Image List with Dotted Rectangle */}
      <div
        className={`mt-5 border-2 ${
          imageList.length === 0 ? "border-dashed" : "border-solid"
        } border-gray-300 p-4 rounded-md`}
      >
        {imageList.length === 0 ? (
          <p className="text-center text-gray-500">No media selected</p>
        ) : (
          <div className="flex gap-4 flex-wrap justify-center">
            {imageList.map((image, index) => (
              <div key={index} className="relative">
                {/* Display image as a preview */}
                <img
                  src={URL.createObjectURL(image)} // Display the preview URL
                  alt="Selected"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <Button
                  className="absolute top-0 right-0 text-red-500 bg-white rounded-full p-1 hover:bg-red-500 hover:text-white"
                  onClick={() => removeImage(image)}
                >
                  &times;
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Image Button */}
      <div className="flex justify-center mt-5">
        <Button
          asChild
          className="bg-primary text-white px-4 py-2 rounded-full"
        >
          <label htmlFor="fileInput" className="cursor-pointer">
            Click to add pictures
          </label>
        </Button>
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/png, image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default AddMedia;
