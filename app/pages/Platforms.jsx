import React from 'react';

function Platform() {
  const platforms = [
    {
      name: "TikTok",
      logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg"
    },
    {
      name: "Meta",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
    },
    {
      name: "Shopify",
      logo: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/shopify-icon.svg"
    },
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
    },
    {
      name: "Google Play",
      logo: "https://i1.wp.com/9to5google.com/wp-content/uploads/sites/4/2022/07/current-google-play-icon.jpg?ssl=1"
    },
    {
      name: "App Store",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg"
    }
  ];

  return (
    <div className="bg-black py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-[#F8F9FF] rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-normal text-center mb-12 text-black">
            Compatible with these platforms
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {platforms.map((platform) => (
              <div 
                key={platform.name}
                className="w-24 h-12 flex items-center justify-center"
              >
                <img
                  src={platform.logo}
                  alt={`${platform.name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Platform;
